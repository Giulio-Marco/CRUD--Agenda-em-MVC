import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { listarConcluidasPorCurso } from '@/api/concluidas';
import { listarCursos } from '@/api/plataforma';
import { CampoBusca } from '@/components/CampoBusca';
import { CursoCard } from '@/components/CursoCard';
import { AvisoErro, EstadoCarregando, EstadoErro, EstadoVazio } from '@/components/Estados';
import { useApiData } from '@/hooks/useApiData';
import { cores, fonte, spacing } from '@/styles/theme';
import { cursoConcluido, normalizar, plural } from '@/utils/formato';

async function carregarCatalogo() {
  const [cursos, concluidas] = await Promise.all([listarCursos(), listarConcluidasPorCurso()]);
  return { cursos, concluidas };
}

// Aba Inicio: catalogo de cursos (GET /cursos) com busca por titulo e categoria.
export function InicioScreen() {
  const navigation = useNavigation();
  const { data, error, refreshing, recarregar, atualizar } = useApiData(carregarCatalogo);
  const [busca, setBusca] = useState('');

  const termo = normalizar(busca);
  const cursos = data?.cursos ?? [];
  const concluidas = data?.concluidas;
  const filtrados = termo
    ? cursos.filter(
        (curso) => normalizar(curso.titulo).includes(termo) || normalizar(curso.categoria).includes(termo),
      )
    : cursos;

  return (
    <View style={styles.container}>
      <View style={styles.busca}>
        <CampoBusca
          valor={busca}
          onChange={setBusca}
          placeholder="Buscar por curso ou categoria"
          accessibilityLabel="Buscar cursos por título ou categoria"
        />
      </View>

      {data === null ? (
        error ? (
          <EstadoErro mensagem={error} onTentarDeNovo={recarregar} />
        ) : (
          <EstadoCarregando texto="Carregando cursos…" />
        )
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={(curso) => String(curso.idCurso)}
          renderItem={({ item }) => (
            <CursoCard
              curso={item}
              rotulo={item.categoria}
              selo={item.matriculado ? 'Matriculado' : undefined}
              concluido={cursoConcluido(concluidas?.get(item.idCurso) ?? 0, item.totalAulas)}
              onPress={() => navigation.navigate('DetalheCurso', { id: item.idCurso })}
            />
          )}
          ItemSeparatorComponent={Separador}
          ListHeaderComponent={
            <>
              {error ? <AvisoErro mensagem={error} onTentarDeNovo={recarregar} /> : null}
              {cursos.length > 0 ? (
                <Text style={styles.contagem}>
                  {termo
                    ? `${plural(filtrados.length, 'curso encontrado', 'cursos encontrados')} de ${cursos.length}`
                    : plural(cursos.length, 'curso disponível', 'cursos disponíveis')}
                </Text>
              ) : null}
            </>
          }
          ListEmptyComponent={
            termo ? (
              <EstadoVazio
                icone="search-outline"
                titulo="Nenhum curso encontrado"
                texto={`Nenhum curso tem “${busca.trim()}” no título ou na categoria. Tente outra palavra.`}
                acao={{ titulo: 'Limpar busca', onPress: () => setBusca('') }}
              />
            ) : (
              <EstadoVazio
                icone="library-outline"
                titulo="Nenhum curso publicado ainda"
                texto="Os cursos aparecem aqui assim que o administrador publicar. Puxe a lista para baixo para atualizar."
              />
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={atualizar}
              tintColor={cores.primary}
              colors={[cores.primary]}
            />
          }
          contentContainerStyle={styles.lista}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </View>
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
  busca: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  lista: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  contagem: {
    color: cores.muted,
    fontSize: fonte.legenda,
    marginBottom: spacing.sm,
  },
  separador: {
    height: spacing.sm + 4,
  },
});
