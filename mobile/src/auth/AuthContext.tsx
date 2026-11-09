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

import { api, setTokenGetter, setUnauthorizedHandler } from '@/api/client';

export type Role = 'ADMIN' | 'ALUNO';

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

export type Credentials = { email: string; password: string };
export type RegisterData = Credentials & { name: string };

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  // true enquanto le o SecureStore na abertura do app.
  isLoading: boolean;
  loginAluno: (credentials: Credentials) => Promise<void>;
  loginAdmin: (credentials: Credentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
};

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const AuthContext = createContext<AuthContextValue | null>(null);

function isRole(value: unknown): value is Role {
  return value === 'ADMIN' || value === 'ALUNO';
}

// Usuario salvo por uma versao antiga, sem role, conta como deslogado.
function parseStoredUser(raw: string | null): AuthUser | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<AuthUser>;
    if (typeof value.id !== 'number' || typeof value.email !== 'string' || !isRole(value.role)) {
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
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  const applySession = useCallback((nextToken: string | null, nextUser: AuthUser | null) => {
    tokenRef.current = nextToken;
    setToken(nextToken);
    setUser(nextUser);
  }, []);

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
          if (active) applySession(storedToken, parsedUser);
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
    async (response: AuthResponse) => {
      if (!response?.access_token || !isRole(response.user?.role)) {
        throw new Error('A API respondeu sem o papel do usuário. Atualize o backend.');
      }
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, response.access_token),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user)),
      ]);
      applySession(response.access_token, response.user);
    },
    [applySession],
  );

  const loginAluno = useCallback(
    async (credentials: Credentials) => {
      await saveSession(await api.post<AuthResponse>('/auth/login', credentials));
    },
    [saveSession],
  );

  const loginAdmin = useCallback(
    async (credentials: Credentials) => {
      await saveSession(await api.post<AuthResponse>('/auth/admin/login', credentials));
    },
    [saveSession],
  );

  const register = useCallback(
    async (data: RegisterData) => {
      await saveSession(await api.post<AuthResponse>('/auth/register', data));
    },
    [saveSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isLoading, loginAluno, loginAdmin, register, logout }),
    [user, token, isLoading, loginAluno, loginAdmin, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider.');
  return context;
}
