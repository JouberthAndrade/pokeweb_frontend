'use client'
import Image from 'next/image'
import { useState } from 'react'
import { spritePrincipal, POKEBALL_PLACEHOLDER } from '@/lib/pokemonSprites'
import type { Pokemon } from '@/store/types'
import type { Adversario } from '@/lib/battle/generateOpponents'
import { useGameStore } from '@/store/gameStore'
import MatchupPanel from './MatchupPanel'

interface Props {
  ordemPokemon: Pokemon[]
  oponente: Adversario
  mostrarHabilidade: boolean
  onConfirmar: () => void
  rotuloFase: string
}

const CUSTO_REVELAR = 20

function CardJogador({
  poke,
  n,
  selecionado,
  onClick,
}: {
  poke: Pokemon
  n: number
  selecionado: boolean
  onClick: () => void
}) {
  const [src, setSrc] = useState(spritePrincipal(poke.id))
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center rounded-2xl p-2 ring-2 transition-all cursor-pointer ${selecionado ? 'ring-amber-400 bg-amber-400/10 scale-105' : 'ring-white/10 bg-white/5 hover:bg-white/10'}`}
    >
      <span className="text-[10px] font-bold text-white/50">{n}º</span>
      <Image src={src} alt={poke.name} width={56} height={56} unoptimized onError={() => setSrc(POKEBALL_PLACEHOLDER)} />
      <span className="text-[11px] font-bold text-white/80 truncate w-16">{poke.name}</span>
      <span className="text-[10px] font-bold text-amber-300/80">⚡ {poke.bst}</span>
    </button>
  )
}

function CardOponente({ poke, n, oculto }: { poke: Pokemon; n: number; oculto: boolean }) {
  const [src, setSrc] = useState(spritePrincipal(poke.id))
  return (
    <div
      className={`flex flex-col items-center rounded-2xl p-2 ring-2 transition-all ${oculto ? 'ring-rose-500/30 bg-rose-500/10' : 'ring-white/10 bg-white/5'}`}
    >
      <span className="text-[10px] font-bold text-white/50">{n}º</span>
      {oculto ? (
        <div className="w-14 h-14 flex items-center justify-center text-3xl font-black text-rose-300/70">?</div>
      ) : (
        <Image src={src} alt={poke.name} width={56} height={56} unoptimized onError={() => setSrc(POKEBALL_PLACEHOLDER)} />
      )}
      <span className="text-[11px] font-bold text-white/80 truncate w-16">{oculto ? '???' : poke.name}</span>
      <span className="text-[10px] font-bold text-amber-300/80">⚡ {oculto ? '???' : poke.bst}</span>
    </div>
  )
}

export default function PositioningBoard({ ordemPokemon, oponente, mostrarHabilidade, onConfirmar, rotuloFase }: Props) {
  const [sel, setSel] = useState<number | null>(null)
  const [revelado, setRevelado] = useState(false)
  const trocarSlots = useGameStore(s => s.trocarSlots)
  const gastarPokémoedas = useGameStore(s => s.gastarPokémoedas)
  const pokémoedas = useGameStore(s => s.pokémoedas)
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

  function revelar() {
    if (revelado) return
    if (gastarPokémoedas(CUSTO_REVELAR)) setRevelado(true)
  }

  const inicial = faseAtual === 1
  const custoProxima = inicial ? 'livre' : trocaGratisUsada ? '1 ⚡' : 'grátis'
  const ultimoIdx = oponente.time.length - 1
  const tituloOponente = oponente.tipo === 'lider' ? `Líder ${oponente.nome}` : oponente.nome

  return (
    <div className="w-full max-w-3xl mx-auto text-center">
      <h3 className="text-lg font-extrabold text-white">{rotuloFase} — Posicione seu time</h3>
      <p className="text-xs text-blue-300 mb-1">A ordem importa: o 1º luta com o 1º do adversário.</p>
      <p className="text-[11px] text-white/60 mb-4">
        Toque em <b>dois Pokémon</b> do seu time para trocar as posições · Trocas:{' '}
        <b>{custoProxima}</b>
        {!inicial && <> · Faíscas: {faíscas} ⚡</>}
      </p>

      {mostrarHabilidade && oponente.habilidadeGinasio && (
        <div className="mb-4 rounded-xl bg-violet-500/15 ring-1 ring-violet-400/30 px-4 py-2 text-sm text-violet-200">
          🏛️ <b>Habilidade do Ginásio:</b> {oponente.habilidadeGinasio}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        {/* Seu time */}
        <div className="flex-1">
          <p className="text-xs font-bold text-amber-300 mb-2">🟡 SEU TIME — toque para reordenar</p>
          <div className="grid grid-cols-5 sm:grid-cols-3 gap-2">
            {ordemPokemon.map((p, i) => (
              <CardJogador key={p.id} poke={p} n={i + 1} selecionado={sel === i} onClick={() => clicar(i)} />
            ))}
          </div>
        </div>

        {/* Time do oponente */}
        <div className="flex-1">
          <p className="text-xs font-bold text-rose-300 mb-2">🔴 TIME DE {tituloOponente.toUpperCase()}</p>
          <div className="grid grid-cols-5 sm:grid-cols-3 gap-2">
            {oponente.time.map((p, i) => (
              <CardOponente key={`op-${i}`} poke={p} n={i + 1} oculto={i === ultimoIdx && !revelado} />
            ))}
          </div>
        </div>
      </div>

      {sel !== null && ordemPokemon[sel] && (
        <div className="mb-4 animate-fade-in">
          <MatchupPanel
            poke={ordemPokemon[sel]}
            oponente={oponente.time[sel] ?? null}
            oponenteOculto={sel === ultimoIdx && !revelado}
          />
        </div>
      )}

      {!revelado && (
        <div className="mb-4">
          <button
            onClick={revelar}
            disabled={pokémoedas < CUSTO_REVELAR}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500/20 ring-1 ring-sky-400/40 hover:bg-sky-500/30 disabled:opacity-40 disabled:cursor-not-allowed text-sky-100 font-bold px-5 py-2 transition-all cursor-pointer"
          >
            🔎 Revelar Pokémon Secreto ({CUSTO_REVELAR} 🪙)
          </button>
          <p className="text-[11px] text-white/40 mt-1">Você tem {pokémoedas} 🪙</p>
        </div>
      )}

      <div>
        <button
          onClick={onConfirmar}
          className="min-h-[52px] inline-flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold px-8 py-3 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer"
        >
          ⚔️ Iniciar confronto
        </button>
      </div>
    </div>
  )
}
