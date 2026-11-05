# Plano da Fase 2: login separado (admin/aluno) + app mobile React Native

## Estado atual (lido em 05/11/2026)

- Backend: NestJS 11 + Prisma 7 + PostgreSQL (Docker `agenda-postgres`), JWT de 1 dia, Swagger em `/api`.
- Modulos: `auth`, `users`, `cursos`, `plataforma` (categorias, modulos, aulas, matriculas, progresso, avaliacoes, trilhas, certificados, planos, assinaturas, pagamentos), `contatos`.
- Frontend web: `index.html` + `agenda-contatos/` (MVC em JS puro), porta 5500, token no `localStorage`.
- Duas tabelas de usuario: `User` (login, bcrypt) e `Usuario` (plataforma). `ensurePlatformUser` sincroniza por e-mail.
- Nao existe papel (role). Qualquer usuario logado cria categoria, plano, trilha e curso.
- Git: ultimo commit em 16/04/2026. Todo o backend esta sem commit. O arquivo `.env` esta no stage (`AM .env`) e vazaria o `JWT_SECRET` no proximo push.

## Decisoes

- Papel: enum `Role { ADMIN, ALUNO }` na tabela `User`, padrao `ALUNO`. O papel vai no JWT.
- Login separado: `POST /auth/login` (aluno) e `POST /auth/admin/login` (admin). Cada rota recusa o papel errado com 403.
- Cadastro publico (`/auth/register`, `POST /users`) cria somente ALUNO. Admin nasce por seed (`npm run seed:admin`).
- Rotas so de ADMIN: escrita (POST/PATCH/DELETE) em categorias, cursos, modulos, aulas, trilhas, trilhas/cursos, planos; `GET /users`, `GET /users/:id`.
- Rotas de ALUNO: matricular, progresso, avaliacoes, certificados, assinaturas, pagamentos, contatos. Leituras (GET) liberadas para os dois.
- Mobile: Expo (React Native) na pasta `mobile/`. Expo roda no emulador do Android Studio e no celular via Expo Go, sem configurar Gradle na mao. `npx expo run:android` ou EAS gera APK se o professor pedir.
- Token no mobile: `expo-secure-store`. Navegacao: `expo-router` (abas).
- URL da API no mobile: emulador Android usa `http://10.0.2.2:3000`; celular fisico usa o IP da maquina na rede (ex.: `http://192.168.0.10:3000`). CORS nao afeta o app nativo.

## Ordem de execucao

Rode cada prompt numa sessao do Claude Code aberta na raiz do projeto. Teste antes de passar para o proximo. Faca commit ao fim de cada etapa.

---

### Etapa 0: limpar o git (manual, 2 min)

```powershell
git rm --cached .env
git checkout -b fase2
git add -A
git commit -m "Fase 1: backend NestJS, Swagger e frontend"
```

Confira com `git status` que `.env` aparece como nao rastreado.

---

### Etapa 1: papeis no backend

Prompt para o Claude Code:

```
Leia PLANO-FASE2.md (secoes "Estado atual" e "Decisoes"). Implemente a separacao de papeis no backend NestJS:

1. Prisma: adicione `enum Role { ADMIN ALUNO }` e o campo `role Role @default(ALUNO)` no model `User`. Gere a migration com `npx prisma migrate dev --name add_user_role` e rode `npm run prisma:generate`.
2. Auth: inclua `role` no payload do JWT (`JwtPayload`, `AuthUser`, `JwtStrategy.validate`) e na resposta de login/register/me (`AuthUserResponseDto`).
3. Crie `src/auth/decorators/roles.decorator.ts` (`@Roles(...roles)`) e `src/auth/guards/roles.guard.ts` (le o metadata, compara com `request.user.role`, lanca ForbiddenException com mensagem em portugues).
4. Separe o login: `POST /auth/login` aceita somente ALUNO; crie `POST /auth/admin/login` que aceita somente ADMIN. Papel errado retorna 403 "Use o login de administrador" / "Use o login de aluno". Cadastro publico sempre cria ALUNO; ignore qualquer role enviado.
5. Aplique `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` nas rotas de escrita de categorias, cursos, modulos, aulas, trilhas, trilhas/cursos e planos, e em GET /users e GET /users/:id. Matricula, progresso, avaliacoes, certificados, assinaturas, pagamentos e contatos ficam com `@Roles('ALUNO')`. GETs de leitura ficam liberados para os dois papeis.
6. Em cursos.service.ts, um ADMIN pode editar/excluir qualquer curso (hoje so o instrutor pode).
7. Crie `prisma/seed-admin.ts` que cria ou atualiza um admin a partir de `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` do .env (senha com bcrypt, sincronizando `Usuario` via a mesma logica de `ensurePlatformUser`). Adicione o script `"seed:admin"` no package.json e as tres variaveis no .env.example.
8. Atualize o Swagger: tag e descricao das rotas novas, `@ApiForbiddenResponse` nas rotas protegidas por papel.

Ao terminar, rode `npm run build` e me mostre uma tabela rota x papel. Nao altere o .env real alem de adicionar as 3 variaveis de admin.
```

Teste no Swagger: login de aluno em `/auth/admin/login` deve dar 403; aluno criando categoria deve dar 403; admin criando categoria deve dar 200/201.

---

### Etapa 2: login separado no frontend web

