import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserServiceRoleService } from './user-service-role.service';

import { CreateUserServiceRoleDto } from './dto/create-user-service-role.dto';
import { UpdateUserServiceRoleDto } from './dto/update-user-service-role.dto';

@ApiTags('User Service Roles')
@Controller('user-service-roles')
export class UserServiceRoleController {
  constructor(private readonly usrService: UserServiceRoleService) {}

  @Post()
  @ApiOperation({
    summary: 'Associer un utilisateur à un service et un rôle',
  })
  @ApiBody({
    type: CreateUserServiceRoleDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Association créée',
  })
  create(
    @Body()
    dto: CreateUserServiceRoleDto,
  ) {
    return this.usrService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les associations',
  })
  findAll() {
    return this.usrService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Afficher une association',
  })
  findOne(@Param('id') id: string) {
    return this.usrService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier une association',
  })
  @ApiBody({
    type: UpdateUserServiceRoleDto,
  })
  update(
    @Param('id') id: string,
    @Body()
    dto: UpdateUserServiceRoleDto,
  ) {
    return this.usrService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une association',
  })
  remove(@Param('id') id: string) {
    return this.usrService.remove(id);
  }
}
