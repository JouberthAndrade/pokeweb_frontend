'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { buildCardPool } from '@/lib/buildCardPool'
import { resolverCaptura, TEAM_SIZE, RODADAS_TOTAL, MAX_LOCKS } from '@/lib/draftRound'
import { getLiga } from '@/lib/ligas'
import { calcularSinergias } from '@/lib/synergies'
import { spritePrincipal, POKEBALL_PLACEHOLDER } from '@/lib/pokemonSprites'
import { PokemonCard } from './PokemonCard'
import { SynergyBadge } from './SynergyBadge'
import type { Pokemon } from '@/store/types'

const CAPTURE_MS = 430
const SPIN_STAGGER = 350   // atraso entre o início do giro de cada carta
const SPIN_BASE_MS = 1600  // duração base do giro (cresce por carta)

export function DraftSlots() {
  const router = useRouter()
  const draftCards = useGameStore(s => s.draftCards)
  const teamSlots = useGameStore(s => s.teamSlots)
  const lockedCards = useGameStore(s => s.lockedCards)
  const cartasReveladas = useGameStore(s => s.cartasReveladas)
  const bannedType = useGameStore(s => s.bannedType)
  const jornadaAtual = useGameStore(s => s.jornadaAtual)
  const pokémoedas = useGameStore(s => s.pokémoedas)
  const rerollsDisponíveis = useGameStore(s => s.rerollsDisponíveis)
  const addToTeam = useGameStore(s => s.addToTeam)
  const revelarCartas = useGameStore(s => s.revelarCartas)
  const gastarPokémoedas = useGameStore(s => s.gastarPokémoedas)

  const [capturandoIdx, setCapturandoIdx] = useState<number | null>(null)
  const [rolando, setRolando] = useState(false)
  const settledRef = useRef(0)   // quantas cartas já pararam de girar
  const targetRef = useRef(0)    // quantas cartas precisam parar (não-travadas)

  const liga = getLiga(jornadaAtual)
  const { bstMin, bstMax } = liga
  const tipoBanido = bannedType ?? undefined

  const capturados = teamSlots.filter(Boolean).length
  const completo = capturados >= TEAM_SIZE
  const rodadaAtual = Math.min(capturados + 1, RODADAS_TOTAL)
  const podeTravar = lockedCards.length < MAX_LOCKS

  const timeMontado = teamSlots.filter(Boolean) as Pokemon[]
  const sinergias = calcularSinergias(timeMontado)

  function gerarNovoPool() {
    useGameStore.setState({
      draftCards: buildCardPool({ bstMin, bstMax, tipoBanido }),
      cartasReveladas: false,
    })
  }

  // Garante um pool inicial (face-down) ao entrar no draft.
  useEffect(() => {
    if (!completo && draftCards.length === 0) gerarNovoPool()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function prefereMenosMovimento() {
    return typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  }

  // Cada PokemonCard chama isto quando para de girar. Quando todas as
  // não-travadas pararem, libera a captura (cartasReveladas).
  function handleSettle() {
    settledRef.current += 1
    if (settledRef.current >= targetRef.current) {
      revelarCartas()
      setRolando(false)
    }
  }

  function handleRevelar() {
    if (cartasReveladas || rolando) return
    let cartas = draftCards
    if (cartas.length === 0) {
      cartas = buildCardPool({ bstMin, bstMax, tipoBanido })
      useGameStore.setState({ draftCards: cartas, cartasReveladas: false })
    }

    // Acessibilidade: sem roleta quando o usuário pede menos movimento.
    if (prefereMenosMovimento()) {
      revelarCartas()
      return
    }

    // Só giram as cartas não-travadas; se todas estão travadas, revela direto.
    settledRef.current = 0
    targetRef.current = cartas.filter(c => !c.locked).length
    if (targetRef.current === 0) {
      revelarCartas()
      return
    }
    setRolando(true)
  }

  function handleReroll() {
    if (rolando) return
    const grátis = rerollsDisponíveis > 0
    if (!grátis && !gastarPokémoedas(30)) return
    const novas = buildCardPool({
      bstMin, bstMax, tipoBanido,
      cartasTravadas: draftCards,
      índicesTravados: lockedCards,
    })
    useGameStore.setState({
      draftCards: novas,
      ...(grátis ? { rerollsDisponíveis: rerollsDisponíveis - 1 } : {}),
    })
  }

  function handleCapturar(i: number) {
    if (capturandoIdx !== null || rolando) return
    const card = draftCards[i]
    const revelada = card.locked || cartasReveladas
    if (!revelada) return

    setCapturandoIdx(i)
    const pokemon = card.pokemon
    setTimeout(() => {
      addToTeam(pokemon)
      const jaCapturados = useGameStore.getState().teamSlots.filter(Boolean).length
      if (jaCapturados >= TEAM_SIZE) {
        useGameStore.setState({ draftCards: [], lockedCards: [], cartasReveladas: false })
      } else {
        const { novasCartas, novosTravados } = resolverCaptura({
          draftCards, lockedCards, índice: i, bstMin, bstMax, tipoBanido,
        })
        useGameStore.setState({ draftCards: novasCartas, lockedCards: novosTravados, cartasReveladas: false })
      }
      settledRef.current = 0
      setCapturandoIdx(null)
    }, CAPTURE_MS)
  }

  const accentStyle = { '--accent': liga.accent } as React.CSSProperties

  return (
    <div className="space-y-4" style={accentStyle}>
      {/* Cabeçalho hierárquico: liga · líder + indicador de rodada */}
      {!completo && (
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-300/70">
              {liga.nome} · Líder {liga.lider}
            </p>
            <div className="flex items-center gap-2">
              {Array.from({ length: RODADAS_TOTAL }).map((_, i) => (
                <span
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i < capturados
                      ? 'h-2.5 w-2.5 bg-[var(--accent)]'
                      : i === capturados
                      ? 'h-3 w-3 bg-[var(--accent)] ring-4 ring-[var(--accent)]/25 shadow-[0_0_10px_var(--accent)]'
                      : 'h-2.5 w-2.5 bg-white/15'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs font-bold text-white/80">
            Rodada {rodadaAtual} <span className="text-white/40">de {RODADAS_TOTAL}</span>
          </span>
        </div>
      )}

      {!completo && (
        <>
          {/* Ações */}
          <div className="flex items-center gap-3 flex-wrap">
            {cartasReveladas && !rolando ? (
              <span className="min-h-[48px] inline-flex items-center gap-2 rounded-xl px-5 py-2.5 bg-[var(--accent)]/15 ring-1 ring-[var(--accent)]/40 text-white font-bold">
                <span>✨</span> Toque numa carta para capturar
              </span>
            ) : (
              <button
                onClick={handleRevelar}
                disabled={rolando}
                className="
                  min-h-[48px] inline-flex items-center gap-2 rounded-xl px-5 py-2.5 cursor-pointer
                  bg-gradient-to-r from-blue-500 to-violet-500
                  hover:from-blue-400 hover:to-violet-400
                  disabled:opacity-60 disabled:cursor-not-allowed
                  text-white font-extrabold shadow-lg shadow-blue-500/30
                  transition-all duration-200 active:scale-95
                "
              >
                <span>🔴</span> {rolando ? 'Capturando…' : 'Capture seu Pokémon'}
              </button>
            )}

            <button
              onClick={handleReroll}
              disabled={rolando || !cartasReveladas || (rerollsDisponíveis === 0 && pokémoedas < 30)}
              title={cartasReveladas ? 'Sortear novas cartas' : 'Revele as cartas antes de rerolar'}
              className="
                min-h-[48px] inline-flex items-center gap-2 rounded-xl px-4 py-2.5 cursor-pointer
                bg-white/5 ring-1 ring-white/10 hover:bg-white/10
                disabled:opacity-40 disabled:cursor-not-allowed
                text-white font-bold transition-all duration-200 active:scale-95
              "
            >
              🔄 Reroll {rerollsDisponíveis === 0 && <span className="text-xs text-white/50">(30🪙)</span>}
            </button>

            {rerollsDisponíveis > 0 && (
              <span className="text-sm text-emerald-300/80 font-medium">
                🎁 {rerollsDisponíveis} reroll{rerollsDisponíveis > 1 ? 's' : ''} gratuito{rerollsDisponíveis > 1 ? 's' : ''} disponíve{rerollsDisponíveis > 1 ? 'is' : 'l'}
              </span>
            )}
          </div>

          {/* Sorteio desta rodada — grid centralizado, cards compactos */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
              {rolando ? 'Girando a roleta…' : cartasReveladas ? 'Escolha uma carta para capturar' : 'Sorteio desta rodada'}
            </h3>
            <div className="mx-auto grid max-w-[520px] grid-cols-3 gap-3 sm:gap-4">
              {draftCards.map((card, i) => (
                <PokemonCard
                  key={`${card.pokemon.id}-${i}`}
                  card={card}
                  índice={i}
                  revealed={card.locked || cartasReveladas}
                  capturando={capturandoIdx === i}
                  podeTravar={podeTravar}
                  rolando={rolando}
                  startDelay={i * SPIN_STAGGER}
                  spinDuration={SPIN_BASE_MS + i * 300}
                  onSettle={handleSettle}
                  onCapturar={() => handleCapturar(i)}
                />
              ))}
            </div>
          </div>

          {/* Sinergias ativas */}
          {sinergias.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">Sinergias Ativas</h3>
              {sinergias.map((b, i) => (
                <SynergyBadge key={i} bonus={b} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Meu time — slots (mais próximo dos cards) */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3 text-center">
          Meu Time — Slots Ocupados
        </h3>
        <div className="rounded-2xl bg-black/30 ring-1 ring-white/10 p-4 sm:p-5">
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {teamSlots.map((p, i) => (
              <TeamSlot key={i} pokemon={p} numero={i + 1} />
            ))}
          </div>
        </div>
      </div>

      {/* Avançar */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <button
          onClick={() => router.push('/battle')}
          disabled={!completo}
          className="
            min-h-[52px] rounded-2xl px-8 py-3 font-extrabold text-lg cursor-pointer
            bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/30
            hover:bg-yellow-300 transition-all duration-200 active:scale-95
            disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none disabled:cursor-not-allowed
          "
        >
          Avançar para as Batalhas ⚔️
        </button>
        <span className="text-xs text-white/40">
          {capturados}/{TEAM_SIZE} Pokémon selecionados
        </span>
      </div>
    </div>
  )
}

function TeamSlot({ pokemon, numero }: { pokemon: Pokemon | null; numero: number }) {
  const [erro, setErro] = useState(false)
  if (!pokemon) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-full border-2 border-dashed border-white/15 text-white/30 text-sm font-bold">
        {numero}
      </div>
    )
  }
  return (
    <div key={pokemon.id} className="animate-slot-pop flex flex-col items-center gap-1">
      <div className="flex aspect-square w-full items-center justify-center rounded-full bg-gradient-to-b from-slate-700 to-slate-900 ring-2 ring-yellow-400/40">
        <img
          src={erro ? POKEBALL_PLACEHOLDER : spritePrincipal(pokemon.id)}
          alt={pokemon.name}
          width={64}
          height={64}
          onError={() => setErro(true)}
          className="h-10 w-10 sm:h-14 sm:w-14 object-contain"
        />
      </div>
      <span className="text-[10px] sm:text-xs font-medium text-white/70 capitalize truncate w-full text-center">
        {pokemon.name}
      </span>
    </div>
  )
}
