import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserServiceRole } from './entities/user-service-role.entity';

import { User } from '../user/entities/user.entity';

import { UserServiceRoleService } from './user-service-role.service';
import { UserServiceRoleController } from './user-service-role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserServiceRole, User])],

  controllers: [UserServiceRoleController],

  providers: [UserServiceRoleService],
})
export class UserServiceRoleModule {}
