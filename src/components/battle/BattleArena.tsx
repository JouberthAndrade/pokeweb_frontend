'use client'
import { useEffect, useRef, useState } from 'react'
import type { BattleOutcome, StatusKind } from '@/lib/battle/types'
import type { Pokemon } from '@/store/types'
import SlotDuel from './SlotDuel'

interface Props {
  outcome: BattleOutcome
  playerTeam: Pokemon[]
  opponentTeam: Pokemon[]
  onFim: () => void
}

const PASSO_MS = 700

function maxHp(hp: number) {
  return Math.floor(hp * 2 + 110)
}

export default function BattleArena({ outcome, playerTeam, opponentTeam, onFim }: Props) {
  const [slotIdx, setSlotIdx] = useState(0)
  const [eventoIdx, setEventoIdx] = useState(0)
  const [acelerar, setAcelerar] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const slot = outcome.slots[slotIdx]
  const pPoke = playerTeam[slotIdx]
  const tPoke = opponentTeam[slotIdx]
  const eventosAteAgora = slot.events.slice(0, eventoIdx + 1)
  const ultimo = eventosAteAgora[eventosAteAgora.length - 1]

  const pHpMax = maxHp(pPoke.stats.hp)
  const tHpMax = maxHp(tPoke.stats.hp)
  let pHp = pHpMax
  let tHp = tHpMax
  let pStatus: StatusKind | null = null
  let tStatus: StatusKind | null = null
  for (const e of eventosAteAgora) {
    if (e.actor === 'player') {
      tHp = e.defenderHpAfter
      if (e.statusInflicted) tStatus = e.statusInflicted
    } else {
      pHp = e.defenderHpAfter
      if (e.statusInflicted) pStatus = e.statusInflicted
    }
  }

  useEffect(() => {
    timer.current = setTimeout(() => {
      if (eventoIdx < slot.events.length - 1) {
        setEventoIdx(i => i + 1)
      } else if (slotIdx < outcome.slots.length - 1) {
        setSlotIdx(i => i + 1)
        setEventoIdx(0)
      } else {
        onFim()
      }
    }, acelerar ? 120 : PASSO_MS)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [slotIdx, eventoIdx, acelerar, slot.events.length, outcome.slots.length, onFim])

  const flutuante = ultimo
    ? {
        actor: ultimo.actor,
        dano: ultimo.damage,
        crit: ultimo.crit,
        missed: ultimo.missed,
        efetividade: ultimo.effectiveness,
      }
    : null

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl bg-slate-900/70 ring-1 ring-white/10 p-4">
      <div className="flex items-center justify-between mb-2 text-xs text-white/60">
        <span>Confronto {slot.slot}/5</span>
        <button
          onClick={() => setAcelerar(a => !a)}
          className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1 font-bold text-white transition-colors cursor-pointer"
        >
          {acelerar ? '▶ Normal' : '⏩ Acelerar'}
        </button>
      </div>
      <SlotDuel
        player={{ id: pPoke.id, nome: pPoke.name, hp: pHp, hpMax: pHpMax, status: pStatus }}
        trainer={{ id: tPoke.id, nome: tPoke.name, hp: tHp, hpMax: tHpMax, status: tStatus }}
        flutuante={flutuante}
        tick={`${slotIdx}:${eventoIdx}`}
      />
      <div className="mt-2 flex justify-center gap-1">
        {outcome.slots.map((s, i) => (
          <span
            key={s.slot}
            className={`h-1.5 w-8 rounded-full ${i < slotIdx ? (s.winner === 'player' ? 'bg-emerald-500' : 'bg-rose-500') : i === slotIdx ? 'bg-white/60' : 'bg-white/15'}`}
          />
        ))}
      </div>
    </div>
  )
}
