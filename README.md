# Plataforma de Cursos

Aplicacao com frontend em JavaScript, API REST em NestJS, PostgreSQL com Prisma e autenticacao JWT. O modelo existente da plataforma foi conectado ao Swagger e ao frontend.

## Executar

1. Inicie o PostgreSQL no Docker:

   ```powershell
   docker start agenda-postgres
   ```

2. Instale dependencias, gere o Prisma Client e aplique as migracoes:

   ```powershell
   npm install
   npm run prisma:generate
   npm run prisma:deploy
   ```

3. Em um terminal, inicie a API:

   ```powershell
   npm run start:dev
   ```

4. Em outro terminal, inicie o frontend:

   ```powershell
   npm run start:frontend
   ```

## Enderecos

- Frontend: `http://localhost:5500`
- Swagger: `http://localhost:3000/api`
- Prisma Studio: `npx prisma studio` e `http://localhost:5555`

## Fluxo de autenticacao

1. Execute `POST /auth/register` no Swagger.
2. Copie o `access_token` retornado.
3. Clique em `Authorize` e cole somente o token.
4. Teste `GET /auth/me` e as rotas protegidas.

O cadastro e o login sincronizam o usuario autenticado com a tabela `Usuarios` da plataforma de cursos.

## Recursos da plataforma

- Categorias, cursos, modulos e aulas.
- Matriculas e progresso por aula.
- Avaliacoes, trilhas e certificados.
- Planos, assinaturas e pagamentos.
- Agenda de contatos como area complementar.

Todas as operacoes principais estao documentadas no Swagger. O frontend autenticado possui abas para catalogo, matriculas, trilhas, assinaturas e contatos.
