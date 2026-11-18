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
- [x] Etapa 4 (12/11/2026): telas do aluno consumindo a API real (itens 2, 3, 4, 5 e 7 da lista N2).
  - Inicio: catalogo `GET /cursos` com busca no topo (titulo ou categoria, sem diferenciar acento e maiusculas) e contagem "N cursos encontrados de M".
  - Trilhas: `GET /trilhas` -> DetalheTrilha (`GET /trilhas/:id`, cursos em ordem, "Curso 1 de 3") -> DetalheCurso.
  - DetalheCurso: `GET /cursos/:id` + `GET /progresso`; descricao, nivel, horas, instrutor, modulos e aulas (SectionList, check nas concluidas) e barra de progresso para matriculados. "Matricular": com assinatura ativa (`GET /assinaturas`, `dataFim` no futuro e com pagamento) matricula direto; sem ela abre Pagamento.
  - DetalheAula: params `{ id, cursoId }` (nao existe `GET /aulas/:id`; a aula vem de `GET /cursos/:cursoId`). Tipo, duracao, "Abrir conteudo" com `expo-web-browser` e "Marcar como concluida" (`PUT /aulas/:id/progresso`, status `concluido`) so para matriculados.
  - Pagamento: params `{ cursoId, cursoTitulo }`. `GET /planos`, escolha do plano e do metodo (Pix, Cartao, Boleto), depois `POST /assinaturas` -> `POST /pagamentos` (valor do plano, `idTransacaoGateway` gerado no app) -> `POST /cursos/:id/matricular` e `navigation.popTo('DetalheCurso')`. Se uma etapa falha, "Tentar de novo" continua dela sem duplicar assinatura ou pagamento.
  - Meus cursos: `GET /cursos/matriculados` + `GET /progresso`, barra "3 de 8 aulas / 38%"; vazio oferece "Ver catalogo".
  - Toda lista tem loading, vazio com texto util, erro com "Tentar de novo" e pull-to-refresh. As telas recarregam em silencio ao ganhar foco (hook `src/hooks/useApiData.ts`); falha ao atualizar mantem os dados e mostra aviso.
  - Novos: `src/api/tipos.ts`, `src/api/plataforma.ts`, `src/utils/formato.ts`, `src/components/` (Botao, Estados, CampoBusca, Chip, BarraProgresso, CursoCard). `theme.ts` ganhou `primarySoft`, `successBackground`, `fonte`, `radius.lg/full`, `spacing.xxl`.
  - Dados de demonstracao: `npm run seed:demo` (`prisma/seed-demo.ts`). Pede "sim" no terminal, apaga so catalogo e dados de teste (mantem usuarios e contatos) e cria 3 categorias, 6 cursos (2 ou 3 modulos, 2 ou 3 aulas cada, instrutor = `ADMIN_EMAIL`), 2 trilhas de 3 cursos e os planos Mensal (R$ 49,90) e Anual (R$ 479,00). Precisa do admin criado antes (`npm run seed:admin`).
  - Validacao: `npx tsc --noEmit` ok; `npx expo-doctor` 20/20 depois de `npx expo install --fix` (expo 58.0.24 -> 58.0.25); `npx expo export --platform ios --no-bytecode` ok (bundle 1,4 MB); seed sem erros de tipo; `npm run build` ok. O seed nao foi executado e falta testar no iPhone.
- [ ] Etapa 6: entrega. A Etapa 5 (telas do admin no mobile) foi cancelada pela decisao do professor.
- [x] Item 6 da lista N2, parte backend (12/11/2026): notificacao de boas-vindas com Kafka (20% da nota). Detalhes na secao "Mensageria" do README.
  - `docker-compose.yml` na raiz so com mensageria: `apache/kafka:3.9.2` (KRaft, um no, `localhost:9092`; 3.9 e nao 4.x por causa do kafkajs 2.2.4) e `kafbat/kafka-ui:v1.5.0` (`localhost:8080`). Containers `plataforma-kafka` e `plataforma-kafka-ui`. O Postgres continua no `agenda-postgres`.
  - Instalados `@nestjs/microservices` 11.2.10 (a 12.x exige Nest 12) e `kafkajs` 2.2.4. `KAFKA_BROKERS` no `.env.example`, com padrao `localhost:9092` no codigo.
  - Produtor `src/mensageria/`: `ClientKafka` em `producerOnlyMode`. `AuthService.register` publica `usuario.registrado` `{ idUser, email, nome, dataCadastro }` sem bloquear a resposta. Com erro, registra um aviso no log e fecha o client para reconectar no proximo envio. `garantirTopicos()` cria o topico ao iniciar, porque o consumidor nao assina topico inexistente.
  - Consumidor: app hibrido em `main.ts` (`connectMicroservice`, grupo `notificacoes`, exibido como `notificacoes-server`, iniciado depois do `listen` e sem `await`). `src/notificacoes/usuario-registrado.consumer.ts` (`@EventPattern`) faz `upsert` pelo unique `(idUser, tipo)`.
  - Prisma: enum `TipoNotificacao { BOAS_VINDAS }`, model `Notificacao` e migration `20261113010452_add_notificacoes`.
  - Rotas ALUNO no Swagger: `GET /notificacoes` e `PATCH /notificacoes/:id/lida` (404 se a notificacao nao for do aluno).
  - Validacao:
    - Cadastro gerou a mensagem no topico, visivel no console consumer e no kafka-ui, e a notificacao apareceu em `GET /notificacoes`.
    - PATCH marcou como lida. Id de outro aluno da 404, token de ADMIN da 403, sem token da 401.
    - Republicar a mesma mensagem manteve 1 notificacao.
    - Com o Kafka parado o cadastro respondeu 200 em 0,1 s e o log registrou o aviso. Ao religar o Kafka, produtor e consumidor voltaram sem reiniciar a API.
    - A API iniciada com o Kafka parado sobe o HTTP normalmente e cadastra.
    - `npm run build` ok.
  - Limitacao: evento publicado com o Kafka fora do ar e perdido (sem outbox). Esse aluno fica sem a boas-vindas.
