import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Mostra a notificacao local mesmo com o app aberto.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function concedida(p: Notifications.NotificationPermissionsStatus): boolean {
  return p.granted || p.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

// true se o app pode mostrar notificacoes. Nunca lanca erro.
export async function pedirPermissao(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    if (Platform.OS === 'android') {
      // No Android 13+ o pedido so aparece depois de existir um canal.
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Avisos',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const atual = await Notifications.getPermissionsAsync();
    if (concedida(atual)) return true;
    if (!atual.canAskAgain) return false;
    return concedida(await Notifications.requestPermissionsAsync());
  } catch {
    return false;
  }
}

// Dispara agora (trigger null). Devolve false se falhar.
export async function dispararLocal(titulo: string, mensagem: string): Promise<boolean> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: mensagem },
      trigger: null,
    });
    return true;
  } catch {
    return false;
  }
}
