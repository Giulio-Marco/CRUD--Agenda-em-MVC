import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { cores, fonte, radius, spacing } from '@/styles/theme';

// Estados de uma tela que carrega dados: carregando, erro, vazio e aviso de falha ao atualizar.

export function EstadoCarregando({ texto = 'Carregando…' }: { texto?: string }) {
  return (
    <View style={styles.centro} accessibilityRole="progressbar" accessibilityLabel={texto}>
      <ActivityIndicator size="large" color={cores.primary} />
      <Text style={styles.textoApoio}>{texto}</Text>
    </View>
  );
}

export function EstadoErro({ mensagem, onTentarDeNovo }: { mensagem: string; onTentarDeNovo: () => void }) {
  return (
    <View style={styles.centro}>
      <Ionicons name="cloud-offline-outline" size={40} color={cores.muted} />
      <Text style={styles.titulo}>Não foi possível carregar</Text>
      <Text style={styles.textoApoio} accessibilityRole="alert">
        {mensagem}
      </Text>
      <Botao titulo="Tentar de novo" icone="refresh" onPress={onTentarDeNovo} style={styles.acao} />
    </View>
  );
}

type EstadoVazioProps = {
  titulo: string;
  texto: string;
  icone?: keyof typeof Ionicons.glyphMap;
  acao?: { titulo: string; onPress: () => void };
};

// Usado como ListEmptyComponent: ocupa o espaco da lista e diz o que fazer a seguir.
export function EstadoVazio({ titulo, texto, icone = 'file-tray-outline', acao }: EstadoVazioProps) {
  return (
    <View style={styles.vazio}>
      <Ionicons name={icone} size={40} color={cores.muted} />
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.textoApoio}>{texto}</Text>
      {acao ? <Botao titulo={acao.titulo} variante="secundario" onPress={acao.onPress} style={styles.acao} /> : null}
    </View>
  );
}

// Falha ao atualizar dados que ja estao na tela: os dados continuam visiveis.
export function AvisoErro({ mensagem, onTentarDeNovo }: { mensagem: string; onTentarDeNovo: () => void }) {
  return (
    <View style={styles.aviso} accessibilityRole="alert">
      <Text style={styles.avisoTexto}>Não foi possível atualizar. {mensagem}</Text>
      <TouchableOpacity
        onPress={onTentarDeNovo}
        accessibilityRole="button"
        hitSlop={8}
        activeOpacity={0.7}>
        <Text style={styles.avisoAcao}>Tentar de novo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: cores.background,
  },
  vazio: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  titulo: {
    color: cores.ink,
    fontSize: fonte.subtitulo - 2,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  textoApoio: {
    color: cores.muted,
    fontSize: fonte.apoio + 1,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 320,
  },
  acao: {
    marginTop: spacing.sm,
    alignSelf: 'center',
    minWidth: 180,
  },
  aviso: {
    backgroundColor: cores.dangerBackground,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  avisoTexto: {
    color: cores.danger,
    fontSize: fonte.apoio,
    lineHeight: 20,
  },
  avisoAcao: {
    color: cores.danger,
    fontSize: fonte.apoio,
    fontWeight: '700',
  },
});
