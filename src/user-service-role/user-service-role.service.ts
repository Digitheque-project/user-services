import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

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

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateUserServiceRoleDto) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: dto.userId },
      });

      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      const results = await this.dataSource.transaction(async (manager) => {
        const created: UserServiceRole[] = [];
        const skipped: string[] = [];

        for (const roleId of dto.roleIds) {
          const existing = await manager.findOne(UserServiceRole, {
            where: {
              user: { id: dto.userId },
              serviceId: dto.serviceId,
              roleId,
            },
          });

          if (existing) {
            skipped.push(roleId);
            continue;
          }

          const usr = manager.create(UserServiceRole, {
            user,
            serviceId: dto.serviceId,
            roleId,
          });
          await manager.save(usr);
          created.push(usr);
        }

        return { created, skipped };
      });

      return {
        message: results.created.length > 0
          ? `${results.created.length} rôle(s) assigné(s)${results.skipped.length > 0 ? `, ${results.skipped.length} déjà existant(s) ignoré(s)` : ''}`
          : 'Aucun nouveau rôle assigné (tous déjà présents)',
        data: results.created,
        skipped: results.skipped,
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

  async findAll(filters?: {
    search?: string;
    roleId?: string;
    serviceId?: string;
  }) {
    try {
      const qb = this.usrRepo.createQueryBuilder('usr')
        .leftJoinAndSelect('usr.user', 'user');

      if (filters?.search) {
        const s = `%${filters.search}%`;
        qb.andWhere(
          '(user.name ILIKE :s OR user.firstname ILIKE :s OR user.email ILIKE :s)',
          { s },
        );
      }

      if (filters?.roleId) {
        qb.andWhere('usr.roleId = :roleId', { roleId: filters.roleId });
      }

      if (filters?.serviceId) {
        qb.andWhere('usr.serviceId = :serviceId', { serviceId: filters.serviceId });
      }

      return await qb.getMany();
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
