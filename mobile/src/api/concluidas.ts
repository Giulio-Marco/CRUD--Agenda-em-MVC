import { concluidasPorCurso } from '@/utils/formato';

import { listarProgresso } from './plataforma';

// Aulas concluidas por curso (GET /progresso). Usado so para o selo "Concluido" nas listas:
// se falhar, a lista continua sem selos em vez de bloquear a tela.
export const listarConcluidasPorCurso = () =>
  listarProgresso().then(concluidasPorCurso, () => new Map<number, number>());
