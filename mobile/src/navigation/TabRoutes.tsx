import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { InicioScreen } from '@/screens/InicioScreen';
import { MeusCursosScreen } from '@/screens/MeusCursosScreen';
import { PerfilScreen } from '@/screens/PerfilScreen';
import { TrilhasScreen } from '@/screens/TrilhasScreen';
import { cores } from '@/styles/theme';

export type TabParamList = {
  Inicio: undefined;
  Trilhas: undefined;
  MeusCursos: undefined;
  Perfil: undefined;
};

type IconeIonicons = keyof typeof Ionicons.glyphMap;

// Icone cheio quando a aba esta focada e versao "-outline" quando nao esta.
const icones: Record<keyof TabParamList, { cheio: IconeIonicons; contorno: IconeIonicons }> = {
  Inicio: { cheio: 'home', contorno: 'home-outline' },
  Trilhas: { cheio: 'map', contorno: 'map-outline' },
  MeusCursos: { cheio: 'book', contorno: 'book-outline' },
  Perfil: { cheio: 'person', contorno: 'person-outline' },
};

const Tab = createBottomTabNavigator<TabParamList>();

export function TabRoutes() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icone = icones[route.name];
          return <Ionicons name={focused ? icone.cheio : icone.contorno} size={size} color={color} />;
        },
        tabBarActiveTintColor: cores.primary,
        tabBarInactiveTintColor: cores.muted,
        headerTitleStyle: { color: cores.ink },
        headerStyle: { backgroundColor: cores.background },
        headerShadowVisible: false,
      })}>
      <Tab.Screen name="Inicio" component={InicioScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Trilhas" component={TrilhasScreen} options={{ title: 'Trilhas' }} />
      <Tab.Screen name="MeusCursos" component={MeusCursosScreen} options={{ title: 'Meus cursos' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
