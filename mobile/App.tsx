import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/auth/AuthContext';
import { AppRoutes } from '@/navigation/AppRoutes';
import { cores } from '@/styles/theme';

// Mantem o splash ate o SecureStore dizer se ha sessao salva (AppRoutes esconde).
void SplashScreen.preventAutoHideAsync();

const tema: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: cores.primary,
    background: cores.background,
    card: cores.surface,
    text: cores.ink,
    border: cores.line,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={tema}>
          <AppRoutes />
        </NavigationContainer>
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
