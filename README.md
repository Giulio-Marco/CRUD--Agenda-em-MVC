# Plataforma de Cursos

Plataforma de cursos com dois papeis (ADMIN e ALUNO) e tres partes:

| Parte | Tecnologia | Pasta | Quem usa |
|---|---|---|---|
| API REST | NestJS 11, Prisma 7, PostgreSQL 16, JWT, Swagger | `src/`, `prisma/` | site e app |
| Site | HTML + JavaScript puro (MVC) | `index.html`, `main.js`, `agenda-contatos/` | ADMIN e ALUNO |
| App mobile | Expo (React Native), React Navigation 7 | `mobile/` | somente ALUNO |
| Mensageria | Kafka (KRaft) + kafka-ui | `docker-compose.yml`, `src/mensageria/`, `src/notificacoes/` | notificacoes do aluno |

## Executar

1. Inicie o PostgreSQL no Docker.

   Primeira vez (cria o container `agenda-postgres` com o volume `agenda-pgdata`; use a mesma senha do `DATABASE_URL` do `.env`):

   ```powershell
   docker run -d --name agenda-postgres -e POSTGRES_PASSWORD=sua-senha -e POSTGRES_DB=DBdev -p 5432:5432 -v agenda-pgdata:/var/lib/postgresql/data postgres:16
   ```

   Nas proximas vezes:

   ```powershell
   docker start agenda-postgres
   ```

   Copie `.env.example` para `.env` e preencha `DATABASE_URL`, `JWT_SECRET` e as variaveis `ADMIN_*`.

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

6. Crie o administrador e, se quiser, os dados de demonstracao:

   ```powershell
   npm run seed:admin   # cria ou atualiza o ADMIN de ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_NAME do .env
   npm run seed:demo    # catalogo de exemplo; precisa do admin criado antes
   ```

   O `seed:demo` pede para digitar "sim" no terminal. Ele apaga o catalogo e os dados de uso (categorias, cursos, modulos, aulas, trilhas, planos, matriculas, progresso, avaliacoes, certificados, assinaturas e pagamentos), mantem usuarios e contatos e cria 3 categorias, 6 cursos (instrutor = `ADMIN_EMAIL`), 2 trilhas e os planos Mensal (R$ 49,90) e Anual (R$ 479,00).

