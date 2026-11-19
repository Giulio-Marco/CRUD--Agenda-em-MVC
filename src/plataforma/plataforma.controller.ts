import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/auth-user';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  CreateAssinaturaDto,
  CreateAulaDto,
  CreateAvaliacaoDto,
  CreateCategoriaDto,
  CreateModuloDto,
  CreatePagamentoDto,
  CreatePlanoDto,
  CreateTrilhaDto,
  LinkTrilhaCursoDto,
  ProgressoAulaDto,
  UpdateAulaDto,
  UpdateAvaliacaoDto,
  UpdateCategoriaDto,
  UpdateModuloDto,
  UpdatePlanoDto,
  UpdateProgressoDto,
  UpdateTrilhaDto,
} from './dto/plataforma.dto';
import { PlataformaService } from './plataforma.service';

@ApiTags('plataforma')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PlataformaController {
  constructor(private readonly plataformaService: PlataformaService) {}

  @Get('categorias')
  @ApiOperation({ summary: 'Lista categorias de cursos' })
  listCategorias() { return this.plataformaService.listCategorias(); }

  @Post('categorias')
  @ApiOperation({ summary: 'Cria uma categoria' })
  @Roles('ADMIN')
  createCategoria(@Body() dto: CreateCategoriaDto) { return this.plataformaService.createCategoria(dto); }

  @Patch('categorias/:id')
  @ApiOperation({ summary: 'Atualiza uma categoria' })
  @Roles('ADMIN')
  updateCategoria(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoriaDto) {
    return this.plataformaService.updateCategoria(id, dto);
  }

  @Delete('categorias/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui uma categoria' })
  @Roles('ADMIN')
  deleteCategoria(@Param('id', ParseIntPipe) id: number) { return this.plataformaService.deleteCategoria(id); }

  @Get('cursos/:cursoId/modulos')
  @ApiOperation({ summary: 'Lista modulos de um curso' })
  listModulos(@Param('cursoId', ParseIntPipe) idCurso: number) { return this.plataformaService.listModulos(idCurso); }

  @Post('cursos/:cursoId/modulos')
  @ApiOperation({ summary: 'Cria modulo em um curso' })
  @Roles('ADMIN')
  createModulo(@Param('cursoId', ParseIntPipe) idCurso: number, @Body() dto: CreateModuloDto) {
    return this.plataformaService.createModulo(idCurso, dto);
  }

  @Patch('modulos/:id')
  @ApiOperation({ summary: 'Atualiza um modulo' })
  @Roles('ADMIN')
  updateModulo(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateModuloDto) {
    return this.plataformaService.updateModulo(id, dto);
  }

  @Delete('modulos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui um modulo' })
  @Roles('ADMIN')
  deleteModulo(@Param('id', ParseIntPipe) id: number) { return this.plataformaService.deleteModulo(id); }

  @Get('modulos/:moduloId/aulas')
  @ApiOperation({ summary: 'Lista aulas de um modulo' })
  listAulas(@Param('moduloId', ParseIntPipe) idModulo: number) { return this.plataformaService.listAulas(idModulo); }

  @Post('modulos/:moduloId/aulas')
  @ApiOperation({ summary: 'Cria aula em um modulo' })
  @Roles('ADMIN')
  createAula(@Param('moduloId', ParseIntPipe) idModulo: number, @Body() dto: CreateAulaDto) {
    return this.plataformaService.createAula(idModulo, dto);
  }

  @Patch('aulas/:id')
  @ApiOperation({ summary: 'Atualiza uma aula' })
  @Roles('ADMIN')
  updateAula(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAulaDto) {
    return this.plataformaService.updateAula(id, dto);
  }

  @Delete('aulas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui uma aula' })
  @Roles('ADMIN')
  deleteAula(@Param('id', ParseIntPipe) id: number) { return this.plataformaService.deleteAula(id); }

  @Get('matriculas')
  @ApiOperation({ summary: 'Lista matriculas do usuario autenticado' })
  @Roles('ALUNO')
  listMatriculas(@Request() request: { user: AuthUser }) { return this.plataformaService.listMatriculas(request.user.email); }

  @Delete('matriculas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancela uma matricula do aluno autenticado' })
  @Roles('ALUNO')
  deleteMatricula(@Request() request: { user: AuthUser }, @Param('id', ParseIntPipe) id: number) {
    return this.plataformaService.deleteMatricula(request.user.email, id);
  }

  @Get('progresso')
  @ApiOperation({ summary: 'Lista o progresso do usuario nas aulas' })
  @Roles('ALUNO')
  listProgresso(@Request() request: { user: AuthUser }) { return this.plataformaService.listProgresso(request.user.email); }

  @Put('aulas/:id/progresso')
  @ApiOperation({
    summary: 'Atualiza o progresso de uma aula',
    description:
      'Com status "concluido" na ultima aula que faltava de um curso em que o aluno esta matriculado, a matricula e concluida (dataConclusao, uma unica vez) e o evento curso.concluido e publicado no Kafka. O consumidor grava a notificacao CURSO_CONCLUIDO, lida em GET /notificacoes. Kafka fora do ar nao impede a conclusao.',
  })
  @ApiOkResponse({ type: ProgressoAulaDto })
  @Roles('ALUNO')
  updateProgresso(
    @Request() request: { user: AuthUser },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProgressoDto,
  ) { return this.plataformaService.updateProgresso(request.user, id, dto); }

  @Get('cursos/:cursoId/avaliacoes')
  @ApiOperation({ summary: 'Lista avaliacoes de um curso' })
  listAvaliacoes(@Param('cursoId', ParseIntPipe) idCurso: number) { return this.plataformaService.listAvaliacoes(idCurso); }

  @Post('cursos/:cursoId/avaliacoes')
  @ApiOperation({ summary: 'Cria ou atualiza a avaliacao do usuario no curso' })
  @Roles('ALUNO')
  createAvaliacao(
    @Request() request: { user: AuthUser },
    @Param('cursoId', ParseIntPipe) idCurso: number,
    @Body() dto: CreateAvaliacaoDto,
  ) { return this.plataformaService.createAvaliacao(request.user.email, idCurso, dto); }

  @Patch('avaliacoes/:id')
  @ApiOperation({ summary: 'Atualiza uma avaliacao' })
  @Roles('ALUNO')
  updateAvaliacao(
    @Request() request: { user: AuthUser },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAvaliacaoDto,
  ) { return this.plataformaService.updateAvaliacao(request.user.email, id, dto); }

  @Delete('avaliacoes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui uma avaliacao do aluno autenticado' })
  @Roles('ALUNO')
  deleteAvaliacao(@Request() request: { user: AuthUser }, @Param('id', ParseIntPipe) id: number) {
    return this.plataformaService.deleteAvaliacao(request.user.email, id);
  }

  @Get('trilhas')
  @ApiOperation({ summary: 'Lista trilhas de aprendizagem' })
  listTrilhas() { return this.plataformaService.listTrilhas(); }

  @Get('trilhas/:id')
  @ApiOperation({ summary: 'Exibe uma trilha com seus cursos' })
  findTrilha(@Param('id', ParseIntPipe) id: number) { return this.plataformaService.findTrilha(id); }

  @Post('trilhas')
  @ApiOperation({ summary: 'Cria uma trilha' })
  @Roles('ADMIN')
  createTrilha(@Body() dto: CreateTrilhaDto) { return this.plataformaService.createTrilha(dto); }

  @Patch('trilhas/:id')
  @ApiOperation({ summary: 'Atualiza uma trilha' })
  @Roles('ADMIN')
  updateTrilha(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTrilhaDto) {
    return this.plataformaService.updateTrilha(id, dto);
  }

  @Delete('trilhas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui uma trilha' })
  @Roles('ADMIN')
  deleteTrilha(@Param('id', ParseIntPipe) id: number) { return this.plataformaService.deleteTrilha(id); }

  @Post('trilhas/:id/cursos')
  @ApiOperation({ summary: 'Adiciona curso a uma trilha' })
  @Roles('ADMIN')
  linkTrilhaCurso(@Param('id', ParseIntPipe) id: number, @Body() dto: LinkTrilhaCursoDto) {
    return this.plataformaService.linkTrilhaCurso(id, dto);
  }

  @Delete('trilhas/:id/cursos/:cursoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove curso de uma trilha' })
  @Roles('ADMIN')
  unlinkTrilhaCurso(@Param('id', ParseIntPipe) idTrilha: number, @Param('cursoId', ParseIntPipe) idCurso: number) {
    return this.plataformaService.unlinkTrilhaCurso(idTrilha, idCurso);
  }

  @Get('certificados')
  @ApiOperation({ summary: 'Lista certificados do usuario' })
  @Roles('ALUNO')
  listCertificados(@Request() request: { user: AuthUser }) { return this.plataformaService.listCertificados(request.user.email); }

  @Post('cursos/:cursoId/certificado')
  @ApiOperation({
    summary: 'Emite certificado de um curso concluido',
    description: 'Exige matricula com todas as aulas concluidas (Matricula.dataConclusao preenchida). Repetir devolve o mesmo certificado.',
  })
  @ApiBadRequestResponse({ description: 'Sem matricula no curso, ou curso ainda nao concluido.' })
  @Roles('ALUNO')
  issueCertificado(@Request() request: { user: AuthUser }, @Param('cursoId', ParseIntPipe) idCurso: number) {
    return this.plataformaService.issueCertificado(request.user.email, idCurso);
  }

  @Get('planos')
  @ApiOperation({ summary: 'Lista planos de assinatura' })
  listPlanos() { return this.plataformaService.listPlanos(); }

  @Post('planos')
  @ApiOperation({ summary: 'Cria um plano de assinatura' })
  @Roles('ADMIN')
  createPlano(@Body() dto: CreatePlanoDto) { return this.plataformaService.createPlano(dto); }

  @Patch('planos/:id')
  @ApiOperation({ summary: 'Atualiza um plano' })
  @Roles('ADMIN')
  updatePlano(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlanoDto) {
    return this.plataformaService.updatePlano(id, dto);
  }

  @Delete('planos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui um plano' })
  @Roles('ADMIN')
  deletePlano(@Param('id', ParseIntPipe) id: number) { return this.plataformaService.deletePlano(id); }

  @Get('assinaturas')
  @ApiOperation({ summary: 'Lista assinaturas do usuario' })
  @Roles('ALUNO')
  listAssinaturas(@Request() request: { user: AuthUser }) { return this.plataformaService.listAssinaturas(request.user.email); }

  @Post('assinaturas')
  @ApiOperation({ summary: 'Cria uma assinatura para o usuario' })
  @Roles('ALUNO')
  createAssinatura(@Request() request: { user: AuthUser }, @Body() dto: CreateAssinaturaDto) {
    return this.plataformaService.createAssinatura(request.user.email, dto);
  }

  @Get('pagamentos')
  @ApiOperation({ summary: 'Lista pagamentos do usuario' })
  @Roles('ALUNO')
  listPagamentos(@Request() request: { user: AuthUser }) { return this.plataformaService.listPagamentos(request.user.email); }

  @Post('pagamentos')
  @ApiOperation({ summary: 'Registra pagamento de assinatura' })
  @Roles('ALUNO')
  createPagamento(@Request() request: { user: AuthUser }, @Body() dto: CreatePagamentoDto) {
    return this.plataformaService.createPagamento(request.user.email, dto);
  }
}
