import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { buscarCurso, listarAssinaturas, listarProgresso, matricular } from '@/api/plataforma';
import type { Aula, Modulo } from '@/api/tipos';
import { BarraProgresso } from '@/components/BarraProgresso';
import { Botao } from '@/components/Botao';
import { Chip } from '@/components/Chip';
import { AvisoErro, EstadoCarregando, EstadoErro, EstadoVazio } from '@/components/Estados';
import { useApiData } from '@/hooks/useApiData';
import type { AppStackParamList } from '@/navigation/AppRoutes';
import { cores, fonte, radius, spacing } from '@/styles/theme';
import {
  assinaturaAtiva,
  aulasConcluidas,
  formatarData,
  formatarHoras,
  formatarMinutos,
  nomeTipoAula,
  plural,
} from '@/utils/formato';

type Props = NativeStackScreenProps<AppStackParamList, 'DetalheCurso'>;

type Secao = { modulo: Modulo; data: Aula[] };

// GET /cursos/:id com modulos e aulas. GET /progresso marca as aulas ja concluidas.
export function DetalheCursoScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const { data, error, refreshing, recarregar, atualizar } = useApiData(async () => {
    const [curso, progresso] = await Promise.all([buscarCurso(id), listarProgresso()]);
    return { curso, concluidas: aulasConcluidas(progresso) };
  });
  const [matriculando, setMatriculando] = useState(false);
  const [erroMatricula, setErroMatricula] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  if (data === null) {
    return error ? (
      <EstadoErro mensagem={error} onTentarDeNovo={recarregar} />
    ) : (
      <EstadoCarregando texto="Carregando curso…" />
    );
  }

  const { curso, concluidas } = data;
  const secoes: Secao[] = curso.modulos.map((modulo) => ({ modulo, data: modulo.aulas }));
  const aulas = curso.modulos.flatMap((modulo) => modulo.aulas);
  const feitas = aulas.filter((aula) => concluidas.has(aula.idAula)).length;

  // Com assinatura ativa a matricula e direta; sem ela, o aluno passa pelo Pagamento.
  async function handleMatricular() {
    if (matriculando) return;
    setErroMatricula(null);
    setMatriculando(true);
    try {
      const ativa = assinaturaAtiva(await listarAssinaturas());
      if (ativa) {
        await matricular(id);
        setAviso(`Matrícula feita com sua assinatura ${ativa.plano.nome}, válida até ${formatarData(ativa.dataFim)}.`);
        await recarregar();
      } else {
        navigation.navigate('Pagamento', { cursoId: id, cursoTitulo: curso.titulo });
      }
    } catch (err) {
      setErroMatricula(errorMessage(err));
    } finally {
      setMatriculando(false);
    }
  }

  const cabecalho = (
    <View style={styles.cabecalho}>
      {error ? <AvisoErro mensagem={error} onTentarDeNovo={recarregar} /> : null}
      {curso.categoria ? <Text style={styles.categoria}>{curso.categoria}</Text> : null}
      <Text style={styles.titulo}>{curso.titulo}</Text>
      {curso.descricao ? <Text style={styles.descricao}>{curso.descricao}</Text> : null}

      <View style={styles.chips}>
        <Chip icone="speedometer-outline" texto={curso.nivel} tom="primario" />
        <Chip icone="time-outline" texto={formatarHoras(curso.totalHoras)} tom="primario" />
        <Chip icone="play-circle-outline" texto={plural(aulas.length, 'aula', 'aulas')} tom="primario" />
      </View>

      {curso.instrutor ? (
        <View style={styles.instrutor}>
          <Ionicons name="person-circle-outline" size={20} color={cores.muted} />
          <Text style={styles.instrutorTexto}>Instrutor: {curso.instrutor.nome}</Text>
        </View>
      ) : null}

      {curso.matriculado ? (
        <View style={styles.progresso}>
          <Chip icone="checkmark-circle" texto="Você está matriculado" tom="sucesso" />
          {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}
          <BarraProgresso concluidas={feitas} total={aulas.length} />
        </View>
      ) : null}

      {secoes.length > 0 ? <Text style={styles.secao}>Conteúdo do curso</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={secoes}
        keyExtractor={(aula) => String(aula.idAula)}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.modulo}>
            <Text style={styles.moduloOrdem}>Módulo {section.modulo.ordem}</Text>
            <Text style={styles.moduloTitulo}>{section.modulo.titulo}</Text>
          </View>
        )}
        renderItem={({ item, index, section }) => {
          const concluida = concluidas.has(item.idAula);
          const primeira = index === 0;
          const ultima = index === section.data.length - 1;
          return (
            <TouchableOpacity
              style={[styles.aula, primeira && styles.aulaPrimeira, ultima && styles.aulaUltima]}
              onPress={() => navigation.navigate('DetalheAula', { id: item.idAula, cursoId: curso.idCurso })}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${item.titulo}, ${nomeTipoAula(item.tipoConteudo)}, ${formatarMinutos(item.duracaoMinutos)}${concluida ? ', concluída' : ''}`}
              accessibilityHint="Abre a aula">
              <Ionicons
                name={concluida ? 'checkmark-circle' : iconeDaAula(item.tipoConteudo)}
                size={22}
                color={concluida ? cores.success : cores.primary}
              />
              <View style={styles.aulaTexto}>
                <Text style={styles.aulaTitulo}>{item.titulo}</Text>
                <Text style={styles.aulaMeta}>
                  {nomeTipoAula(item.tipoConteudo)}, {formatarMinutos(item.duracaoMinutos)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={cores.muted} />
            </TouchableOpacity>
          );
        }}
        ListHeaderComponent={cabecalho}
        ListEmptyComponent={
          <EstadoVazio
            icone="albums-outline"
            titulo="Conteúdo em preparação"
            texto="Este curso ainda não tem módulos publicados. Puxe para atualizar mais tarde."
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={atualizar} tintColor={cores.primary} colors={[cores.primary]} />
        }
        contentContainerStyle={styles.lista}
      />

      {!curso.matriculado ? (
        <View style={[styles.rodape, { paddingBottom: insets.bottom + spacing.sm }]}>
          {erroMatricula ? (
            <Text style={styles.erro} accessibilityRole="alert">
              {erroMatricula}
            </Text>
          ) : null}
          <Botao
            titulo="Matricular"
            icone="school-outline"
            onPress={handleMatricular}
            carregando={matriculando}
            accessibilityHint="Matricula você neste curso. Sem assinatura ativa, abre o pagamento."
          />
        </View>
      ) : null}
    </View>
  );
}

function iconeDaAula(tipo: string): keyof typeof Ionicons.glyphMap {
  const nome = nomeTipoAula(tipo);
  if (nome === 'Vídeo') return 'play-circle-outline';
  if (nome === 'Exercício') return 'create-outline';
  return 'document-text-outline';
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
  },
  categoria: {
    color: cores.primary,
    fontSize: fonte.legenda,
    fontWeight: '700',
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  instrutor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  instrutorTexto: {
    color: cores.muted,
    fontSize: fonte.apoio,
  },
  progresso: {
    gap: spacing.sm + 4,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: cores.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: cores.line,
  },
  aviso: {
    color: cores.success,
    fontSize: fonte.apoio,
    lineHeight: 20,
  },
  secao: {
    color: cores.ink,
    fontSize: fonte.subtitulo,
    fontWeight: '700',
    marginTop: spacing.lg,
  },
  modulo: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: 2,
  },
  moduloOrdem: {
    color: cores.muted,
    fontSize: fonte.legenda,
    fontWeight: '600',
  },
  moduloTitulo: {
    color: cores.ink,
    fontSize: fonte.corpo + 1,
    fontWeight: '700',
  },
  aula: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    minHeight: 56,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    backgroundColor: cores.surface,
    borderColor: cores.line,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  aulaPrimeira: {
    borderTopWidth: 1,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  aulaUltima: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  aulaTexto: {
    flex: 1,
    gap: 2,
  },
  aulaTitulo: {
    color: cores.ink,
    fontSize: fonte.corpo - 1,
    fontWeight: '500',
  },
  aulaMeta: {
    color: cores.muted,
    fontSize: fonte.legenda,
  },
  rodape: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + 4,
    backgroundColor: cores.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cores.line,
  },
  erro: {
    color: cores.danger,
    backgroundColor: cores.dangerBackground,
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
    fontSize: fonte.apoio,
  },
});
