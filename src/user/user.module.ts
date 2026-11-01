import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MonCompteController } from './mon-compte.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  // MonCompteController d'abord : ses routes /users/moi/... passent avant /users/:id.
  controllers: [MonCompteController, UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
