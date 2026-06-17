import { apiFetch } from './http'
import { getUserId } from './guestId'
import type { CreateSessionResponse, BattleOutcomeDto } from './types'

export function criarSessao(req: { leagueId: number; stage: number; draftPokemonIds: number[] }): Promise<CreateSessionResponse> {
  return apiFetch<CreateSessionResponse>('/battle/session', {
    method: 'POST',
    body: { userId: getUserId(), ...req },
  })
}

export function posicionar(req: { sessionId: string; playerSlots: number[] }): Promise<BattleOutcomeDto> {
  return apiFetch<BattleOutcomeDto>('/battle/position', {
    method: 'POST',
    body: { userId: getUserId(), ...req },
  })
}

export function buscarResultado(sessionId: string): Promise<unknown> {
  return apiFetch(`/battle/result/${sessionId}`)
}

export function replay(sessionId: string): Promise<BattleOutcomeDto> {
  return apiFetch<BattleOutcomeDto>(`/battle/replay/${sessionId}`)
}
