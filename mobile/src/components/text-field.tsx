import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type Props = TextInputProps & {
  label: string;
};

export function TextField({ label, style, ...inputProps }: Props) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.ink,
    fontSize: 16,
  },
});
