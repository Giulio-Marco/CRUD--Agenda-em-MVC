import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

// Moldura das telas de entrada: titulo, texto de apoio e conteudo rolavel acima do teclado.
export function AuthScreen({ title, subtitle, children }: Props) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
  },
});