- [x] Item 6 da lista N2, parte mobile (13/11/2026): notificacao local de boas-vindas, lista no Perfil e badge na aba.
  - `expo-notifications ~58.1.9` (`npx expo install`), so notificacao LOCAL (Expo Go); sem plugin no `app.json`, sem push remoto.
  - `AuthContext` ganhou `origemSessao` (`cadastro` | `login` | `armazenada`). `src/notificacoes/NotificacoesContext.tsx` reage a ela: cadastro consulta `GET /notificacoes` 1x por segundo por ate 10 s; login consulta uma vez; sessao restaurada so atualiza a lista (badge), sem disparar. Cada id dispara uma unica vez por sessao. Sem notificacao em 10 s (Kafka fora do ar) nao mostra erro.
  - `src/notificacoes/local.ts`: `setNotificationHandler` (banner, lista e som com o app aberto), `pedirPermissao()` (cria canal no Android) e `dispararLocal()` (`trigger: null`).
  - Permissao negada (ou disparo falhou): `BannerAviso` no topo do app com o titulo/mensagem da API, botao fechar, sem travar o fluxo.
  - Perfil: secao "Notificacoes" (titulo, mensagem, data/hora); tocar marca como lida (`PATCH /notificacoes/:id/lida`, otimista com rollback); pull-to-refresh. Badge com o numero de nao lidas na aba Perfil.
  - Logs no Metro com prefixo `[notificacoes]` (aguardando, recebida id X, local disparada).
  - Validacao: `npx tsc --noEmit` sem erros e `npx expo-doctor` 20/20. Nao testado no aparelho (sem `expo start`).
  - Diferenca do "Proximo prompt": o banner dentro do app aparece so quando a permissao e negada (pedido desta rodada), nao na tela Inicio.
- [ ] Antes da apresentacao: rodar `npm run seed:demo` e testar o roteiro no iPhone (cadastro -> busca -> curso -> Matricular -> plano + Pix -> aula concluida -> Meus cursos).

Para retomar: abrir o Docker Desktop e rodar `docker start agenda-postgres` e `docker compose up -d` (Kafka).

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

## Proximo prompt (preparado em 12/11/2026): notificacao de boas-vindas no app

Configuracao: Opus 5.5, esforco High no plano e Medium na execucao, modo Plan e depois Auto. Antes: `docker start agenda-postgres` e `docker compose start` (Kafka antes da API).

```
Use as skills react-native-best-practices, expo:expo-data-fetching e verification-before-completion. Nao use as skills saas-*.

Leia PLANO-FASE2.md (item 6 da N2 e "Desenho da mensageria"). O backend ja publica `usuario.registrado` no Kafka e o consumidor grava a notificacao BOAS_VINDAS, lida em GET /notificacoes. Hoje o app nao mostra nada: o aluno se cadastra e nao ve a mensagem. Objetivo: o aluno ve "Bem-vindo(a), <nome>!" logo depois de criar a conta, vindo da notificacao gravada pelo consumidor Kafka.

1. Instale expo-notifications com `npx expo install`. Use so notificacao LOCAL (funciona no Expo Go do iPhone); nada de push remoto. Configure o setNotificationHandler para mostrar banner e som com o app aberto.
2. Depois do cadastro bem-sucedido: peca permissao de notificacao e consulte GET /notificacoes a cada 1 s por ate 10 s (o consumidor grava em segundo plano). Quando chegar a BOAS_VINDAS nao lida, dispare a notificacao local com titulo e mensagem da API e mostre tambem um banner dentro do app no topo da tela Inicio com o mesmo texto e botao de fechar. Ao fechar, marque como lida (PATCH /notificacoes/:id/lida).
3. Se a permissao for negada, mostre so o banner dentro do app. Se a notificacao nao chegar em 10 s (Kafka fora do ar), nao mostre erro; ela aparece no proximo login.
4. No login, se existir notificacao nao lida, faca o mesmo do item 2 (cobre quem cadastrou com o app fechado). Nao dispare duas vezes a mesma notificacao na mesma sessao.
5. Perfil: secao "Notificacoes" com as notificacoes da API (titulo, mensagem, data), tocar marca como lida. Badge com o numero de nao lidas na aba Perfil.
6. Registre no console do Metro cada etapa ("aguardando notificacao", "notificacao recebida id X", "notificacao local disparada") para eu acompanhar no terminal.
7. Valide com `npx tsc --noEmit` e `npx expo-doctor`. Atualize o "Progresso" do PLANO-FASE2.md. Nao rode `npx expo start`.
```

