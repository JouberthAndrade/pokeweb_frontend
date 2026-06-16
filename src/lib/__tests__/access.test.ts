import { describe, it, expect } from 'vitest'
import { ligaPermitida } from '../access'

describe('ligaPermitida', () => {
  it('convidado joga ligas 1 e 2', () => {
    expect(ligaPermitida(1, false)).toBe(true)
    expect(ligaPermitida(2, false)).toBe(true)
  })
  it('convidado bloqueado da liga 3 em diante', () => {
    expect(ligaPermitida(3, false)).toBe(false)
    expect(ligaPermitida(6, false)).toBe(false)
  })
  it('autenticado joga tudo', () => {
    expect(ligaPermitida(6, true)).toBe(true)
  })
})
