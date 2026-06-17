// Espelha os contratos do backend. Fonte única de verdade no front.
import type { Pokemon } from '@/store/types'

// Draft
export interface BuildPoolRequest {
  seedId: string
  jornadaId: number
  rodada: number
  tipoBanido?: string
  indicesTravados?: number[]
  playerLockedIds?: number[]
  /** Contador de rerolls da mesma rodada — varia a mão sem trocar a seed. */
  reroll?: number
}
export interface BuildPoolResponse { cards: Pokemon[] }
export interface SeedResponse { seedId: string }

// Batalha
export interface CreateSessionRequest {
  userId: string
  leagueId: number
  stage: number
  draftPokemonIds: number[]
}
export interface CreateSessionResponse {
  sessionId: string
  state: string
  expiresAt: string
  trainerThemeTypes: string[]
  /** Ids do time do oponente (ordenados) nas ligas 1–2; null nas ligas 3+. */
  trainerTeamIds: number[] | null
}
export interface PositionRequest {
  sessionId: string
  userId: string
  playerSlots: number[]
}
export type StatusKindDto = 'paralysis' | 'burn' | 'sleep' | 'freeze' | 'poison'

// Log golpe-a-golpe de um confronto, retornado por /battle/position.
// É o que alimenta a animação rodada a rodada na arena.
export interface RoundEventDto {
  round: number
  actor: 'player' | 'trainer'
  move: string
  damage: number
  crit: boolean
  effectiveness: number
  missed: boolean
  statusInflicted: StatusKindDto | null
  drainHeal: number
  recoil: number
  attackerHpAfter: number
  defenderHpAfter: number
}
export interface SlotResult {
  slot: number
  winner: 'player' | 'trainer'
  rounds: number
  playerPokemonId: number
  trainerPokemonId: number
  playerHpEnd: number
  trainerHpEnd: number
  events: RoundEventDto[]
}
export interface BattleOutcomeDto {
  sessionId: string
  result: 'PLAYER_WIN' | 'TRAINER_WIN'
  score: { player: number; trainer: number }
  slots: SlotResult[]
  synergyBundle: { activeSynergies: string[] }
}

// Leaderboard
export interface VictoryRequest { userId: string; sessionId: string }
export interface LeaderboardEntry { userId: string; score: number }
