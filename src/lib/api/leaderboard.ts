import { apiFetch } from './http'
import { getUserId } from './guestId'
import type { LeaderboardEntry } from './types'

export function registrarVitoria(sessionId: string): Promise<void> {
  return apiFetch<void>('/leaderboard/victory', {
    method: 'POST',
    body: { userId: getUserId(), sessionId },
  })
}

export function topSemanal(): Promise<LeaderboardEntry[]> {
  return apiFetch<LeaderboardEntry[]>('/leaderboard/weekly')
}
