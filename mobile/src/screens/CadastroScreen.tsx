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
  type TextInputProps,
} from 'react-native';

import { errorMessage } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { cores, radius, spacing } from '@/styles/theme';

const SENHA_MINIMA = 6;

export function CadastroScreen() {
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function validar(): string | null {
    if (!nome.trim()) return 'Informe seu nome.';
    if (!email.trim().includes('@')) return 'Informe um e-mail válido.';
    if (senha.length < SENHA_MINIMA) return `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
    if (senha !== confirmarSenha) return 'As senhas não conferem.';
    return null;
  }

  async function handleCadastrar() {
    if (enviando) return;
    const problema = validar();
    if (problema) {
      setErro(problema);
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      // A confirmacao so existe no app; a API recebe nome, e-mail e senha.
      await register({ name: nome.trim(), email: email.trim(), password: senha });
      // Sucesso: a API ja devolve o token e AppRoutes abre as abas.
    } catch (err) {
      setErro(errorMessage(err));
      setEnviando(false);
    }
  }

  // Limpa o erro quando o usuario volta a digitar.
  function aoDigitar(setter: (valor: string) => void) {
    return (valor: string) => {
      setter(valor);
      setErro(null);
    };
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Criar conta de aluno</Text>
          <Text style={styles.subtitle}>Preencha os dados para começar a estudar.</Text>
        </View>

        <Campo
          label="Nome"
          value={nome}
          onChangeText={aoDigitar(setNome)}
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
        />
        <Campo
          label="E-mail"
          value={email}
          onChangeText={aoDigitar(setEmail)}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <Campo
          label="Senha"
          placeholder={`Mínimo de ${SENHA_MINIMA} caracteres`}
          value={senha}
          onChangeText={aoDigitar(setSenha)}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
        />
        <Campo
          label="Confirmar senha"
          value={confirmarSenha}
          onChangeText={aoDigitar(setConfirmarSenha)}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleCadastrar}
        />

        {erro ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {erro}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, enviando && styles.buttonDisabled]}
          onPress={handleCadastrar}
          disabled={enviando}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ disabled: enviando, busy: enviando }}>
          {enviando ? (
            <ActivityIndicator color={cores.surface} />
          ) : (
            <Text style={styles.buttonText}>Criar conta</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Rotulo + TextInput com o estilo do formulario.
function Campo({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={cores.muted}
        accessibilityLabel={label}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: cores.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  title: {
    color: cores.ink,
    fontSize: 28,
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
});
