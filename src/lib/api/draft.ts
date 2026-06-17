import { apiFetch } from './http'
import type { BuildPoolRequest, BuildPoolResponse, SeedResponse } from './types'

export function criarSeed(): Promise<SeedResponse> {
  return apiFetch<SeedResponse>('/draft/seed', { method: 'POST', body: {} })
}

export function construirRodada(req: BuildPoolRequest): Promise<BuildPoolResponse> {
  return apiFetch<BuildPoolResponse>('/draft/build', { method: 'POST', body: req })
}
