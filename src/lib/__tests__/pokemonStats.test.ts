import { describe, it, expect } from 'vitest'
import { hpDeBatalha, pctBarra } from '../pokemonStats'

describe('hpDeBatalha', () => {
  it('aplica a fórmula hp*2 + 110', () => {
    expect(hpDeBatalha(23)).toBe(156)
    expect(hpDeBatalha(0)).toBe(110)
    expect(hpDeBatalha(45)).toBe(200)
  })
})

describe('pctBarra', () => {
  it('valor igual ao máximo é 100%', () => {
    expect(pctBarra(255)).toBe(100)
  })

  it('valor zero é 0%', () => {
    expect(pctBarra(0)).toBe(0)
  })

  it('clampa acima do máximo em 100%', () => {
    expect(pctBarra(300)).toBe(100)
  })

  it('é proporcional ao máximo informado', () => {
    expect(pctBarra(100, 200)).toBe(50)
  })
})
