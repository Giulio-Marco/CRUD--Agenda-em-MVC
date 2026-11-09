import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { colors } from '@/theme';

// Mantem o splash ate o SecureStore dizer se ha sessao salva.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) void SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) return null;

  // So o grupo liberado fica no navegador. Quando o guard muda (login, logout, 401),
  // o router sai da tela bloqueada e abre o primeiro grupo liberado.
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={user?.role === 'ALUNO'}>
        <Stack.Screen name="aluno" />
      </Stack.Protected>
      <Stack.Protected guard={user?.role === 'ADMIN'}>
        <Stack.Screen name="admin" />
      </Stack.Protected>
    </Stack>
  );
}
