'use client'
import { useGameStore } from '@/store/gameStore'

export function CurrencyDisplay() {
  const pokémoedas = useGameStore(s => s.pokémoedas)
  const faíscas = useGameStore(s => s.faíscas)
  const gemas = useGameStore(s => s.gemas)
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full border border-yellow-200">
        🪙 {pokémoedas}
      </span>
      <span className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full border border-blue-200">
        ⚡ {faíscas}
      </span>
      <span className="flex items-center gap-1 bg-purple-100 text-purple-800 text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full border border-purple-200">
        💎 {gemas}
      </span>
    </div>
  )
}
