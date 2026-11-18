import { StyleSheet, Text, View } from 'react-native';

import { cores, fonte, radius, spacing } from '@/styles/theme';
import { plural } from '@/utils/formato';

type Props = {
  concluidas: number;
  total: number;
};

// Barra de progresso do curso. Sem total conhecido, mostra so a contagem.
export function BarraProgresso({ concluidas, total }: Props) {
  if (total <= 0) {
    return <Text style={styles.texto}>{plural(concluidas, 'aula concluída', 'aulas concluídas')}</Text>;
  }

  const feitas = Math.min(concluidas, total);
  const percentual = Math.round((feitas / total) * 100);
  const completo = feitas === total;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Progresso no curso"
      accessibilityValue={{ min: 0, max: 100, now: percentual, text: `${feitas} de ${total} aulas, ${percentual}%` }}>
      <View style={styles.linha}>
        <Text style={styles.texto}>
          {completo ? 'Curso concluído' : `${feitas} de ${plural(total, 'aula', 'aulas')}`}
        </Text>
        <Text style={[styles.percentual, completo && styles.percentualCompleto]}>{percentual}%</Text>
      </View>
      <View style={styles.trilho}>
        <View
          style={[
            styles.preenchimento,
            { width: `${percentual}%` },
            completo && styles.preenchimentoCompleto,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs + 2,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  texto: {
    color: cores.muted,
    fontSize: fonte.legenda,
    fontWeight: '500',
  },
  percentual: {
    color: cores.ink,
    fontSize: fonte.legenda,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  percentualCompleto: {
    color: cores.success,
  },
  trilho: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: cores.primarySoft,
    overflow: 'hidden',
  },
  preenchimento: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: cores.accent,
  },
  preenchimentoCompleto: {
    backgroundColor: cores.success,
  },
});
