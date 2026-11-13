import { Kafka, logLevel } from 'kafkajs';
import { kafkaBrokers, TOPICO_USUARIO_REGISTRADO } from './kafka.config';

/**
 * Cria os topicos da plataforma se ainda nao existirem (idempotente).
 * O consumidor nao consegue assinar um topico inexistente, e o primeiro cadastro
 * pode acontecer depois da API subir; por isso o topico e criado antes.
 */
export async function garantirTopicos(): Promise<void> {
  const admin = new Kafka({
    clientId: 'plataforma-api-admin',
    brokers: kafkaBrokers(),
    retry: { retries: 2 },
    logLevel: logLevel.NOTHING,
  }).admin();

  await admin.connect();
  try {
    await admin.createTopics({
      waitForLeaders: true,
      topics: [{ topic: TOPICO_USUARIO_REGISTRADO, numPartitions: 1, replicationFactor: 1 }],
    });
  } finally {
    await admin.disconnect();
  }
}
