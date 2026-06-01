import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Rakoto',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Jean',
  })
  @IsOptional()
  @IsString()
  firstname?: string;

  @ApiPropertyOptional({
    example: 'Médecin',
  })
  @IsOptional()
  @IsString()
  job?: string;

  @ApiPropertyOptional({
    example: 'MAT001',
  })
  @IsOptional()
  @IsString()
  matricule?: string;

  @ApiPropertyOptional({
    example: 'ORD123456',
  })
  @IsOptional()
  @IsString()
  registration_number_professional_order?: string;

  @ApiPropertyOptional({
    example: 'Ordre des médecins',
  })
  @IsOptional()
  @IsString()
  professional_order?: string;

  @ApiPropertyOptional({
    example: 'rakoto@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '0341234567',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
