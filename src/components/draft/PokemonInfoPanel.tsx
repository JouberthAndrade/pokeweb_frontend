'use client'
import { StatBars } from './StatBars'
import MatchupPanel from '@/components/battle/MatchupPanel'
import type { Pokemon } from '@/store/types'

/** Painel de inspeção de um Pokémon: 6 stats + perfil defensivo. */
export function PokemonInfoPanel({ pokemon }: { pokemon: Pokemon }) {
  return (
    <div className="space-y-2">
      <StatBars stats={pokemon.stats} />
      <MatchupPanel poke={pokemon} />
    </div>
  )
}
