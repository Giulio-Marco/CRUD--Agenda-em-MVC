import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { colors, spacing } from '@/theme';

export default function EscolhaPerfilScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>Plataforma de Cursos</Text>
          <Text style={styles.title}>Como você quer entrar?</Text>
        </View>
        <PrimaryButton title="Sou aluno" onPress={() => router.push('/login-aluno')} />
        <PrimaryButton
          title="Sou administrador"
          variant="outline"
          onPress={() => router.push('/login-admin')}
        />
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
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  brand: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '700',
  },
});
