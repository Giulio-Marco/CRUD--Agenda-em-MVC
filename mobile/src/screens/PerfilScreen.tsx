import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Botao } from '@/components/Botao';
import { AvisoErro } from '@/components/Estados';
import { useNotificacoes } from '@/notificacoes/NotificacoesContext';
import { cores, fonte, radius, spacing } from '@/styles/theme';
import { formatarDataHora } from '@/utils/formato';

export function PerfilScreen() {
  const { user, logout } = useAuth();
  const { notificacoes, carregando, erro, recarregar, marcarComoLida } = useNotificacoes();
  const [saindo, setSaindo] = useState(false);
  const [erroMarcar, setErroMarcar] = useState<string | null>(null);

  // Ao abrir a aba, atualiza a lista.
  useFocusEffect(
    useCallback(() => {
      void recarregar();
    }, [recarregar]),
  );

  async function handleSair() {
    setSaindo(true);
    // Sem reset: ao limpar o usuario, AppRoutes volta para o Login sozinho.
    await logout();
  }

  async function handleLer(id: number) {
    setErroMarcar(null);
    setErroMarcar(await marcarComoLida(id));
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={false} onRefresh={recarregar} tintColor={cores.primary} />}>
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome</Text>
        <Text style={styles.value}>{user?.name ?? '—'}</Text>
        <Text style={[styles.label, styles.spaced]}>E-mail</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      <Text style={styles.secao}>Notificações</Text>

      {erro && notificacoes.length > 0 ? <AvisoErro mensagem={erro} onTentarDeNovo={recarregar} /> : null}
      {erroMarcar ? (
        <Text accessibilityRole="alert" style={styles.erro}>
          {erroMarcar}
        </Text>
      ) : null}

      {notificacoes.length === 0 ? (
        carregando ? (
          <ActivityIndicator color={cores.primary} style={styles.carregando} />
        ) : erro ? (
          <AvisoErro mensagem={erro} onTentarDeNovo={recarregar} />
        ) : (
          <Text style={styles.vazio}>Nenhuma notificação ainda.</Text>
        )
      ) : (
        notificacoes.map((n) => (
          <TouchableOpacity
            key={n.id}
            style={[styles.notificacao, !n.lida && styles.naoLida]}
            onPress={() => handleLer(n.id)}
            disabled={n.lida}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${n.lida ? '' : 'Não lida. '}${n.titulo}. ${n.mensagem}`}
            accessibilityHint={n.lida ? undefined : 'Toque para marcar como lida'}
            accessibilityState={{ disabled: n.lida }}>
            <View style={styles.notificacaoTopo}>
              {!n.lida ? <View style={styles.ponto} /> : null}
              <Text style={styles.notificacaoTitulo}>{n.titulo}</Text>
            </View>
            <Text style={styles.notificacaoMensagem}>{n.mensagem}</Text>
            <Text style={styles.notificacaoData}>{formatarDataHora(n.criadaEm)}</Text>
          </TouchableOpacity>
        ))
      )}

      <Botao titulo="Sair" variante="secundario" onPress={handleSair} carregando={saindo} style={styles.sair} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: cores.background,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: cores.ink,
    fontSize: fonte.titulo,
    fontWeight: '700',
  },
  card: {
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  label: {
    color: cores.muted,
    fontSize: fonte.legenda,
    fontWeight: '600',
  },
  spaced: {
    marginTop: spacing.md,
  },
  value: {
    color: cores.ink,
    fontSize: fonte.corpo,
    marginTop: spacing.xs,
  },
  secao: {
    color: cores.ink,
    fontSize: fonte.subtitulo,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  carregando: {
    paddingVertical: spacing.md,
  },
  vazio: {
    color: cores.muted,
    fontSize: fonte.apoio,
  },
  erro: {
    color: cores.danger,
    backgroundColor: cores.dangerBackground,
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
    fontSize: fonte.apoio,
  },
  notificacao: {
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  naoLida: {
    backgroundColor: cores.primarySoft,
    borderColor: cores.primary,
  },
  notificacaoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ponto: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: cores.primary,
  },
  notificacaoTitulo: {
    flex: 1,
    color: cores.ink,
    fontSize: fonte.corpo,
    fontWeight: '700',
  },
  notificacaoMensagem: {
    color: cores.ink,
    fontSize: fonte.apoio,
    lineHeight: 20,
  },
  notificacaoData: {
    color: cores.muted,
    fontSize: fonte.legenda,
  },
  sair: {
    marginTop: spacing.sm,
  },
});
