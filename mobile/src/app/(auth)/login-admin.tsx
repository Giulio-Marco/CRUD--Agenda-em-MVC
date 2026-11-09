import { useAuth } from '@/auth/AuthContext';
import { AuthScreen } from '@/components/auth-screen';
import { LoginForm } from '@/components/login-form';

// Sem cadastro: contas de administrador nascem pelo seed (npm run seed:admin).
export default function LoginAdminScreen() {
  const { loginAdmin } = useAuth();

  return (
    <AuthScreen
      title="Entrar como administrador"
      subtitle="Acesso restrito a contas de administrador.">
      <LoginForm submitLabel="Entrar" onSubmit={loginAdmin} />
    </AuthScreen>
  );
}
