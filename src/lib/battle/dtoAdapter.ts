/**
 * dtoAdapter.ts
 *
 * Converts BattleOutcomeDto (server contract, @/lib/api/types) into the
 * client-side BattleOutcome shape (@/lib/battle/types) consumed by BattleArena,
 * PhaseResult and registrarResultado.
 *
 * Key difference: the server DTO does not include round-by-round RoundEvent[]
 * data. We synthesise slots with empty events arrays so BattleArena cycles
 * through all slots instantly (the animation timer immediately falls to the
 * "call onFim()" branch). The scoreboard and result are still shown correctly.
 *
 * Full per-round animation is deferred to a future PRD that adds
 * GET /battle/replay/:sessionId → RoundEvent[] support.
 */
import type { BattleOutcomeDto } from '@/lib/api/types'
import type { BattleOutcome } from './types'

export function dtoToBattleOutcome(dto: BattleOutcomeDto): BattleOutcome {
  return {
    result: dto.result,
    score: dto.score,
    synergyBundle: dto.synergyBundle,
    slots: dto.slots.map(s => ({
      slot: s.slot,
      winner: s.winner,
      playerPokemonId: s.playerPokemonId,
      trainerPokemonId: s.trainerPokemonId,
      // Fields not provided by the server — synthesised defaults so BattleArena
      // compiles and runs; animation is effectively instantaneous.
      rounds: 0,
      playerHpEnd: 0,
      trainerHpEnd: 0,
      events: [],
    })),
  }
}
