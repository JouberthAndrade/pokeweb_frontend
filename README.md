This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Rodando com o backend (integração server-authoritative)

O jogo é **server-authoritative**: draft, batalhas e leaderboard são resolvidos pelo backend NestJS (`pokeweb-backend`). Para rodar o fluxo completo:

1. **Suba as dependências do backend:** Redis (`redis://localhost:6379`) e Postgres (Prisma).
2. **Inicie o backend** (porta `3001`): na pasta `pokeweb-backend`, `npm run start:dev`.
3. **Configure a URL da API no frontend:** copie `.env.example` para `.env.local` (já aponta para `http://localhost:3001`). A variável é `NEXT_PUBLIC_API_URL`.
4. **Inicie o frontend** (porta `3000`): `npm run dev`.

CORS: o backend já libera `FRONTEND_URL` (default `http://localhost:3000`). Ajuste essa env no backend por ambiente.

Sem o backend no ar, o draft/batalha/leaderboard não funcionam — não há fallback offline (decisão de design para garantir verdade única e anti-cheat).

### Identidade do jogador

Nesta fase só há **modo convidado**: um `userId` (UUID) é gerado e salvo em `localStorage` no primeiro acesso (`src/lib/api/guestId.ts`). Convidado joga até a liga Intermediária (jornada 2); o restante exige login (Google OAuth — fase futura).

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
