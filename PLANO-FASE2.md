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
- Mobile: Expo (React Native) na pasta `mobile/`, testado no iPhone pelo Expo Go (o emulador do Android Studio nao abriu a janela nesta maquina e foi removido; o professor Daniel aprovou o Expo Go). APK, se pedido, sai pelo EAS Build na nuvem.
- Token no mobile: `expo-secure-store`. Navegacao: React Navigation 7 explicito (native-stack + bottom-tabs), como no tutorial do professor (o `expo-router` foi removido em 12/11/2026).
- URL da API no mobile: IP da maquina na rede Wi-Fi (ex.: `http://192.168.0.10:3000`). Por padrao o app usa o IP do PC que serve o Metro; `EXPO_PUBLIC_API_URL` em `mobile/.env` fixa outra URL. iPhone e PC no mesmo Wi-Fi, porta 3000 liberada no firewall. CORS nao afeta o app nativo.

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

---

## Progresso (atualizado em 12/11/2026)

- [x] Etapa 0: banco recriado no Docker (`agenda-postgres`, volume `agenda-pgdata`), `.env` fora do git, branch `fase2`.
- [x] Etapa 1: papeis ADMIN/ALUNO no backend (commit "Papeis ADMIN e ALUNO..."). Admin: `admin@plataforma.com` via `npm run seed:admin`.
- [x] Etapa 2: login separado no frontend web, prints em `docs/prints/`.
- [x] Emulador descartado (janela nao aparece). Expo Go instalado no iPhone, aprovado pelo professor.
- [x] Etapa 3: app Expo em `mobile/` (SDK 58). A versao com expo-router, escolha de perfil e abas de admin (commit "App mobile Expo...") foi substituida pela Etapa 3b.
  - URL da API: `EXPO_PUBLIC_API_URL` em `mobile/.env`; sem ela, o app usa o IP do PC que serve o Metro com a porta 3000 (`mobile/src/api/config.ts`).
- [x] Etapa 3b (12/11/2026): app so de ALUNO com React Navigation explicito, como no tutorial do professor.
  - Removidos: `expo-router` (dependencia, plugin, `typedRoutes`, `web.output: server`, pasta `src/app/`), escolha de perfil, login de admin, abas de admin, `loginAdmin` e `src/components/`. Usuario salvo com role ADMIN conta como deslogado; admin tentando entrar ve "Este app é só para alunos. Administradores usam o site."
  - Instalados: `@react-navigation/native` 7.5, `native-stack` e `bottom-tabs` 7.21, `@expo/vector-icons` 15 (Ionicons). `npx expo install --fix` atualizou 10 pacotes Expo para os patches do SDK 58 e adicionou os plugins `expo-status-bar` e `expo-web-browser` no `app.json`.
  - Estrutura: `index.ts` → `App.tsx` (`SafeAreaProvider` + `AuthProvider` + `NavigationContainer` + `StatusBar`); `src/navigation/AppRoutes.tsx` (stack: Login, Cadastro / Principal, DetalheTrilha, DetalheCurso, DetalheAula, Pagamento, condicionais pelo `user` do AuthContext no lugar de `replace`/`reset`); `src/navigation/TabRoutes.tsx` (Inicio, Trilhas, Meus cursos, Perfil; icone cheio focado, `-outline` sem foco); `src/screens/*Screen.tsx`; `src/styles/theme.ts` com `cores`.
  - Telas: Login e Cadastro (com "Confirmar senha") usam KeyboardAvoidingView, ScrollView `keyboardShouldPersistTaps="handled"`, TextInput, TouchableOpacity e StyleSheet.create. Abas mostram so o titulo; Perfil mostra nome, e-mail e Sair. Detalhes leem `route.params.id` (Pagamento le `route.params.cursoId`) e mostram o numero.
  - Validacao: `npx tsc --noEmit` ok; `npx expo-doctor` 20/20; `npx expo export --platform ios` montou o bundle JS, mas o Windows bloqueou o `hermesc.exe` (politica de Controle de Aplicativo, executavel sem assinatura). Com `--no-bytecode` o export passou (bundle de 1,3 MB, sem expo-router). Falta testar no iPhone.
- [ ] Etapas 4 a 6: telas do aluno (seguir a lista "N2: Funcionalidades Mobile"), entrega. A Etapa 5 (telas do admin no mobile) foi cancelada pela decisao do professor.
- [ ] Antes da apresentacao: limpar dados de teste do banco e criar dados de demonstracao.

