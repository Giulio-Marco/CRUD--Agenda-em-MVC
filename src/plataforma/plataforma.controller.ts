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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/auth-user';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
@UseGuards(JwtAuthGuard)
@Controller()
export class PlataformaController {
  constructor(private readonly plataformaService: PlataformaService) {}

  @Get('categorias')
  @ApiOperation({ summary: 'Lista categorias de cursos' })
  listCategorias() { return this.plataformaService.listCategorias(); }

  @Post('categorias')
  @ApiOperation({ summary: 'Cria uma categoria' })
  createCategoria(@Body() dto: CreateCategoriaDto) { return this.plataformaService.createCategoria(dto); }

  @Patch('categorias/:id')
  @ApiOperation({ summary: 'Atualiza uma categoria' })
  updateCategoria(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoriaDto) {
    return this.plataformaService.updateCategoria(id, dto);
  }

  @Delete('categorias/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCategoria(@Param('id', ParseIntPipe) id: number) { return this.plataformaService.deleteCategoria(id); }

  @Get('cursos/:cursoId/modulos')
  @ApiOperation({ summary: 'Lista modulos de um curso' })
  listModulos(@Param('cursoId', ParseIntPipe) idCurso: number) { return this.plataformaService.listModulos(idCurso); }

  @Post('cursos/:cursoId/modulos')
  @ApiOperation({ summary: 'Cria modulo em um curso' })
  createModulo(@Param('cursoId', ParseIntPipe) idCurso: number, @Body() dto: CreateModuloDto) {
    return this.plataformaService.createModulo(idCurso, dto);
  }

  @Patch('modulos/:id')
  @ApiOperation({ summary: 'Atualiza um modulo' })
  updateModulo(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateModuloDto) {
    return this.plataformaService.updateModulo(id, dto);
  }

  @Delete('modulos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteModulo(@Param('id', ParseIntPipe) id: number) { return this.plataformaService.deleteModulo(id); }

  @Get('modulos/:moduloId/aulas')
  @ApiOperation({ summary: 'Lista aulas de um modulo' })
  listAulas(@Param('moduloId', ParseIntPipe) idModulo: number) { return this.plataformaService.listAulas(idModulo); }

  @Post('modulos/:moduloId/aulas')
  @ApiOperation({ summary: 'Cria aula em um modulo' })
  createAula(@Param('moduloId', ParseIntPipe) idModulo: number, @Body() dto: CreateAulaDto) {
    return this.plataformaService.createAula(idModulo, dto);
  }

  @Patch('aulas/:id')
  @ApiOperation({ summary: 'Atualiza uma aula' })
  updateAula(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAulaDto) {
    return this.plataformaService.updateAula(id, dto);
  }

  @Delete('aulas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAula(@Param('id', ParseIntPipe) id: number) { return this.plataformaService.deleteAula(id); }

  @Get('matriculas')
  @ApiOperation({ summary: 'Lista matriculas do usuario autenticado' })
  listMatriculas(@Request() request: { user: AuthUser }) { return this.plataformaService.listMatriculas(request.user.email); }

  @Delete('matriculas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMatricula(@Request() request: { user: AuthUser }, @Param('id', ParseIntPipe) id: number) {
    return this.plataformaService.deleteMatricula(request.user.email, id);
  }

  @Get('progresso')
  @ApiOperation({ summary: 'Lista o progresso do usuario nas aulas' })
  listProgresso(@Request() request: { user: AuthUser }) { return this.plataformaService.listProgresso(request.user.email); }

  @Put('aulas/:id/progresso')
  @ApiOperation({ summary: 'Atualiza o progresso de uma aula' })
  updateProgresso(
    @Request() request: { user: AuthUser },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProgressoDto,
  ) { return this.plataformaService.updateProgresso(request.user.email, id, dto); }

  @Get('cursos/:cursoId/avaliacoes')
  @ApiOperation({ summary: 'Lista avaliacoes de um curso' })
  listAvaliacoes(@Param('cursoId', ParseIntPipe) idCurso: number) { return this.plataformaService.listAvaliacoes(idCurso); }

  @Post('cursos/:cursoId/avaliacoes')
  @ApiOperation({ summary: 'Cria ou atualiza a avaliacao do usuario no curso' })
  createAvaliacao(
    @Request() request: { user: AuthUser },
    @Param('cursoId', ParseIntPipe) idCurso: number,
    @Body() dto: CreateAvaliacaoDto,
  ) { return this.plataformaService.createAvaliacao(request.user.email, idCurso, dto); }

  @Patch('avaliacoes/:id')
  @ApiOperation({ summary: 'Atualiza uma avaliacao' })
  updateAvaliacao(
    @Request() request: { user: AuthUser },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAvaliacaoDto,
  ) { return this.plataformaService.updateAvaliacao(request.user.email, id, dto); }

  @Delete('avaliacoes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
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
  createTrilha(@Body() dto: CreateTrilhaDto) { return this.plataformaService.createTrilha(dto); }

  @Patch('trilhas/:id')
  @ApiOperation({ summary: 'Atualiza uma trilha' })
  updateTrilha(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTrilhaDto) {
    return this.plataformaService.updateTrilha(id, dto);
  }

  @Delete('trilhas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTrilha(@Param('id', ParseIntPipe) id: number) { return this.plataformaService.deleteTrilha(id); }

  @Post('trilhas/:id/cursos')
  @ApiOperation({ summary: 'Adiciona curso a uma trilha' })
  linkTrilhaCurso(@Param('id', ParseIntPipe) id: number, @Body() dto: LinkTrilhaCursoDto) {
    return this.plataformaService.linkTrilhaCurso(id, dto);
  }

  @Delete('trilhas/:id/cursos/:cursoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  unlinkTrilhaCurso(@Param('id', ParseIntPipe) idTrilha: number, @Param('cursoId', ParseIntPipe) idCurso: number) {
    return this.plataformaService.unlinkTrilhaCurso(idTrilha, idCurso);
  }

  @Get('certificados')
  @ApiOperation({ summary: 'Lista certificados do usuario' })
  listCertificados(@Request() request: { user: AuthUser }) { return this.plataformaService.listCertificados(request.user.email); }

  @Post('cursos/:cursoId/certificado')
  @ApiOperation({ summary: 'Emite certificado para curso matriculado' })
  issueCertificado(@Request() request: { user: AuthUser }, @Param('cursoId', ParseIntPipe) idCurso: number) {
    return this.plataformaService.issueCertificado(request.user.email, idCurso);
  }

  @Get('planos')
  @ApiOperation({ summary: 'Lista planos de assinatura' })
  listPlanos() { return this.plataformaService.listPlanos(); }

  @Post('planos')
  @ApiOperation({ summary: 'Cria um plano de assinatura' })
  createPlano(@Body() dto: CreatePlanoDto) { return this.plataformaService.createPlano(dto); }

  @Patch('planos/:id')
  @ApiOperation({ summary: 'Atualiza um plano' })
  updatePlano(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlanoDto) {
    return this.plataformaService.updatePlano(id, dto);
  }

  @Delete('planos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePlano(@Param('id', ParseIntPipe) id: number) { return this.plataformaService.deletePlano(id); }

  @Get('assinaturas')
  @ApiOperation({ summary: 'Lista assinaturas do usuario' })
  listAssinaturas(@Request() request: { user: AuthUser }) { return this.plataformaService.listAssinaturas(request.user.email); }

  @Post('assinaturas')
  @ApiOperation({ summary: 'Cria uma assinatura para o usuario' })
  createAssinatura(@Request() request: { user: AuthUser }, @Body() dto: CreateAssinaturaDto) {
    return this.plataformaService.createAssinatura(request.user.email, dto);
  }

  @Get('pagamentos')
  @ApiOperation({ summary: 'Lista pagamentos do usuario' })
  listPagamentos(@Request() request: { user: AuthUser }) { return this.plataformaService.listPagamentos(request.user.email); }

  @Post('pagamentos')
  @ApiOperation({ summary: 'Registra pagamento de assinatura' })
  createPagamento(@Request() request: { user: AuthUser }, @Body() dto: CreatePagamentoDto) {
    return this.plataformaService.createPagamento(request.user.email, dto);
  }
}
