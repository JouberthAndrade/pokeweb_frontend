import { pctBarra, hpDeBatalha } from '@/lib/pokemonStats'
import type { Pokemon } from '@/store/types'

// HP em vermelho (igual ao ❤️ do card). Verde é reservado para a Força ⚡.
const LINHAS: { rotulo: string; chave: keyof Pokemon['stats']; cor: string }[] = [
  { rotulo: 'HP', chave: 'hp', cor: 'bg-rose-500' },
  { rotulo: 'ATK', chave: 'atk', cor: 'bg-orange-500' },
  { rotulo: 'DEF', chave: 'def', cor: 'bg-amber-400' },
  { rotulo: 'SP.A', chave: 'spAtk', cor: 'bg-sky-500' },
  { rotulo: 'SP.D', chave: 'spDef', cor: 'bg-indigo-500' },
  { rotulo: 'SPE', chave: 'speed', cor: 'bg-fuchsia-500' },
]

// Teto da barra de HP usa o HP efetivo máximo, para a barra ficar proporcional
// ao número exibido (o mesmo HP de batalha mostrado no card e na arena).
const HP_MAX_EFETIVO = hpDeBatalha(255)

export function StatBars({ stats }: { stats: Pokemon['stats'] }) {
  return (
    <div className="space-y-1">
      {LINHAS.map(({ rotulo, chave, cor }) => {
        const ehHp = chave === 'hp'
        const valor = ehHp ? hpDeBatalha(stats.hp) : stats[chave]
        const pct = ehHp ? pctBarra(valor, HP_MAX_EFETIVO) : pctBarra(valor)
        return (
          <div key={chave} className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-white/40 w-9 shrink-0 text-right">{rotulo}</span>
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className={`h-full ${cor} rounded-full`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] font-mono text-white/60 w-7 shrink-0 text-right">{valor}</span>
          </div>
        )
      })}
    </div>
  )
}
