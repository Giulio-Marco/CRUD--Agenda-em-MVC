import { useState } from 'react';

import { errorMessage } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { AuthScreen } from '@/components/auth-screen';
import { FormError } from '@/components/form-error';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';

const MIN_PASSWORD = 6;

export default function CadastroScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return 'Informe seu nome.';
    if (!email.trim().includes('@')) return 'Informe um e-mail válido.';
    if (password.length < MIN_PASSWORD) return `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`;
    return null;
  }

  async function handleSubmit() {
    if (submitting) return;
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  function clearErrorAnd(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setError(null);
    };
  }

  return (
    <AuthScreen title="Criar conta de aluno" subtitle="Preencha os dados para começar a estudar.">
      <TextField
        label="Nome"
        value={name}
        onChangeText={clearErrorAnd(setName)}
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
      />
      <TextField
        label="E-mail"
        value={email}
        onChangeText={clearErrorAnd(setEmail)}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <TextField
        label="Senha"
        placeholder={`Mínimo de ${MIN_PASSWORD} caracteres`}
        value={password}
        onChangeText={clearErrorAnd(setPassword)}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
      <FormError message={error} />
      <PrimaryButton title="Criar conta" loading={submitting} onPress={handleSubmit} />
    </AuthScreen>
  );
}