```
Leia PLANO-FASE2.md. O backend agora tem `POST /auth/login` (aluno) e `POST /auth/admin/login` (admin), e o usuario retornado tem `role`.
No frontend web (index.html + agenda-contatos/):
1. Na tela de login, adicione um seletor "Sou aluno" / "Sou administrador". Aluno ve login e "Criar conta"; administrador ve somente login (sem cadastro) e chama /auth/admin/login.
2. Salve o `role` junto do usuario no localStorage.
3. Para ALUNO, esconda os formularios de criar curso, categoria, trilha e plano. Para ADMIN, esconda matricular, progresso, assinatura, pagamento e contatos, e mostre um selo "Administrador" na barra do usuario.
4. Trate 403 com mensagem amigavel em portugues.
Mantenha o padrao MVC atual. Depois rode o backend e o frontend e teste os dois logins com o Playwright CLI, salvando prints em docs/prints/.
```

---

### Etapa 3: criar o app mobile (Expo)

Pre-requisitos na sua maquina: Node 20+, Android Studio com um emulador (Pixel, API 34+) ou o app Expo Go no celular.

```
Leia PLANO-FASE2.md. Crie o app mobile React Native com Expo na pasta `mobile/` deste repositorio:
1. `npx create-expo-app@latest mobile --template tabs` (TypeScript, expo-router).
2. Instale `expo-secure-store`. Crie `mobile/src/api/client.ts` com `API_URL` lido de `process.env.EXPO_PUBLIC_API_URL` (crie `mobile/.env.example` com `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000` e um comentario explicando o IP para celular fisico). O client injeta `Authorization: Bearer`, trata 401 (logout) e 403 (mensagem).
3. Crie `mobile/src/auth/AuthContext.tsx`: guarda token e usuario no SecureStore, expoe `loginAluno`, `loginAdmin`, `register`, `logout`, `user.role`.
4. Rotas com expo-router:
   - `app/(auth)/index.tsx`: escolha "Sou aluno" / "Sou administrador".
   - `app/(auth)/login-aluno.tsx` (com link para cadastro), `app/(auth)/cadastro.tsx`, `app/(auth)/login-admin.tsx`.
   - `app/(aluno)/` com abas: Cursos, Minhas matriculas, Trilhas, Planos, Contatos.
   - `app/(admin)/` com abas: Cursos, Categorias, Trilhas, Planos, Usuarios.
   - O layout raiz redireciona conforme `user.role`.
5. Por enquanto as abas so mostram um titulo. Valide com `npx tsc --noEmit` e `npx expo-doctor`.
Use somente os endpoints que existem no Swagger (src/**/*.controller.ts). Textos em portugues.
```

Rodar: terminal 1 `npm run start:dev` (raiz); terminal 2 `cd mobile && npx expo start`, tecla `a` abre no emulador. No celular, escaneie o QR no Expo Go e use o IP da maquina no `.env`. Se o celular nao conectar, libere a porta 3000 no Firewall do Windows.

---

### Etapa 4: telas do aluno

```
Leia PLANO-FASE2.md e o codigo em mobile/. Implemente as abas do ALUNO consumindo a API real:
- Cursos: lista (GET /cursos) com busca, tela de detalhe (GET /cursos/:id) com modulos e aulas, botao Matricular (POST /cursos/:id/matricular).
- Minhas matriculas: GET /cursos/matriculados; ao abrir um curso, marcar aula concluida (PUT /aulas/:id/progresso), barra de progresso, avaliar curso (POST /cursos/:cursoId/avaliacoes) e emitir certificado (POST /cursos/:cursoId/certificado).
- Trilhas: GET /trilhas e detalhe.
- Planos: GET /planos, assinar (POST /assinaturas), registrar pagamento (POST /pagamentos), listar minhas assinaturas.
- Contatos: CRUD completo (GET/POST/PATCH/DELETE /contatos) com formulario e confirmacao antes de excluir.
Cada lista tem loading, estado vazio, erro com "Tentar de novo" e pull-to-refresh. Componentes reaproveitaveis em mobile/src/components. Rode `npx tsc --noEmit` no fim.
```

---

### Etapa 5: telas do admin

```
Leia PLANO-FASE2.md e o codigo em mobile/. Implemente as abas do ADMIN:
- Cursos: listar, criar, editar, excluir; dentro do curso, CRUD de modulos (/cursos/:cursoId/modulos, /modulos/:id) e aulas (/modulos/:moduloId/aulas, /aulas/:id).
- Categorias: CRUD (/categorias).
- Trilhas: CRUD (/trilhas) e vincular/desvincular cursos (/trilhas/:id/cursos).
- Planos: CRUD (/planos).
- Usuarios: lista somente leitura (GET /users).
Formularios com validacao antes de enviar e mensagens em portugues. Reaproveite os componentes da etapa 4. Rode `npx tsc --noEmit` no fim.
```

---

### Etapa 6: verificacao e entrega

```
Revise o projeto inteiro para a entrega:
1. Rode `npm run build` na raiz e `npx tsc --noEmit` + `npx expo-doctor` em mobile/. Corrija erros.
2. Atualize o README.md: arquitetura (API, web, mobile), como criar o admin (seed:admin), como rodar o mobile no emulador e no celular, tabela rota x papel.
3. Confira que .env e mobile/.env estao no .gitignore e fora do git.
4. Liste um roteiro de demonstracao de 5 minutos: cadastro de aluno no app, matricula, progresso, login admin, criacao de curso aparecendo para o aluno.
```

Opcional (APK para entregar): `cd mobile && npx expo run:android --variant release` (precisa do Android Studio/SDK) ou `npx eas build -p android --profile preview` (conta Expo gratuita).
