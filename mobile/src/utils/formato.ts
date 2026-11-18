import { STATUS_CONCLUIDA } from '@/api/plataforma';
import type { Assinatura, ProgressoAula } from '@/api/tipos';

const formatoPreco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatarPreco(valor: string | number): string {
  return formatoPreco.format(Number(valor));
}

// 1.5 -> "1h30", 0.75 -> "45 min", 3 -> "3h".
export function formatarHoras(horas: string | number): string {
  const totalMinutos = Math.round(Number(horas) * 60);
  if (!totalMinutos) return '0 min';
  const h = Math.floor(totalMinutos / 60);
  const min = totalMinutos % 60;
  if (h === 0) return `${min} min`;
  return min ? `${h}h${String(min).padStart(2, '0')}` : `${h}h`;
}

export function formatarMinutos(minutos: number): string {
  return formatarHoras(minutos / 60);
}

export function formatarData(iso: string): string {
  const data = new Date(iso);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${data.getFullYear()}`;
}

export function plural(quantidade: number, singular: string, pluralTexto: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : pluralTexto}`;
}

// Minusculas e sem acento: "Programação" e "programacao" casam na busca.
export function normalizar(texto: string | null | undefined): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

// Assinatura ativa: vence no futuro e tem pelo menos um pagamento registrado.
export function assinaturaAtiva(assinaturas: Assinatura[], agora = new Date()): Assinatura | null {
  return (
    assinaturas.find(
      (assinatura) => new Date(assinatura.dataFim) > agora && (assinatura.pagamentos?.length ?? 0) > 0,
    ) ?? null
  );
}

export function aulasConcluidas(progresso: ProgressoAula[]): Set<number> {
  return new Set(progresso.filter((item) => item.status === STATUS_CONCLUIDA).map((item) => item.idAula));
}

// Quantidade de aulas concluidas por curso.
export function concluidasPorCurso(progresso: ProgressoAula[]): Map<number, number> {
  const contagem = new Map<number, number>();
  for (const item of progresso) {
    if (item.status !== STATUS_CONCLUIDA) continue;
    const idCurso = item.aula.modulo.idCurso;
    contagem.set(idCurso, (contagem.get(idCurso) ?? 0) + 1);
  }
  return contagem;
}

export function nomeTipoAula(tipo: string): string {
  const nomes: Record<string, string> = { video: 'Vídeo', leitura: 'Leitura', exercicio: 'Exercício' };
  return nomes[normalizar(tipo)] ?? tipo;
}

// "2026-11-12T22:15:03Z" -> "12/11/2026 às 19:15" (hora local do aparelho).
export function formatarDataHora(iso: string): string {
  const data = new Date(iso);
  const hora = String(data.getHours()).padStart(2, '0');
  const min = String(data.getMinutes()).padStart(2, '0');
  return `${formatarData(iso)} às ${hora}:${min}`;
}
