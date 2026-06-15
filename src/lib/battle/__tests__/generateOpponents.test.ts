import { describe, it, expect } from 'vitest'
import { gerarTorneio } from '../generateOpponents'
import { LENDARIOS } from '../legendaries'

describe('gerarTorneio', () => {
  it('gera 4 adversários: 3 treinadores + 1 líder', () => {
    const advs = gerarTorneio(1, 42)
    expect(advs).toHaveLength(4)
    expect(advs.slice(0, 3).every(a => a.tipo === 'treinador')).toBe(true)
    expect(advs[3].tipo).toBe('lider')
    expect(advs[3].habilidadeGinasio).toBeTruthy()
    expect(advs[3].nome).toBe('Brock')
  })

  it('cada time tem 5 Pokémon únicos sem lendários (treinadores)', () => {
    const advs = gerarTorneio(2, 7)
    for (const tr of advs.slice(0, 3)) {
      expect(tr.time).toHaveLength(5)
      expect(new Set(tr.time.map(p => p.id)).size).toBe(5)
      for (const p of tr.time) expect(LENDARIOS.has(p.id)).toBe(false)
    }
  })

  it('o líder tem 5 Pokémon e um Pokémon assinatura fixo entre seeds', () => {
    const a = gerarTorneio(1, 1)
    const b = gerarTorneio(1, 2)
    expect(a[3].time).toHaveLength(5)
    expect(a[3].assinaturaId).toBe(b[3].assinaturaId)
    expect(a[3].time.some(p => p.id === a[3].assinaturaId)).toBe(true)
  })

  it('é determinístico por seed', () => {
    const ids = (j: number, s: number) =>
      gerarTorneio(j, s).map(a => a.time.map(p => p.id).join(','))
    expect(ids(1, 555)).toEqual(ids(1, 555))
  })
})
