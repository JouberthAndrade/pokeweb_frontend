'use client'
import { FASES } from '@/lib/battle/torneioFases'

export default function TournamentBracket({ faseAtual }: { faseAtual: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {FASES.map((f, i) => (
        <div key={f.n} className="flex items-center gap-2">
          <div
            className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
              f.n < faseAtual
                ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                : f.n === faseAtual
                  ? 'bg-white/15 text-white ring-1 ring-white/40'
                  : 'bg-white/5 text-white/40'
            }`}
          >
            {f.n < faseAtual ? '✓ ' : ''}{f.nome}
          </div>
          {i < FASES.length - 1 && <span className="text-white/20">→</span>}
        </div>
      ))}
    </div>
  )
}
