import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNotificacoes } from '@/notificacoes/NotificacoesContext';
import { cores, fonte, radius, spacing } from '@/styles/theme';

// Aviso no topo do app quando o celular nao deixa mostrar a notificacao. Nao bloqueia nada.
export function BannerAviso() {
  const { aviso, fecharAviso } = useNotificacoes();
  const insets = useSafeAreaInsets();
  if (!aviso) return null;

  return (
    <View style={[styles.area, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
      <View style={styles.cartao} accessibilityRole="alert">
        <Ionicons name="notifications-outline" size={22} color={cores.primary} />
        <View style={styles.textos}>
          <Text style={styles.titulo}>{aviso.titulo}</Text>
          <Text style={styles.mensagem}>{aviso.mensagem}</Text>
          <Text style={styles.apoio}>
            Notificações do celular desativadas. Ative em Ajustes para receber avisos.
          </Text>
        </View>
        <TouchableOpacity
          onPress={fecharAviso}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Fechar aviso">
          <Ionicons name="close" size={22} color={cores.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
  },
  cartao: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 4,
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  textos: { flex: 1, gap: spacing.xs },
  titulo: { color: cores.ink, fontSize: fonte.corpo, fontWeight: '700' },
  mensagem: { color: cores.ink, fontSize: fonte.apoio, lineHeight: 20 },
  apoio: { color: cores.muted, fontSize: fonte.legenda, lineHeight: 18 },
});
