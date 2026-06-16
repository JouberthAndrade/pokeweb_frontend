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
}
export interface PositionRequest {
  sessionId: string
  userId: string
  playerSlots: number[]
}
export interface SlotResult {
  slot: number
  winner: 'player' | 'trainer'
  playerPokemonId: number
  trainerPokemonId: number
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
