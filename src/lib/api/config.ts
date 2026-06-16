// Único lugar que conhece o endereço do backend.
// Quando entrar o BFF (route handlers do Next), só este arquivo muda.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
