import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { cores, fonte, radius, spacing } from '@/styles/theme';

type Variante = 'primario' | 'secundario';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  icone?: keyof typeof Ionicons.glyphMap;
  carregando?: boolean;
  desabilitado?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  carregando = false,
  desabilitado = false,
  accessibilityHint,
  style,
}: Props) {
  const inativo = desabilitado || carregando;
  const corTexto = variante === 'primario' ? cores.surface : cores.primary;

  return (
    <TouchableOpacity
      style={[styles.base, styles[variante], inativo && styles.inativo, style]}
      onPress={onPress}
      disabled={inativo}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inativo, busy: carregando }}>
      {carregando ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        <>
          {icone ? <Ionicons name={icone} size={20} color={corTexto} /> : null}
          <Text style={[styles.texto, { color: corTexto }]}>{titulo}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  primario: {
    backgroundColor: cores.primary,
  },
  secundario: {
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.primary,
  },
  inativo: {
    opacity: 0.55,
  },
  texto: {
    fontSize: fonte.corpo,
    fontWeight: '600',
  },
});
