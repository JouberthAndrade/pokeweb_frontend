'use client'
import Image from 'next/image'
import { useState } from 'react'
import { spritePrincipal, POKEBALL_PLACEHOLDER } from '@/lib/pokemonSprites'
import { estiloEfetividade } from '@/lib/battle/efetividade'
import type { StatusKind } from '@/lib/battle/types'

const STATUS_ICONE: Record<StatusKind, { icone: string; titulo: string }> = {
  paralysis: { icone: '⚡', titulo: 'Paralisado' },
  burn: { icone: '🔥', titulo: 'Queimado' },
  sleep: { icone: '💤', titulo: 'Dormindo' },
  freeze: { icone: '❄️', titulo: 'Congelado' },
  poison: { icone: '☠️', titulo: 'Envenenado' },
}

interface LadoProps {
  id: number
  nome: string
  hp: number
  hpMax: number
  status: StatusKind | null
  tremendo: boolean
  tick: string | number
  alinhamento: 'left' | 'right'
}

function BarraHp({ hp, hpMax }: { hp: number; hpMax: number }) {
  const pct = Math.max(0, Math.min(100, (hp / hpMax) * 100))
  const cor = pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
      <div className={`h-full ${cor} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function Lado({ id, nome, hp, hpMax, status, tremendo, tick, alinhamento }: LadoProps) {
  const [src, setSrc] = useState(spritePrincipal(id))
  const desmaiado = hp <= 0
  const st = status ? STATUS_ICONE[status] : null
  return (
    <div className={`flex flex-col items-${alinhamento === 'left' ? 'start' : 'end'} gap-2 w-36`}>
      <div className="w-full">
        <div className="flex items-center gap-1">
          <p className="text-xs font-bold text-white/80 truncate">{nome}</p>
          {st && !desmaiado && (
            <span title={st.titulo} className="text-[11px] leading-none" aria-label={st.titulo}>
              {st.icone}
            </span>
          )}
        </div>
        <BarraHp hp={hp} hpMax={hpMax} />
        <p className="text-[10px] text-white/50 mt-0.5">{Math.max(0, hp)}/{hpMax}</p>
      </div>
      <Image
        // remonta a cada golpe crítico para reiniciar o tremor
        key={tremendo ? `shake-${tick}` : 'idle'}
        src={src}
        alt={nome}
        width={112}
        height={112}
        unoptimized
        onError={() => setSrc(POKEBALL_PLACEHOLDER)}
        className={`drop-shadow-lg transition-all duration-300 ${desmaiado ? 'grayscale opacity-40 translate-y-2' : ''} ${tremendo && !desmaiado ? 'animate-hit-shake' : ''} ${alinhamento === 'right' ? '-scale-x-100' : ''}`}
      />
    </div>
  )
}

interface LadoEstado {
  id: number
  nome: string
  hp: number
  hpMax: number
  status?: StatusKind | null
}

export interface FlutuanteInfo {
  actor: 'player' | 'trainer'
  dano: number
  crit: boolean
  missed: boolean
  efetividade: number
}

export interface SlotDuelProps {
  player: LadoEstado
  trainer: LadoEstado
  flutuante?: FlutuanteInfo | null
  tick?: string | number
}

export default function SlotDuel({ player, trainer, flutuante, tick = 0 }: SlotDuelProps) {
  const estilo = flutuante ? estiloEfetividade(flutuante.efetividade) : null
  // O dano aparece sobre o DEFENSOR (lado oposto ao atacante).
  const ladoDefensor = flutuante?.actor === 'player' ? 'right' : 'left'
  const critNoPlayer = !!flutuante?.crit && flutuante.actor === 'trainer' && !flutuante.missed
  const critNoTrainer = !!flutuante?.crit && flutuante.actor === 'player' && !flutuante.missed

  let texto = ''
  if (flutuante && estilo) {
    if (flutuante.missed) texto = 'Errou!'
    else if (flutuante.dano > 0) texto = `-${flutuante.dano}`
    else texto = estilo.rotulo ?? '0'
  }
  const mostrarRotulo =
    !!flutuante && !!estilo && !flutuante.missed && flutuante.dano > 0 && estilo.nivel !== 'neutro'

  return (
    <div className="relative flex items-end justify-between gap-4 px-2 py-6">
      <Lado
        key={`p-${player.id}`}
        id={player.id}
        nome={player.nome}
        hp={player.hp}
        hpMax={player.hpMax}
        status={player.status ?? null}
        tremendo={critNoPlayer}
        tick={tick}
        alinhamento="left"
      />
      <div className="text-2xl font-black text-white/40 self-center">VS</div>
      <Lado
        key={`t-${trainer.id}`}
        id={trainer.id}
        nome={trainer.nome}
        hp={trainer.hp}
        hpMax={trainer.hpMax}
        status={trainer.status ?? null}
        tremendo={critNoTrainer}
        tick={tick}
        alinhamento="right"
      />
      {flutuante && estilo && (
        <div
          key={`flut-${tick}`}
          className={`absolute top-1 ${ladoDefensor === 'right' ? 'right-1/4' : 'left-1/4'} flex flex-col items-center animate-dmg-pop`}
        >
          <span className={`font-black drop-shadow ${estilo.cor}`} style={{ fontSize: `${1.4 * estilo.escala}rem` }}>
            {texto}
          </span>
          {flutuante.crit && !flutuante.missed && (
            <span className="text-[10px] font-black text-amber-300 -mt-1">CRÍTICO!</span>
          )}
          {mostrarRotulo && (
            <span className={`text-[10px] font-bold -mt-0.5 ${estilo.cor}`}>{estilo.rotulo}</span>
          )}
        </div>
      )}
    </div>
  )
}
