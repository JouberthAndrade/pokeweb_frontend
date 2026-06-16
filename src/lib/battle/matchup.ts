import { TYPE_CHART, getTypeEffectiveness } from './typeChart'

export interface EntradaMatchup {
  tipo: string
  mult: number
}

export interface PerfilDefensivo {
  fraquezas: EntradaMatchup[] // mult > 1, ordenado do maior para o menor
  resistencias: EntradaMatchup[] // 0 < mult < 1, ordenado do menor para o maior
  imunidades: string[] // mult === 0
}

const TODOS_OS_TIPOS = Object.keys(TYPE_CHART)

/**
 * Perfil defensivo de um Pokémon: como cada um dos 18 tipos atacantes o atinge.
 */
export function perfilDefensivo(defenderTypes: string[]): PerfilDefensivo {
  const fraquezas: EntradaMatchup[] = []
  const resistencias: EntradaMatchup[] = []
  const imunidades: string[] = []

  for (const tipo of TODOS_OS_TIPOS) {
    const mult = getTypeEffectiveness(tipo, defenderTypes)
    if (mult === 0) imunidades.push(tipo)
    else if (mult > 1) fraquezas.push({ tipo, mult })
    else if (mult < 1) resistencias.push({ tipo, mult })
  }

  fraquezas.sort((a, b) => b.mult - a.mult)
  resistencias.sort((a, b) => a.mult - b.mult)

  return { fraquezas, resistencias, imunidades }
}

export type VantagemNivel = 'vantagem' | 'equilibrio' | 'desvantagem'

export interface ResumoMatchup {
  nivel: VantagemNivel
  meuMelhorMult: number // melhor efetividade que meus tipos causam no oponente
  oponenteMelhorMult: number // melhor efetividade que o oponente causa em mim
}

function melhorEfetividade(atacanteTypes: string[], defensorTypes: string[]): number {
  return atacanteTypes.reduce(
    (max, t) => Math.max(max, getTypeEffectiveness(t, defensorTypes)),
    0,
  )
}

/**
 * Resumo do confronto 1×1 esperado (aproximação por STAB: usa os próprios
 * tipos do Pokémon como tipos ofensivos).
 */
export function matchupContra(meuTypes: string[], oponenteTypes: string[]): ResumoMatchup {
  const meuMelhorMult = melhorEfetividade(meuTypes, oponenteTypes)
  const oponenteMelhorMult = melhorEfetividade(oponenteTypes, meuTypes)
  const nivel: VantagemNivel =
    meuMelhorMult > oponenteMelhorMult
      ? 'vantagem'
      : meuMelhorMult < oponenteMelhorMult
        ? 'desvantagem'
        : 'equilibrio'
  return { nivel, meuMelhorMult, oponenteMelhorMult }
}
