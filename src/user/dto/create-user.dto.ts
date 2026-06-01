import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Rakoto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Jean' })
  @IsOptional()
  @IsString()
  firstname?: string;

  @ApiProperty({ example: 'Médecin' })
  @IsString()
  @IsNotEmpty()
  job: string;

  @ApiPropertyOptional({ example: 'MAT001' })
  @IsOptional()
  @IsString()
  matricule?: string;

  @ApiProperty({ example: 'ORD123456' })
  @IsString()
  @IsNotEmpty()
  registration_number_professional_order: string;

  @ApiProperty({ example: 'Ordre des médecins' })
  @IsString()
  @IsNotEmpty()
  professional_order: string;

  @ApiProperty({ example: 'rakoto@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0341234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'hashedpassword' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
