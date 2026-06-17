import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getUserId } from '../guestId'

describe('getUserId', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.unstubAllGlobals())

  it('gera e persiste um id na primeira chamada', () => {
    const id = getUserId()
    expect(id).toMatch(/[0-9a-f-]{36}/)
    expect(localStorage.getItem('pokeweb-user-id')).toBe(id)
  })

  it('reusa o mesmo id em chamadas seguintes', () => {
    const a = getUserId()
    const b = getUserId()
    expect(a).toBe(b)
  })

  it('retorna ssr-anon quando não há window (SSR)', () => {
    vi.stubGlobal('window', undefined)
    expect(getUserId()).toBe('ssr-anon')
  })
})
