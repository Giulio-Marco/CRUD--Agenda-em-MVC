import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { buscarTrilha } from '@/api/plataforma';
import { Chip } from '@/components/Chip';
import { CursoCard } from '@/components/CursoCard';
import { AvisoErro, EstadoCarregando, EstadoErro, EstadoVazio } from '@/components/Estados';
import { useApiData } from '@/hooks/useApiData';
import type { AppStackParamList } from '@/navigation/AppRoutes';
import { cores, fonte, spacing } from '@/styles/theme';

type Props = NativeStackScreenProps<AppStackParamList, 'DetalheTrilha'>;

// GET /trilhas/:id: cursos da trilha na ordem definida pelo administrador.
export function DetalheTrilhaScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { data: trilha, error, refreshing, recarregar, atualizar } = useApiData(() => buscarTrilha(id));

  if (trilha === null) {
    return error ? (
      <EstadoErro mensagem={error} onTentarDeNovo={recarregar} />
    ) : (
      <EstadoCarregando texto="Carregando trilha…" />
    );
  }

  const itens = [...trilha.trilhasCursos].sort((a, b) => a.ordem - b.ordem);

  return (
    <FlatList
      style={styles.container}
      data={itens}
      keyExtractor={(item) => String(item.idCurso)}
      renderItem={({ item, index }) => (
        <CursoCard
          curso={item.curso}
          rotulo={`Curso ${index + 1} de ${itens.length}`}
          onPress={() => navigation.navigate('DetalheCurso', { id: item.idCurso })}
        />
      )}
      ItemSeparatorComponent={Separador}
      ListHeaderComponent={
        <View style={styles.cabecalho}>
          {error ? <AvisoErro mensagem={error} onTentarDeNovo={recarregar} /> : null}
          {trilha.categoria ? <Chip texto={trilha.categoria.nome} tom="primario" /> : null}
          <Text style={styles.titulo}>{trilha.titulo}</Text>
          {trilha.descricao ? <Text style={styles.descricao}>{trilha.descricao}</Text> : null}
          {itens.length > 0 ? <Text style={styles.secao}>Cursos na ordem recomendada</Text> : null}
        </View>
      }
      ListEmptyComponent={
        <EstadoVazio
          icone="layers-outline"
          titulo="Esta trilha ainda não tem cursos"
          texto="Os cursos aparecem aqui quando o administrador vincular cursos à trilha. Puxe para atualizar."
        />
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={atualizar} tintColor={cores.primary} colors={[cores.primary]} />
      }
      contentContainerStyle={styles.lista}
    />
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
    paddingBottom: spacing.xl,
  },
  cabecalho: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  titulo: {
    color: cores.ink,
    fontSize: fonte.titulo,
    fontWeight: '700',
    lineHeight: 34,
  },
  descricao: {
    color: cores.muted,
    fontSize: fonte.corpo,
    lineHeight: 23,
  },
  secao: {
    color: cores.ink,
    fontSize: fonte.corpo,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  separador: {
    height: spacing.sm + 4,
  },
});