Para retomar: abrir o Docker Desktop e rodar `docker start agenda-postgres`.

## N2: Funcionalidades Mobile (lista oficial do professor Daniel, 12/11/2026)

O professor vai cobrar exatamente esta lista. O app mobile e so para ALUNO.

1. Autenticar e registrar usuario (POST /auth/login, POST /auth/register).
2. Exibir Trilhas, Cursos e Modulos (Trilhas -> DetalheTrilha com os cursos -> DetalheCurso com modulos).
3. Exibir a lista dos meus cursos (GET /cursos/matriculados).
4. Exibir curso e aula do curso (DetalheCurso -> DetalheAula).
5. Matricular no curso e efetuar pagamento (POST /cursos/:id/matricular; pagamento via planos/assinaturas/pagamentos da API).
6. Notificacao de boas-vindas utilizando mensageria Kafka: 20% DA NOTA.
7. Pedido extra: campo de busca na tela inicial (catalogo de cursos).

Estrutura do app decorrente da lista:
- Stack sem usuario: Login, Cadastro.
- Abas: Inicio (catalogo com busca), Trilhas, Meus cursos, Perfil (dados, notificacoes, Sair).
- Stack com usuario: DetalheTrilha, DetalheCurso, DetalheAula, Pagamento.
- Contatos e abas de admin saem do mobile.

Desenho da mensageria (proposta):
- Kafka em container Docker (imagem apache/kafka, modo KRaft, porta 9092), via docker-compose.yml.
- API NestJS como produtora: no POST /auth/register publica o evento `usuario.registrado` (Transport.KAFKA / kafkajs).
- Consumidor NestJS (microservico hibrido no mesmo app) com @EventPattern('usuario.registrado'): grava uma Notificacao de boas-vindas no banco.
- Rotas novas: GET /notificacoes e PATCH /notificacoes/:id/lida (so ALUNO), documentadas no Swagger.
- Mobile: apos o login busca /notificacoes e dispara notificacao local com expo-notifications (funciona no Expo Go do iPhone); lista no Perfil.

## Anotacoes para discutir depois (12/11/2026)

- DECISAO DO PROFESSOR: o app mobile e so para ALUNO. Sem login de admin, sem abas de admin no mobile. O admin continua no frontend web e no Swagger.
- Dica do professor: na aba Trilhas, tocar numa trilha abre outra tela (Stack, navigate com route.params) listando os cursos daquela trilha.

- Notificacoes no app valem pontos extras (informado pelo professor). Ideia: o professor (instrutor/admin do curso) envia uma mensagem direto para o aluno, e o aluno recebe uma notificacao no celular.
- Instalar e configurar mensageria (pedido do professor). Ligado a ideia das mensagens professor -> aluno com notificacao; definir a ferramenta depois.
- `npx expo start --tunnel` como alternativa quando o Wi-Fi bloqueia a conexao entre iPhone e PC (ex.: Wi-Fi da PUC). Atencao: o tunnel cobre so o servidor da Expo (porta 8081); a API na porta 3000 precisa de outra solucao nesse caso.

## Referencia do professor: "Tutorial React Native: Componentes, Flexbox e Navegacao" (Daniel, 22/10/2026)

- Projeto Expo, testado no Expo Go; dica de laboratorio: `npx expo start --tunnel`.
- Componentes cobrados: View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, FlatList (listas grandes).
- Estilo: `StyleSheet.create` fora do componente, tema central (`src/styles/theme.js` com `cores`), Flexbox (flexDirection, justifyContent, alignItems, alignSelf, flexWrap, gap, flex: 1, position absolute para badge/FAB), `useWindowDimensions`.
- Navegacao com React Navigation explicito: `NavigationContainer` em App.js, `src/navigation/AppRoutes.js` (createNativeStackNavigator: Login, Registro, Principal) e `src/navigation/TabRoutes.js` (createBottomTabNavigator com Ionicons). Metodos: navigate, push, goBack, replace (apos login), reset (logout), route.params.
- Estrutura: `src/screens/*Screen.js`, `src/navigation/`, `src/styles/theme.js`.
- Proximo passo sugerido no tutorial: trocar alert/replace por chamadas reais a API NestJS (POST /users, POST /auth/login) guardando o access_token.
