'use client'
import type { BattleOutcome } from '@/lib/battle/types'

interface Props {
  outcome: BattleOutcome
  ehFinal: boolean
  rotuloProxima: string
  onContinuar: () => void
}

export default function PhaseResult({ outcome, ehFinal, rotuloProxima, onContinuar }: Props) {
  const venceu = outcome.result === 'PLAYER_WIN'
  return (
    <div className="w-full max-w-md mx-auto text-center rounded-3xl bg-slate-900/70 ring-1 ring-white/10 p-8">
      <div className="text-5xl mb-3">{venceu ? '🏆' : '💀'}</div>
      <h3 className={`text-2xl font-extrabold mb-1 ${venceu ? 'text-emerald-300' : 'text-rose-300'}`}>
        {venceu ? 'Vitória!' : 'Derrota'}
      </h3>
      <p className="text-white/70 mb-6">
        Placar {outcome.score.player} – {outcome.score.trainer}
      </p>
      <button
        onClick={onContinuar}
        className="min-h-[52px] inline-flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold px-8 py-3 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer"
      >
        {venceu ? (ehFinal ? '🎉 Concluir Liga' : `Avançar → ${rotuloProxima}`) : '↻ Tentar de novo'}
      </button>
    </div>
  )
}
