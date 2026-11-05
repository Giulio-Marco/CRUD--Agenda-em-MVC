import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCursoDto, UpdateCursoDto } from './dto/create-curso.dto';

@Injectable()
export class CursosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(email: string) {
    const usuario = await this.findPlatformUser(email);
    const [cursos, matriculas] = await Promise.all([
      this.prisma.curso.findMany({
        include: {
          categoria: true,
          instrutor: { select: { idUsuario: true, nomeCompleto: true, email: true } },
          _count: { select: { matriculas: true } },
        },
        orderBy: { dataPublicacao: 'desc' },
      }),
      this.prisma.matricula.findMany({
        where: { idUsuario: usuario.idUsuario },
        select: { idCurso: true },
      }),
    ]);
    const matriculados = new Set(matriculas.map((item) => item.idCurso));

    return cursos.map((curso) => this.serializeCurso(curso, matriculados.has(curso.idCurso)));
  }

  async findOne(email: string, idCurso: number) {
    const usuario = await this.findPlatformUser(email);
    const curso = await this.prisma.curso.findUnique({
      where: { idCurso },
      include: {
        categoria: true,
        instrutor: { select: { idUsuario: true, nomeCompleto: true, email: true } },
        modulos: {
          orderBy: { ordem: 'asc' },
          include: { aulas: { orderBy: { ordem: 'asc' } } },
        },
        _count: { select: { matriculas: true } },
      },
    });

    if (!curso) {
      throw new NotFoundException('Curso nao encontrado.');
    }

    const matricula = await this.prisma.matricula.findUnique({
      where: { idUsuario_idCurso: { idUsuario: usuario.idUsuario, idCurso } },
    });

    return {
      ...this.serializeCurso(curso, Boolean(matricula)),
      modulos: curso.modulos,
    };
  }

  async create(email: string, createCursoDto: CreateCursoDto) {
    const usuario = await this.findPlatformUser(email);
    const categoriaNome = createCursoDto.categoria.trim();
    const categoria = await this.prisma.categoria.upsert({
      where: { nome: categoriaNome },
      update: {},
      create: { nome: categoriaNome },
    });
    const curso = await this.prisma.curso.create({
      data: {
        titulo: createCursoDto.titulo.trim(),
        descricao: createCursoDto.descricao?.trim() || null,
        nivel: createCursoDto.nivel.trim(),
        totalHoras: createCursoDto.totalHoras ?? 0,
        idInstrutor: usuario.idUsuario,
        idCategoria: categoria.idCategoria,
      },
      include: {
        categoria: true,
        instrutor: { select: { idUsuario: true, nomeCompleto: true, email: true } },
        _count: { select: { matriculas: true } },
      },
    });

    return this.serializeCurso(curso, false);
  }

  async enroll(email: string, idCurso: number) {
    const usuario = await this.findPlatformUser(email);
    const curso = await this.prisma.curso.findUnique({ where: { idCurso } });

    if (!curso) {
      throw new NotFoundException('Curso nao encontrado.');
    }

    const matricula = await this.prisma.matricula.upsert({
      where: { idUsuario_idCurso: { idUsuario: usuario.idUsuario, idCurso } },
      update: {},
      create: { idUsuario: usuario.idUsuario, idCurso },
      include: { curso: { include: { categoria: true } } },
    });

    return {
      idMatricula: matricula.idMatricula,
      dataMatricula: matricula.dataMatricula,
      curso: {
        idCurso: matricula.curso.idCurso,
        titulo: matricula.curso.titulo,
        categoria: matricula.curso.categoria.nome,
      },
    };
  }

  async update(email: string, idCurso: number, dto: UpdateCursoDto) {
    const usuario = await this.findPlatformUser(email);
    const curso = await this.prisma.curso.findUnique({ where: { idCurso } });

    if (!curso) throw new NotFoundException('Curso nao encontrado.');
    if (curso.idInstrutor !== usuario.idUsuario) throw new ForbiddenException('Somente o instrutor pode alterar este curso.');

    let idCategoria = curso.idCategoria;
    if (dto.categoria !== undefined) {
      const categoria = await this.prisma.categoria.upsert({
        where: { nome: dto.categoria.trim() },
        update: {},
        create: { nome: dto.categoria.trim() },
      });
      idCategoria = categoria.idCategoria;
    }

    return this.prisma.curso.update({
      where: { idCurso },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo.trim() }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao?.trim() || null }),
        ...(dto.nivel !== undefined && { nivel: dto.nivel.trim() }),
        ...(dto.totalHoras !== undefined && { totalHoras: dto.totalHoras }),
        idCategoria,
      },
    });
  }

  async remove(email: string, idCurso: number) {
    const usuario = await this.findPlatformUser(email);
    const curso = await this.prisma.curso.findUnique({ where: { idCurso } });

    if (!curso) throw new NotFoundException('Curso nao encontrado.');
    if (curso.idInstrutor !== usuario.idUsuario) throw new ForbiddenException('Somente o instrutor pode excluir este curso.');

    await this.prisma.curso.delete({ where: { idCurso } });
  }

  async findMine(email: string) {
    const usuario = await this.findPlatformUser(email);
    const matriculas = await this.prisma.matricula.findMany({
      where: { idUsuario: usuario.idUsuario },
      include: {
        curso: {
          include: {
            categoria: true,
            instrutor: { select: { nomeCompleto: true } },
            _count: { select: { matriculas: true } },
          },
        },
      },
      orderBy: { dataMatricula: 'desc' },
    });

    return matriculas.map((matricula) => ({
      idMatricula: matricula.idMatricula,
      dataMatricula: matricula.dataMatricula,
      curso: this.serializeCurso(matricula.curso, true),
    }));
  }

  private async findPlatformUser(email: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      throw new UnauthorizedException('Usuario ainda nao sincronizado com a plataforma. Faca login novamente.');
    }

    return usuario;
  }

  private serializeCurso(curso: any, matriculado: boolean) {
    return {
      idCurso: curso.idCurso,
      titulo: curso.titulo,
      descricao: curso.descricao,
      nivel: curso.nivel,
      dataPublicacao: curso.dataPublicacao,
      totalAulas: curso.totalAulas,
      totalHoras: Number(curso.totalHoras),
      categoria: curso.categoria?.nome ?? null,
      instrutor: curso.instrutor
        ? { idUsuario: curso.instrutor.idUsuario, nome: curso.instrutor.nomeCompleto, email: curso.instrutor.email }
        : null,
      totalMatriculados: curso._count?.matriculas ?? 0,
      matriculado,
    };
  }
}
