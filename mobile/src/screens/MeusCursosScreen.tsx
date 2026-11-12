import { StyleSheet, Text, View } from 'react-native';

import { cores, spacing } from '@/styles/theme';

// Aba Meus cursos: por enquanto so o titulo. O conteudo chega na Etapa 4.
export function MeusCursosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus cursos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: cores.background,
  },
  title: {
    color: cores.ink,
    fontSize: 28,
    fontWeight: '700',
  },
});
