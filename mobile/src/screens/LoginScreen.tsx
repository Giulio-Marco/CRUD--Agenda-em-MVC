import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { Botao } from '@/components/Botao';
import type { AppStackParamList } from '@/navigation/AppRoutes';
import { cores, fonte, radius, spacing } from '@/styles/theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleEntrar() {
    if (enviando) return;
    const emailLimpo = email.trim();
    if (!emailLimpo.includes('@')) {
      setErro('Informe um e-mail válido.');
      return;
    }
    if (!senha) {
      setErro('Informe a senha.');
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      await login({ email: emailLimpo, password: senha });
      // Sucesso: AppRoutes troca para as abas sozinho (ver comentario la).
    } catch (err) {
      setErro(errorMessage(err));
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.brand}>Plataforma de Cursos</Text>
            <Text style={styles.title}>Entrar</Text>
            <Text style={styles.subtitle}>Use o e-mail e a senha da sua conta de aluno.</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(texto) => {
                setEmail(texto);
                setErro(null);
              }}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
              accessibilityLabel="E-mail"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={senha}
              onChangeText={(texto) => {
                setSenha(texto);
                setErro(null);
              }}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleEntrar}
              accessibilityLabel="Senha"
            />
          </View>

          {erro ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {erro}
            </Text>
          ) : null}

          <Botao titulo="Entrar" onPress={handleEntrar} carregando={enviando} />

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Cadastro')}
            // Texto de ~36 px de altura: o hitSlop leva a area de toque a 44 px sem mudar o layout.
            hitSlop={{ top: 4, bottom: 4 }}
            accessibilityRole="button">
            <Text style={styles.footer}>
              Ainda não tem conta? <Text style={styles.link}>Criar conta</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: cores.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  brand: {
    color: cores.primary,
    fontSize: fonte.apoio,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: cores.ink,
    fontSize: fonte.titulo,
    fontWeight: '700',
  },
  subtitle: {
    color: cores.muted,
    fontSize: fonte.corpo,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    color: cores.ink,
    fontSize: fonte.apoio,
    fontWeight: '600',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: radius.md,
    backgroundColor: cores.surface,
    paddingHorizontal: spacing.md,
    color: cores.ink,
    fontSize: fonte.corpo,
  },
  error: {
    color: cores.danger,
    backgroundColor: cores.dangerBackground,
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
    fontSize: fonte.apoio,
  },
  linkButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  footer: {
    color: cores.muted,
    fontSize: fonte.apoio,
    textAlign: 'center',
  },
  link: {
    color: cores.primary,
    fontWeight: '600',
  },
});
