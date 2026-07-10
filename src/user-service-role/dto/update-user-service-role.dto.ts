import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserServiceRoleDto {
  @ApiPropertyOptional({
    example: 'uuid-user',
    description: "ID de l'utilisateur",
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    example: 'uuid-service',
    description: 'ID du service',
  })
  @IsOptional()
  @IsUUID()
  serviceId?: string;
}