7. App mobile (opcional), em outro terminal:

   ```powershell
   cd mobile
   npm install
   npx expo start
   ```

   Detalhes na secao [App mobile](#app-mobile).

## Enderecos

- Frontend: `http://localhost:5500`
- Swagger: `http://localhost:3000/api`
- Prisma Studio: `npx prisma studio` e `http://localhost:5555`
- kafka-ui (mensagens do Kafka): `http://localhost:8080`

## Papeis e autenticacao

O papel fica na tabela `User` (enum `Role`: `ADMIN` ou `ALUNO`, padrao `ALUNO`) e vai dentro do JWT, que vale 1 dia.

- **ALUNO**: nasce pelo cadastro publico (`POST /auth/register`). Um campo `role` enviado no corpo e ignorado.
- **ADMIN**: nao tem cadastro publico; nasce somente pelo `npm run seed:admin`.
- **Login separado**: `POST /auth/login` aceita so ALUNO e `POST /auth/admin/login` aceita so ADMIN. Papel errado responde 403 ("Use o login de administrador" / "Use o login de aluno"); o papel so e conferido depois da senha.
- **Rotas protegidas**: `JwtAuthGuard` (401 sem token) + `RolesGuard` com `@Roles(...)` (403 com o papel errado).
- O cadastro e o login sincronizam o `User` com a tabela `Usuarios` da plataforma, ligadas pelo e-mail (`UsersService.ensurePlatformUser`).

No Swagger:

1. Execute `POST /auth/register` (aluno) ou `POST /auth/admin/login` (admin).
2. Copie o `access_token` retornado.
3. Clique em `Authorize` e cole somente o token.
4. Teste `GET /auth/me` e as rotas protegidas.

### Rota x papel

"Logado" = qualquer papel com token valido.

| Rota | Publico | Logado | ADMIN | ALUNO |
|---|:-:|:-:|:-:|:-:|
| `POST /auth/register`, `POST /auth/login`, `POST /auth/admin/login`, `POST /users` | x | | | |
| `GET /auth/me` | | x | | |
| `GET /cursos`, `GET /cursos/:id` | | x | | |
| `GET /categorias`, `GET /trilhas`, `GET /trilhas/:id`, `GET /planos` | | x | | |
| `GET /cursos/:cursoId/modulos`, `GET /modulos/:moduloId/aulas`, `GET /cursos/:cursoId/avaliacoes` | | x | | |
| `POST/PATCH/DELETE /categorias` | | | x | |
| `POST/PATCH/DELETE /cursos` | | | x | |
| `POST /cursos/:cursoId/modulos`, `PATCH/DELETE /modulos/:id` | | | x | |
| `POST /modulos/:moduloId/aulas`, `PATCH/DELETE /aulas/:id` | | | x | |
| `POST/PATCH/DELETE /trilhas`, `POST /trilhas/:id/cursos`, `DELETE /trilhas/:id/cursos/:cursoId` | | | x | |
| `POST/PATCH/DELETE /planos` | | | x | |
| `GET /users`, `GET /users/:id` | | | x | |
| `POST /cursos/:id/matricular`, `GET /cursos/matriculados`, `GET /matriculas`, `DELETE /matriculas/:id` | | | | x |
| `PUT /aulas/:id/progresso`, `GET /progresso` | | | | x |
| `POST /cursos/:cursoId/avaliacoes`, `PATCH/DELETE /avaliacoes/:id` | | | | x |
| `POST /cursos/:cursoId/certificado` (exige o curso concluido), `GET /certificados` | | | | x |
| `GET/POST /assinaturas`, `GET/POST /pagamentos` | | | | x |
| `GET/POST/PATCH/DELETE /contatos` | | | | x |
| `GET /notificacoes`, `PATCH /notificacoes/:id/lida` | | | | x |

## App mobile

App Expo (SDK 58) em `mobile/`, so para ALUNO; o admin usa o site e o Swagger. Uma conta ADMIN que tenta entrar ve "Este app é só para alunos. Administradores usam o site.".

- Telas: Login e Cadastro; abas Inicio (catalogo com busca), Trilhas, Meus cursos e Perfil (dados, notificacoes e Sair); telas de detalhe da trilha, do curso e da aula, e Pagamento (plano + Pix, Cartao ou Boleto, depois a matricula).
- Navegacao: React Navigation 7 (`src/navigation/AppRoutes.tsx` com native-stack e `src/navigation/TabRoutes.tsx` com bottom-tabs). Token e usuario no `expo-secure-store`.
- Notificacoes: depois do cadastro e ao concluir um curso, o app consulta `GET /notificacoes` e dispara uma notificacao local (`expo-notifications`, funciona no Expo Go). Sem permissao, mostra um banner dentro do app.
- URL da API: por padrao, o IP do PC que serve o Metro com a porta 3000 (`mobile/src/api/config.ts`). Para fixar outra, copie `mobile/.env.example` para `mobile/.env` e preencha `EXPO_PUBLIC_API_URL`.

Rodar no iPhone (Expo Go):

1. API no ar na raiz (`npm run start:dev`).
2. `cd mobile`, `npm install` (primeira vez) e `npx expo start`.
3. iPhone e PC no mesmo Wi-Fi; leia o QR code com a Camera e abra no Expo Go.
4. Se aparecer "Não foi possível conectar à API", libere a porta 3000 no Firewall do Windows.

Validar: `npx tsc --noEmit` e `npx expo-doctor` dentro de `mobile/`.

## Mensageria

Notificacoes de boas-vindas e de curso concluido com Kafka. A API NestJS e um app hibrido: atende HTTP e tambem consome mensagens do Kafka.

```text
POST /auth/register ---------> topico "usuario.registrado" --> UsuarioRegistradoConsumer --+
                                                                                           +--> tabela Notificacao --> GET /notificacoes
PUT /aulas/:id/progresso ----> topico "curso.concluido" -----> CursoConcluidoConsumer -----+     (PostgreSQL)            (aluno)
(ultima aula do curso)             (Kafka)                     (grupo notificacoes-server)
```

1. **Cadastro**: depois de criar o aluno, `POST /auth/register` publica no topico `usuario.registrado` (chave = `idUser`):

   ```json
   { "idUser": 9, "email": "maria@exemplo.com", "nome": "Maria", "dataCadastro": "2026-11-13T01:08:34.217Z" }
   ```

2. **Curso concluido**: `PUT /aulas/:id/progresso` com `status: "concluido"` na ultima aula que faltava de um curso em que o aluno esta matriculado preenche `Matricula.dataConclusao` (uma unica vez) e publica no topico `curso.concluido` (chave = `idUser`). A resposta traz `cursoConcluido: true` so nessa requisicao.

   ```json
   { "idUser": 9, "idCurso": 7, "tituloCurso": "Python para Análise de Dados" }
   ```

   `idUser` e o id da tabela `User` (login, vem do JWT). A plataforma usa outra tabela, `Usuario` (`idUsuario`); as duas se ligam pelo **e-mail** (`UsersService.ensurePlatformUser` faz upsert do `Usuario` pelo e-mail do `User`).
3. **Topicos**: `usuario.registrado` e `curso.concluido`, criados pela API ao iniciar se ainda nao existirem.
4. **Consumidores** (grupo `notificacoes`, que o Nest exibe como `notificacoes-server`): `src/notificacoes/usuario-registrado.consumer.ts` grava a `BOAS_VINDAS`; `src/notificacoes/curso-concluido.consumer.ts` grava a `CURSO_CONCLUIDO` ("Parabéns por terminar o curso de <titulo>!").
5. **Notificacao**: model `Notificacao` com `idCurso` opcional e unique em `(idUser, tipo, idCurso)`. Se o Kafka reentregar a mensagem, a notificacao nao e duplicada. Como no Postgres `NULL` nao conflita no unique, a `BOAS_VINDAS` (sem curso) e protegida no codigo (`findFirst` + `create`).
6. **Leitura** (somente ALUNO, no Swagger): `GET /notificacoes` (mais recentes primeiro) e `PATCH /notificacoes/:id/lida`.

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

O cadastro e a conclusao de aulas continuam funcionando. A publicacao nao bloqueia a resposta, e a API registra um aviso no log (`Kafka indisponivel; evento usuario.registrado (usuario X) nao publicado`), que pode levar ate cerca de 30 s para aparecer. Esse evento nao e reenviado, entao esse aluno fica sem a notificacao (de boas-vindas ou do curso concluido nesse momento). Quando o Kafka volta, os proximos cadastros sao publicados normalmente, sem reiniciar a API. Se a API iniciar com o Kafka parado, o HTTP sobe normalmente, o log avisa que o consumidor nao conectou, e e preciso reiniciar a API depois de `docker compose up -d`.

### Versoes das imagens

- `apache/kafka:3.9.2`, ultima da linha 3.9. Nao foi usada a 4.x porque o `@nestjs/microservices` usa o kafkajs 2.2.4, que e antigo, e o Kafka 4.0 removeu versoes antigas do protocolo.
- `kafbat/kafka-ui:v1.5.0`.

## Recursos da plataforma

- Categorias, cursos, modulos e aulas.
- Matriculas e progresso por aula.
- Avaliacoes, trilhas e certificados (o certificado so e emitido depois de concluir todas as aulas do curso).
- Planos, assinaturas e pagamentos.
- Notificacoes do aluno via Kafka (boas-vindas e curso concluido).
- Agenda de contatos como area complementar (so no site).

Todas as operacoes estao documentadas no Swagger. No site, o ALUNO ve catalogo, matriculas, trilhas, planos/assinaturas e contatos; o ADMIN ve os formularios de cursos, modulos, aulas, categorias, trilhas e planos e um selo "Administrador".
