import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { registrarVitoria, topSemanal } from '../leaderboard'

beforeEach(() => localStorage.setItem('pokeweb-user-id', 'u-test'))
afterEach(() => vi.restoreAllMocks())

describe('api/leaderboard', () => {
  // O backend Nest responde 200 com CORPO VAZIO em POST /leaderboard/victory
  // (@HttpCode(OK) + Promise<void>). http.ts trata corpo vazio sem lançar.
  it('registrarVitoria envia userId + sessionId e lida com 200 vazio', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(registrarVitoria('sess-1')).resolves.toBeUndefined()
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).toEqual({ userId: 'u-test', sessionId: 'sess-1' })
  })

  it('topSemanal retorna o array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ userId: 'a', score: 4 }]), { status: 200 })
    ))
    expect(await topSemanal()).toEqual([{ userId: 'a', score: 4 }])
  })
})
