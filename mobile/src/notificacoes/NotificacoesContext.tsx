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
  // Chamado depois que PUT /aulas/:id/progresso responde cursoConcluido: aguarda a notificacao
  // CURSO_CONCLUIDO gravada pelo consumidor Kafka e dispara do mesmo jeito que as boas-vindas.
  aguardarCursoConcluido: (idCurso: number) => void;
};

type Consulta = {
  tentativas: number;
  // Quais notificacoes nao lidas esta consulta espera (e dispara).
  alvo: (n: Notificacao) => boolean;
  rotulo: string;
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
  // Muda a cada login/logout: consultas de uma sessao antiga param sozinhas.
  const sessao = useRef(0);

  const consultarEDisparar = useCallback(async ({ tentativas, alvo, rotulo }: Consulta) => {
    const minhaSessao = sessao.current;
    const ativa = () => sessao.current === minhaSessao;
    const permissao = pedirPermissao();

    for (let i = 0; i < tentativas && ativa(); i++) {
      if (tentativas > 1) log(`aguardando ${rotulo} (${i + 1}/${tentativas})`);
      try {
        const lista = await listarNotificacoes();
        if (!ativa()) return;
        setNotificacoes(lista);
        const encontradas = lista.filter((n) => !n.lida && alvo(n));
        if (encontradas.length) {
          encontradas.forEach((n) => log(`notificacao recebida id ${n.id}`));
          const novas = encontradas.filter((n) => !disparadas.current.has(n.id));
          novas.forEach((n) => disparadas.current.add(n.id));
          const permitido = await permissao;
          for (const n of novas) {
            if (!ativa()) return;
            const enviada = permitido && (await dispararLocal(n.titulo, n.mensagem));
            if (!ativa()) return;
            if (enviada) log(`notificacao local disparada id ${n.id}`);
            else setAviso({ titulo: n.titulo, mensagem: n.mensagem });
          }
          return;
        }
      } catch (err) {
        // Rede ou Kafka fora do ar: sem erro na tela, tenta de novo.
        log(`consulta falhou: ${errorMessage(err)}`);
      }
      if (i < tentativas - 1) await esperar(INTERVALO_MS);
    }
  }, []);

  useEffect(() => {
    sessao.current += 1;
    disparadas.current = new Set();
    setNotificacoes([]);
    setErro(null);
    setAviso(null);
    if (userId === null || origemSessao === null) return;

    if (origemSessao === 'armazenada') {
      // Reabriu o app: so atualiza a lista (badge). Nao dispara de novo.
      const minhaSessao = sessao.current;
      listarNotificacoes()
        .then((lista) => {
          if (sessao.current === minhaSessao) setNotificacoes(lista);
        })
        .catch((err: unknown) => log(`consulta falhou: ${errorMessage(err)}`));
    } else {
      // Cadastro: o consumidor Kafka grava em segundo plano, entao espera ate 10 s.
      // Login: uma consulta (cobre quem cadastrou ou concluiu curso com o app fechado).
      void consultarEDisparar({
        tentativas: origemSessao === 'cadastro' ? TENTATIVAS : 1,
        alvo: () => true,
        rotulo: 'notificacao',
      });
    }

    return () => {
      sessao.current += 1;
    };
  }, [userId, origemSessao, consultarEDisparar]);

  const aguardarCursoConcluido = useCallback(
    (idCurso: number) => {
      void consultarEDisparar({
        tentativas: TENTATIVAS,
        alvo: (n) => n.tipo === 'CURSO_CONCLUIDO' && n.idCurso === idCurso,
        rotulo: `notificacao de curso concluido ${idCurso}`,
      });
    },
    [consultarEDisparar],
  );

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
    () => ({
      notificacoes,
      naoLidas,
      carregando,
      erro,
      recarregar,
      marcarComoLida,
      aviso,
      fecharAviso,
      aguardarCursoConcluido,
    }),
    [notificacoes, naoLidas, carregando, erro, recarregar, marcarComoLida, aviso, fecharAviso, aguardarCursoConcluido],
  );

  return <NotificacoesContext.Provider value={value}>{children}</NotificacoesContext.Provider>;
}

export function useNotificacoes(): NotificacoesContextValue {
  const context = useContext(NotificacoesContext);
  if (!context) throw new Error('useNotificacoes precisa estar dentro de NotificacoesProvider.');
  return context;
}
