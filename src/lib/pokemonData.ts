import rawData from '@/data/pokemon.json'
import type { Pokemon } from '@/store/types'

const POKEMON_DATA = rawData as Pokemon[]

export function carregarPokemon(): Pokemon[] {
  return POKEMON_DATA
}

export function filtrarPorTipo(pokemon: Pokemon[], tipoBanido: string): Pokemon[] {
  return pokemon.filter(p => !p.types.includes(tipoBanido))
}

export function filtrarPorGeracao(pokemon: Pokemon[], geracao: number): Pokemon[] {
  return pokemon.filter(p => p.generation === geracao)
}

export function buscarPorEstágio(pokemon: Pokemon[], estagio: number): Pokemon[] {
  return pokemon.filter(p => p.stage === estagio)
}

export function filtrarPorBSTRange(pokemon: Pokemon[], min: number, max: number): Pokemon[] {
  return pokemon.filter(p => p.bst >= min && p.bst <= max)
}
