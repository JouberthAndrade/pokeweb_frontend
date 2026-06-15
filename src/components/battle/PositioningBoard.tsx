'use client'
import Image from 'next/image'
import { useState } from 'react'
import { spritePrincipal, POKEBALL_PLACEHOLDER } from '@/lib/pokemonSprites'
import type { Pokemon } from '@/store/types'
import { useGameStore } from '@/store/gameStore'

interface Props {
  ordemPokemon: Pokemon[]
  habilidadeGinasio?: string
  onConfirmar: () => void
  rotuloFase: string
}

function Slot({ poke, n, selecionado, onClick }: { poke: Pokemon; n: number; selecionado: boolean; onClick: () => void }) {
  const [src, setSrc] = useState(spritePrincipal(poke.id))
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center rounded-2xl p-2 ring-2 transition-all cursor-pointer ${selecionado ? 'ring-amber-400 bg-amber-400/10 scale-105' : 'ring-white/10 bg-white/5 hover:bg-white/10'}`}
    >
      <span className="text-[10px] font-bold text-white/50">#{n}</span>
      <Image src={src} alt={poke.name} width={64} height={64} unoptimized onError={() => setSrc(POKEBALL_PLACEHOLDER)} />
      <span className="text-[11px] font-bold text-white/80 truncate w-16">{poke.name}</span>
    </button>
  )
}

export default function PositioningBoard({ ordemPokemon, habilidadeGinasio, onConfirmar, rotuloFase }: Props) {
  const [sel, setSel] = useState<number | null>(null)
  const trocarSlots = useGameStore(s => s.trocarSlots)
  const faíscas = useGameStore(s => s.faíscas)
  const faseAtual = useGameStore(s => s.torneio?.faseAtual ?? 1)
  const trocaGratisUsada = useGameStore(s => s.torneio?.trocaGratisUsada ?? false)

  function clicar(i: number) {
    if (sel === null) {
      setSel(i)
      return
    }
    if (sel === i) {
      setSel(null)
      return
    }
    trocarSlots(sel, i)
    setSel(null)
  }

  const inicial = faseAtual === 1
  const custoProxima = inicial ? 'livre' : trocaGratisUsada ? '1 ⚡' : 'grátis'

  return (
    <div className="w-full max-w-xl mx-auto text-center">
      <h3 className="text-lg font-extrabold text-white">{rotuloFase} — Posicione seu time</h3>
      <p className="text-xs text-blue-300 mb-1">A ordem importa: slot 1 luta com o slot 1 do adversário.</p>
      <p className="text-[11px] text-white/60 mb-1">
        Toque em <b>dois Pokémon</b> para trocar as posições.
      </p>
      <p className="text-[11px] text-white/50 mb-4">
        {inicial
          ? 'Posicionamento inicial: trocas livres.'
          : <>Próxima troca: <b>{custoProxima}</b> · Faíscas: {faíscas} ⚡</>}
      </p>

      {habilidadeGinasio && (
        <div className="mb-4 rounded-xl bg-violet-500/15 ring-1 ring-violet-400/30 px-4 py-2 text-sm text-violet-200">
          🏛️ <b>Habilidade do Ginásio:</b> {habilidadeGinasio}
        </div>
      )}

      <div className="grid grid-cols-5 gap-2 mb-6">
        {ordemPokemon.map((p, i) => (
          <Slot key={p.id} poke={p} n={i + 1} selecionado={sel === i} onClick={() => clicar(i)} />
        ))}
      </div>

      <button
        onClick={onConfirmar}
        className="min-h-[52px] inline-flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold px-8 py-3 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer"
      >
        ⚔️ Iniciar confronto
      </button>
    </div>
  )
}
