import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { criarAssinatura, listarPlanos, matricular, registrarPagamento } from '@/api/plataforma';
import type { MetodoPagamento, Plano } from '@/api/tipos';
import { Botao } from '@/components/Botao';
import { AvisoErro, EstadoCarregando, EstadoErro, EstadoVazio } from '@/components/Estados';
import { useApiData } from '@/hooks/useApiData';
import type { AppStackParamList } from '@/navigation/AppRoutes';
import { cores, fonte, radius, spacing } from '@/styles/theme';
import { formatarPreco, plural } from '@/utils/formato';

type Props = NativeStackScreenProps<AppStackParamList, 'Pagamento'>;

const METODOS: { valor: MetodoPagamento; icone: keyof typeof Ionicons.glyphMap }[] = [
  { valor: 'Pix', icone: 'qr-code-outline' },
  { valor: 'Cartão', icone: 'card-outline' },
  { valor: 'Boleto', icone: 'barcode-outline' },
];

// O que ja foi gravado na API nesta tentativa. Uma nova tentativa continua daqui,
// sem criar outra assinatura nem outro pagamento.
type Andamento = {
  idPlano: number;
  assinatura?: { idAssinatura: number; dataFim: string };
  pago?: boolean;
};

function somarMeses(data: Date, meses: number): Date {
  const resultado = new Date(data);
  resultado.setMonth(resultado.getMonth() + meses);
  return resultado;
}

