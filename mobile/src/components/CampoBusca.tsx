import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { cores, fonte, radius, spacing } from '@/styles/theme';

type Props = {
  valor: string;
  onChange: (texto: string) => void;
  placeholder: string;
  accessibilityLabel: string;
};

export function CampoBusca({ valor, onChange, placeholder, accessibilityLabel }: Props) {
  return (
    <View style={styles.campo}>
      <Ionicons name="search" size={20} color={cores.muted} />
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={cores.muted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never"
        accessibilityLabel={accessibilityLabel}
      />
      {valor ? (
        <TouchableOpacity
          onPress={() => onChange('')}
          hitSlop={10}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca">
          <Ionicons name="close-circle" size={20} color={cores.muted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: cores.line,
    backgroundColor: cores.surface,
  },
  input: {
    flex: 1,
    minHeight: 46,
    color: cores.ink,
    fontSize: fonte.corpo,
  },
});
