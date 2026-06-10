import type { Pokemon, SynergyBonus } from '@/store/types'

function contarOcorrências<T>(lista: T[]): Map<T, number> {
  return lista.reduce((map, item) => map.set(item, (map.get(item) ?? 0) + 1), new Map<T, number>())
}

export function calcularSinergias(time: Pokemon[]): SynergyBonus[] {
  const bonuses: SynergyBonus[] = []

  // Regra 1: Time puro (todos do mesmo tipo, sem tipo2)
  const todosMesmoTipo = time.length >= 3 && time.every(p => p.tipo1 === time[0].tipo1 && p.tipo2 === null)
  if (todosMesmoTipo) {
    bonuses.push({
      label: `Time Puro: ${time[0].tipo1}`,
      descricao: '+25% dano, mas fraqueza dobrada',
      multiplicador: 1.25,
      tipo: time[0].tipo1,
    })
  }

  // Regra 2: 3 pokémon do mesmo tipo (tipo1 ou tipo2) → +15% dano
  const tipos = time.flatMap(p => [p.tipo1, p.tipo2].filter((t): t is string => t !== null))
  const contTipos = contarOcorrências(tipos)
  for (const [tipo, count] of contTipos) {
    if (count >= 3) {
      bonuses.push({
        label: `Trio ${tipo}`,
        descricao: `+15% de dano do tipo ${tipo}`,
        multiplicador: 1.15,
        tipo,
      })
    }
  }

  // Regra 3: 2+ pokémon da mesma geração → +10% velocidade
  const gerações = time.map(p => p.geracao)
  const contGerações = contarOcorrências(gerações)
  for (const [geracao, count] of contGerações) {
    if (count >= 2) {
      bonuses.push({
        label: `Geração ${geracao} United`,
        descricao: '+10% de velocidade base',
        multiplicador: 1.10,
      })
      break
    }
  }

  // Regra 4: Linha evolutiva completa (estágios 1, 2 e 3)
  const estágios = new Set(time.map(p => p.estagio))
  if (estágios.has(1) && estágios.has(2) && estágios.has(3)) {
    bonuses.push({
      label: 'Linha Evolutiva Completa',
      descricao: 'Pokémon estágio 3 começa com HP +20%',
      multiplicador: 1.20,
    })
  }

  return bonuses
}
