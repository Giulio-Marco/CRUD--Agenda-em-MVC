# Plataforma de Cursos

Aplicacao com frontend em JavaScript, API REST em NestJS, PostgreSQL com Prisma e autenticacao JWT. O modelo existente da plataforma foi conectado ao Swagger e ao frontend.

## Executar

1. Inicie o PostgreSQL no Docker:

   ```powershell
   docker start agenda-postgres
   ```

2. Suba a mensageria (Kafka e kafka-ui), na raiz do projeto:

   ```powershell
   docker compose up -d
   ```

3. Instale dependencias, gere o Prisma Client e aplique as migracoes:

   ```powershell
   npm install
   npm run prisma:generate
   npm run prisma:deploy
   ```

4. Em um terminal, inicie a API:

   ```powershell
   npm run start:dev
   ```

5. Em outro terminal, inicie o frontend:

   ```powershell
   npm run start:frontend
   ```

## Enderecos

- Frontend: `http://localhost:5500`
- Swagger: `http://localhost:3000/api`
- Prisma Studio: `npx prisma studio` e `http://localhost:5555`
- kafka-ui (mensagens do Kafka): `http://localhost:8080`

## Fluxo de autenticacao

1. Execute `POST /auth/register` no Swagger.
2. Copie o `access_token` retornado.
3. Clique em `Authorize` e cole somente o token.
4. Teste `GET /auth/me` e as rotas protegidas.

O cadastro e o login sincronizam o usuario autenticado com a tabela `Usuarios` da plataforma de cursos.

## Mensageria

Notificacao de boas-vindas com Kafka. A API NestJS e um app hibrido: atende HTTP e tambem consome mensagens do Kafka.

```text
POST /auth/register --> topico "usuario.registrado" --> consumidor (grupo notificacoes-server) --> tabela Notificacao --> GET /notificacoes
     (produtor)                (Kafka)                    UsuarioRegistradoConsumer                (PostgreSQL)              (aluno)
```

1. **Cadastro**: depois de criar o aluno, `POST /auth/register` publica no topico `usuario.registrado` (chave = `idUser`):

   ```json
   { "idUser": 9, "email": "maria@exemplo.com", "nome": "Maria", "dataCadastro": "2026-11-13T01:08:34.217Z" }
   ```

2. **Topico**: `usuario.registrado`, criado pela API ao iniciar se ainda nao existir.
3. **Consumidor**: `src/notificacoes/usuario-registrado.consumer.ts` (`@EventPattern('usuario.registrado')`, grupo `notificacoes`, que o Nest exibe como `notificacoes-server`) grava a notificacao de boas-vindas.
4. **Notificacao**: model `Notificacao` com unique em `(idUser, tipo)`. Se o Kafka reentregar a mensagem, a notificacao nao e duplicada.
5. **Leitura** (somente ALUNO, no Swagger): `GET /notificacoes` (mais recentes primeiro) e `PATCH /notificacoes/:id/lida`.

Codigo: `src/mensageria/` (produtor `ClientKafka`, configuracao e criacao do topico), `src/notificacoes/` (consumidor e rotas) e `src/main.ts` (`connectMicroservice` com `Transport.KAFKA`).

### Subir e conferir

```powershell
docker compose up -d      # Kafka (localhost:9092) e kafka-ui (localhost:8080)
docker compose ps         # kafka deve aparecer como "healthy"
docker compose stop       # para os dois containers sem apagar as mensagens
```

`docker compose down` remove os containers e apaga as mensagens. O banco nao e afetado, porque o PostgreSQL continua no `agenda-postgres`.

A API le os brokers de `KAFKA_BROKERS` no `.env`. O padrao e `localhost:9092`.

### Ver a mensagem no kafka-ui

1. Cadastre um aluno (`POST /auth/register` no Swagger ou no app).
2. Abra `http://localhost:8080`, cluster `local`.
3. Em **Topics**, abra `usuario.registrado` e depois a aba **Messages** para ver a chave e o JSON do evento.
4. Em **Consumers**, o grupo `notificacoes-server` mostra o consumidor da API e o lag (0 quando tudo foi lido).
5. Com o token do aluno, `GET /notificacoes` retorna a notificacao `BOAS_VINDAS`.

Pelo terminal:

```powershell
docker exec plataforma-kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic usuario.registrado --from-beginning --property print.key=true --timeout-ms 5000
```

### Kafka fora do ar

O cadastro continua funcionando. A publicacao nao bloqueia a resposta, e a API registra um aviso no log (`Kafka indisponivel; evento usuario.registrado do usuario X nao publicado`), que pode levar ate cerca de 30 s para aparecer. Esse evento nao e reenviado, entao esse aluno fica sem a notificacao de boas-vindas. Quando o Kafka volta, os proximos cadastros sao publicados normalmente, sem reiniciar a API. Se a API iniciar com o Kafka parado, o HTTP sobe normalmente, o log avisa que o consumidor nao conectou, e e preciso reiniciar a API depois de `docker compose up -d`.

### Versoes das imagens

- `apache/kafka:3.9.2`, ultima da linha 3.9. Nao foi usada a 4.x porque o `@nestjs/microservices` usa o kafkajs 2.2.4, que e antigo, e o Kafka 4.0 removeu versoes antigas do protocolo.
- `kafbat/kafka-ui:v1.5.0`.

## Recursos da plataforma

- Categorias, cursos, modulos e aulas.
- Matriculas e progresso por aula.
- Avaliacoes, trilhas e certificados.
- Planos, assinaturas e pagamentos.
- Agenda de contatos como area complementar.

Todas as operacoes principais estao documentadas no Swagger. O frontend autenticado possui abas para catalogo, matriculas, trilhas, assinaturas e contatos.
