import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { listarTrilhas } from '@/api/plataforma';
import type { TrilhaResumo } from '@/api/tipos';
import { AvisoErro, EstadoCarregando, EstadoErro, EstadoVazio } from '@/components/Estados';
import { useApiData } from '@/hooks/useApiData';
import { cores, fonte, radius, spacing } from '@/styles/theme';
import { plural } from '@/utils/formato';

// Aba Trilhas: GET /trilhas. Tocar abre DetalheTrilha com os cursos em ordem.
export function TrilhasScreen() {
  const navigation = useNavigation();
  const { data, error, refreshing, recarregar, atualizar } = useApiData(listarTrilhas);

  if (data === null) {
    return error ? (
      <EstadoErro mensagem={error} onTentarDeNovo={recarregar} />
    ) : (
      <EstadoCarregando texto="Carregando trilhas…" />
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={data}
      keyExtractor={(trilha) => String(trilha.idTrilha)}
      renderItem={({ item }) => (
        <TrilhaItem trilha={item} onPress={() => navigation.navigate('DetalheTrilha', { id: item.idTrilha })} />
      )}
      ItemSeparatorComponent={Separador}
      ListHeaderComponent={
        <>
          {error ? <AvisoErro mensagem={error} onTentarDeNovo={recarregar} /> : null}
          {data.length > 0 ? (
            <Text style={styles.intro}>Sequências de cursos para seguir do começo ao fim.</Text>
          ) : null}
        </>
      }
      ListEmptyComponent={
        <EstadoVazio
          icone="map-outline"
          titulo="Nenhuma trilha disponível"
          texto="Trilhas organizam cursos em uma ordem recomendada. Puxe a lista para baixo para ver se há novidades."
        />
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={atualizar} tintColor={cores.primary} colors={[cores.primary]} />
      }
      contentContainerStyle={styles.lista}
    />
  );
}

function TrilhaItem({ trilha, onPress }: { trilha: TrilhaResumo; onPress: () => void }) {
  const quantidade = trilha._count?.trilhasCursos ?? 0;
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${trilha.titulo}, ${plural(quantidade, 'curso', 'cursos')}`}
      accessibilityHint="Abre a trilha com os cursos em ordem">
      <View style={styles.cardTexto}>
        <Text style={styles.categoria}>{trilha.categoria?.nome}</Text>
        <Text style={styles.titulo}>{trilha.titulo}</Text>
        {trilha.descricao ? (
          <Text style={styles.descricao} numberOfLines={3}>
            {trilha.descricao}
          </Text>
        ) : null}
        <View style={styles.meta}>
          <Ionicons name="layers-outline" size={15} color={cores.muted} />
          <Text style={styles.metaTexto}>{plural(quantidade, 'curso', 'cursos')}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={cores.muted} />
    </TouchableOpacity>
  );
}

function Separador() {
  return <View style={styles.separador} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.background,
  },
  lista: {
    flexGrow: 1,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  intro: {
    color: cores.muted,
    fontSize: fonte.apoio,
    marginBottom: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  cardTexto: {
    flex: 1,
    gap: spacing.xs + 2,
  },
  categoria: {
    color: cores.primary,
    fontSize: fonte.legenda,
    fontWeight: '700',
  },
  titulo: {
    color: cores.ink,
    fontSize: fonte.corpo + 2,
    fontWeight: '700',
  },
  descricao: {
    color: cores.muted,
    fontSize: fonte.apoio,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metaTexto: {
    color: cores.muted,
    fontSize: fonte.legenda,
  },
  separador: {
    height: spacing.sm + 4,
  },
});
