import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { cores, radius, spacing } from '@/styles/theme';

export function PerfilScreen() {
  const { user, logout } = useAuth();
  const [saindo, setSaindo] = useState(false);

  async function handleSair() {
    setSaindo(true);
    // Sem reset: ao limpar o usuario, AppRoutes volta para o Login sozinho.
    await logout();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome</Text>
        <Text style={styles.value}>{user?.name ?? '—'}</Text>
        <Text style={[styles.label, styles.spaced]}>E-mail</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSair}
        disabled={saindo}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ disabled: saindo, busy: saindo }}>
        {saindo ? (
          <ActivityIndicator color={cores.primary} />
        ) : (
          <Text style={styles.buttonText}>Sair</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: cores.background,
  },
  title: {
    color: cores.ink,
    fontSize: 28,
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
    fontSize: 13,
    fontWeight: '600',
  },
  spaced: {
    marginTop: spacing.md,
  },
  value: {
    color: cores.ink,
    fontSize: 17,
    marginTop: spacing.xs,
  },
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: cores.primary,
    backgroundColor: cores.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: cores.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
