import { useState, type ReactNode } from 'react';

import { errorMessage } from '@/api/client';
import type { Credentials } from '@/auth/AuthContext';
import { FormError } from '@/components/form-error';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';

type Props = {
  submitLabel: string;
  onSubmit: (credentials: Credentials) => Promise<void>;
  footer?: ReactNode;
};

// Formulario de e-mail e senha usado pelo login de aluno e pelo de administrador.
// Em erro, mantem o que foi digitado e mostra a mensagem da API.
export function LoginForm({ submitLabel, onSubmit, footer }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (submitting) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail.includes('@')) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (!password) {
      setError('Informe a senha.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ email: trimmedEmail, password });
      // Sucesso: o layout raiz troca de grupo e esta tela sai da pilha.
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <>
      <TextField
        label="E-mail"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError(null);
        }}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <TextField
        label="Senha"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError(null);
        }}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
      <FormError message={error} />
      <PrimaryButton title={submitLabel} loading={submitting} onPress={handleSubmit} />
      {footer}
    </>
  );
}
