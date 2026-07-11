import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserService } from './user.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiBearerAuth('access-token')
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un utilisateur',
  })
  @ApiBody({ type: CreateUserDto })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les utilisateurs',
  })
  async findAll(
    @Query('search') search?: string,
    @Query('roleId') roleId?: string,
    @Query('serviceId') serviceId?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const users = await this.userService.findAll({
      search,
      roleId,
      serviceId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return { users, total: users.length };
  }

  @Get('by-email/:email')
  @ApiOperation({
    summary: 'Trouver un utilisateur par email',
  })
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Get('chu/:chuId')
  @ApiOperation({
    summary: 'Lister les utilisateurs d\'un CHU',
  })
  findByChu(@Param('chuId') chuId: string) {
    return this.userService.findByChu(chuId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Afficher un utilisateur',
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier un utilisateur',
  })
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur mis à jour avec succès',
  })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Patch(':id/password')
  @ApiOperation({
    summary: 'Modifier le mot de passe d\'un utilisateur',
  })
  @ApiBody({
    type: ChangePasswordDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe mis à jour',
  })
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un utilisateur',
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
