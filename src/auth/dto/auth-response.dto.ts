import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../generated/prisma/client';

export class AuthUserResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'aluno@exemplo.com' })
  email!: string;

  @ApiProperty({ example: 'Giulio Marco', nullable: true })
  name!: string | null;

  @ApiProperty({ enum: Role, example: Role.ALUNO, description: 'Papel do usuario: ADMIN ou ALUNO.' })
  role!: Role;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT para enviar como Bearer token nas rotas protegidas.' })
  access_token!: string;

  @ApiProperty({ type: AuthUserResponseDto })
  user!: AuthUserResponseDto;
}
