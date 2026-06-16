import { describe, it, expect } from 'vitest'
import { estiloEfetividade } from '../efetividade'

describe('estiloEfetividade', () => {
  it('4× é super eficaz com maior destaque', () => {
    const e = estiloEfetividade(4)
    expect(e.nivel).toBe('super')
    expect(e.rotulo).toBe('SUPER EFICAZ!')
    expect(e.escala).toBeGreaterThan(estiloEfetividade(2).escala)
  })

  it('2× é eficaz', () => {
    const e = estiloEfetividade(2)
    expect(e.nivel).toBe('eficaz')
    expect(e.rotulo).toBe('Eficaz!')
    expect(e.escala).toBeGreaterThan(1)
  })

  it('1× é neutro, sem rótulo', () => {
    const e = estiloEfetividade(1)
    expect(e.nivel).toBe('neutro')
    expect(e.rotulo).toBeNull()
    expect(e.escala).toBe(1)
  })

  it('0.5× é fraco', () => {
    const e = estiloEfetividade(0.5)
    expect(e.nivel).toBe('fraco')
    expect(e.rotulo).toBe('Pouco eficaz…')
    expect(e.escala).toBeLessThan(1)
  })

  it('0.25× é fraco com destaque ainda menor que 0.5×', () => {
    const e = estiloEfetividade(0.25)
    expect(e.nivel).toBe('fraco')
    expect(e.escala).toBeLessThan(estiloEfetividade(0.5).escala)
  })

  it('0× é imune', () => {
    const e = estiloEfetividade(0)
    expect(e.nivel).toBe('imune')
    expect(e.rotulo).toBe('Não afeta')
  })

  it('sempre retorna uma cor (classe tailwind não-vazia)', () => {
    for (const m of [0, 0.25, 0.5, 1, 2, 4]) {
      expect(estiloEfetividade(m).cor.length).toBeGreaterThan(0)
    }
  })
})
