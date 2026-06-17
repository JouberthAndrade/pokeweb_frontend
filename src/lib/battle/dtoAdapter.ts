/**
 * dtoAdapter.ts
 *
 * Converts BattleOutcomeDto (server contract, @/lib/api/types) into the
 * client-side BattleOutcome shape (@/lib/battle/types) consumed by BattleArena,
 * PhaseResult and registrarResultado.
 *
 * /battle/position retorna o log golpe-a-golpe (slots[].events). Repassamos esse
 * log intacto para que a BattleArena anime cada rodada (dano, barras de HP,
 * status) em vez de pular direto para o placar final.
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
      rounds: s.rounds,
      playerPokemonId: s.playerPokemonId,
      trainerPokemonId: s.trainerPokemonId,
      playerHpEnd: s.playerHpEnd,
      trainerHpEnd: s.trainerHpEnd,
      events: s.events.map(e => ({ ...e })),
    })),
  }
}
