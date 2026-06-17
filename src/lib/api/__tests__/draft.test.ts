import { describe, it, expect, vi, afterEach } from 'vitest'
import { criarSeed, construirRodada } from '../draft'

afterEach(() => vi.restoreAllMocks())

describe('api/draft', () => {
  it('criarSeed retorna seedId', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ seedId: 'abc' }), { status: 201 })
    ))
    expect(await criarSeed()).toEqual({ seedId: 'abc' })
  })

  it('construirRodada envia rodada e retorna cards', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ cards: [] }), { status: 200 })
    )
    vi.stubGlobal('fetch', fetchMock)
    await construirRodada({ seedId: 's', jornadaId: 2, rodada: 3 })
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).toMatchObject({ seedId: 's', jornadaId: 2, rodada: 3 })
  })
})
