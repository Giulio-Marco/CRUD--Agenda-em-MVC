import { StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Text accessibilityRole="alert" style={styles.error}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
    backgroundColor: '#f8e9e9',
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
    fontSize: 14,
  },
});
