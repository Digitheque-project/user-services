import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserServiceRole } from './entities/user-service-role.entity';

import { User } from '../user/entities/user.entity';

import { CreateUserServiceRoleDto } from './dto/create-user-service-role.dto';
import { UpdateUserServiceRoleDto } from './dto/update-user-service-role.dto';

@Injectable()
export class UserServiceRoleService {
  constructor(
    @InjectRepository(UserServiceRole)
    private readonly usrRepo: Repository<UserServiceRole>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserServiceRoleDto) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: dto.userId },
      });

      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      const existing = await this.usrRepo.findOne({
        where: {
          user: { id: dto.userId },
          serviceId: dto.serviceId,
        },
      });

      if (existing) {
        throw new ConflictException(
          'Cet utilisateur est déjà associé à ce service',
        );
      }

      const usr = this.usrRepo.create({
        user,
        serviceId: dto.serviceId,
        roleId: dto.roleId,
      });

      await this.usrRepo.save(usr);

      return {
        message: 'Association utilisateur-service-rôle créée',
        data: usr,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      )
        throw error;
      console.error(error);
      throw new InternalServerErrorException(
        "Erreur lors de la création de l'association",
      );
    }
  }

  async findAll() {
    try {
      return await this.usrRepo.find({
        relations: { user: true },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        "Erreur lors de la récupération des associations",
      );
    }
  }

  async findOne(id: string) {
    try {
      const usr = await this.usrRepo.findOne({
        where: { id },
        relations: { user: true },
      });

      if (!usr) {
        throw new NotFoundException('Association introuvable');
      }

      return usr;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException(
        "Erreur lors de la recherche de l'association",
      );
    }
  }

  async update(id: string, dto: UpdateUserServiceRoleDto) {
    try {
      const usr = await this.findOne(id);

      if (dto.userId) {
        const user = await this.userRepo.findOne({
          where: { id: dto.userId },
        });

        if (!user) {
          throw new NotFoundException('Utilisateur introuvable');
        }

        usr.user = user;
      }

      if (dto.serviceId) {
        usr.serviceId = dto.serviceId;
      }

      if (dto.roleId) {
        usr.roleId = dto.roleId;
      }

      await this.usrRepo.save(usr);

      return {
        message: 'Association mise à jour',
        data: usr,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException(
        "Erreur lors de la mise à jour de l'association",
      );
    }
  }

  async remove(id: string) {
    try {
      const usr = await this.findOne(id);
      await this.usrRepo.remove(usr);

      return {
        message: 'Association supprimée',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException(
        "Erreur lors de la suppression de l'association",
      );
    }
  }
}
