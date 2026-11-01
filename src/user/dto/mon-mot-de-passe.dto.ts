import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class MonMotDePasseDto {
  @ApiProperty({ description: 'Mot de passe actuel' })
  @IsString()
  @IsNotEmpty()
  ancien: string;

  @ApiProperty({ description: 'Nouveau mot de passe (8 caractères minimum)', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  nouveau: string;
}
