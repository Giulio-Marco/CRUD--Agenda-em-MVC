import Constants from 'expo-constants';

const API_PORT = 3000;

// hostUri vem do Metro, por exemplo "192.168.0.10:8081". O host e o IP do PC
// na rede Wi-Fi, o mesmo PC que roda a API.
function apiUrlFromMetroHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;
  const host = hostUri.split(':')[0];
  return host ? `http://${host}:${API_PORT}` : null;
}

function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  return apiUrlFromMetroHost() ?? `http://localhost:${API_PORT}`;
}

export const API_URL = resolveApiUrl();
