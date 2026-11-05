import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'aluno@exemplo.com' })
  email!: string;

  @ApiProperty({ example: 'Giulio Marco', nullable: true })
  name!: string | null;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT para enviar como Bearer token nas rotas protegidas.' })
  access_token!: string;

  @ApiProperty({ type: AuthUserResponseDto })
  user!: AuthUserResponseDto;
}
