import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import type { AppStackParamList } from '@/navigation/AppRoutes';
import { cores, spacing } from '@/styles/theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Pagamento'>;

// Recebe o id por route.params. Os dados da API chegam na Etapa 4.
export function PagamentoScreen({ route }: Props) {
  const { cursoId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagamento do curso #{cursoId}</Text>
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