// Identificador da transacao no "gateway". O pagamento e simulado: nao ha cobranca real.
function gerarIdTransacao(): string {
  return `APP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

// Fluxo: POST /assinaturas -> POST /pagamentos -> POST /cursos/:id/matricular.
export function PagamentoScreen({ navigation, route }: Props) {
  const { cursoId, cursoTitulo } = route.params;
  const insets = useSafeAreaInsets();
  const { data: planos, error, refreshing, recarregar, atualizar } = useApiData(listarPlanos);
  const [idPlano, setIdPlano] = useState<number | null>(null);
  const [metodo, setMetodo] = useState<MetodoPagamento>('Pix');
  const [enviando, setEnviando] = useState(false);
  const [etapa, setEtapa] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const andamentoRef = useRef<Andamento | null>(null);

  if (planos === null) {
    return error ? (
      <EstadoErro mensagem={error} onTentarDeNovo={recarregar} />
    ) : (
      <EstadoCarregando texto="Carregando planos…" />
    );
  }

  const plano = planos.find((item) => item.idPlano === idPlano) ?? null;

  async function handlePagar() {
    if (enviando || !plano) return;
    setErro(null);
    setEnviando(true);

    // Trocar de plano depois de uma falha comeca do zero.
    let andamento = andamentoRef.current;
    if (!andamento || andamento.idPlano !== plano.idPlano) {
      andamento = { idPlano: plano.idPlano };
      andamentoRef.current = andamento;
    }

    try {
      if (!andamento.assinatura) {
        setEtapa('Criando assinatura…');
        const inicio = new Date();
        const fim = somarMeses(inicio, plano.duracaoMeses);
        const assinatura = await criarAssinatura({
          idPlano: plano.idPlano,
          dataInicio: inicio.toISOString(),
          dataFim: fim.toISOString(),
        });
        andamento.assinatura = { idAssinatura: assinatura.idAssinatura, dataFim: fim.toISOString() };
      }

      if (!andamento.pago) {
        setEtapa('Registrando pagamento…');
        await registrarPagamento({
          idAssinatura: andamento.assinatura.idAssinatura,
          valorPago: Number(plano.preco),
          metodoPagamento: metodo,
          idTransacaoGateway: gerarIdTransacao(),
          dataFim: andamento.assinatura.dataFim,
        });
        andamento.pago = true;
      }

      setEtapa('Confirmando matrícula…');
      await matricular(cursoId);
      andamentoRef.current = null;
      // Volta para o curso; ao ganhar foco ele recarrega e aparece como matriculado.
      navigation.popTo('DetalheCurso', { id: cursoId });
    } catch (err) {
      const mensagem = errorMessage(err);
      setErro(
        andamento.pago
          ? `Pagamento registrado, mas a matrícula não foi confirmada: ${mensagem}`
          : mensagem,
      );
      setEnviando(false);
      setEtapa(null);
    }
  }

  const tentativaPendente = erro !== null && andamentoRef.current?.idPlano === idPlano;

  return (
    <View style={styles.container}>
      <FlatList
        data={planos}
        keyExtractor={(item) => String(item.idPlano)}
        extraData={{ idPlano, enviando }}
        renderItem={({ item }) => (
          <PlanoOpcao
            plano={item}
            selecionado={item.idPlano === idPlano}
            desabilitado={enviando}
            onPress={() => setIdPlano(item.idPlano)}
          />
        )}
        ItemSeparatorComponent={Separador}
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            {error ? <AvisoErro mensagem={error} onTentarDeNovo={recarregar} /> : null}
            <Text style={styles.rotulo}>Matrícula em</Text>
            <Text style={styles.curso}>{cursoTitulo}</Text>
            <Text style={styles.explicacao}>
              Escolha um plano. Enquanto a assinatura estiver ativa, você se matricula em qualquer curso sem pagar
              de novo.
            </Text>
            {planos.length > 0 ? <Text style={styles.secao}>Plano</Text> : null}
          </View>
        }
        ListEmptyComponent={
          <EstadoVazio
            icone="pricetags-outline"
            titulo="Nenhum plano disponível"
            texto="A matrícula precisa de um plano de assinatura, e nenhum foi cadastrado ainda. Puxe para atualizar mais tarde."
          />
        }
        ListFooterComponent={
          planos.length > 0 ? (
            <View style={styles.metodos}>
              <Text style={styles.secao}>Forma de pagamento</Text>
              <View style={styles.segmentos} accessibilityRole="radiogroup">
                {METODOS.map((opcao) => {
                  const ativo = opcao.valor === metodo;
                  return (
                    <TouchableOpacity
                      key={opcao.valor}
                      style={[styles.segmento, ativo && styles.segmentoAtivo]}
                      onPress={() => setMetodo(opcao.valor)}
                      disabled={enviando}
                      activeOpacity={0.7}
                      accessibilityRole="radio"
                      accessibilityLabel={opcao.valor}
                      accessibilityState={{ checked: ativo, disabled: enviando }}>
                      <Ionicons name={opcao.icone} size={20} color={ativo ? cores.primary : cores.muted} />
                      <Text style={[styles.segmentoTexto, ativo && styles.segmentoTextoAtivo]}>{opcao.valor}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.nota}>Ambiente de demonstração: nenhuma cobrança real é feita.</Text>
            </View>
          ) : undefined
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={atualizar} tintColor={cores.primary} colors={[cores.primary]} />
        }
        contentContainerStyle={styles.lista}
      />

      {planos.length > 0 ? (
        <View style={[styles.rodape, { paddingBottom: insets.bottom + spacing.sm }]}>
          {erro ? (
            <Text style={styles.erro} accessibilityRole="alert">
              {erro}
            </Text>
          ) : null}
          <View style={styles.total}>
            <Text style={styles.totalRotulo}>Total</Text>
            <Text style={styles.totalValor}>{plano ? formatarPreco(plano.preco) : 'Escolha um plano'}</Text>
          </View>
          <Botao
            titulo={tentativaPendente ? 'Tentar de novo' : 'Pagar e matricular'}
            icone="lock-closed-outline"
            onPress={handlePagar}
            carregando={enviando}
            desabilitado={!plano}
            accessibilityHint="Cria a assinatura, registra o pagamento e matricula você no curso"
          />
          {etapa ? <Text style={styles.etapa}>{etapa}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

type PlanoOpcaoProps = {
  plano: Plano;
  selecionado: boolean;
  desabilitado: boolean;
  onPress: () => void;
};

function PlanoOpcao({ plano, selecionado, desabilitado, onPress }: PlanoOpcaoProps) {
  const duracao = plural(plano.duracaoMeses, 'mês', 'meses');
  return (
    <TouchableOpacity
      style={[styles.plano, selecionado && styles.planoSelecionado]}
      onPress={onPress}
      disabled={desabilitado}
      activeOpacity={0.7}
      accessibilityRole="radio"
      accessibilityLabel={`Plano ${plano.nome}, ${formatarPreco(plano.preco)} por ${duracao}`}
      accessibilityState={{ checked: selecionado, disabled: desabilitado }}>
      <Ionicons
        name={selecionado ? 'radio-button-on' : 'radio-button-off'}
        size={22}
        color={selecionado ? cores.primary : cores.muted}
      />
      <View style={styles.planoTexto}>
        <Text style={styles.planoNome}>{plano.nome}</Text>
        {plano.descricao ? <Text style={styles.planoDescricao}>{plano.descricao}</Text> : null}
      </View>
      <View style={styles.planoPreco}>
        <Text style={styles.planoValor}>{formatarPreco(plano.preco)}</Text>
        <Text style={styles.planoDuracao}>por {duracao}</Text>
      </View>
    </TouchableOpacity>
  );
}

function Separador() {
  return <View style={styles.separador} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.background,
  },
  lista: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  cabecalho: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  rotulo: {
    color: cores.muted,
    fontSize: fonte.legenda,
    fontWeight: '600',
  },
  curso: {
    color: cores.ink,
    fontSize: fonte.subtitulo + 2,
    fontWeight: '700',
  },
  explicacao: {
    color: cores.muted,
    fontSize: fonte.apoio + 1,
    lineHeight: 21,
    marginTop: spacing.xs,
  },
  secao: {
    color: cores.ink,
    fontSize: fonte.corpo,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  plano: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    padding: spacing.md,
    backgroundColor: cores.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: cores.line,
  },
  planoSelecionado: {
    borderWidth: 2,
    borderColor: cores.primary,
    backgroundColor: cores.primarySoft,
  },
  planoTexto: {
    flex: 1,
    gap: 2,
  },
  planoNome: {
    color: cores.ink,
    fontSize: fonte.corpo + 1,
    fontWeight: '700',
  },
  planoDescricao: {
    color: cores.muted,
    fontSize: fonte.legenda,
    lineHeight: 18,
  },
  planoPreco: {
    alignItems: 'flex-end',
  },
  planoValor: {
    color: cores.ink,
    fontSize: fonte.corpo + 1,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  planoDuracao: {
    color: cores.muted,
    fontSize: fonte.legenda,
  },
  metodos: {
    gap: spacing.sm,
  },
  segmentos: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segmento: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: cores.line,
    backgroundColor: cores.surface,
  },
  segmentoAtivo: {
    borderWidth: 2,
    borderColor: cores.primary,
    backgroundColor: cores.primarySoft,
  },
  segmentoTexto: {
    color: cores.muted,
    fontSize: fonte.apoio,
    fontWeight: '600',
  },
  segmentoTextoAtivo: {
    color: cores.primaryDark,
  },
  nota: {
    color: cores.muted,
    fontSize: fonte.legenda,
    marginTop: spacing.xs,
  },
  rodape: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + 4,
    backgroundColor: cores.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cores.line,
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalRotulo: {
    color: cores.muted,
    fontSize: fonte.apoio,
  },
  totalValor: {
    color: cores.ink,
    fontSize: fonte.subtitulo,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  etapa: {
    color: cores.muted,
    fontSize: fonte.legenda,
    textAlign: 'center',
  },
  erro: {
    color: cores.danger,
    backgroundColor: cores.dangerBackground,
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
    fontSize: fonte.apoio,
  },
  separador: {
    height: spacing.sm + 4,
  },
});
