import type { Pokemon } from '@/store/types'

export type BattleResultKind = 'PLAYER_WIN' | 'TRAINER_WIN'
export type Actor = 'player' | 'trainer'
export type StatusKind = 'paralysis' | 'burn' | 'sleep' | 'freeze' | 'poison'

export interface RoundEvent {
  round: number
  actor: Actor
  move: string
  damage: number
  crit: boolean
  effectiveness: number
  missed: boolean
  statusInflicted: StatusKind | null
  drainHeal: number
  recoil: number
  attackerHpAfter: number
  defenderHpAfter: number
}

export interface SlotResult {
  slot: number
  winner: Actor
  rounds: number
  playerPokemonId: number
  trainerPokemonId: number
  playerHpEnd: number
  trainerHpEnd: number
  events: RoundEvent[]
}

export interface BattleOutcome {
  result: BattleResultKind
  score: { player: number; trainer: number }
  slots: SlotResult[]
  synergyBundle: { activeSynergies: string[] }
}

export type Time = Pokemon[]
