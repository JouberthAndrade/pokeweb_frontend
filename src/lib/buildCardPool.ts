import { carregarPokemon, filtrarPorTipo, filtrarPorBSTRange } from './pokemonData'
import type { DraftCard, Pokemon } from '@/store/types'

interface BuildCardPoolOptions {
  bstMin: number
  bstMax: number
  tipoBanido?: string
  cartasTravadas?: DraftCard[]
  índicesTravados?: number[]
}

const PESOS_ESTÁGIO: Record<number, number> = { 1: 50, 2: 35, 3: 15 }

function weightedPick(pool: Pokemon[]): Pokemon {
  if (pool.length === 0) throw new Error('Pool vazio — ajuste os filtros de BST ou tipo banido')
  const total = pool.reduce((acc, p) => acc + (PESOS_ESTÁGIO[p.estagio] ?? 35), 0)
  let rand = Math.random() * total
  for (const pokemon of pool) {
    rand -= PESOS_ESTÁGIO[pokemon.estagio] ?? 35
    if (rand <= 0) return pokemon
  }
  return pool[pool.length - 1]
}

export function buildCardPool(opts: BuildCardPoolOptions): DraftCard[] {
  const { bstMin, bstMax, tipoBanido, cartasTravadas = [], índicesTravados = [] } = opts

  let pool = carregarPokemon()
  pool = filtrarPorBSTRange(pool, bstMin, bstMax)
  if (tipoBanido) pool = filtrarPorTipo(pool, tipoBanido)

  const resultado: DraftCard[] = []

  for (let i = 0; i < 3; i++) {
    if (índicesTravados.includes(i) && cartasTravadas[i]) {
      resultado.push({ ...cartasTravadas[i], locked: true })
    } else {
      resultado.push({ pokemon: weightedPick(pool), locked: false })
    }
  }

  return resultado
}
