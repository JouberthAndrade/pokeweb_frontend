import { describe, it, expect } from 'vitest'
import { carregarPokemon, filtrarPorTipo, filtrarPorGeracao, buscarPorEstágio } from '../pokemonData'

describe('pokemonData', () => {
  it('carrega todos os pokémon', () => {
    expect(carregarPokemon().length).toBeGreaterThan(0)
  })

  it('filtra pokémon excluindo um tipo', () => {
    const semFire = filtrarPorTipo(carregarPokemon(), 'Fire')
    expect(semFire.some(p => p.types.includes('Fire'))).toBe(false)
  })

  it('filtra por geração', () => {
    filtrarPorGeracao(carregarPokemon(), 1).forEach(p => expect(p.generation).toBe(1))
  })

  it('busca pokémon por estágio', () => {
    const estagio3 = buscarPorEstágio(carregarPokemon(), 3)
    estagio3.forEach(p => expect(p.stage).toBe(3))
    expect(estagio3.length).toBeGreaterThan(0)
  })
})
