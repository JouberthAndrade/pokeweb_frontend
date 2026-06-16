import { describe, it, expect, vi, afterEach } from 'vitest'
import { apiFetch, ApiError } from '../http'

afterEach(() => vi.restoreAllMocks())

describe('apiFetch', () => {
  it('retorna JSON tipado em resposta OK', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: 1 }), { status: 200 })
    ))
    const data = await apiFetch<{ ok: number }>('/x')
    expect(data.ok).toBe(1)
  })

  it('lança ApiError com status em resposta 4xx', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'inválido' }), { status: 400 })
    ))
    const err = await apiFetch('/x').catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ status: 400, message: 'inválido' })
  })

  it('lança ApiError status 0 em falha de rede', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    await expect(apiFetch('/x')).rejects.toMatchObject({ status: 0 })
  })
})
