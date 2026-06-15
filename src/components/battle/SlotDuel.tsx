'use client'
import Image from 'next/image'
import { useState } from 'react'
import { spritePrincipal, POKEBALL_PLACEHOLDER } from '@/lib/pokemonSprites'

interface LadoProps {
  id: number
  nome: string
  hp: number
  hpMax: number
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

function Lado({ id, nome, hp, hpMax, alinhamento }: LadoProps) {
  const [src, setSrc] = useState(spritePrincipal(id))
  const desmaiado = hp <= 0
  return (
    <div className={`flex flex-col items-${alinhamento === 'left' ? 'start' : 'end'} gap-2 w-36`}>
      <div className="w-full">
        <p className="text-xs font-bold text-white/80 truncate">{nome}</p>
        <BarraHp hp={hp} hpMax={hpMax} />
        <p className="text-[10px] text-white/50 mt-0.5">{Math.max(0, hp)}/{hpMax}</p>
      </div>
      <Image
        src={src}
        alt={nome}
        width={112}
        height={112}
        unoptimized
        onError={() => setSrc(POKEBALL_PLACEHOLDER)}
        className={`drop-shadow-lg transition-all duration-300 ${desmaiado ? 'grayscale opacity-40 translate-y-2' : ''} ${alinhamento === 'right' ? '-scale-x-100' : ''}`}
      />
    </div>
  )
}

export interface SlotDuelProps {
  player: { id: number; nome: string; hp: number; hpMax: number }
  trainer: { id: number; nome: string; hp: number; hpMax: number }
  flutuante?: { actor: 'player' | 'trainer'; texto: string; cor: string } | null
}

export default function SlotDuel({ player, trainer, flutuante }: SlotDuelProps) {
  return (
    <div className="relative flex items-end justify-between gap-4 px-2 py-6">
      <Lado id={player.id} nome={player.nome} hp={player.hp} hpMax={player.hpMax} alinhamento="left" />
      <div className="text-2xl font-black text-white/40 self-center">VS</div>
      <Lado id={trainer.id} nome={trainer.nome} hp={trainer.hp} hpMax={trainer.hpMax} alinhamento="right" />
      {flutuante && (
        <div
          className={`absolute top-2 ${flutuante.actor === 'player' ? 'right-1/3' : 'left-1/3'} text-lg font-black ${flutuante.cor} animate-bounce`}
        >
          {flutuante.texto}
        </div>
      )}
    </div>
  )
}
