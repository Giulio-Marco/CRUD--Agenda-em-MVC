import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { KAFKA_CLIENT, kafkaBrokers } from './kafka.config';
import { MensageriaService } from './mensageria.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'plataforma-api',
            brokers: kafkaBrokers(),
            // Poucas tentativas: com o Kafka fora do ar o aviso aparece logo no log.
            retry: { retries: 2 },
          },
          // So publica eventos; nao precisa de consumidor de respostas.
          producerOnlyMode: true,
          producer: { allowAutoTopicCreation: true, createPartitioner: Partitioners.DefaultPartitioner },
        },
      },
    ]),
  ],
  providers: [MensageriaService],
  exports: [MensageriaService],
})
export class MensageriaModule {}
