import { describe, it, expect } from 'vitest'
import { simulateBattle } from '../simulateBattle'
import type { Pokemon } from '@/store/types'

function mk(id: number, over: Partial<Pokemon> = {}): Pokemon {
  return {
    id, name: `Mon${id}`, types: ['Normal'], stage: 1, bst: 300, generation: 1, abilities: [],
    stats: { hp: 60, atk: 80, def: 70, spAtk: 70, spDef: 70, speed: 70 },
    ...over,
  }
}

const playerTeam: Pokemon[] = [1, 2, 3, 4, 5].map(i => mk(i, { types: ['Fire'] }))
const trainerTeam: Pokemon[] = [6, 7, 8, 9, 10].map(i => mk(i, { types: ['Grass'] }))

describe('simulateBattle', () => {
  it('retorna 5 slots e score que soma 5, sem empate', () => {
    const r = simulateBattle(playerTeam, trainerTeam, 12345)
    expect(r.slots).toHaveLength(5)
    expect(r.score.player + r.score.trainer).toBe(5)
    expect(['PLAYER_WIN', 'TRAINER_WIN']).toContain(r.result)
    expect(r.result).toBe(r.score.player >= 3 ? 'PLAYER_WIN' : 'TRAINER_WIN')
  })

  it('é determinístico por seed', () => {
    expect(simulateBattle(playerTeam, trainerTeam, 999))
      .toEqual(simulateBattle(playerTeam, trainerTeam, 999))
  })

  it('seeds diferentes podem gerar logs diferentes', () => {
    const a = simulateBattle(playerTeam, trainerTeam, 1)
    const b = simulateBattle(playerTeam, trainerTeam, 2)
    expect(JSON.stringify(a.slots)).not.toEqual(JSON.stringify(b.slots))
  })

  it('HP final nunca é negativo e cada slot tem eventos', () => {
    const r = simulateBattle(playerTeam, trainerTeam, 7)
    for (const s of r.slots) {
      expect(s.playerHpEnd).toBeGreaterThanOrEqual(0)
      expect(s.trainerHpEnd).toBeGreaterThanOrEqual(0)
      expect(s.events.length).toBeGreaterThan(0)
    }
  })

  it('vantagem de tipo esmagadora tende a vencer (Water vs Fire)', () => {
    const water = [11, 12, 13, 14, 15].map(i => mk(i, { types: ['Water'], stats: { hp: 70, atk: 100, def: 80, spAtk: 100, spDef: 80, speed: 90 } }))
    const fire = [16, 17, 18, 19, 20].map(i => mk(i, { types: ['Fire'], stats: { hp: 50, atk: 60, def: 60, spAtk: 60, spDef: 60, speed: 50 } }))
    expect(simulateBattle(water, fire, 3).result).toBe('PLAYER_WIN')
  })
})
