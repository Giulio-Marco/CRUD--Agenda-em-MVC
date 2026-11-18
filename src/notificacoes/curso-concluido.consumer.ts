import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CursoConcluidoEvento, TOPICO_CURSO_CONCLUIDO } from '../mensageria/kafka.config';
import { NotificacoesService } from './notificacoes.service';

/** Consumidor Kafka (parte microservico do app hibrido, grupo notificacoes-server, ver main.ts). */
@Controller()
export class CursoConcluidoConsumer {
  private readonly logger = new Logger(CursoConcluidoConsumer.name);

  constructor(private readonly notificacoesService: NotificacoesService) {}

  @EventPattern(TOPICO_CURSO_CONCLUIDO)
  async handleCursoConcluido(@Payload() evento: CursoConcluidoEvento): Promise<void> {
    if (
      !evento ||
      !Number.isInteger(evento.idUser) ||
      !Number.isInteger(evento.idCurso) ||
      typeof evento.tituloCurso !== 'string'
    ) {
      this.logger.warn(`Mensagem invalida em ${TOPICO_CURSO_CONCLUIDO} ignorada: ${JSON.stringify(evento)}`);
      return;
    }

    // Erro tratado aqui: evento e fire-and-forget, e o filtro global do Prisma so entende HTTP.
    try {
      const notificacao = await this.notificacoesService.criarCursoConcluido(evento);
      this.logger.log(
        `Notificacao de curso concluido ${notificacao.id} pronta para o usuario ${evento.idUser} (curso ${evento.idCurso}).`,
      );
    } catch (erro) {
      const motivo = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(`Falha ao gravar curso concluido do usuario ${evento.idUser} (curso ${evento.idCurso}): ${motivo}`);
    }
  }
}
