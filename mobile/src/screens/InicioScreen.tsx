import { StyleSheet, Text, View } from 'react-native';

import { cores, spacing } from '@/styles/theme';

// Aba Início: por enquanto so o titulo. O conteudo chega na Etapa 4.
export function InicioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Início</Text>
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
