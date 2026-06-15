# Deploy — Frontend (Vercel)

Frontend Next.js 16 (atualmente 100% client-side, com persistência em `localStorage`).
Deploy automático por push na branch `main` (repo `JouberthAndrade/pokeweb_frontend`).

## Passos

1. Em [vercel.com](https://vercel.com) → **Add New → Project** → importe `pokeweb_frontend`.
2. **Framework Preset**: Next.js (detectado automaticamente).
   - Como o repo é só do frontend, **Root Directory** = `./` (raiz). Não precisa apontar subpasta.
   - Build Command / Output: padrão do Next.js (não alterar).
3. **Production Branch** = `main` (Settings → Git).
4. Deploy. A app sobe em `https://<projeto>.vercel.app`.

## Variáveis de ambiente

Nenhuma necessária por enquanto — o app não chama o backend (sem integração nesta fase).

Quando a integração frontend↔backend for feita, adicionar:

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | URL do backend na Railway (ex.: `https://<api>.up.railway.app`) |

E lembrar de incluir a URL do Vercel em `FRONTEND_URL` no backend (CORS).
