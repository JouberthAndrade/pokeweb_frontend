import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Pokedex from 'pokedex-promise-v2'
import { computeBst, parseGeneration, capitalizeType, buildStageMap } from './lib/derive'

const P = new Pokedex()
const MAX_ID = 1013 // mesma faixa do dataset atual
const TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
]

interface Pokemon {
  id: number
  name: string
  types: string[]
  stats: { hp: number; atk: number; def: number; spAtk: number; spDef: number; speed: number }
  bst: number
  stage: number
  generation: number
  abilities: string[]
}

const STAT_KEY: Record<string, keyof Pokemon['stats']> = {
  hp: 'hp', attack: 'atk', defense: 'def',
  'special-attack': 'spAtk', 'special-defense': 'spDef', speed: 'speed',
}

async function withRetry<T>(fn: () => Promise<T>, label: string, tries = 3): Promise<T> {
  for (let i = 0; i < tries; i++) {
    try { return await fn() } catch (e) {
      if (i === tries - 1) throw e
      await new Promise((r) => setTimeout(r, 500 * (i + 1)))
    }
  }
  throw new Error(`unreachable ${label}`)
}

async function buildPokemon(id: number): Promise<Pokemon | null> {
  try {
    const mon: any = await withRetry(() => P.getPokemonByName(String(id)), `pokemon/${id}`)
    const species: any = await withRetry(() => P.getPokemonSpeciesByName(mon.species.name), `species/${id}`)
    const evoId = species.evolution_chain.url.split('/').filter(Boolean).pop()
    const evo: any = await withRetry(() => P.getEvolutionChainById(Number(evoId)), `evo/${evoId}`)
    const stageMap = buildStageMap(evo.chain)

    const stats = { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 }
    for (const s of mon.stats) {
      const key = STAT_KEY[s.stat.name]
      if (key) stats[key] = s.base_stat
    }

    return {
      id: mon.id,
      name: capitalizeType(mon.name),
      types: mon.types.map((t: any) => capitalizeType(t.type.name)),
      stats,
      bst: computeBst(mon.stats),
      stage: stageMap.get(mon.species.name) ?? 1,
      generation: parseGeneration(species.generation.name),
      abilities: mon.abilities.map((a: any) => a.ability.name),
    }
  } catch (e) {
    console.warn(`! pulando id ${id}: ${(e as Error).message}`)
    return null
  }
}

async function buildTypeChart() {
  const chart: Record<string, { double_damage_to: string[]; half_damage_to: string[]; no_damage_to: string[] }> = {}
  for (const t of TYPES) {
    const data: any = await withRetry(() => P.getTypeByName(t), `type/${t}`)
    const dr = data.damage_relations
    chart[t] = {
      double_damage_to: dr.double_damage_to.map((x: any) => x.name),
      half_damage_to: dr.half_damage_to.map((x: any) => x.name),
      no_damage_to: dr.no_damage_to.map((x: any) => x.name),
    }
  }
  return chart
}

function writeBoth(file: string, data: unknown) {
  const json = JSON.stringify(data, null, 2)
  writeFileSync(resolve(__dirname, '../src/data', file), json)
  writeFileSync(resolve(__dirname, '../../pokeweb-backend/src/data', file), json)
}

async function main() {
  console.log('Gerando type-chart...')
  writeBoth('type-chart.json', await buildTypeChart())

  console.log(`Gerando pokemon.json (1..${MAX_ID})...`)
  const list: Pokemon[] = []
  for (let id = 1; id <= MAX_ID; id++) {
    const p = await buildPokemon(id)
    if (p) list.push(p)
    if (id % 100 === 0) console.log(`  ${id}/${MAX_ID}`)
  }

  if (list.length < MAX_ID * 0.9) {
    throw new Error(`Dataset suspeito: so ${list.length} registros — abortando para nao sobrescrever um JSON bom.`)
  }
  writeBoth('pokemon.json', list)
  console.log(`OK: ${list.length} pokemon gravados.`)
}

main().catch((e) => { console.error(e); process.exit(1) })
