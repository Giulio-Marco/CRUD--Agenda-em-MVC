import { useNavigation } from '@react-navigation/native';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { listarMeusCursos, listarProgresso } from '@/api/plataforma';
import { BarraProgresso } from '@/components/BarraProgresso';
import { CursoCard } from '@/components/CursoCard';
import { AvisoErro, EstadoCarregando, EstadoErro, EstadoVazio } from '@/components/Estados';
import { useApiData } from '@/hooks/useApiData';
import { cores, fonte, spacing } from '@/styles/theme';
import { concluidasPorCurso, plural } from '@/utils/formato';

async function carregarMeusCursos() {
  const [matriculas, progresso] = await Promise.all([listarMeusCursos(), listarProgresso()]);
  return { matriculas, concluidas: concluidasPorCurso(progresso) };
}

// Aba Meus cursos: GET /cursos/matriculados com o progresso de cada curso (GET /progresso).
export function MeusCursosScreen() {
  const navigation = useNavigation();
  const { data, error, refreshing, recarregar, atualizar } = useApiData(carregarMeusCursos);

  if (data === null) {
    return error ? (
      <EstadoErro mensagem={error} onTentarDeNovo={recarregar} />
    ) : (
      <EstadoCarregando texto="Carregando seus cursos…" />
    );
  }

  const { matriculas, concluidas } = data;

  return (
    <FlatList
      style={styles.container}
      data={matriculas}
      keyExtractor={(matricula) => String(matricula.idMatricula)}
      renderItem={({ item }) => (
        <CursoCard
          curso={item.curso}
          rotulo={item.curso.categoria}
          onPress={() => navigation.navigate('DetalheCurso', { id: item.curso.idCurso })}>
          <BarraProgresso concluidas={concluidas.get(item.curso.idCurso) ?? 0} total={item.curso.totalAulas} />
        </CursoCard>
      )}
      ItemSeparatorComponent={Separador}
      ListHeaderComponent={
        <>
          {error ? <AvisoErro mensagem={error} onTentarDeNovo={recarregar} /> : null}
          {matriculas.length > 0 ? (
            <Text style={styles.contagem}>{plural(matriculas.length, 'curso em andamento', 'cursos em andamento')}</Text>
          ) : null}
        </>
      }
      ListEmptyComponent={
        <EstadoVazio
          icone="book-outline"
          titulo="Você ainda não tem cursos"
          texto="Escolha um curso no catálogo e toque em Matricular. Ele aparece aqui com o seu progresso."
          acao={{ titulo: 'Ver catálogo', onPress: () => navigation.navigate('Principal', { screen: 'Inicio' }) }}
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
