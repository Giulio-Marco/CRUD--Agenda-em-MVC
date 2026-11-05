import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCursoDto {
  @ApiProperty({ example: 'Desenvolvimento Web com JavaScript' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  titulo!: string;

  @ApiPropertyOptional({ example: 'Aprenda os fundamentos para criar aplicacoes web.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descricao?: string;

  @ApiProperty({ example: 'Iniciante' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  nivel!: string;

  @ApiProperty({ example: 'Programacao' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  categoria!: string;

  @ApiPropertyOptional({ example: 12.5, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalHoras?: number;
}

export class UpdateCursoDto extends PartialType(CreateCursoDto) {}
