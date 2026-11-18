import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Programacao' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome!: string;

  @ApiPropertyOptional({ example: 'Cursos de tecnologia.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;
}

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}

export class CreateModuloDto {
  @ApiProperty({ example: 'Fundamentos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  titulo!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  ordem!: number;
}

export class UpdateModuloDto extends PartialType(CreateModuloDto) {}

export class CreateAulaDto {
  @ApiProperty({ example: 'Introducao ao tema' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  titulo!: string;

  @ApiProperty({ example: 'video' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  tipoConteudo!: string;

  @ApiProperty({ example: 'https://exemplo.com/aula' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  urlConteudo!: string;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(1)
  duracaoMinutos!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  ordem!: number;
}

export class UpdateAulaDto extends PartialType(CreateAulaDto) {}

export class UpdateProgressoDto {
  @ApiProperty({
    example: 'concluido',
    description: 'Use "concluido" para marcar a aula como concluida (e o que conta para concluir o curso).',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  status!: string;
}

/** Resposta de PUT /aulas/:id/progresso. */
export class ProgressoAulaDto {
  @ApiProperty({ example: 3, description: 'Id do Usuario da plataforma.' })
  idUsuario!: number;

  @ApiProperty({ example: 12 })
  idAula!: number;

  @ApiProperty({ example: 'concluido' })
  status!: string;

  @ApiProperty({ example: '2026-11-18T14:05:00.000Z' })
  dataConclusao!: Date;

  @ApiProperty({
    example: true,
    description:
      'true somente na requisicao que concluiu a ultima aula do curso: a matricula recebe dataConclusao e o evento curso.concluido e publicado no Kafka (gera a notificacao CURSO_CONCLUIDO).',
  })
  cursoConcluido!: boolean;
}

export class CreateAvaliacaoDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  nota!: number;

  @ApiPropertyOptional({ example: 'Excelente curso.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comentario?: string;
}

export class UpdateAvaliacaoDto extends PartialType(CreateAvaliacaoDto) {}

export class CreateTrilhaDto {
  @ApiProperty({ example: 'Trilha Frontend' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  titulo!: string;

  @ApiPropertyOptional({ example: 'Jornada de estudos.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descricao?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  idCategoria!: number;
}

export class UpdateTrilhaDto extends PartialType(CreateTrilhaDto) {}

export class LinkTrilhaCursoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  idCurso!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  ordem!: number;
}

export class CreatePlanoDto {
  @ApiProperty({ example: 'Plano Mensal' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome!: string;

  @ApiPropertyOptional({ example: 'Acesso completo.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;

  @ApiProperty({ example: 49.9, minimum: 0 })
  @IsNumber()
  @Min(0)
  preco!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  duracaoMeses!: number;
}

export class UpdatePlanoDto extends PartialType(CreatePlanoDto) {}

export class CreateAssinaturaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  idPlano!: number;

  @ApiProperty({ example: '2026-10-01T00:00:00.000Z' })
  @IsISO8601()
  dataInicio!: string;

  @ApiProperty({ example: '2026-11-01T00:00:00.000Z' })
  @IsISO8601()
  dataFim!: string;
}

export class CreatePagamentoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  idAssinatura!: number;

  @ApiProperty({ example: 49.9, minimum: 0 })
  @IsNumber()
  @Min(0)
  valorPago!: number;

  @ApiProperty({ example: 'Cartao' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  metodoPagamento!: string;

  @ApiProperty({ example: 'transacao-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  idTransacaoGateway!: string;

  @ApiProperty({ example: '2026-11-01T00:00:00.000Z' })
  @IsISO8601()
  dataFim!: string;
}

