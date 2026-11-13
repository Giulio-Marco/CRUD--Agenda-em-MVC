import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { errorMessage } from '@/api/client';
import { listarNotificacoes, marcarNotificacaoLida } from '@/api/notificacoes';
import type { Notificacao } from '@/api/tipos';
import { useAuth } from '@/auth/AuthContext';
import { dispararLocal, pedirPermissao } from '@/notificacoes/local';

// O consumidor Kafka grava em segundo plano: consulta 1 vez por segundo, ate 10 vezes.
const TENTATIVAS = 10;
const INTERVALO_MS = 1000;

export type AvisoApp = { titulo: string; mensagem: string };

type NotificacoesContextValue = {
  notificacoes: Notificacao[];
  naoLidas: number;
  carregando: boolean;
  // Falha da ultima consulta manual (Perfil). Vazio quando deu certo.
  erro: string | null;
  recarregar: () => Promise<void>;
  // Devolve a mensagem de erro se a API falhar (a lista volta ao estado anterior).
  marcarComoLida: (id: number) => Promise<string | null>;
  // Banner dentro do app, usado quando a permissao foi negada.
  aviso: AvisoApp | null;
  fecharAviso: () => void;
};

const NotificacoesContext = createContext<NotificacoesContextValue | null>(null);

function log(mensagem: string) {
  if (__DEV__) console.log(`[notificacoes] ${mensagem}`);
}

const esperar = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function NotificacoesProvider({ children }: { children: ReactNode }) {
  const { user, origemSessao } = useAuth();
  const userId = user?.id ?? null;

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<AvisoApp | null>(null);

  // Ids ja disparados nesta sessao: nunca dispara duas vezes a mesma notificacao.
  const disparadas = useRef(new Set<number>());

  useEffect(() => {
    disparadas.current = new Set();
    setNotificacoes([]);
    setErro(null);
    setAviso(null);
    if (userId === null || origemSessao === null) return;

    let ativo = true;

    async function disparar(lista: Notificacao[], permissao: Promise<boolean>) {
      const novas = lista.filter((n) => !n.lida && !disparadas.current.has(n.id));
      if (!novas.length) return;
      novas.forEach((n) => disparadas.current.add(n.id));
      const permitido = await permissao;
      if (!ativo) return;
      for (const n of novas) {
        const enviada = permitido && (await dispararLocal(n.titulo, n.mensagem));
        if (!ativo) return;
        if (enviada) log('notificacao local disparada');
        else setAviso({ titulo: n.titulo, mensagem: n.mensagem });
      }
    }

    (async () => {
      try {
        if (origemSessao === 'armazenada') {
          // Reabriu o app: so atualiza a lista (badge). Nao dispara de novo.
          const lista = await listarNotificacoes();
          if (!ativo) return;
          setNotificacoes(lista);
          return;
        }

        const permissao = pedirPermissao();
        const tentativas = origemSessao === 'cadastro' ? TENTATIVAS : 1;
        for (let i = 0; i < tentativas && ativo; i++) {
          if (origemSessao === 'cadastro') log(`aguardando notificacao (${i + 1}/${tentativas})`);
          try {
            const lista = await listarNotificacoes();
            if (!ativo) return;
            setNotificacoes(lista);
            const naoLidasAgora = lista.filter((n) => !n.lida);
            if (naoLidasAgora.length) {
              naoLidasAgora.forEach((n) => log(`notificacao recebida id ${n.id}`));
              await disparar(lista, permissao);
              return;
            }
          } catch (err) {
            // Rede ou Kafka fora do ar: sem erro na tela, tenta de novo.
            log(`consulta falhou: ${errorMessage(err)}`);
          }
          if (i < tentativas - 1) await esperar(INTERVALO_MS);
        }
      } catch (err) {
        log(`consulta falhou: ${errorMessage(err)}`);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [userId, origemSessao]);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      setNotificacoes(await listarNotificacoes());
      setErro(null);
    } catch (err) {
      setErro(errorMessage(err));
    } finally {
      setCarregando(false);
    }
  }, []);

  const marcarComoLida = useCallback(async (id: number) => {
    setNotificacoes((lista) => lista.map((n) => (n.id === id ? { ...n, lida: true } : n)));
    try {
      await marcarNotificacaoLida(id);
      return null;
    } catch (err) {
      setNotificacoes((lista) => lista.map((n) => (n.id === id ? { ...n, lida: false } : n)));
      return errorMessage(err);
    }
  }, []);

  const fecharAviso = useCallback(() => setAviso(null), []);

  const naoLidas = useMemo(() => notificacoes.filter((n) => !n.lida).length, [notificacoes]);

  const value = useMemo<NotificacoesContextValue>(
    () => ({ notificacoes, naoLidas, carregando, erro, recarregar, marcarComoLida, aviso, fecharAviso }),
    [notificacoes, naoLidas, carregando, erro, recarregar, marcarComoLida, aviso, fecharAviso],
  );

  return <NotificacoesContext.Provider value={value}>{children}</NotificacoesContext.Provider>;
}

export function useNotificacoes(): NotificacoesContextValue {
  const context = useContext(NotificacoesContext);
  if (!context) throw new Error('useNotificacoes precisa estar dentro de NotificacoesProvider.');
  return context;
}
