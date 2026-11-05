import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from '../auth/auth-user';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCursoDto, UpdateCursoDto } from './dto/create-curso.dto';
import { CursosService } from './cursos.service';

@ApiTags('cursos')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os cursos disponiveis para o usuario autenticado' })
  findAll(@Request() request: { user: AuthUser }) {
    return this.cursosService.findAll(request.user.email);
  }

  @Get('matriculados')
  @ApiOperation({ summary: 'Lista os cursos em que o usuario esta matriculado' })
  findMine(@Request() request: { user: AuthUser }) {
    return this.cursosService.findMine(request.user.email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Exibe um curso com seus modulos e aulas' })
  findOne(
    @Request() request: { user: AuthUser },
    @Param('id', ParseIntPipe) idCurso: number,
  ) {
    return this.cursosService.findOne(request.user.email, idCurso);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Curso criado usando o usuario autenticado como instrutor.' })
  @ApiOperation({ summary: 'Cria um curso na plataforma' })
  create(
    @Request() request: { user: AuthUser },
    @Body() createCursoDto: CreateCursoDto,
  ) {
    return this.cursosService.create(request.user.email, createCursoDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um curso do instrutor autenticado' })
  update(
    @Request() request: { user: AuthUser },
    @Param('id', ParseIntPipe) idCurso: number,
    @Body() updateCursoDto: UpdateCursoDto,
  ) {
    return this.cursosService.update(request.user.email, idCurso, updateCursoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui um curso do instrutor autenticado' })
  remove(@Request() request: { user: AuthUser }, @Param('id', ParseIntPipe) idCurso: number) {
    return this.cursosService.remove(request.user.email, idCurso);
  }

  @Post(':id/matricular')
  @ApiOperation({ summary: 'Matricula o usuario autenticado em um curso' })
  enroll(
    @Request() request: { user: AuthUser },
    @Param('id', ParseIntPipe) idCurso: number,
  ) {
    return this.cursosService.enroll(request.user.email, idCurso);
  }
}
