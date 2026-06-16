import { describe, it, expect } from 'vitest'
import { perfilDefensivo, matchupContra } from '../matchup'

function multDe(lista: { tipo: string; mult: number }[], tipo: string) {
  return lista.find(x => x.tipo === tipo)?.mult
}

describe('perfilDefensivo', () => {
  it('mono Grass: fraquezas e resistências clássicas', () => {
    const p = perfilDefensivo(['Grass'])
    expect(multDe(p.fraquezas, 'Fire')).toBe(2)
    expect(multDe(p.fraquezas, 'Ice')).toBe(2)
    expect(multDe(p.fraquezas, 'Flying')).toBe(2)
    expect(multDe(p.resistencias, 'Water')).toBe(0.5)
    expect(multDe(p.resistencias, 'Electric')).toBe(0.5)
    expect(multDe(p.resistencias, 'Ground')).toBe(0.5)
  })

  it('dual Bug/Grass: Fire é fraqueza 4× (caso do Paras)', () => {
    const p = perfilDefensivo(['Bug', 'Grass'])
    expect(multDe(p.fraquezas, 'Fire')).toBe(4)
    // fraquezas ordenadas do maior para o menor
    expect(p.fraquezas[0].mult).toBe(4)
  })

  it('mono Fire: bate com a referência do screenshot', () => {
    const p = perfilDefensivo(['Fire'])
    expect(multDe(p.fraquezas, 'Water')).toBe(2)
    expect(multDe(p.fraquezas, 'Ground')).toBe(2)
    expect(multDe(p.fraquezas, 'Rock')).toBe(2)
    expect(multDe(p.resistencias, 'Grass')).toBe(0.5)
    expect(multDe(p.resistencias, 'Steel')).toBe(0.5)
    expect(multDe(p.resistencias, 'Fairy')).toBe(0.5)
  })

  it('imunidades aparecem separadas (Flying imune a Ground)', () => {
    const p = perfilDefensivo(['Flying'])
    expect(p.imunidades).toContain('Ground')
    expect(multDe(p.fraquezas, 'Ground')).toBeUndefined()
  })
})

describe('matchupContra', () => {
  it('Water contra Fire é vantagem', () => {
    const r = matchupContra(['Water'], ['Fire'])
    expect(r.nivel).toBe('vantagem')
    expect(r.meuMelhorMult).toBe(2)
  })

  it('Fire contra Water é desvantagem', () => {
    expect(matchupContra(['Fire'], ['Water']).nivel).toBe('desvantagem')
  })

  it('espelho (Fire vs Fire) é equilíbrio', () => {
    expect(matchupContra(['Fire'], ['Fire']).nivel).toBe('equilibrio')
  })
})
