import { describe, it, expect } from 'vitest'
import { calcularSinergias } from '../synergies'
import type { Pokemon } from '@/store/types'

const makePokemon = (overrides: Partial<Pokemon>): Pokemon => ({
  id: 1, nome: 'Test', geracao: 1, tipo1: 'Normal', tipo2: null, estagio: 1, status_total: 300,
  ...overrides,
})

describe('calcularSinergias', () => {
  it('detecta time com 3 do mesmo tipo → +15% dano', () => {
    const time = [
      makePokemon({ tipo1: 'Fogo', tipo2: 'Flying' }),  // tem tipo secundário
      makePokemon({ tipo1: 'Fogo' }),
      makePokemon({ tipo1: 'Fogo' }),
    ]
    const bonuses = calcularSinergias(time)
    const sinergia = bonuses.find(b => b.multiplicador === 1.15)
    expect(sinergia).toBeDefined()
    expect(sinergia!.tipo).toBe('Fogo')
  })

  it('detecta 2+ da mesma geração → +10% velocidade', () => {
    const time = [
      makePokemon({ geracao: 1 }),
      makePokemon({ geracao: 1 }),
      makePokemon({ geracao: 2 }),
    ]
    const bonuses = calcularSinergias(time)
    const sinergia = bonuses.find(b => b.label.includes('Geração'))
    expect(sinergia).toBeDefined()
    expect(sinergia!.multiplicador).toBe(1.10)
  })

  it('detecta linha evolutiva completa (estágios 1+2+3) → HP +20%', () => {
    const time = [
      makePokemon({ estagio: 1 }),
      makePokemon({ estagio: 2 }),
      makePokemon({ estagio: 3 }),
    ]
    const bonuses = calcularSinergias(time)
    const sinergia = bonuses.find(b => b.label.includes('Evolutiva'))
    expect(sinergia).toBeDefined()
    expect(sinergia!.multiplicador).toBe(1.20)
  })

  it('detecta time puro → +25% dano com fraqueza dobrada', () => {
    const time = [
      makePokemon({ tipo1: 'Água', tipo2: null }),
      makePokemon({ tipo1: 'Água', tipo2: null }),
      makePokemon({ tipo1: 'Água', tipo2: null }),
      makePokemon({ tipo1: 'Água', tipo2: null }),
      makePokemon({ tipo1: 'Água', tipo2: null }),
      makePokemon({ tipo1: 'Água', tipo2: null }),
    ]
    const bonuses = calcularSinergias(time)
    const sinergia = bonuses.find(b => b.label.includes('Puro'))
    expect(sinergia).toBeDefined()
    expect(sinergia!.multiplicador).toBe(1.25)
  })

  it('retorna lista vazia se não há sinergias', () => {
    const time = [
      makePokemon({ tipo1: 'Fogo', geracao: 1 }),
      makePokemon({ tipo1: 'Água', geracao: 2 }),
    ]
    const bonuses = calcularSinergias(time)
    expect(bonuses.length).toBe(0)
  })
})
