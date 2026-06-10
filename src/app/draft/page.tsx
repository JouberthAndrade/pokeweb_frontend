import Link from 'next/link'
import { DraftSlots } from '@/components/draft/DraftSlots'
import { TEAM_SIZE } from '@/lib/draftRound'

export default function DraftPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
            Jornada — Selecione {TEAM_SIZE} Pokémon
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Monte seu Time 🏆</h2>
        </div>
        <Link
          href="/"
          className="shrink-0 min-h-[40px] inline-flex items-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-white/80 text-sm font-bold px-4 transition-all active:scale-95"
        >
          ← Jornadas
        </Link>
      </div>
      <DraftSlots />
    </div>
  )
}
