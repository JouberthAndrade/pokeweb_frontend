import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pokeweb',
  description: 'Jogo de Pokémon com Draft e Ligas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 min-h-screen`}>
        <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h1 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Pokeweb
            </h1>
          </div>
          <CurrencyDisplay />
        </header>
        <main className="min-h-[calc(100vh-60px)] p-4 sm:p-6">{children}</main>
      </body>
    </html>
  )
}
