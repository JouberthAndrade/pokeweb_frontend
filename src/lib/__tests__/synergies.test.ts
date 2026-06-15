import { describe, it, expect } from 'vitest'
import { calcularSinergias } from '../synergies'
import type { Pokemon } from '@/store/types'

const makePokemon = (overrides: Partial<Pokemon>): Pokemon => ({
  id: 1, name: 'Test', generation: 1, types: ['Normal'], stage: 1, bst: 300,
  stats: { hp: 50, atk: 50, def: 50, spAtk: 50, spDef: 50, speed: 50 },
  abilities: [],
  ...overrides,
})

describe('calcularSinergias', () => {
  it('detecta time com 3 do mesmo tipo → +15% dano', () => {
    const time = [
      makePokemon({ types: ['Fire', 'Flying'] }),
      makePokemon({ types: ['Fire'] }),
      makePokemon({ types: ['Fire'] }),
    ]
    const sinergia = calcularSinergias(time).find(b => b.multiplicador === 1.15)
    expect(sinergia).toBeDefined()
    expect(sinergia!.tipo).toBe('Fire')
  })

  it('detecta 2+ da mesma geração → +10% velocidade', () => {
    const time = [
      makePokemon({ generation: 1 }),
      makePokemon({ generation: 1 }),
      makePokemon({ generation: 2 }),
    ]
    const sinergia = calcularSinergias(time).find(b => b.label.includes('Geração'))
    expect(sinergia).toBeDefined()
    expect(sinergia!.multiplicador).toBe(1.10)
  })

  it('detecta linha evolutiva completa (estágios 1+2+3) → HP +20%', () => {
    const time = [
      makePokemon({ stage: 1 }),
      makePokemon({ stage: 2 }),
      makePokemon({ stage: 3 }),
    ]
    const sinergia = calcularSinergias(time).find(b => b.label.includes('Evolutiva'))
    expect(sinergia).toBeDefined()
    expect(sinergia!.multiplicador).toBe(1.20)
  })

  it('detecta time puro → +25% dano com fraqueza dobrada', () => {
    const time = Array.from({ length: 6 }, () => makePokemon({ types: ['Water'] }))
    const sinergia = calcularSinergias(time).find(b => b.label.includes('Puro'))
    expect(sinergia).toBeDefined()
    expect(sinergia!.multiplicador).toBe(1.25)
  })

  it('retorna lista vazia se não há sinergias', () => {
    const time = [
      makePokemon({ types: ['Fire'], generation: 1 }),
      makePokemon({ types: ['Water'], generation: 2 }),
    ]
    expect(calcularSinergias(time).length).toBe(0)
  })
})
