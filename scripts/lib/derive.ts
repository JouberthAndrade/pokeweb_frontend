export interface ApiStat {
  base_stat: number
  stat: { name: string }
}

export interface EvoNode {
  species: { name: string }
  evolves_to: EvoNode[]
}

export function computeBst(stats: ApiStat[]): number {
  return stats.reduce((acc, s) => acc + s.base_stat, 0)
}

const ROMAN: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9,
}

export function parseGeneration(name: string): number {
  const roman = name.replace('generation-', '').toLowerCase()
  return ROMAN[roman] ?? 0
}

export function capitalizeType(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

/** Profundidade de cada especie na cadeia evolutiva, 1-based, limitada a 3. */
export function buildStageMap(chain: EvoNode): Map<string, number> {
  const map = new Map<string, number>()
  const walk = (node: EvoNode, depth: number) => {
    map.set(node.species.name, Math.min(depth, 3))
    node.evolves_to.forEach((n) => walk(n, depth + 1))
  }
  walk(chain, 1)
  return map
}
