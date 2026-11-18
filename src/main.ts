import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Partitioners } from 'kafkajs';
import { garantirTopicos } from './mensageria/garantir-topicos';
import { GRUPO_NOTIFICACOES, kafkaBrokers } from './mensageria/kafka.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5500,http://127.0.0.1:5500')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Plataforma de Cursos API')
    .setDescription(
      'API da plataforma de cursos com dois papeis. ADMIN gerencia categorias, cursos, modulos, aulas, trilhas, planos e usuarios. ALUNO se matricula, registra progresso, avalia, emite certificado, assina planos, gerencia contatos e le suas notificacoes (via Kafka: boas-vindas apos o cadastro e parabens ao concluir um curso). Leituras do catalogo valem para os dois.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        in: 'header',
        description: 'Informe somente o JWT retornado por /auth/login (aluno) ou /auth/admin/login (administrador).',
      },
      'token',
    )
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);

  // App hibrido: alem do HTTP, consome usuario.registrado (UsuarioRegistradoConsumer) e curso.concluido (CursoConcluidoConsumer).
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { clientId: 'plataforma-api-consumidor', brokers: kafkaBrokers() },
      consumer: { groupId: GRUPO_NOTIFICACOES },
      producer: { createPartitioner: Partitioners.DefaultPartitioner },
    },
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`API disponível em http://localhost:${port}`);
  console.log(`Swagger disponível em http://localhost:${port}/api`);

  // Sem await: com o Kafka fora do ar a API HTTP continua no ar (cadastro, login etc.).
  const logger = new Logger('Mensageria');
  garantirTopicos()
    .then(() => app.startAllMicroservices())
    .then(() => logger.log(`Consumidor Kafka conectado (grupo ${GRUPO_NOTIFICACOES}-server).`))
    .catch((erro: unknown) => {
      const motivo = erro instanceof Error ? erro.message : String(erro);
      logger.warn(
        `Consumidor Kafka nao conectou: ${motivo}. Suba o Kafka (docker compose up -d) e reinicie a API para gravar as notificacoes.`,
      );
    });
}

void bootstrap();
