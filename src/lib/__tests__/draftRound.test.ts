import { describe, it, expect } from 'vitest'
import { resolverCaptura, TEAM_SIZE, RODADAS_TOTAL, MAX_LOCKS } from '../draftRound'
import type { DraftCard } from '@/store/types'

function carta(id: number, locked = false): DraftCard {
  return {
    pokemon: {
      id, name: `Mon${id}`, generation: 1, types: ['Normal'], stage: 1, bst: 300,
      stats: { hp: 50, atk: 50, def: 50, spAtk: 50, spDef: 50, speed: 50 },
      abilities: [],
    },
    locked,
  }
}

describe('draftRound — constantes', () => {
  it('time tem 5 slots, 5 rodadas e no máximo 2 travas', () => {
    expect(TEAM_SIZE).toBe(5)
    expect(RODADAS_TOTAL).toBe(5)
    expect(MAX_LOCKS).toBe(2)
  })
})

describe('resolverCaptura', () => {
  const base = { bstMin: 200, bstMax: 600 }

  it('preserva a carta travada que NÃO foi capturada (mesma posição, mesmo pokémon)', () => {
    const draftCards = [carta(10, true), carta(20), carta(30)]
    const { novasCartas, novosTravados } = resolverCaptura({
      ...base,
      draftCards,
      lockedCards: [0],
      índice: 2, // captura a carta NÃO travada
    })

    expect(novasCartas).toHaveLength(3)
    expect(novosTravados).toEqual([0])
    expect(novasCartas[0].pokemon.id).toBe(10)
    expect(novasCartas[0].locked).toBe(true)
  })

  it('consome a trava quando o jogador captura a própria carta travada', () => {
    const draftCards = [carta(10, true), carta(20, true), carta(30)]
    const { novasCartas, novosTravados } = resolverCaptura({
      ...base,
      draftCards,
      lockedCards: [0, 1],
      índice: 0, // captura uma carta TRAVADA
    })

    // a trava do índice 0 foi consumida; só resta a do índice 1
    expect(novosTravados).toEqual([1])
    expect(novasCartas[1].pokemon.id).toBe(20)
    expect(novasCartas[1].locked).toBe(true)
    // a posição capturada é resorteada (não fica travada)
    expect(novasCartas[0].locked).toBe(false)
  })

  it('resorteia todas as posições quando nada está travado', () => {
    const draftCards = [carta(10), carta(20), carta(30)]
    const { novasCartas, novosTravados } = resolverCaptura({
      ...base,
      draftCards,
      lockedCards: [],
      índice: 1,
    })
    expect(novosTravados).toEqual([])
    expect(novasCartas.every(c => !c.locked)).toBe(true)
  })
})
