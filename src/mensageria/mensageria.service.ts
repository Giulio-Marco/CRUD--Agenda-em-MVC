import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  CursoConcluidoEvento,
  KAFKA_CLIENT,
  TOPICO_CURSO_CONCLUIDO,
  TOPICO_USUARIO_REGISTRADO,
  UsuarioRegistradoEvento,
} from './kafka.config';

@Injectable()
export class MensageriaService implements OnApplicationShutdown {
  private readonly logger = new Logger(MensageriaService.name);

  constructor(@Inject(KAFKA_CLIENT) private readonly kafka: ClientKafka) {}

  publicarUsuarioRegistrado(evento: UsuarioRegistradoEvento): void {
    this.publicar(TOPICO_USUARIO_REGISTRADO, evento.idUser, evento);
  }

  publicarCursoConcluido(evento: CursoConcluidoEvento): void {
    this.publicar(TOPICO_CURSO_CONCLUIDO, evento.idUser, evento, ` curso ${evento.idCurso}`);
  }

  /**
   * Publica o evento sem bloquear quem chamou: cadastro e conclusao de aula respondem mesmo
   * com o Kafka fora do ar. A conexao com o Kafka e aberta no primeiro envio.
   * A chave e o idUser: as mensagens de um mesmo usuario ficam em ordem na mesma particao.
   */
  private publicar(topico: string, idUser: number, evento: object, detalhe = ''): void {
    const origem = `(usuario ${idUser}${detalhe})`;
    this.kafka.emit(topico, { key: String(idUser), value: evento }).subscribe({
      complete: () => this.logger.log(`Evento ${topico} publicado ${origem}.`),
      error: (erro: unknown) => {
        const motivo = erro instanceof Error ? erro.message : String(erro);
        this.logger.warn(`Kafka indisponivel; evento ${topico} ${origem} nao publicado: ${motivo}`);
        // O ClientKafka guarda a conexao que falhou; fechar permite que o proximo envio reconecte.
        this.kafka.close().catch(() => undefined);
      },
    });
  }

  async onApplicationShutdown() {
    await this.kafka.close().catch(() => undefined);
  }
}
