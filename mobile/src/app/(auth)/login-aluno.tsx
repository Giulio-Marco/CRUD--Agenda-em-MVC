import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { AuthScreen } from '@/components/auth-screen';
import { LoginForm } from '@/components/login-form';
import { colors, spacing } from '@/theme';

export default function LoginAlunoScreen() {
  const { loginAluno } = useAuth();

  return (
    <AuthScreen title="Entrar como aluno" subtitle="Use o e-mail e a senha da sua conta.">
      <LoginForm
        submitLabel="Entrar"
        onSubmit={loginAluno}
        footer={
          <Text style={styles.footer}>
            Ainda não tem conta?{' '}
            <Link href="/cadastro" style={styles.link}>
              Criar conta
            </Link>
          </Text>
        }
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  footer: {
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
});
