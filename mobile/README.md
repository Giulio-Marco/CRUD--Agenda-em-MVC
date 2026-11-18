# App mobile (Expo)

App React Native da Plataforma de Cursos. Expo SDK 58, testado no iPhone pelo Expo Go.

## Rodar

1. Na raiz do projeto, suba a API: `npm run start:dev` (porta 3000).
2. Aqui em `mobile/`: `npm install` (primeira vez) e `npx expo start`.
3. No iPhone, no mesmo Wi-Fi do PC, leia o QR code com a Camera e abra no Expo Go.

O app descobre a API pelo IP do PC que roda o Metro. Para fixar outra URL, copie `.env.example` para `.env` e preencha `EXPO_PUBLIC_API_URL`.
Se aparecer "Não foi possível conectar à API", libere a porta 3000 no Firewall do Windows.

## Validar

```bash
npx tsc --noEmit
npx expo-doctor
```
