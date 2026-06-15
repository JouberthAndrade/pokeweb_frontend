import type { Pokemon } from '@/store/types'
import { carregarPokemon, filtrarPorBSTRange } from '@/lib/pokemonData'
import { getLiga } from '@/lib/ligas'
import { mulberry32 } from './rng'
import { LENDARIOS } from './legendaries'

export interface Adversario {
  tipo: 'treinador' | 'lider'
  nome: string
  time: Pokemon[]
  assinaturaId?: number
  habilidadeGinasio?: string
}

const TEAM_SIZE = 5
const NOMES_TREINADOR = ['Treinador Léo', 'Treinadora Bia', 'Treinador Caio', 'Treinadora Duda']

function sortear(pool: Pokemon[], n: number, rng: () => number): Pokemon[] {
  const copy = [...pool]
  const out: Pokemon[] = []
  for (let i = 0; i < n && copy.length > 0; i++) {
    const j = Math.floor(rng() * copy.length)
    out.push(copy.splice(j, 1)[0])
  }
  return out
}

export function gerarTorneio(jornada: number, seed: number): Adversario[] {
  const liga = getLiga(jornada)
  const rng = mulberry32(seed)
  const todos = carregarPokemon()
  const poolTreinador = filtrarPorBSTRange(todos, liga.bstMin, liga.bstMax)
    .filter(p => !LENDARIOS.has(p.id))

  const adversarios: Adversario[] = []
  for (let i = 0; i < 3; i++) {
    adversarios.push({
      tipo: 'treinador',
      nome: NOMES_TREINADOR[i],
      time: sortear(poolTreinador, TEAM_SIZE, rng),
    })
  }

  const assinatura = [...poolTreinador].sort((a, b) => b.bst - a.bst || a.id - b.id)[0]
  const restoLider = sortear(
    poolTreinador.filter(p => p.id !== assinatura.id),
    TEAM_SIZE - 1,
    rng,
  )
  adversarios.push({
    tipo: 'lider',
    nome: liga.lider,
    time: [assinatura, ...restoLider],
    assinaturaId: assinatura.id,
    habilidadeGinasio: `Especialista de ${liga.regiao}: o time do líder ganha vigor na Final.`,
  })

  return adversarios
}
