'use client'
import { TypePill } from '@/components/ui/TypePill'
import { perfilDefensivo, matchupContra, type EntradaMatchup } from '@/lib/battle/matchup'
import type { Pokemon } from '@/store/types'

function fmtMult(m: number): string {
  return `${m}×`
}

function LinhaTipos({
  titulo,
  entradas,
  corMult,
}: {
  titulo: string
  entradas: EntradaMatchup[]
  corMult: string
}) {
  if (entradas.length === 0) return null
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] font-bold text-white/40 w-16 shrink-0 pt-0.5 uppercase">{titulo}</span>
      <div className="flex flex-wrap gap-1">
        {entradas.map(e => (
          <span key={e.tipo} className="inline-flex items-center gap-0.5">
            <TypePill tipo={e.tipo} />
            <span className={`text-[10px] font-extrabold ${corMult}`}>{fmtMult(e.mult)}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

const BADGE_VANTAGEM = {
  vantagem: { txt: '▲ Vantagem', cls: 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/40' },
  equilibrio: { txt: '＝ Equilíbrio', cls: 'bg-white/10 text-white/70 ring-white/20' },
  desvantagem: { txt: '▼ Desvantagem', cls: 'bg-rose-500/20 text-rose-200 ring-rose-400/40' },
} as const

interface Props {
  poke: Pokemon
  oponente?: Pokemon | null
  oponenteOculto?: boolean
}

export default function MatchupPanel({ poke, oponente, oponenteOculto }: Props) {
  const perfil = perfilDefensivo(poke.types)
  const resumo = oponente && !oponenteOculto ? matchupContra(poke.types, oponente.types) : null
  const imunes = perfil.imunidades.map(t => ({ tipo: t, mult: 0 }))

  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-slate-900/70 ring-1 ring-white/10 p-3 text-left">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-white capitalize">{poke.name}</span>
          {poke.types.map(t => (
            <TypePill key={t} tipo={t} />
          ))}
        </div>
        {resumo && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ring-1 ${BADGE_VANTAGEM[resumo.nivel].cls}`}>
            {BADGE_VANTAGEM[resumo.nivel].txt}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <LinhaTipos titulo="Fraco a" entradas={perfil.fraquezas} corMult="text-rose-300" />
        <LinhaTipos titulo="Resiste" entradas={perfil.resistencias} corMult="text-emerald-300" />
        <LinhaTipos titulo="Imune" entradas={imunes} corMult="text-white/40" />
      </div>

      {resumo && oponente && (
        <p className="mt-2 text-[11px] text-white/50">
          Contra <b className="text-white/70 capitalize">{oponente.name}</b>: você causa até{' '}
          <b className="text-emerald-300">{fmtMult(resumo.meuMelhorMult)}</b> · ele causa até{' '}
          <b className="text-rose-300">{fmtMult(resumo.oponenteMelhorMult)}</b>
        </p>
      )}
    </div>
  )
}
