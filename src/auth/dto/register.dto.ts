import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Giulio Marco' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'aluno@exemplo.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  // Aceito so para o ValidationPipe (forbidNonWhitelisted) nao responder 400. O service ignora o valor.
  @ApiHideProperty()
  @IsOptional()
  role?: unknown;
}
