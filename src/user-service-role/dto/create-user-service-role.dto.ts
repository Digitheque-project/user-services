import { IsNotEmpty, IsUUID } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserServiceRoleDto {
  @ApiProperty({
    example: 'uuid-user',
    description: "ID de l'utilisateur",
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'uuid-service',
    description: 'ID du service',
  })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({
    example: 'uuid-role',
    description: 'ID du rôle',
  })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
