import { describe, it, expect } from 'vitest'
import { buildCardPool } from '../buildCardPool'
import type { DraftCard } from '@/store/types'

describe('buildCardPool', () => {
  it('retorna exatamente 3 cartas', () => {
    const cartas = buildCardPool({ bstMin: 200, bstMax: 600 })
    expect(cartas.length).toBe(3)
  })

  it('respeita o tipo banido', () => {
    const cartas = buildCardPool({ bstMin: 200, bstMax: 600, tipoBanido: 'Fogo' })
    const temFogo = cartas.some(c => c.pokemon.tipo1 === 'Fogo' || c.pokemon.tipo2 === 'Fogo')
    expect(temFogo).toBe(false)
  })

  it('mantém cartas travadas inalteradas', () => {
    const cartasTravadas: DraftCard[] = [
      { pokemon: { id: 6, nome: 'Charizard', geracao: 1, tipo1: 'Fogo', tipo2: 'Voador', estagio: 3, status_total: 534 }, locked: true },
    ]
    const cartas = buildCardPool({ bstMin: 200, bstMax: 600, cartasTravadas, índicesTravados: [0] })
    expect(cartas[0].pokemon.id).toBe(6)
    expect(cartas[0].locked).toBe(true)
  })

  it('distribui cartas com peso por estágio', () => {
    const amostras = Array.from({ length: 100 }, () =>
      buildCardPool({ bstMin: 200, bstMax: 600 })
    ).flat()
    const estagio1 = amostras.filter(c => c.pokemon.estagio === 1).length
    const estagio3 = amostras.filter(c => c.pokemon.estagio === 3).length
    expect(estagio3).toBeLessThan(estagio1)
  })
})
