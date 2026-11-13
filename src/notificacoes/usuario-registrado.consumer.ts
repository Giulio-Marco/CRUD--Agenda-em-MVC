import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TOPICO_USUARIO_REGISTRADO, UsuarioRegistradoEvento } from '../mensageria/kafka.config';
import { NotificacoesService } from './notificacoes.service';

/** Consumidor Kafka (parte microservico do app hibrido, ver main.ts). */
@Controller()
export class UsuarioRegistradoConsumer {
  private readonly logger = new Logger(UsuarioRegistradoConsumer.name);

  constructor(private readonly notificacoesService: NotificacoesService) {}

  @EventPattern(TOPICO_USUARIO_REGISTRADO)
  async handleUsuarioRegistrado(@Payload() evento: UsuarioRegistradoEvento): Promise<void> {
    if (!evento || !Number.isInteger(evento.idUser) || typeof evento.email !== 'string') {
      this.logger.warn(`Mensagem invalida em ${TOPICO_USUARIO_REGISTRADO} ignorada: ${JSON.stringify(evento)}`);
      return;
    }

    // Erro tratado aqui: evento e fire-and-forget, e o filtro global do Prisma so entende HTTP.
    try {
      const notificacao = await this.notificacoesService.criarBoasVindas(evento);
      this.logger.log(`Notificacao de boas-vindas ${notificacao.id} pronta para o usuario ${evento.idUser}.`);
    } catch (erro) {
      const motivo = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(`Falha ao gravar boas-vindas do usuario ${evento.idUser}: ${motivo}`);
    }
  }
}
