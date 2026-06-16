'use client'
import { useEffect, useRef, useState } from 'react'
import { TypePill } from '@/components/ui/TypePill'
import { useGameStore } from '@/store/gameStore'
import { spriteFallbackChain, spritesRoleta, spritePrincipal, POKEBALL_PLACEHOLDER } from '@/lib/pokemonSprites'
import { hpDeBatalha } from '@/lib/pokemonStats'
import { PokemonInfoPanel } from './PokemonInfoPanel'
import type { DraftCard } from '@/store/types'

// Altura de cada item da fita (= diâmetro da janela). Combina com o style inline.
const ITEM_H = 96

interface PokemonCardProps {
  card: DraftCard
  índice: number
  revealed: boolean      // locked || cartasReveladas — habilita a captura
  capturando: boolean    // tocando a animação de saída
  podeTravar: boolean    // ainda há trava disponível (ou esta já está travada)
  rolando: boolean       // roleta global ativa nesta rodada
  startDelay: number     // atraso (ms) antes desta carta começar a girar (stagger)
  spinDuration: number   // duração (ms) do giro desta carta
  onSettle: () => void   // callback quando esta carta para de girar
  onCapturar: () => void
}

export function PokemonCard({
  card, índice, revealed, capturando, podeTravar,
  rolando, startDelay, spinDuration, onSettle, onCapturar,
}: PokemonCardProps) {
  const lockCard = useGameStore(s => s.lockCard)
  const unlockCard = useGameStore(s => s.unlockCard)
  const { pokemon, locked } = card

  const fontes = spriteFallbackChain(pokemon.id)
  const [fonteIdx, setFonteIdx] = useState(0)
  const srcAtual = fonteIdx < fontes.length ? fontes[fonteIdx] : POKEBALL_PLACEHOLDER

  const [settled, setSettled] = useState(false)
  const [reel, setReel] = useState<string[]>([])
  const [hover, setHover] = useState(false)
  const [infoFixado, setInfoFixado] = useState(false)
  const stripRef = useRef<HTMLDivElement>(null)
  const onSettleRef = useRef(onSettle)
  onSettleRef.current = onSettle

  // Cartas travadas NÃO giram: já aparecem reveladas com borda dourada.
  const girando = rolando && !settled && !locked
  // Mostra a frente sempre que estiver girando ou já decidida.
  const mostrandoFrente = locked || revealed || settled || girando
  // Estado final (Pokémon definitivo visível, sem giro).
  const final = !girando && (locked || revealed || settled)
  // Borda dourada de "revelado" (igual à referência).
  const douradoRevelado = !locked && (settled || (revealed && !girando))

  // ===== Engine da roleta — fita vertical de sprites com easing em 2 fases ====
  useEffect(() => {
    if (!rolando || locked) return
    setSettled(false)

    // Monta a fita: muitos aleatórios + o Pokémon final ao fim.
    const pool = spritesRoleta(30)
    const SPIN_ITEMS = 18 + índice * 4 // mais itens = giro mais longo nas cartas seguintes
    const urls: string[] = []
    for (let k = 0; k < SPIN_ITEMS; k++) urls.push(pool[k % pool.length])
    urls.push(spritePrincipal(pokemon.id))
    setReel(urls)

    const finalPos = -(urls.length - 1) * ITEM_H
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)
    const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

    let raf = 0
    let cancelado = false
    let animStart: number | null = null
    let waitStart: number | null = null

    const frame = (now: number) => {
      if (cancelado) return
      // Espera o stagger antes de iniciar o giro desta carta.
      if (animStart === null) {
        if (waitStart === null) waitStart = now
        if (now - waitStart < startDelay) { raf = requestAnimationFrame(frame); return }
        animStart = now
      }
      const progress = Math.min((now - animStart) / spinDuration, 1)
      // Fase rápida (60%) → fase de desaceleração (40%), aterrissando no final.
      const y = progress < 0.6
        ? finalPos * 0.5 * easeInOutQuad(progress / 0.6)
        : finalPos * 0.5 + finalPos * 0.5 * easeOutQuart((progress - 0.6) / 0.4)
      if (stripRef.current) stripRef.current.style.transform = `translateY(${y}px)`

      if (progress < 1) {
        raf = requestAnimationFrame(frame)
      } else {
        if (stripRef.current) stripRef.current.style.transform = `translateY(${finalPos}px)`
        setSettled(true)
        onSettleRef.current()
      }
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelado = true; cancelAnimationFrame(raf) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolando])

  // Cartas travadas não refazem o flip a cada rodada.
  const flipDelay = locked ? '0ms' : `${índice * 130}ms`

  // Painel de inspeção (stats + fraquezas): só no estado final do card.
  const infoAberto = final && (hover || infoFixado)
  // Abre ao lado do card; a última carta (3 por rodada) abre à esquerda p/ não sair da tela.
  const abrirAEsquerda = índice >= 2

  return (
    <div
      className={`relative w-full max-w-[160px] mx-auto [perspective:1000px] ${infoAberto ? 'z-50' : ''} ${capturando ? 'animate-capture' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="relative h-full transition-transform duration-500 ease-out [transform-style:preserve-3d]"
        style={{
          transform: mostrandoFrente ? 'rotateY(0deg)' : 'rotateY(180deg)',
          transitionDelay: flipDelay,
        }}
      >
        {/* ===== FRENTE ===== */}
        <div
          onClick={revealed && !girando ? onCapturar : undefined}
          className={`
            [backface-visibility:hidden] relative rounded-2xl border-2 p-3
            min-h-[232px] flex flex-col items-center justify-center text-center select-none
            bg-gradient-to-b from-slate-800 to-slate-900
            transition-colors duration-200
            ${revealed && !girando ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default'}
            ${locked
              ? 'border-yellow-400 animate-pulse-gold ring-1 ring-yellow-300/60'
              : douradoRevelado
              ? 'border-yellow-400/80 animate-reveal-flash'
              : girando
              ? 'border-blue-500/60 shadow-[0_0_20px_rgba(96,124,255,0.25)]'
              : 'border-white/10 hover:border-blue-400/70 hover:shadow-xl hover:shadow-blue-500/10'
            }
          `}
        >
          {/* Botão de trava (oculto durante o giro) */}
          {!girando && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                locked ? unlockCard(índice) : lockCard(índice)
              }}
              disabled={!locked && !podeTravar}
              title={locked ? 'Destravar carta' : podeTravar ? 'Travar carta' : 'Limite de travas atingido'}
              className={`
                absolute top-2 right-2 z-10 min-h-[32px] min-w-[44px] text-xs px-2 py-1 rounded-full font-bold
                transition-all duration-200 active:scale-90 cursor-pointer
                ${locked
                  ? 'bg-yellow-400 text-slate-900 shadow-md'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed'
                }
              `}
            >
              {locked ? '🔒' : '🔓'}
            </button>
          )}

          {/* #id */}
          <span className="absolute top-3 left-3 text-[11px] font-mono text-white/40">
            {girando ? '' : `#${String(pokemon.id).padStart(3, '0')}`}
          </span>

          {/* Botão de inspeção (stats + fraquezas) */}
          {final && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setInfoFixado(v => !v)
              }}
              title="Ver stats e fraquezas"
              aria-label="Ver stats e fraquezas"
              className={`absolute bottom-2 right-2 z-10 h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${infoFixado ? 'bg-sky-400 text-slate-900' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            >
              ⓘ
            </button>
          )}

          {girando ? (
            /* ===== Janela da roleta com fita rolando ===== */
            <div
              className="roulette-window mx-auto overflow-hidden rounded-full border-2 border-white/10"
              style={{ width: ITEM_H, height: ITEM_H, background: 'rgba(96,124,255,0.08)' }}
            >
              <div ref={stripRef} className="flex flex-col items-center will-change-transform" style={{ width: ITEM_H }}>
                {reel.map((url, k) => (
                  <div
                    key={k}
                    className="flex shrink-0 items-center justify-center"
                    style={{ width: ITEM_H, height: ITEM_H }}
                  >
                    <img
                      src={url}
                      alt=""
                      aria-hidden="true"
                      className="h-[72px] w-[72px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Sprite final */}
              <div className="my-1 flex h-24 w-24 items-center justify-center rounded-full bg-black/30">
                <img
                  src={srcAtual}
                  alt={pokemon.name}
                  width={112}
                  height={112}
                  loading="lazy"
                  onError={() => setFonteIdx(i => i + 1)}
                  className="h-20 w-20 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                />
              </div>

              {/* Nome */}
              <p className="font-extrabold text-sm text-white capitalize leading-tight line-clamp-1 w-full">
                {pokemon.name}
              </p>

              {/* Tipos */}
              <div className="flex flex-wrap justify-center gap-1 mt-1.5">
                <TypePill tipo={pokemon.types[0]} />
                {pokemon.types[1] && <TypePill tipo={pokemon.types[1]} />}
              </div>

              {/* FORÇA (BST) + HP de batalha */}
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <div
                  title="Força (soma dos stats)"
                  className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 ring-1 ring-emerald-400/20"
                >
                  <span className="text-amber-400 text-xs">⚡</span>
                  <span className="text-sm font-extrabold text-emerald-200">{pokemon.bst}</span>
                </div>
                <div
                  title="HP em batalha"
                  className="flex items-center gap-1 rounded-lg bg-rose-500/10 px-2 py-1 ring-1 ring-rose-400/20"
                >
                  <span className="text-rose-300 text-xs">❤️</span>
                  <span className="text-sm font-extrabold text-rose-200">{hpDeBatalha(pokemon.stats.hp)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ===== VERSO (por revelar) ===== */}
        <div
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]
            rounded-2xl border-2 border-white/10 bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950
            flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="relative h-16 w-16 rounded-full border-4 border-white/20 overflow-hidden opacity-70">
            <div className="absolute top-0 left-0 h-1/2 w-full bg-red-500/60" />
            <div className="absolute top-1/2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-200 ring-4 ring-slate-900" />
          </div>
        </div>
      </div>

      {/* Painel de inspeção — popover ao lado do card (desktop) */}
      {infoAberto && (
        <div
          data-testid="info-popover"
          className={`hidden sm:block absolute top-0 z-40 w-64 rounded-2xl bg-slate-900/95 ring-1 ring-white/10 p-3 shadow-xl animate-fade-in ${abrirAEsquerda ? 'right-full mr-3' : 'left-full ml-3'}`}
        >
          <PokemonInfoPanel pokemon={pokemon} />
        </div>
      )}

      {/* Painel de inspeção — bottom-sheet no mobile (via botão ⓘ) */}
      {final && infoFixado && (
        <div className="sm:hidden">
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setInfoFixado(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-slate-900 ring-1 ring-white/10 p-4 animate-slide-up">
            <div className="flex justify-end mb-1">
              <button
                onClick={() => setInfoFixado(false)}
                className="text-white/60 text-sm font-bold px-2 py-1 cursor-pointer"
              >
                Fechar ✕
              </button>
            </div>
            <PokemonInfoPanel pokemon={pokemon} />
          </div>
        </div>
      )}
    </div>
  )
}
