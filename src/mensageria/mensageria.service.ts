import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_CLIENT, TOPICO_USUARIO_REGISTRADO, UsuarioRegistradoEvento } from './kafka.config';

@Injectable()
export class MensageriaService implements OnApplicationShutdown {
  private readonly logger = new Logger(MensageriaService.name);

  constructor(@Inject(KAFKA_CLIENT) private readonly kafka: ClientKafka) {}

  /**
   * Publica o evento sem bloquear quem chamou: o cadastro responde mesmo com o Kafka fora do ar.
   * A conexao com o Kafka e aberta no primeiro envio.
   */
  publicarUsuarioRegistrado(evento: UsuarioRegistradoEvento): void {
    this.kafka
      .emit(TOPICO_USUARIO_REGISTRADO, { key: String(evento.idUser), value: evento })
      .subscribe({
        complete: () =>
          this.logger.log(`Evento ${TOPICO_USUARIO_REGISTRADO} publicado (usuario ${evento.idUser}).`),
        error: (erro: unknown) => {
          const motivo = erro instanceof Error ? erro.message : String(erro);
          this.logger.warn(
            `Kafka indisponivel; evento ${TOPICO_USUARIO_REGISTRADO} do usuario ${evento.idUser} nao publicado: ${motivo}`,
          );
          // O ClientKafka guarda a conexao que falhou; fechar permite que o proximo envio reconecte.
          this.kafka.close().catch(() => undefined);
        },
      });
  }

  async onApplicationShutdown() {
    await this.kafka.close().catch(() => undefined);
  }
}
