import { describe, it, expect } from 'vitest'
import { buildCardPool } from '../buildCardPool'
import type { DraftCard } from '@/store/types'

describe('buildCardPool', () => {
  it('retorna exatamente 3 cartas', () => {
    expect(buildCardPool({ bstMin: 200, bstMax: 600 }).length).toBe(3)
  })

  it('respeita o tipo banido', () => {
    const cartas = buildCardPool({ bstMin: 200, bstMax: 600, tipoBanido: 'Fire' })
    expect(cartas.some(c => c.pokemon.types.includes('Fire'))).toBe(false)
  })

  it('mantém cartas travadas inalteradas', () => {
    const cartasTravadas: DraftCard[] = [
      { pokemon: {
        id: 6, name: 'Charizard', generation: 1, types: ['Fire', 'Flying'],
        stage: 3, bst: 534,
        stats: { hp: 78, atk: 84, def: 78, spAtk: 109, spDef: 85, speed: 100 },
        abilities: ['blaze'],
      }, locked: true },
    ]
    const cartas = buildCardPool({ bstMin: 200, bstMax: 600, cartasTravadas, índicesTravados: [0] })
    expect(cartas[0].pokemon.id).toBe(6)
    expect(cartas[0].locked).toBe(true)
  })

  it('distribui cartas com peso por estágio', () => {
    const amostras = Array.from({ length: 100 }, () =>
      buildCardPool({ bstMin: 200, bstMax: 600 })
    ).flat()
    const estagio1 = amostras.filter(c => c.pokemon.stage === 1).length
    const estagio3 = amostras.filter(c => c.pokemon.stage === 3).length
    expect(estagio3).toBeLessThan(estagio1)
  })
})
