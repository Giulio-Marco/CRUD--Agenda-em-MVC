import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

import { errorMessage } from '@/api/client';

type Modo = 'inicial' | 'refresh' | 'silencioso';

export type ApiData<T> = {
  // null ate a primeira carga terminar com sucesso.
  data: T | null;
  // Mensagem da ultima falha. Com data preenchido, e uma falha de atualizacao.
  error: string | null;
  loading: boolean;
  refreshing: boolean;
  // Tenta de novo (botao "Tentar de novo").
  recarregar: () => Promise<void>;
  // Pull-to-refresh.
  atualizar: () => Promise<void>;
  setData: Dispatch<SetStateAction<T | null>>;
};

// Carrega dados da API quando a tela ganha foco. A primeira carga mostra loading;
// as seguintes (voltar de outra tela) atualizam em silencio, mantendo os dados na tela.
export function useApiData<T>(carregar: () => Promise<T>): ApiData<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Sempre a versao mais recente de `carregar` (pode depender de route.params).
  const carregarRef = useRef(carregar);
  useEffect(() => {
    carregarRef.current = carregar;
  });

  // So a resposta do pedido mais recente atualiza o estado.
  const pedidoRef = useRef(0);
  const carregouRef = useRef(false);

  const executar = useCallback(async (modo: Modo) => {
    const pedido = ++pedidoRef.current;
    if (modo === 'inicial') setLoading(true);
    if (modo === 'refresh') setRefreshing(true);

    try {
      const resultado = await carregarRef.current();
      if (pedido !== pedidoRef.current) return;
      carregouRef.current = true;
      setData(resultado);
      setError(null);
    } catch (err) {
      if (pedido !== pedidoRef.current) return;
      setError(errorMessage(err));
    } finally {
      if (pedido === pedidoRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void executar(carregouRef.current ? 'silencioso' : 'inicial');
    }, [executar]),
  );

  // Ao desmontar, respostas atrasadas sao descartadas.
  useEffect(
    () => () => {
      pedidoRef.current++;
    },
    [],
  );

  const recarregar = useCallback(() => executar('inicial'), [executar]);
  const atualizar = useCallback(() => executar('refresh'), [executar]);

  return { data, error, loading, refreshing, recarregar, atualizar, setData };
}
