import { Injectable, NotFoundException } from '@nestjs/common';
import { TipoNotificacao } from '../generated/prisma/client';
import { UsuarioRegistradoEvento } from '../mensageria/kafka.config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificacoesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Idempotente: o unique (idUser, tipo) faz a reentrega da mesma mensagem
   * cair no "update" vazio em vez de criar uma segunda notificacao.
   */
  criarBoasVindas(evento: UsuarioRegistradoEvento) {
    const nome = evento.nome?.trim() || evento.email;

    return this.prisma.notificacao.upsert({
      where: { idUser_tipo: { idUser: evento.idUser, tipo: TipoNotificacao.BOAS_VINDAS } },
      update: {},
      create: {
        idUser: evento.idUser,
        tipo: TipoNotificacao.BOAS_VINDAS,
        titulo: 'Bem-vindo(a) à plataforma!',
        mensagem: `Olá, ${nome}! Seu cadastro foi concluído. Explore as trilhas e os cursos e comece a estudar.`,
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
