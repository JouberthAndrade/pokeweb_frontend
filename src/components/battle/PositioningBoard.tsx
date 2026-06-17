'use client'
import Image from 'next/image'
import { useState } from 'react'
import { spritePrincipal, POKEBALL_PLACEHOLDER } from '@/lib/pokemonSprites'
import type { Pokemon } from '@/store/types'
import type { Adversario } from '@/lib/battle/generateOpponents'
import { useGameStore } from '@/store/gameStore'
import MatchupPanel from './MatchupPanel'
import { TypePill } from '@/components/ui/TypePill'
import { hpDeBatalha } from '@/lib/pokemonStats'
import { calcularSinergias } from '@/lib/synergies'

interface Props {
  ordemPokemon: Pokemon[]
  oponente: Adversario
  mostrarHabilidade: boolean
  onConfirmar: () => void
  rotuloFase: string
  /** Tipos-tema do treinador oponente recebidos do servidor.
   *  Usado nas ligas 3+ (time oculto): substitui as sprites por pílulas de tipo. */
  trainerThemeTypes?: string[]
  /** Time real do oponente (ligas 1–2): quando presente, mostra as sprites do
   *  oponente antes da luta (ocultando só o último), tendo prioridade sobre as pílulas. */
  oponenteTimeReal?: Pokemon[]
  /** Desabilita o botão de confirmar (ex: aguardando resposta do servidor) */
  confirmandoDisabled?: boolean
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
      <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
        {poke.types.map(t => (
          <TypePill key={t} tipo={t} size="xs" />
        ))}
      </div>
      <div className="flex items-center justify-center gap-1 text-[9px] font-extrabold leading-none mt-0.5">
        <span title="Poder (soma dos stats)" className="text-emerald-300">⚡{poke.bst}</span>
        <span title="HP em batalha" className="text-rose-300">❤{hpDeBatalha(poke.stats.hp)}</span>
      </div>
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

export default function PositioningBoard({ ordemPokemon, oponente, mostrarHabilidade, onConfirmar, rotuloFase, trainerThemeTypes, oponenteTimeReal, confirmandoDisabled }: Props) {
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
  // Time exibido como sprites: o real do servidor (ligas 1–2) ou, na ausência de
  // tema (modo offline/local), o gerado no cliente. Ligas 3+ mostram só pílulas.
  const timeExibido = oponenteTimeReal ?? oponente.time
  const mostrarSprites = !!oponenteTimeReal || !trainerThemeTypes?.length
  const ultimoIdx = timeExibido.length - 1
  const tituloOponente = oponente.tipo === 'lider' ? `Líder ${oponente.nome}` : oponente.nome
  // Sinergias do time montado — ganhas no draft, exibidas aqui para o jogador
  // posicionar com elas em mente.
  const sinergias = calcularSinergias(ordemPokemon)

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

        {/* Time do oponente — ligas 1–2: sprites reais (oculta o último);
            ligas 3+: apenas pílulas de tipo (anti-manipulação) */}
        <div className="flex-1">
          <p className="text-xs font-bold text-rose-300 mb-2">🔴 TIME DE {tituloOponente.toUpperCase()}</p>
          {mostrarSprites ? (
            <div className="grid grid-cols-5 sm:grid-cols-3 gap-2">
              {timeExibido.map((p, i) => (
                <CardOponente key={`op-${i}`} poke={p} n={i + 1} oculto={i === ultimoIdx && !revelado} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl ring-1 ring-rose-500/30 bg-rose-500/10 p-4">
              <p className="text-[11px] text-rose-200/80 font-semibold">Tema do oponente:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {trainerThemeTypes!.map(tipo => (
                  <TypePill key={tipo} tipo={tipo} />
                ))}
              </div>
              <p className="text-[10px] text-white/40 mt-1">
                O time real será revelado após a batalha.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sinergias ativas do time (ganhas no draft) */}
      {sinergias.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-bold text-emerald-300 mb-2">✨ SINERGIAS ATIVAS</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {sinergias.map((s, i) => (
              <div
                key={i}
                title={s.descricao}
                className="flex flex-col items-start rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/30 px-3 py-1.5 text-left"
              >
                <span className="text-[11px] font-extrabold text-emerald-200">{s.label}</span>
                <span className="text-[10px] text-emerald-300/70">{s.descricao}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MatchupPanel só disponível quando exibindo sprites do oponente */}
      {mostrarSprites && sel !== null && ordemPokemon[sel] && (
        <div className="mb-4 animate-fade-in">
          <MatchupPanel
            poke={ordemPokemon[sel]}
            oponente={timeExibido[sel] ?? null}
            oponenteOculto={sel === ultimoIdx && !revelado}
          />
        </div>
      )}

      {mostrarSprites && !revelado && (
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
          disabled={confirmandoDisabled}
          className="min-h-[52px] inline-flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold px-8 py-3 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer"
        >
          {confirmandoDisabled ? '⏳ Processando…' : '⚔️ Iniciar confronto'}
        </button>
      </div>
    </div>
  )
}
