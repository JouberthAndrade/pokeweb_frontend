'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { getLiga, LIGAS } from '@/lib/ligas'

// Placeholder — a arena de batalha é a Fase 2. Esta rota apenas evita um 404
// ao concluir o draft. O botão "Concluir Liga" permite testar a progressão
// sequencial das ligas (persistida em localStorage) enquanto não há batalha real.
export default function BattlePage() {
  const router = useRouter()
  const jornadaAtual = useGameStore(s => s.jornadaAtual)
  const completarLiga = useGameStore(s => s.completarLiga)
  const liga = getLiga(jornadaAtual)
  const proxima = LIGAS.find(l => l.jornada === jornadaAtual + 1)

  function concluir() {
    completarLiga(jornadaAtual)
    router.push('/')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl mb-4">⚔️</div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Arena de Batalhas</h2>
      <p className="text-blue-300 mb-8 max-w-md">
        Seu time está pronto! As batalhas chegam na próxima fase do Pokeweb.
      </p>

      <button
        onClick={concluir}
        className="min-h-[52px] inline-flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold px-7 py-3 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer"
      >
        🏆 Concluir {liga.nome}
        {proxima && <span className="text-emerald-100/80 font-bold text-sm">→ desbloqueia {proxima.nome}</span>}
      </button>

      <Link
        href="/draft"
        className="mt-4 min-h-[48px] inline-flex items-center rounded-xl bg-white/10 ring-1 ring-white/15 hover:bg-white/20 text-white font-bold px-6 py-3 transition-all active:scale-95"
      >
        ← Voltar ao Draft
      </Link>
    </div>
  )
}
