import { api } from './client';
import type { Notificacao } from './tipos';

export const listarNotificacoes = () => api.get<Notificacao[]>('/notificacoes');
export const marcarNotificacaoLida = (id: number) =>
  api.patch<Notificacao>(`/notificacoes/${id}/lida`);
