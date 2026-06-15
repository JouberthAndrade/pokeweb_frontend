'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { LIGAS, ligaDesbloqueada, ligaConcluida, type Liga } from '@/lib/ligas'
import { TEAM_SIZE } from '@/lib/draftRound'
import { GymLeaderAvatar } from '@/components/ligas/GymLeaderAvatar'

export default function LigasPage() {
  const router = useRouter()
  const ligasCompletas = useGameStore(s => s.ligasCompletas)

  // Guarda de hidratação: o progresso vem do localStorage (persist), então no
  // 1º render (e no SSR) tratamos tudo como "sem progresso" para evitar
  // mismatch; após montar, usamos o estado real.
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])
  const completas = montado ? ligasCompletas : []

  function selecionarLiga(jornada: number) {
    // Começa uma jornada limpa: define a liga e zera o time/draft/travas.
    // Descarta qualquer torneio remanescente (persistido) para que a batalha
    // seja iniciada a partir do time recém-draftado, e não de um time antigo.
    useGameStore.setState({
      jornadaAtual: jornada,
      teamSlots: Array(TEAM_SIZE).fill(null),
      draftCards: [],
      lockedCards: [],
      cartasReveladas: false,
      rerollsDisponíveis: 1,
      torneio: null,
    })
    router.push('/draft')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">⚡ Escolha sua Liga</h2>
        <p className="text-blue-300 text-sm sm:text-base max-w-md mx-auto">
          Vença uma liga para desbloquear a próxima. Cada liga eleva a força dos Pokémon do draft.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {LIGAS.map((liga) => (
          <LigaCard
            key={liga.jornada}
            liga={liga}
            desbloqueada={ligaDesbloqueada(liga.jornada, completas)}
            concluida={ligaConcluida(liga.jornada, completas)}
            onSelecionar={() => selecionarLiga(liga.jornada)}
          />
        ))}
      </div>
    </div>
  )
}

interface LigaCardProps {
  liga: Liga
  desbloqueada: boolean
  concluida: boolean
  onSelecionar: () => void
}

function LigaCard({ liga, desbloqueada, concluida, onSelecionar }: LigaCardProps) {
  return (
    <div
      className="relative group pt-2"
      style={{ '--accent': liga.accent } as React.CSSProperties}
    >
      <button
        type="button"
        disabled={!desbloqueada}
        onClick={onSelecionar}
        className={`
          relative w-full overflow-hidden rounded-2xl p-5 text-left
          min-h-[188px] flex flex-col justify-between
          bg-gradient-to-br ${liga.cor}
          ring-1 ring-white/10 shadow-lg
          transition-all duration-200 ease-out
          ${desbloqueada
            ? 'cursor-pointer group-hover:scale-[1.02] group-hover:ring-2 group-hover:ring-[var(--accent)] group-hover:shadow-[0_12px_40px_-8px_var(--accent)] active:scale-[0.98]'
            : 'cursor-not-allowed grayscale-[0.65] brightness-75'}
          ${concluida ? 'opacity-85' : ''}
        `}
      >
        {/* Topo: emoji + meta */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-4xl drop-shadow-md">{liga.emoji}</span>
          <div className="text-right text-white/85 text-[11px] font-semibold leading-tight">
            <p>{liga.lideres} líderes</p>
            <p className="text-white/65">Força {liga.forca}</p>
          </div>
        </div>

        {/* Título + descrição */}
        <div className="mt-3 pr-20">
          <p className="text-white font-extrabold text-lg leading-tight">{liga.nome}</p>
          <p className="text-white/80 text-xs mt-0.5">Líder {liga.lider}</p>
          <p className="text-white/70 text-xs mt-1.5 leading-snug">{liga.descricao}</p>
        </div>

        {/* Rodapé: região + BST */}
        <div className="mt-3 flex items-center gap-2 pr-20">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/85">
            🗺️ {liga.regiao}
          </span>
          <span className="rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-bold text-white/85">
            BST {liga.bstMin}–{liga.bstMax}
          </span>
        </div>
      </button>

      {/* Avatar do líder — sobreposto à borda inferior direita */}
      <div className="pointer-events-none absolute -bottom-1 right-3 z-20">
        <GymLeaderAvatar
          lider={liga.lider}
          accent={liga.accent}
          className="h-20 w-20 text-2xl transition-all duration-200 group-hover:h-24 group-hover:w-24"
        />
      </div>

      {/* Badge CONCLUÍDA */}
      {concluida && (
        <span className="absolute top-0 right-2 z-30 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/30">
          Concluída ✓
        </span>
      )}

      {/* Overlay de bloqueio */}
      {!desbloqueada && (
        <div className="pointer-events-none absolute inset-0 top-2 z-10 grid place-items-center rounded-2xl bg-black/60 px-6 text-center backdrop-blur-[1px]">
          <div>
            <div className="text-4xl drop-shadow-lg">🔒</div>
            <p className="mt-2 text-xs font-semibold text-white/85">
              Complete a liga anterior para desbloquear
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
