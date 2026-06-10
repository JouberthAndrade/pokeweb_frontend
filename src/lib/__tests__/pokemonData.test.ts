import { describe, it, expect } from 'vitest'
import { carregarPokemon, filtrarPorTipo, filtrarPorGeracao, buscarPorEstágio } from '../pokemonData'

describe('pokemonData', () => {
  it('carrega todos os pokémon', () => {
    const pokemon = carregarPokemon()
    expect(pokemon.length).toBeGreaterThan(0)
  })

  it('filtra pokémon excluindo um tipo', () => {
    const pokemon = carregarPokemon()
    const semFogo = filtrarPorTipo(pokemon, 'Fire')
    const temFogo = semFogo.some(p => p.tipo1 === 'Fire' || p.tipo2 === 'Fire')
    expect(temFogo).toBe(false)
  })

  it('filtra por geração', () => {
    const pokemon = carregarPokemon()
    const gen1 = filtrarPorGeracao(pokemon, 1)
    gen1.forEach(p => expect(p.geracao).toBe(1))
  })

  it('busca pokémon por estágio', () => {
    const pokemon = carregarPokemon()
    const estagio3 = buscarPorEstágio(pokemon, 3)
    estagio3.forEach(p => expect(p.estagio).toBe(3))
    expect(estagio3.length).toBeGreaterThan(0)
  })
})
