import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { cores, fonte, radius, spacing } from '@/styles/theme';
import { formatarHoras, plural } from '@/utils/formato';

type CursoDoCard = {
  titulo: string;
  descricao: string | null;
  nivel: string;
  totalHoras: string | number;
  totalAulas: number;
};

type Props = {
  curso: CursoDoCard;
  // Linha acima do titulo: categoria no catalogo, "Curso 1 de 3" na trilha.
  rotulo?: string | null;
  // Selo ao lado do rotulo, ex.: "Matriculado".
  selo?: string;
  // Curso concluido pelo aluno: mostra "Concluido" no lugar do selo.
  concluido?: boolean;
  onPress: () => void;
  // Rodape opcional (barra de progresso em Meus cursos).
  children?: ReactNode;
};

export function CursoCard({ curso, rotulo, selo, concluido, onPress, children }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={concluido ? `${curso.titulo}, concluído` : curso.titulo}
      accessibilityHint="Abre os detalhes do curso">
      {rotulo || selo || concluido ? (
        <View style={styles.topo}>
          {rotulo ? (
            <Text style={styles.rotulo} numberOfLines={1}>
              {rotulo}
            </Text>
          ) : (
            <View />
          )}
          {concluido ? (
            <Chip texto="Concluído" icone="checkmark-circle" tom="sucesso" />
          ) : selo ? (
            <Chip texto={selo} icone="checkmark-circle" tom="sucesso" />
          ) : null}
        </View>
      ) : null}

      <Text style={styles.titulo}>{curso.titulo}</Text>
      {curso.descricao ? (
        <Text style={styles.descricao} numberOfLines={2}>
          {curso.descricao}
        </Text>
      ) : null}

      <View style={styles.meta}>
        <Meta icone="speedometer-outline" texto={curso.nivel} />
        <Meta icone="time-outline" texto={formatarHoras(curso.totalHoras)} />
        <Meta icone="play-circle-outline" texto={plural(curso.totalAulas, 'aula', 'aulas')} />
      </View>

      {children ? <View style={styles.rodape}>{children}</View> : null}
    </TouchableOpacity>
  );
}

function Meta({ icone, texto }: { icone: keyof typeof Ionicons.glyphMap; texto: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icone} size={15} color={cores.muted} />
      <Text style={styles.metaTexto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rotulo: {
    flexShrink: 1,
    color: cores.primary,
    fontSize: fonte.legenda,
    fontWeight: '700',
  },
  titulo: {
    color: cores.ink,
    fontSize: fonte.corpo + 2,
    fontWeight: '700',
    lineHeight: 24,
  },
  descricao: {
    color: cores.muted,
    fontSize: fonte.apoio,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.md,
    rowGap: spacing.xs,
    marginTop: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaTexto: {
    color: cores.muted,
    fontSize: fonte.legenda,
  },
  rodape: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm + 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cores.line,
  },
});
