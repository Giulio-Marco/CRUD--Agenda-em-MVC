import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import type { AppStackParamList } from '@/navigation/AppRoutes';
import { cores, radius, spacing } from '@/styles/theme';

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

          <TouchableOpacity
            style={[styles.button, enviando && styles.buttonDisabled]}
            onPress={handleEntrar}
            disabled={enviando}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ disabled: enviando, busy: enviando }}>
            {enviando ? (
              <ActivityIndicator color={cores.surface} />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Cadastro')}
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
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: cores.ink,
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: cores.muted,
    fontSize: 16,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    color: cores.ink,
    fontSize: 14,
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
    fontSize: 16,
  },
  error: {
    color: cores.danger,
    backgroundColor: cores.dangerBackground,
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
    fontSize: 14,
  },
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: cores.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: cores.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  footer: {
    color: cores.muted,
    fontSize: 15,
    textAlign: 'center',
  },
  link: {
    color: cores.primary,
    fontWeight: '600',
  },
});