Teste depois: subir Postgres, Kafka e API; `npx expo start`; criar conta nova no iPhone; permitir notificacoes; ver o banner do sistema e o banner na tela Inicio; conferir o Perfil com a notificacao lida; conferir a mensagem no kafka-ui (localhost:8080).

## Proximos prompts (preparados em 13/11/2026), executar na ordem

### Prompt A: notificacao de curso concluido (Kafka) + limpeza do banco
Use as skills nestjs-best-practices, prisma-cli, prisma-client-api, react-native-best-practices e verification-before-completion. Nao use as skills saas-*.

Leia PLANO-FASE2.md ("Desenho da mensageria" e Progresso) e o schema Prisma. Hoje so existe a notificacao BOAS_VINDAS (topico `usuario.registrado`). Objetivo: quando o aluno conclui um curso, ele recebe "Parabens por terminar o curso de <titulo>!" no app, pelo mesmo fluxo Kafka.

1. Antes de codar, descubra em `src/plataforma/plataforma.service.ts` como a conclusao e registrada (ProgressoAula, Matricula.dataConclusao, Certificado). Se hoje nada marca o curso como concluido quando a ultima aula e concluida, implemente isso: ao concluir a ultima aula do curso, preencher Matricula.dataConclusao uma unica vez. Mostre a decisao no plano.
2. Enum TipoNotificacao ganha CURSO_CONCLUIDO. A chave unica atual (idUser, tipo) impede uma notificacao por curso: adicione o campo `idCurso Int?` em Notificacao e troque o unique para (idUser, tipo, idCurso). Atencao: no Postgres NULL nao conflita no unique, entao BOAS_VINDAS (idCurso nulo) precisa continuar idempotente (use findFirst + create, ou indice parcial). Migration nova, nunca editar a antiga. Rode `npm run prisma:generate`.
3. Novo topico `curso.concluido` (garantir-topicos.ts, mensageria.service.ts) com payload { idUser, idCurso, tituloCurso }. Atencao: `Usuario` (plataforma) e `User` (auth) sao tabelas diferentes; o idUser da notificacao e o do User. Descubra a ligacao entre os dois (email) e documente.
4. Novo consumidor `curso-concluido.consumer.ts` no mesmo padrao do de boas-vindas, grupo `notificacoes-server`, idempotente por (idUser, tipo, idCurso). Falha do Kafka nao pode quebrar a conclusao da aula (mesma resiliencia do registro).
5. Mobile: o tipo Notificacao aceita 'CURSO_CONCLUIDO' e idCurso. No app, apos concluir a aula (DetalheAulaScreen), se o curso foi concluido, reutilizar o mecanismo do NotificacoesContext (consulta por ate 10 s, notificacao local, banner se sem permissao, badge no Perfil). Nao dispare a mesma notificacao duas vezes na sessao.
6. Swagger: documentar o que mudou. Validar: `npx tsc --noEmit` no backend e no mobile, `npx expo-doctor`, teste manual no Swagger (concluir ultima aula, GET /notificacoes mostra CURSO_CONCLUIDO). Atualizar o Progresso do PLANO-FASE2.md. Nao rodar `npx expo start`.

Configuracao: Opus 5.5, High, Plan; depois Medium, Auto (accept edits).

### Prompt B: revisao geral do codigo e melhorias de design
Use as skills nestjs-best-practices, react-native-best-practices, react-navigation, frontend-design, vectorlab-ux-skills:ux-audit, audit-suite:audit-as-a11y-eng e verification-before-completion. Nao use saas-*.
Parte 1 (so relatorio, sem editar): revisar backend (auth, roles, DTOs, filtros, Kafka, seeds), web e mobile. Listar achados por gravidade (seguranca, bugs, duplicacao, tipos, README desatualizado, segredos no git), com arquivo e linha. Parar e esperar aprovacao.
Parte 2: aplicar so os achados aprovados. Design mobile: consistencia de espacamento e tipografia (theme.ts), estados vazios e de erro, toque minimo 44 px, contraste, acessibilidade, icones, feedback de carregamento. Validar com tsc, expo-doctor e screenshots descritos no relatorio.
Configuracao: Opus 5.5, High, Plan na parte 1; Medium, Auto na parte 2.
