import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { cores, fonte, radius, spacing } from '@/styles/theme';

type Tom = 'neutro' | 'primario' | 'sucesso';

type Props = {
  texto: string;
  icone?: keyof typeof Ionicons.glyphMap;
  tom?: Tom;
};

const tons: Record<Tom, { fundo: string; texto: string }> = {
  neutro: { fundo: cores.background, texto: cores.muted },
  primario: { fundo: cores.primarySoft, texto: cores.primaryDark },
  sucesso: { fundo: cores.successBackground, texto: cores.success },
};

// Rotulo pequeno: nivel, duracao, tipo de aula, "Matriculado".
export function Chip({ texto, icone, tom = 'neutro' }: Props) {
  const cor = tons[tom];
  return (
    <View style={[styles.chip, { backgroundColor: cor.fundo }]}>
      {icone ? <Ionicons name={icone} size={14} color={cor.texto} /> : null}
      <Text style={[styles.texto, { color: cor.texto }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.full,
  },
  texto: {
    fontSize: fonte.legenda,
    fontWeight: '600',
  },
});
