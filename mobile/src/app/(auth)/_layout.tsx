import { Stack } from 'expo-router';

import { colors } from '@/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.ink },
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login-aluno" options={{ title: 'Login de aluno' }} />
      <Stack.Screen name="cadastro" options={{ title: 'Criar conta' }} />
      <Stack.Screen name="login-admin" options={{ title: 'Login de administrador' }} />
    </Stack>
  );
}
