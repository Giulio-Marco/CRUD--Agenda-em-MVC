import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'danger';
};

export function PrimaryButton({ title, onPress, loading, disabled, variant = 'primary' }: Props) {
  const isDisabled = disabled || loading;
  const outline = variant === 'outline';
  const textColor = outline ? colors.primary : colors.surface;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && { backgroundColor: pressed ? colors.primaryDark : colors.primary },
        variant === 'danger' && { backgroundColor: colors.danger, opacity: pressed ? 0.85 : 1 },
        outline && [styles.outline, pressed && { backgroundColor: colors.background }],
        isDisabled && styles.disabled,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
