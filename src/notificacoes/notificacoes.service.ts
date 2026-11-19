import { Injectable, NotFoundException } from '@nestjs/common';
import { TipoNotificacao } from '../generated/prisma/client';
import { CursoConcluidoEvento, UsuarioRegistradoEvento } from '../mensageria/kafka.config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificacoesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Idempotente sem depender do unique: BOAS_VINDAS tem idCurso nulo, e no Postgres NULL nao
   * conflita no unique (idUser, tipo, idCurso). O findFirst + create basta porque o topico tem
   * uma particao e o consumidor processa as mensagens uma de cada vez (sem corrida).
   */
  async criarBoasVindas(evento: UsuarioRegistradoEvento) {
    const existente = await this.prisma.notificacao.findFirst({
      where: { idUser: evento.idUser, tipo: TipoNotificacao.BOAS_VINDAS },
    });
    if (existente) return existente;

    const nome = evento.nome?.trim() || evento.email;
    return this.prisma.notificacao.create({
      data: {
        idUser: evento.idUser,
        tipo: TipoNotificacao.BOAS_VINDAS,
        titulo: 'Bem-vindo(a) à plataforma!',
        mensagem: `Olá, ${nome}! Seu cadastro foi concluído. Explore as trilhas e os cursos e comece a estudar.`,
      },
    });
  }

  /** Idempotente pelo unique (idUser, tipo, idCurso): a reentrega cai no "update" vazio. */
  criarCursoConcluido(evento: CursoConcluidoEvento) {
    return this.prisma.notificacao.upsert({
      where: {
        idUser_tipo_idCurso: {
          idUser: evento.idUser,
          tipo: TipoNotificacao.CURSO_CONCLUIDO,
          idCurso: evento.idCurso,
        },
      },
      update: {},
      create: {
        idUser: evento.idUser,
        tipo: TipoNotificacao.CURSO_CONCLUIDO,
        idCurso: evento.idCurso,
        titulo: 'Curso concluído!',
        mensagem: `Parabéns por terminar o curso de ${evento.tituloCurso}!`,
      },
    });
  }

  listar(idUser: number) {
    return this.prisma.notificacao.findMany({
      where: { idUser },
      orderBy: [{ criadaEm: 'desc' }, { id: 'desc' }],
    });
  }

  async marcarComoLida(idUser: number, id: number) {
    const notificacao = await this.prisma.notificacao.findFirst({ where: { id, idUser } });

    if (!notificacao) {
      throw new NotFoundException('Notificação não encontrada.');
    }

    return this.prisma.notificacao.update({ where: { id }, data: { lida: true } });
  }
}
