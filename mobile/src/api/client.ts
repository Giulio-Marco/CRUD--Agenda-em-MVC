import { fetch } from 'expo/fetch';

import { API_URL } from './config';

const TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(
    message: string,
    // 0 quando a API nao respondeu (rede, timeout).
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type TokenGetter = () => string | null;
type UnauthorizedHandler = () => void;

let getToken: TokenGetter = () => null;
let onUnauthorized: UnauthorizedHandler = () => {};

// O AuthContext registra aqui como ler o token e o que fazer no 401.
export function setTokenGetter(getter: TokenGetter) {
  getToken = getter;
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorized = handler;
}

// O Nest responde { statusCode, message, error }. Em 400 do ValidationPipe, message e uma lista.
function messageFromBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const message = (body as { message?: unknown }).message;
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message)) {
    const parts = message.filter((item): item is string => typeof item === 'string');
    if (parts.length) return parts.join('\n');
  }
  return null;
}

function fallbackMessage(status: number): string {
  if (status === 403) return 'Você não tem permissão para esta ação.';
  if (status === 404) return 'Registro não encontrado.';
  if (status === 409) return 'Este registro já existe.';
  if (status >= 500) return 'A API teve um erro interno. Tente de novo em instantes.';
  return `A API respondeu com erro ${status}.`;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Awaited<ReturnType<typeof fetch>>;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(`Não foi possível conectar à API em ${API_URL}`, 0);
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (response.ok) return data as T;

  const status = response.status;
  const apiMessage = messageFromBody(data);

  // 401 com token salvo: sessao vencida ou invalida. Sem token (tela de login): credenciais erradas.
  if (status === 401) {
    if (token) {
      onUnauthorized();
      throw new ApiError('Sua sessão expirou. Entre de novo.', status);
    }
    throw new ApiError(apiMessage ?? 'E-mail ou senha incorretos.', status);
  }

  throw new ApiError(apiMessage ?? fallbackMessage(status), status);
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Algo deu errado. Tente de novo.';
}
