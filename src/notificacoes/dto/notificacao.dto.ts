import { ApiProperty } from '@nestjs/swagger';
import { TipoNotificacao } from '../../generated/prisma/client';

export class NotificacaoDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 7, description: 'Id do usuario (tabela User) dono da notificacao.' })
  idUser!: number;

  @ApiProperty({
    enum: TipoNotificacao,
    example: TipoNotificacao.BOAS_VINDAS,
    description: 'BOAS_VINDAS (topico usuario.registrado) ou CURSO_CONCLUIDO (topico curso.concluido).',
  })
  tipo!: TipoNotificacao;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: null,
    description: 'Curso concluido (somente em CURSO_CONCLUIDO); null nas boas-vindas.',
  })
  idCurso!: number | null;

  @ApiProperty({ example: 'Bem-vindo(a) à plataforma!' })
  titulo!: string;

  @ApiProperty({ example: 'Olá, Maria! Seu cadastro foi concluído. Explore as trilhas e os cursos e comece a estudar.' })
  mensagem!: string;

  @ApiProperty({ example: false })
  lida!: boolean;

  @ApiProperty({ example: '2026-11-12T22:15:03.120Z' })
  criadaEm!: Date;
}
