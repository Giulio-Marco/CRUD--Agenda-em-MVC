import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthContext';
import { PrimaryButton } from '@/components/primary-button';
import { colors, spacing } from '@/theme';

// Tela provisoria de cada aba: titulo, usuario logado e botao Sair.
export function TabPlaceholder({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const [leaving, setLeaving] = useState(false);

  async function handleLogout() {
    setLeaving(true);
    await logout();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {user ? (
          <Text style={styles.user}>
            {user.name ?? user.email} · {user.role === 'ADMIN' ? 'Administrador' : 'Aluno'}
          </Text>
        ) : null}
        <Text style={styles.soon}>Conteúdo desta aba chega na próxima etapa.</Text>
        <PrimaryButton title="Sair" variant="outline" loading={leaving} onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '700',
  },
  user: {
    color: colors.muted,
    fontSize: 15,
  },
  soon: {
    color: colors.muted,
    fontSize: 15,
  },
});
