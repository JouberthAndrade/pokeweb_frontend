/**
 * @legacy PRODUCTION battles are now resolved server-side via POST /battle/session
 * + POST /battle/position (see src/store/gameStore.ts — iniciarSessaoBatalha /
 * confirmarPosicao). This module is kept for unit tests only. Do NOT use
 * simulateBattle() in the production battle flow.
 */
import type { Pokemon } from '@/store/types'
import type { BattleOutcome, RoundEvent, SlotResult, Actor } from './types'
import { mulberry32 } from './rng'
import { getTypeEffectiveness } from './typeChart'

const MAX_ROUNDS = 50

function nivel(bst: number): number {
  return Math.min(100, Math.max(1, Math.round(bst / 6)))
}
function maxHp(hp: number): number {
  return Math.floor(hp * 2 + 110)
}

interface Lutador {
  poke: Pokemon
  nivel: number
  hpMax: number
  hp: number
  moveType: string
  fisico: boolean
}

function montar(poke: Pokemon): Lutador {
  const hpMax = maxHp(poke.stats.hp)
  return {
    poke,
    nivel: nivel(poke.bst),
    hpMax,
    hp: hpMax,
    moveType: poke.types[0],
    fisico: poke.stats.atk >= poke.stats.spAtk,
  }
}

function golpear(
  round: number,
  actor: Actor,
  atk: Lutador,
  def: Lutador,
  rng: () => number,
  eventos: RoundEvent[],
): void {
  const power = 60
  const atkStat = atk.fisico ? atk.poke.stats.atk : atk.poke.stats.spAtk
  const defStat = atk.fisico ? def.poke.stats.def : def.poke.stats.spDef
  let dano = ((2 * atk.nivel) / 5 + 2) * power * (atkStat / defStat) / 50 + 2
  if (atk.poke.types.includes(atk.moveType)) dano *= 1.5
  const efetividade = getTypeEffectiveness(atk.moveType, def.poke.types)
  dano *= efetividade
  const crit = rng() < 0.0625
  if (crit) dano *= 1.5
  dano *= (85 + Math.floor(rng() * 16)) / 100
  const final = Math.max(0, Math.floor(dano))
  def.hp = Math.max(0, def.hp - final)
  eventos.push({
    round,
    actor,
    move: `${atk.moveType} Attack`,
    damage: final,
    crit,
    effectiveness: efetividade,
    missed: false,
    statusInflicted: null,
    drainHeal: 0,
    recoil: 0,
    attackerHpAfter: atk.hp,
    defenderHpAfter: def.hp,
  })
}

function resolverSlot(slot: number, p: Lutador, t: Lutador, rng: () => number): SlotResult {
  const eventos: RoundEvent[] = []
  let round = 0
  while (p.hp > 0 && t.hp > 0 && round < MAX_ROUNDS) {
    round += 1
    const playerFirst = p.poke.stats.speed >= t.poke.stats.speed
    const ordem: Array<[Actor, Lutador, Lutador]> = playerFirst
      ? [['player', p, t], ['trainer', t, p]]
      : [['trainer', t, p], ['player', p, t]]
    for (const [label, a, d] of ordem) {
      if (a.hp <= 0 || d.hp <= 0) break
      golpear(round, label, a, d, rng, eventos)
    }
  }
  let winner: Actor
  if (t.hp <= 0 && p.hp > 0) winner = 'player'
  else if (p.hp <= 0 && t.hp > 0) winner = 'trainer'
  else if (p.hp <= 0 && t.hp <= 0) winner = 'player'
  else winner = p.hp / p.hpMax >= t.hp / t.hpMax ? 'player' : 'trainer'
  return {
    slot,
    winner,
    rounds: round,
    playerPokemonId: p.poke.id,
    trainerPokemonId: t.poke.id,
    playerHpEnd: Math.max(0, p.hp),
    trainerHpEnd: Math.max(0, t.hp),
    events: eventos,
  }
}

export function simulateBattle(
  playerTeam: Pokemon[],
  opponentTeam: Pokemon[],
  seed: number,
): BattleOutcome {
  const rng = mulberry32(seed)
  const slots: SlotResult[] = []
  let placarJogador = 0
  for (let i = 0; i < 5; i++) {
    const r = resolverSlot(i + 1, montar(playerTeam[i]), montar(opponentTeam[i]), rng)
    slots.push(r)
    if (r.winner === 'player') placarJogador += 1
  }
  return {
    result: placarJogador >= 3 ? 'PLAYER_WIN' : 'TRAINER_WIN',
    score: { player: placarJogador, trainer: 5 - placarJogador },
    slots,
    synergyBundle: { activeSynergies: [] },
  }
}
