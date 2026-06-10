import rawData from '@/data/pokemon.json'
import type { Pokemon } from '@/store/types'

const POKEMON_DATA = rawData as Pokemon[]

export function carregarPokemon(): Pokemon[] {
  return POKEMON_DATA
}

export function filtrarPorTipo(pokemon: Pokemon[], tipoBanido: string): Pokemon[] {
  return pokemon.filter(p => p.tipo1 !== tipoBanido && p.tipo2 !== tipoBanido)
}

export function filtrarPorGeracao(pokemon: Pokemon[], geracao: number): Pokemon[] {
  return pokemon.filter(p => p.geracao === geracao)
}

export function buscarPorEstágio(pokemon: Pokemon[], estagio: number): Pokemon[] {
  return pokemon.filter(p => p.estagio === estagio)
}

export function filtrarPorBSTRange(pokemon: Pokemon[], min: number, max: number): Pokemon[] {
  return pokemon.filter(p => p.status_total >= min && p.status_total <= max)
}
