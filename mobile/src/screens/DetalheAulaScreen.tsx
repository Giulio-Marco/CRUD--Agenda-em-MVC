import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { buscarCurso, concluirAula, listarProgresso } from '@/api/plataforma';
import { Botao } from '@/components/Botao';
import { Chip } from '@/components/Chip';
import { AvisoErro, EstadoCarregando, EstadoErro } from '@/components/Estados';
import { useApiData } from '@/hooks/useApiData';
import { useNotificacoes } from '@/notificacoes/NotificacoesContext';
import type { AppStackParamList } from '@/navigation/AppRoutes';
import { cores, fonte, radius, spacing } from '@/styles/theme';
import { aulasConcluidas, formatarMinutos, nomeTipoAula } from '@/utils/formato';

type Props = NativeStackScreenProps<AppStackParamList, 'DetalheAula'>;

function dominio(url: string): string | null {
  const match = /^https?:\/\/([^/?#]+)/i.exec(url.trim());
  return match ? match[1].replace(/^www\./, '') : null;
}

// A API nao tem GET /aulas/:id: a aula vem de GET /cursos/:cursoId, que tambem diz se o aluno
// esta matriculado. GET /progresso diz se a aula ja foi concluida.
export function DetalheAulaScreen({ navigation, route }: Props) {
  const { id, cursoId } = route.params;
  const { data, error, refreshing, recarregar, atualizar, setData } = useApiData(async () => {
    const [curso, progresso] = await Promise.all([buscarCurso(cursoId), listarProgresso()]);
    const modulo = curso.modulos.find((item) => item.aulas.some((aula) => aula.idAula === id));
    const aula = modulo?.aulas.find((item) => item.idAula === id);
    if (!modulo || !aula) throw new Error('Esta aula não existe mais neste curso.');
    return { curso, modulo, aula, concluida: aulasConcluidas(progresso).has(id) };
  });
  const { aguardarCursoConcluido } = useNotificacoes();
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  // A ultima aula que faltava foi concluida agora: o curso todo esta concluido.
  const [terminouCurso, setTerminouCurso] = useState(false);

  if (data === null) {
    return error ? (
      <EstadoErro mensagem={error} onTentarDeNovo={recarregar} />
    ) : (
      <EstadoCarregando texto="Carregando aula…" />
    );
  }

  const { curso, modulo, aula, concluida } = data;
  const site = dominio(aula.urlConteudo);

  async function handleAbrirConteudo() {
    setErroAcao(null);
    if (!site) {
      setErroAcao('O link desta aula não é um endereço web válido.');
      return;
    }
    try {
      await WebBrowser.openBrowserAsync(aula.urlConteudo.trim());
    } catch (err) {
      setErroAcao(`Não foi possível abrir o conteúdo. ${errorMessage(err)}`);
    }
  }

  async function handleConcluir() {
    if (enviando) return;
    setErroAcao(null);
    setEnviando(true);
    try {
      const resposta = await concluirAula(id);
      setData((atual) => (atual ? { ...atual, concluida: true } : atual));
      if (resposta.cursoConcluido) {
        setTerminouCurso(true);
        // A notificacao "Parabens..." vem do consumidor Kafka; o contexto aguarda e dispara.
        aguardarCursoConcluido(cursoId);
      }
    } catch (err) {
      setErroAcao(errorMessage(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={atualizar} tintColor={cores.primary} colors={[cores.primary]} />
      }>
      {error ? <AvisoErro mensagem={error} onTentarDeNovo={recarregar} /> : null}

      <Text style={styles.origem}>
        {curso.titulo}, módulo {modulo.ordem}: {modulo.titulo}
      </Text>
      <Text style={styles.titulo}>{aula.titulo}</Text>

      <View style={styles.chips}>
        <Chip icone="pricetag-outline" texto={nomeTipoAula(aula.tipoConteudo)} tom="primario" />
        <Chip icone="time-outline" texto={formatarMinutos(aula.duracaoMinutos)} tom="primario" />
        {concluida ? <Chip icone="checkmark-circle" texto="Concluída" tom="sucesso" /> : null}
      </View>

      <View style={styles.bloco}>
        <Text style={styles.blocoTitulo}>Conteúdo</Text>
        <Text style={styles.blocoTexto}>
          {site ? `O material abre no navegador, em ${site}.` : 'Esta aula não tem um link válido.'}
        </Text>
        <Botao
          titulo="Abrir conteúdo"
          icone="open-outline"
          variante="secundario"
          onPress={handleAbrirConteudo}
          desabilitado={!site}
        />
      </View>

      <View style={styles.bloco}>
        <Text style={styles.blocoTitulo}>Seu progresso</Text>
        {!curso.matriculado ? (
          <>
            <Text style={styles.blocoTexto}>Matricule-se no curso para registrar seu progresso nesta aula.</Text>
            <Botao
              titulo="Ver curso"
              variante="secundario"
              onPress={() => navigation.popTo('DetalheCurso', { id: cursoId })}
            />
          </>
        ) : concluida ? (
          <View style={styles.concluida}>
            <Ionicons name="checkmark-circle" size={24} color={cores.success} />
            <Text style={styles.concluidaTexto}>
              {terminouCurso
                ? 'Aula concluída. Você concluiu todas as aulas deste curso!'
                : 'Aula concluída. Ela já conta no progresso do curso.'}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.blocoTexto}>Terminou o material? Marque a aula para avançar no curso.</Text>
            <Botao
              titulo="Marcar como concluída"
              icone="checkmark-done"
              onPress={handleConcluir}
              carregando={enviando}
            />
          </>
        )}
      </View>

      {erroAcao ? (
        <Text style={styles.erro} accessibilityRole="alert">
          {erroAcao}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.background,
  },
  conteudo: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm + 4,
  },
  origem: {
    color: cores.primary,
    fontSize: fonte.legenda,
    fontWeight: '700',
  },
  titulo: {
    color: cores.ink,
    fontSize: fonte.titulo - 2,
    fontWeight: '700',
    lineHeight: 32,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bloco: {
    gap: spacing.sm + 4,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: cores.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: cores.line,
  },
  blocoTitulo: {
    color: cores.ink,
    fontSize: fonte.corpo + 1,
    fontWeight: '700',
  },
  blocoTexto: {
    color: cores.muted,
    fontSize: fonte.apoio + 1,
    lineHeight: 21,
  },
  concluida: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 4,
    borderRadius: radius.md,
    backgroundColor: cores.successBackground,
  },
  concluidaTexto: {
    flex: 1,
    color: cores.success,
    fontSize: fonte.apoio + 1,
    fontWeight: '600',
  },
  erro: {
    color: cores.danger,
    backgroundColor: cores.dangerBackground,
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
    fontSize: fonte.apoio,
  },
});
