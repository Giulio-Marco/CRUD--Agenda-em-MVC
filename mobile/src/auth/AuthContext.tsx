import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { api, ApiError, setTokenGetter, setUnauthorizedHandler } from '@/api/client';

// O app mobile e so para ALUNO. O admin usa o frontend web e o Swagger.
export type Role = 'ALUNO';

export type AuthUser = {
  id: number;
  email: string;
  name: string | null;
  role: Role;
};

type AuthResponse = {
  access_token: string;
  user: AuthUser;
};

// Como a sessao comecou: o app de notificacoes age diferente em cada caso.
export type OrigemSessao = 'cadastro' | 'login' | 'armazenada';

export type Credentials = { email: string; password: string };
export type RegisterData = Credentials & { name: string };

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  origemSessao: OrigemSessao | null;
  // true enquanto le o SecureStore na abertura do app.
  isLoading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
};

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const ALUNO_ONLY_MESSAGE = 'Este app é só para alunos. Administradores usam o site.';

const AuthContext = createContext<AuthContextValue | null>(null);

function isAluno(value: unknown): value is Role {
  return value === 'ALUNO';
}

// Usuario salvo sem role ou com role ADMIN (versao antiga do app) conta como deslogado.
function parseStoredUser(raw: string | null): AuthUser | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<AuthUser>;
    if (typeof value.id !== 'number' || typeof value.email !== 'string' || !isAluno(value.role)) {
      return null;
    }
    return { id: value.id, email: value.email, name: value.name ?? null, role: value.role };
  } catch {
    return null;
  }
}

async function clearStorage() {
  await Promise.all([SecureStore.deleteItemAsync(TOKEN_KEY), SecureStore.deleteItemAsync(USER_KEY)]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [origemSessao, setOrigemSessao] = useState<OrigemSessao | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  const applySession = useCallback(
    (nextToken: string | null, nextUser: AuthUser | null, origem: OrigemSessao | null = null) => {
      tokenRef.current = nextToken;
      setToken(nextToken);
      setOrigemSessao(origem);
      setUser(nextUser);
    },
    [],
  );

  const logout = useCallback(async () => {
    applySession(null, null);
    await clearStorage();
  }, [applySession]);

  useEffect(() => {
    setTokenGetter(() => tokenRef.current);
    setUnauthorizedHandler(() => {
      void logout();
    });
  }, [logout]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        const parsedUser = parseStoredUser(storedUser);
        if (storedToken && parsedUser) {
          if (active) applySession(storedToken, parsedUser, 'armazenada');
        } else if (storedToken || storedUser) {
          await clearStorage();
        }
      } catch {
        await clearStorage().catch(() => {});
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [applySession]);

  const saveSession = useCallback(
    async (response: AuthResponse, origem: OrigemSessao) => {
      if (!response?.access_token || !response.user) {
        throw new Error('A API respondeu sem os dados da sessão.');
      }
      if (!isAluno(response.user.role)) {
        throw new Error(ALUNO_ONLY_MESSAGE);
      }
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, response.access_token),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user)),
      ]);
      applySession(response.access_token, response.user, origem);
    },
    [applySession],
  );

  const login = useCallback(
    async (credentials: Credentials) => {
      let response: AuthResponse;
      try {
        response = await api.post<AuthResponse>('/auth/login', credentials);
      } catch (err) {
        // 403 em /auth/login: a conta e de administrador ("Use o login de administrador").
        if (err instanceof ApiError && err.status === 403) {
          throw new ApiError(ALUNO_ONLY_MESSAGE, 403);
        }
        throw err;
      }
      await saveSession(response, 'login');
    },
    [saveSession],
  );

  const register = useCallback(
    async (data: RegisterData) => {
      await saveSession(await api.post<AuthResponse>('/auth/register', data), 'cadastro');
    },
    [saveSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, origemSessao, isLoading, login, register, logout }),
    [user, token, origemSessao, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider.');
  return context;
}
