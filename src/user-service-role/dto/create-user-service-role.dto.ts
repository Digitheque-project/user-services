import { IsNotEmpty, IsUUID, IsArray, ArrayMinSize } from 'class-validator';

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
    example: ['uuid-role-1', 'uuid-role-2'],
    description: 'Liste des IDs des rôles à assigner',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  roleIds: string[];
}
