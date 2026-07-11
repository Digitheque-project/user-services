import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { ConfigService } from '@nestjs/config';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateUserDto) {
    try {
      const existingUser = await this.userRepo.findOne({
        where: [
          { email: dto.email },
          { matricule: dto.matricule },
          {
            registration_number_professional_order:
              dto.registration_number_professional_order,
          },
          { professional_order: dto.professional_order },
        ],
      });

      if (existingUser) {
        if (existingUser.email === dto.email) {
          throw new ConflictException('Email déjà utilisé');
        }
        if (existingUser.matricule === dto.matricule) {
          throw new ConflictException('Matricule déjà utilisé');
        }
        if (
          existingUser.registration_number_professional_order ===
          dto.registration_number_professional_order
        ) {
          throw new ConflictException(
            "Numéro d'inscription à l'ordre déjà utilisé",
          );
        }
        if (existingUser.professional_order === dto.professional_order) {
          throw new ConflictException('Ordre professionnel déjà utilisé');
        }
      }

      const user = this.userRepo.create(dto);
      return await this.userRepo.save(user);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      console.error(error);
      throw new InternalServerErrorException(
        "Erreur lors de la création de l'utilisateur",
      );
    }
  }

  async findAll(filters?: {
    search?: string;
    roleId?: string;
    serviceId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    try {
      const qb = this.userRepo.createQueryBuilder('user')
        .leftJoinAndSelect('user.serviceRoles', 'serviceRoles');

      if (filters?.search) {
        const s = `%${filters.search}%`;
        qb.andWhere(
          '(user.name ILIKE :s OR user.firstname ILIKE :s OR user.email ILIKE :s OR user.job ILIKE :s OR user.phone ILIKE :s OR user.matricule ILIKE :s)',
          { s },
        );
      }

      if (filters?.roleId) {
        qb.andWhere('serviceRoles.roleId = :roleId', { roleId: filters.roleId });
      }

      if (filters?.serviceId) {
        qb.andWhere('serviceRoles.serviceId = :serviceId', { serviceId: filters.serviceId });
      }

      if (filters?.isActive !== undefined) {
        qb.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
      }

      const users = await qb.getMany();
      return users.map(({ password, ...user }) => user);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        "Erreur lors de la récupération des utilisateurs",
      );
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { id },
        relations: { serviceRoles: true },
      });

      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException(
        "Erreur lors de la recherche de l'utilisateur",
      );
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { email },
        relations: { serviceRoles: true },
      });

      return user;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        "Erreur lors de la recherche par email",
      );
    }
  }

  async findByChu(chuId: string) {
    try {
      const serviceUrl = this.configService.get<string>('SERVICE_SERVICE_URL');
      const apiKey = this.configService.get<string>('INTERNAL_API_KEY');

      const res = await fetch(`${serviceUrl}/services?chuId=${chuId}`, {
        headers: { 'x-api-key': apiKey || '' },
      });

      if (!res.ok) {
        throw new InternalServerErrorException(
          "Erreur lors de la récupération des services du CHU",
        );
      }

      const servicesData = await res.json();
      const services = Array.isArray(servicesData) ? servicesData : servicesData.services || [];
      const serviceIds = services.map((s: any) => s.id).filter(Boolean);

      if (serviceIds.length === 0) {
        return [];
      }

      const qb = this.userRepo.createQueryBuilder('user')
        .leftJoinAndSelect('user.serviceRoles', 'serviceRoles')
        .where('serviceRoles.serviceId IN (:...serviceIds)', { serviceIds });

      const users = await qb.getMany();
      return users.map(({ password, ...user }) => user);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        "Erreur lors de la récupération des utilisateurs par CHU",
      );
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    try {
      const user = await this.findOne(id);

      if (dto.email) {
        const existing = await this.userRepo.findOne({
          where: { email: dto.email },
        });
        if (existing && existing.id !== id) {
          throw new ConflictException('Email déjà utilisé');
        }
      }

      Object.assign(user, dto);
      await this.userRepo.save(user);

      return {
        message: 'Utilisateur mis à jour avec succès',
        user,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      )
        throw error;
      console.error(error);
      throw new InternalServerErrorException(
        "Erreur lors de la mise à jour de l'utilisateur",
      );
    }
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    try {
      const user = await this.findOne(id);
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(dto.password, salt);
      await this.userRepo.save(user);
      return { message: 'Mot de passe mis à jour avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException(
        "Erreur lors de la mise à jour du mot de passe",
      );
    }
  }

  async remove(id: string) {
    try {
      const user = await this.findOne(id);
      await this.userRepo.remove(user);

      return {
        message: 'Utilisateur supprimé avec succès',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException(
        "Erreur lors de la suppression de l'utilisateur",
      );
    }
  }
}
