// Mesmas cores das variaveis CSS do frontend web (index.html, :root).
export const cores = {
  ink: '#17212b',
  muted: '#647381',
  line: '#d8e2e8',
  surface: '#ffffff',
  background: '#f3f7f8',
  primary: '#176b78',
  primaryDark: '#104b55',
  // Fundo claro do primary: chips, trilho da barra de progresso, item selecionado.
  primarySoft: '#e2eff1',
  accent: '#e39b3e',
  success: '#24704b',
  successBackground: '#e5f2eb',
  danger: '#a33b3b',
  dangerBackground: '#f8e9e9',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 999,
} as const;

// Escala de texto usada nas telas (tamanho em pt).
export const fonte = {
  titulo: 28,
  subtitulo: 20,
  corpo: 16,
  apoio: 14,
  legenda: 13,
} as const;
