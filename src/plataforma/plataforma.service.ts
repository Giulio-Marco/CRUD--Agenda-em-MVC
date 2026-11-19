import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthUser } from '../auth/auth-user';
import { MensageriaService } from '../mensageria/mensageria.service';
import { PrismaService } from '../prisma/prisma.service';
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
  UpdateTrilhaDto,
  UpdateProgressoDto,
} from './dto/plataforma.dto';

/** Status de ProgressoAula que conta como aula concluida (o app envia exatamente este valor). */
export const STATUS_AULA_CONCLUIDA = 'concluido';

@Injectable()
export class PlataformaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mensageriaService: MensageriaService,
  ) {}

  listCategorias() {
    return this.prisma.categoria.findMany({ orderBy: { nome: 'asc' } });
  }

  createCategoria(dto: CreateCategoriaDto) {
    return this.prisma.categoria.create({
      data: { nome: dto.nome.trim(), descricao: dto.descricao?.trim() || null },
    });
  }

  updateCategoria(idCategoria: number, dto: UpdateCategoriaDto) {
    return this.prisma.categoria.update({
      where: { idCategoria },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome.trim() }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao?.trim() || null }),
      },
    });
  }

  async deleteCategoria(idCategoria: number) {
    await this.requireCategoria(idCategoria);
    await this.prisma.categoria.delete({ where: { idCategoria } });
  }

  listModulos(idCurso: number) {
    return this.prisma.modulo.findMany({
      where: { idCurso },
      include: { aulas: { orderBy: { ordem: 'asc' } } },
      orderBy: { ordem: 'asc' },
    });
  }

  async createModulo(idCurso: number, dto: CreateModuloDto) {
    await this.requireCurso(idCurso);
    return this.prisma.modulo.create({
      data: { idCurso, titulo: dto.titulo.trim(), ordem: dto.ordem },
      include: { aulas: true },
    });
  }

  updateModulo(idModulo: number, dto: UpdateModuloDto) {
    return this.prisma.modulo.update({
      where: { idModulo },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo.trim() }),
        ...(dto.ordem !== undefined && { ordem: dto.ordem }),
      },
    });
  }

  async deleteModulo(idModulo: number) {
    await this.requireModulo(idModulo);
    await this.prisma.modulo.delete({ where: { idModulo } });
  }

  listAulas(idModulo: number) {
    return this.prisma.aula.findMany({ where: { idModulo }, orderBy: { ordem: 'asc' } });
  }

  async createAula(idModulo: number, dto: CreateAulaDto) {
    await this.requireModulo(idModulo);
    return this.prisma.aula.create({
      data: {
        idModulo,
        titulo: dto.titulo.trim(),
        tipoConteudo: dto.tipoConteudo.trim(),
        urlConteudo: dto.urlConteudo.trim(),
        duracaoMinutos: dto.duracaoMinutos,
        ordem: dto.ordem,
      },
    });
  }

  updateAula(idAula: number, dto: UpdateAulaDto) {
    return this.prisma.aula.update({
      where: { idAula },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo.trim() }),
        ...(dto.tipoConteudo !== undefined && { tipoConteudo: dto.tipoConteudo.trim() }),
        ...(dto.urlConteudo !== undefined && { urlConteudo: dto.urlConteudo.trim() }),
        ...(dto.duracaoMinutos !== undefined && { duracaoMinutos: dto.duracaoMinutos }),
        ...(dto.ordem !== undefined && { ordem: dto.ordem }),
      },
    });
  }

  async deleteAula(idAula: number) {
    await this.requireAula(idAula);
    await this.prisma.aula.delete({ where: { idAula } });
  }

  async listMatriculas(email: string) {
    const usuario = await this.requireUsuario(email);
    return this.prisma.matricula.findMany({
      where: { idUsuario: usuario.idUsuario },
      include: { curso: { include: { categoria: true } } },
      orderBy: { dataMatricula: 'desc' },
    });
  }

  async deleteMatricula(email: string, idMatricula: number) {
    const usuario = await this.requireUsuario(email);
    const matricula = await this.prisma.matricula.findFirst({
      where: { idMatricula, idUsuario: usuario.idUsuario },
    });

    if (!matricula) {
      throw new NotFoundException('Matricula nao encontrada.');
    }

    await this.prisma.matricula.delete({ where: { idMatricula } });
  }

  async listProgresso(email: string) {
    const usuario = await this.requireUsuario(email);
    return this.prisma.progressoAula.findMany({
      where: { idUsuario: usuario.idUsuario },
      include: { aula: { include: { modulo: { include: { curso: true } } } } },
      orderBy: { dataConclusao: 'desc' },
    });
  }

  /**
   * Registra o progresso da aula. Quando a aula concluida e a ultima que faltava no curso,
   * preenche Matricula.dataConclusao e publica curso.concluido (uma unica vez por matricula).
   * `auth.userId` (tabela User) vai no evento; `auth.email` acha o Usuario da plataforma.
   */
  async updateProgresso(auth: AuthUser, idAula: number, dto: UpdateProgressoDto) {
    const usuario = await this.requireUsuario(auth.email);
    const aula = await this.prisma.aula.findUnique({
      where: { idAula },
      select: { modulo: { select: { idCurso: true } } },
    });
    if (!aula) throw new NotFoundException('Aula nao encontrada.');

    const status = dto.status.trim();
    const progresso = await this.prisma.progressoAula.upsert({
      where: { idUsuario_idAula: { idUsuario: usuario.idUsuario, idAula } },
      update: { status, dataConclusao: new Date() },
      create: { idUsuario: usuario.idUsuario, idAula, status },
    });

    const cursoConcluido =
      status.toLowerCase() === STATUS_AULA_CONCLUIDA &&
      (await this.registrarConclusaoDoCurso(auth.userId, usuario.idUsuario, aula.modulo.idCurso));

    return { ...progresso, cursoConcluido };
  }

  /** Devolve true so na chamada que concluiu o curso agora. */
  private async registrarConclusaoDoCurso(idUser: number, idUsuario: number, idCurso: number) {
    const [totalAulas, concluidas] = await Promise.all([
      this.prisma.aula.count({ where: { modulo: { idCurso } } }),
      this.prisma.progressoAula.count({
        where: {
          idUsuario,
          status: { equals: STATUS_AULA_CONCLUIDA, mode: 'insensitive' },
          aula: { modulo: { idCurso } },
        },
      }),
    ]);
    if (totalAulas === 0 || concluidas < totalAulas) return false;

    // O filtro dataConclusao: null torna a conclusao atomica: com duas requisicoes ao mesmo tempo,
    // so uma atualiza a linha e publica o evento. Sem matricula, nada e atualizado.
    const { count } = await this.prisma.matricula.updateMany({
      where: { idUsuario, idCurso, dataConclusao: null },
      data: { dataConclusao: new Date() },
    });
    if (count === 0) return false;

    const curso = await this.requireCurso(idCurso);
    // Sem await: o Kafka fora do ar nao impede a conclusao da aula (aviso no log).
    this.mensageriaService.publicarCursoConcluido({ idUser, idCurso, tituloCurso: curso.titulo });
    return true;
  }

  async listAvaliacoes(idCurso: number) {
    await this.requireCurso(idCurso);
    return this.prisma.avaliacao.findMany({
      where: { idCurso },
      include: { usuario: { select: { idUsuario: true, nomeCompleto: true } } },
      orderBy: { dataAvaliacao: 'desc' },
    });
  }

  async createAvaliacao(email: string, idCurso: number, dto: CreateAvaliacaoDto) {
    const usuario = await this.requireUsuario(email);
    await this.requireCurso(idCurso);
    const matricula = await this.prisma.matricula.findUnique({
      where: { idUsuario_idCurso: { idUsuario: usuario.idUsuario, idCurso } },
    });

    if (!matricula) {
      throw new BadRequestException('Matricule-se no curso antes de avaliar.');
    }

    const existente = await this.prisma.avaliacao.findFirst({
      where: { idUsuario: usuario.idUsuario, idCurso },
    });

    if (existente) {
      return this.prisma.avaliacao.update({
        where: { idAvaliacao: existente.idAvaliacao },
        data: { nota: dto.nota, comentario: dto.comentario?.trim() || null },
      });
    }

    return this.prisma.avaliacao.create({
      data: {
        idUsuario: usuario.idUsuario,
        idCurso,
        nota: dto.nota,
        comentario: dto.comentario?.trim() || null,
      },
    });
  }

  async updateAvaliacao(email: string, idAvaliacao: number, dto: UpdateAvaliacaoDto) {
    const usuario = await this.requireUsuario(email);
    const avaliacao = await this.prisma.avaliacao.findFirst({ where: { idAvaliacao, idUsuario: usuario.idUsuario } });

    if (!avaliacao) {
      throw new NotFoundException('Avaliacao nao encontrada.');
    }

    return this.prisma.avaliacao.update({
      where: { idAvaliacao },
      data: {
        ...(dto.nota !== undefined && { nota: dto.nota }),
        ...(dto.comentario !== undefined && { comentario: dto.comentario?.trim() || null }),
      },
    });
  }

  async deleteAvaliacao(email: string, idAvaliacao: number) {
    const usuario = await this.requireUsuario(email);
    const avaliacao = await this.prisma.avaliacao.findFirst({ where: { idAvaliacao, idUsuario: usuario.idUsuario } });

    if (!avaliacao) {
      throw new NotFoundException('Avaliacao nao encontrada.');
    }

    await this.prisma.avaliacao.delete({ where: { idAvaliacao } });
  }

  listTrilhas() {
    return this.prisma.trilha.findMany({
      include: { categoria: true, _count: { select: { trilhasCursos: true } } },
      orderBy: { titulo: 'asc' },
    });
  }

  async findTrilha(idTrilha: number) {
    const trilha = await this.prisma.trilha.findUnique({
      where: { idTrilha },
      include: {
        categoria: true,
        trilhasCursos: { orderBy: { ordem: 'asc' }, include: { curso: true } },
      },
    });

    if (!trilha) {
      throw new NotFoundException('Trilha nao encontrada.');
    }

    return trilha;
  }

  async createTrilha(dto: CreateTrilhaDto) {
    await this.requireCategoria(dto.idCategoria);
    return this.prisma.trilha.create({
      data: { titulo: dto.titulo.trim(), descricao: dto.descricao?.trim() || null, idCategoria: dto.idCategoria },
      include: { categoria: true },
    });
  }

  updateTrilha(idTrilha: number, dto: UpdateTrilhaDto) {
    return this.prisma.trilha.update({
      where: { idTrilha },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo.trim() }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao?.trim() || null }),
        ...(dto.idCategoria !== undefined && { idCategoria: dto.idCategoria }),
      },
    });
  }

  async deleteTrilha(idTrilha: number) {
    await this.findTrilha(idTrilha);
    await this.prisma.trilha.delete({ where: { idTrilha } });
  }

  async linkTrilhaCurso(idTrilha: number, dto: LinkTrilhaCursoDto) {
    await this.findTrilha(idTrilha);
    await this.requireCurso(dto.idCurso);
    return this.prisma.trilhaCurso.upsert({
      where: { idTrilha_idCurso: { idTrilha, idCurso: dto.idCurso } },
      update: { ordem: dto.ordem },
      create: { idTrilha, idCurso: dto.idCurso, ordem: dto.ordem },
    });
  }

  async unlinkTrilhaCurso(idTrilha: number, idCurso: number) {
    await this.prisma.trilhaCurso.delete({ where: { idTrilha_idCurso: { idTrilha, idCurso } } });
  }

  async listCertificados(email: string) {
    const usuario = await this.requireUsuario(email);
    return this.prisma.certificado.findMany({
      where: { idUsuario: usuario.idUsuario },
      include: { curso: true, trilha: true },
      orderBy: { dataEmissao: 'desc' },
    });
  }

  async issueCertificado(email: string, idCurso: number, idTrilha?: number) {
    const usuario = await this.requireUsuario(email);
    await this.requireCurso(idCurso);
    const matricula = await this.prisma.matricula.findUnique({
      where: { idUsuario_idCurso: { idUsuario: usuario.idUsuario, idCurso } },
    });

    if (!matricula) {
      throw new BadRequestException('Matricule-se no curso antes de emitir o certificado.');
    }

    // dataConclusao e preenchida em updateProgresso quando a ultima aula do curso e concluida.
    if (!matricula.dataConclusao) {
      throw new BadRequestException('Conclua todas as aulas do curso antes de emitir o certificado.');
    }

    const existente = await this.prisma.certificado.findFirst({ where: { idUsuario: usuario.idUsuario, idCurso } });
    if (existente) return existente;

    if (idTrilha !== undefined) await this.findTrilha(idTrilha);

    return this.prisma.certificado.create({
      data: {
        idUsuario: usuario.idUsuario,
        idCurso,
        idTrilha: idTrilha ?? null,
        codigoVerificacao: `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      },
      include: { curso: true, trilha: true },
    });
  }

  listPlanos() {
    return this.prisma.plano.findMany({ orderBy: { preco: 'asc' } });
  }

  createPlano(dto: CreatePlanoDto) {
    return this.prisma.plano.create({
      data: {
        nome: dto.nome.trim(),
        descricao: dto.descricao?.trim() || null,
        preco: dto.preco,
        duracaoMeses: dto.duracaoMeses,
      },
    });
  }

  updatePlano(idPlano: number, dto: UpdatePlanoDto) {
    return this.prisma.plano.update({
      where: { idPlano },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome.trim() }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao?.trim() || null }),
        ...(dto.preco !== undefined && { preco: dto.preco }),
        ...(dto.duracaoMeses !== undefined && { duracaoMeses: dto.duracaoMeses }),
      },
    });
  }

  async deletePlano(idPlano: number) {
    await this.requirePlano(idPlano);
    await this.prisma.plano.delete({ where: { idPlano } });
  }

  async listAssinaturas(email: string) {
    const usuario = await this.requireUsuario(email);
    return this.prisma.assinatura.findMany({
      where: { idUsuario: usuario.idUsuario },
      include: { plano: true, pagamentos: true },
      orderBy: { dataInicio: 'desc' },
    });
  }

  async createAssinatura(email: string, dto: CreateAssinaturaDto) {
    const usuario = await this.requireUsuario(email);
    await this.requirePlano(dto.idPlano);
    return this.prisma.assinatura.create({
      data: {
        idUsuario: usuario.idUsuario,
        idPlano: dto.idPlano,
        dataInicio: new Date(dto.dataInicio),
        dataFim: new Date(dto.dataFim),
      },
      include: { plano: true },
    });
  }

  async listPagamentos(email: string) {
    const usuario = await this.requireUsuario(email);
    return this.prisma.pagamento.findMany({
      where: { assinatura: { idUsuario: usuario.idUsuario } },
      include: { assinatura: { include: { plano: true } } },
      orderBy: { dataPagamento: 'desc' },
    });
  }

  async createPagamento(email: string, dto: CreatePagamentoDto) {
    const usuario = await this.requireUsuario(email);
    const assinatura = await this.prisma.assinatura.findFirst({
      where: { idAssinatura: dto.idAssinatura, idUsuario: usuario.idUsuario },
    });

    if (!assinatura) {
      throw new NotFoundException('Assinatura nao encontrada para este usuario.');
    }

    return this.prisma.pagamento.create({
      data: {
        idAssinatura: dto.idAssinatura,
        valorPago: dto.valorPago,
        metodoPagamento: dto.metodoPagamento.trim(),
        idTransacaoGateway: dto.idTransacaoGateway.trim(),
        dataFim: new Date(dto.dataFim),
      },
    });
  }

  private async requireUsuario(email: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario) throw new UnauthorizedException('Usuario nao sincronizado com a plataforma. Faca login novamente.');
    return usuario;
  }

  private async requireCurso(idCurso: number) {
    const curso = await this.prisma.curso.findUnique({ where: { idCurso } });
    if (!curso) throw new NotFoundException('Curso nao encontrado.');
    return curso;
  }

  private async requireCategoria(idCategoria: number) {
    const categoria = await this.prisma.categoria.findUnique({ where: { idCategoria } });
    if (!categoria) throw new NotFoundException('Categoria nao encontrada.');
    return categoria;
  }

  private async requireModulo(idModulo: number) {
    const modulo = await this.prisma.modulo.findUnique({ where: { idModulo } });
    if (!modulo) throw new NotFoundException('Modulo nao encontrado.');
    return modulo;
  }

  private async requireAula(idAula: number) {
    const aula = await this.prisma.aula.findUnique({ where: { idAula } });
    if (!aula) throw new NotFoundException('Aula nao encontrada.');
    return aula;
  }

  private async requirePlano(idPlano: number) {
    const plano = await this.prisma.plano.findUnique({ where: { idPlano } });
    if (!plano) throw new NotFoundException('Plano nao encontrado.');
    return plano;
  }
}
