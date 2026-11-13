import { api } from './client';
import type {
  Assinatura,
  Curso,
  CursoDetalhe,
  MatriculaCurso,
  MetodoPagamento,
  Pagamento,
  Plano,
  ProgressoAula,
  TrilhaDetalhe,
  TrilhaResumo,
} from './tipos';

// Status gravado em PUT /aulas/:id/progresso quando o aluno conclui a aula.
export const STATUS_CONCLUIDA = 'concluido';

export const listarCursos = () => api.get<Curso[]>('/cursos');
export const buscarCurso = (id: number) => api.get<CursoDetalhe>(`/cursos/${id}`);
export const listarMeusCursos = () => api.get<MatriculaCurso[]>('/cursos/matriculados');
export const matricular = (idCurso: number) => api.post<unknown>(`/cursos/${idCurso}/matricular`);

export const listarTrilhas = () => api.get<TrilhaResumo[]>('/trilhas');
export const buscarTrilha = (id: number) => api.get<TrilhaDetalhe>(`/trilhas/${id}`);

export const listarProgresso = () => api.get<ProgressoAula[]>('/progresso');
export const concluirAula = (idAula: number) =>
  api.put<unknown>(`/aulas/${idAula}/progresso`, { status: STATUS_CONCLUIDA });

export const listarPlanos = () => api.get<Plano[]>('/planos');
export const listarAssinaturas = () => api.get<Assinatura[]>('/assinaturas');

export const criarAssinatura = (dados: { idPlano: number; dataInicio: string; dataFim: string }) =>
  api.post<Assinatura>('/assinaturas', dados);

export const registrarPagamento = (dados: {
  idAssinatura: number;
  valorPago: number;
  metodoPagamento: MetodoPagamento;
  idTransacaoGateway: string;
  dataFim: string;
}) => api.post<Pagamento>('/pagamentos', dados);
