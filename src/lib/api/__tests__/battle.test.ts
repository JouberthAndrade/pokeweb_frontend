import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { criarSessao, posicionar } from '../battle'

beforeEach(() => localStorage.setItem('pokeweb-user-id', 'u-test'))
afterEach(() => vi.restoreAllMocks())

describe('api/battle', () => {
  it('criarSessao injeta userId e envia draftPokemonIds', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ sessionId: 's1', state: 'AWAITING_POSITION', expiresAt: '', trainerThemeTypes: [] }), { status: 201 })
    )
    vi.stubGlobal('fetch', fetchMock)
    await criarSessao({ leagueId: 1, stage: 1, draftPokemonIds: [1,2,3,4,5] })
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).toMatchObject({ userId: 'u-test', leagueId: 1, stage: 1, draftPokemonIds: [1,2,3,4,5] })
  })

  it('posicionar injeta userId e envia playerSlots', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ sessionId: 's1', result: 'PLAYER_WIN', score: { player: 3, trainer: 2 }, slots: [], synergyBundle: { activeSynergies: [] } }), { status: 200 })
    )
    vi.stubGlobal('fetch', fetchMock)
    await posicionar({ sessionId: 's1', playerSlots: [1,2,3,4,5] })
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).toMatchObject({ userId: 'u-test', sessionId: 's1', playerSlots: [1,2,3,4,5] })
  })
})
