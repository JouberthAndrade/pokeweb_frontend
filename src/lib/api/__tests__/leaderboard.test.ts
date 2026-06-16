import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { registrarVitoria, topSemanal } from '../leaderboard'

beforeEach(() => localStorage.setItem('pokeweb-user-id', 'u-test'))
afterEach(() => vi.restoreAllMocks())

describe('api/leaderboard', () => {
  // NOTE: The original spec used `new Response(null, { status: 200 })`, but:
  //  - http.ts calls res.json() for every non-204 response, so a null/empty body throws.
  //  - `new Response('', { status: 204 })` is rejected by the WHATWG constructor in vitest's
  //    jsdom/happy-dom environment (204 must have no body, but the constructor itself rejects it).
  // Resolution: mock returns `{}` as JSON body with status 200. http.ts parses it fine and the
  // return value is void (callers discard it). The important assertion — that the *request* body
  // contains the right fields — is still verified. This is a DONE_WITH_CONCERNS note: the real
  // backend endpoint should return 204; http.ts could be extended to handle empty-body 200 too.
  it('registrarVitoria envia userId + sessionId', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await registrarVitoria('sess-1')
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
