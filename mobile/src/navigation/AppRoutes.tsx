import type { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useAuth } from '@/auth/AuthContext';
import { TabRoutes, type TabParamList } from '@/navigation/TabRoutes';
import { CadastroScreen } from '@/screens/CadastroScreen';
import { DetalheAulaScreen } from '@/screens/DetalheAulaScreen';
import { DetalheCursoScreen } from '@/screens/DetalheCursoScreen';
import { DetalheTrilhaScreen } from '@/screens/DetalheTrilhaScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { PagamentoScreen } from '@/screens/PagamentoScreen';
import { cores } from '@/styles/theme';

// Parametros de cada tela da pilha (lidos com route.params).
export type AppStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Principal: NavigatorScreenParams<TabParamList> | undefined;
  DetalheTrilha: { id: number };
  DetalheCurso: { id: number };
  // Nao existe GET /aulas/:id: a aula e lida dentro de GET /cursos/:cursoId.
  DetalheAula: { id: number; cursoId: number };
  Pagamento: { cursoId: number; cursoTitulo: string };
};

// Deixa useNavigation() tipado em qualquer tela sem passar o tipo toda vez.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends AppStackParamList {}
  }
}

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppRoutes() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) void SplashScreen.hideAsync();
  }, [isLoading]);

  // Enquanto le o SecureStore, o splash continua na tela.
  if (isLoading) return null;

  // Telas condicionais: o tutorial usa navigation.replace('Principal') depois do login e
  // navigation.reset(...) no logout. Aqui a pilha depende do `user` do AuthContext:
  // ao entrar, sair ou receber 401, o React Navigation troca o grupo de telas sozinho e
  // o botao voltar nao leva de volta ao Login. Isso substitui o replace e o reset.
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: cores.primary,
        headerTitleStyle: { color: cores.ink },
        headerStyle: { backgroundColor: cores.background },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: cores.background },
      }}>
      {user ? (
        <>
          <Stack.Screen name="Principal" component={TabRoutes} options={{ headerShown: false }} />
          <Stack.Screen name="DetalheTrilha" component={DetalheTrilhaScreen} options={{ title: 'Trilha' }} />
          <Stack.Screen name="DetalheCurso" component={DetalheCursoScreen} options={{ title: 'Curso' }} />
          <Stack.Screen name="DetalheAula" component={DetalheAulaScreen} options={{ title: 'Aula' }} />
          <Stack.Screen name="Pagamento" component={PagamentoScreen} options={{ title: 'Pagamento' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: 'Criar conta' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
