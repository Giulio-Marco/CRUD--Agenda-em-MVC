// Formatos devolvidos pela API NestJS (src/cursos e src/plataforma).
// Campos Decimal do Prisma chegam como string quando a API devolve o registro cru.

export type Instrutor = {
  idUsuario: number;
  nome: string;
  email: string;
};

// GET /cursos e GET /cursos/matriculados (serializeCurso).
export type Curso = {
  idCurso: number;
  titulo: string;
  descricao: string | null;
  nivel: string;
  dataPublicacao: string;
  totalAulas: number;
  totalHoras: number;
  categoria: string | null;
  instrutor: Instrutor | null;
  totalMatriculados: number;
  matriculado: boolean;
};

export type Aula = {
  idAula: number;
  idModulo: number;
  titulo: string;
  tipoConteudo: string;
  urlConteudo: string;
  duracaoMinutos: number;
  ordem: number;
};

export type Modulo = {
  idModulo: number;
  idCurso: number;
  titulo: string;
  ordem: number;
  aulas: Aula[];
};

// GET /cursos/:id
export type CursoDetalhe = Curso & { modulos: Modulo[] };

// GET /cursos/matriculados
export type MatriculaCurso = {
  idMatricula: number;
  dataMatricula: string;
  curso: Curso;
};

export type Categoria = {
  idCategoria: number;
  nome: string;
  descricao: string | null;
};

// GET /trilhas
export type TrilhaResumo = {
  idTrilha: number;
  titulo: string;
  descricao: string | null;
  idCategoria: number;
  categoria: Categoria;
  _count: { trilhasCursos: number };
};

// Curso cru do Prisma, como vem dentro de GET /trilhas/:id.
export type CursoBruto = {
  idCurso: number;
  titulo: string;
  descricao: string | null;
  nivel: string;
  totalAulas: number;
  totalHoras: string | number;
};

// GET /trilhas/:id
export type TrilhaDetalhe = {
  idTrilha: number;
  titulo: string;
  descricao: string | null;
  idCategoria: number;
  categoria: Categoria;
  trilhasCursos: { idTrilha: number; idCurso: number; ordem: number; curso: CursoBruto }[];
};

// GET /planos
export type Plano = {
  idPlano: number;
  nome: string;
  descricao: string | null;
  preco: string | number;
  duracaoMeses: number;
};

export type Pagamento = {
  idPagamento: number;
  idAssinatura: number;
  valorPago: string | number;
  dataPagamento: string;
  metodoPagamento: string;
  idTransacaoGateway: string;
  dataFim: string;
};

// GET /assinaturas (inclui plano e pagamentos) e POST /assinaturas (inclui plano).
export type Assinatura = {
  idAssinatura: number;
  idUsuario: number;
  idPlano: number;
  dataInicio: string;
  dataFim: string;
  plano: Plano;
  pagamentos?: Pagamento[];
};

// GET /progresso
export type ProgressoAula = {
  idUsuario: number;
  idAula: number;
  dataConclusao: string;
  status: string;
  aula: Aula & { modulo: { idModulo: number; idCurso: number; titulo: string } };
};

// PUT /aulas/:id/progresso. cursoConcluido e true so na requisicao que concluiu a ultima aula do
// curso; a API publica curso.concluido no Kafka e a notificacao CURSO_CONCLUIDO chega logo depois.
export type RespostaProgresso = {
  idUsuario: number;
  idAula: number;
  status: string;
  dataConclusao: string;
  cursoConcluido: boolean;
};

export type MetodoPagamento = 'Pix' | 'Cartão' | 'Boleto';

// GET /notificacoes e PATCH /notificacoes/:id/lida.
export type Notificacao = {
  id: number;
  idUser: number;
  tipo: 'BOAS_VINDAS' | 'CURSO_CONCLUIDO';
  // Curso concluido (so em CURSO_CONCLUIDO); null nas boas-vindas.
  idCurso: number | null;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadaEm: string;
};
