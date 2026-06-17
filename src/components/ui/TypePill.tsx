const TYPE_COLORS: Record<string, string> = {
  Fire: 'bg-orange-500',
  Water: 'bg-blue-500',
  Grass: 'bg-green-500',
  Electric: 'bg-yellow-400 text-gray-800',
  Psychic: 'bg-pink-500',
  Ice: 'bg-cyan-400 text-gray-800',
  Dragon: 'bg-indigo-600',
  Dark: 'bg-gray-800',
  Fairy: 'bg-pink-300 text-gray-800',
  Normal: 'bg-gray-400',
  Fighting: 'bg-red-700',
  Flying: 'bg-sky-400 text-gray-800',
  Poison: 'bg-purple-500',
  Ground: 'bg-yellow-600',
  Rock: 'bg-stone-500',
  Bug: 'bg-lime-500 text-gray-800',
  Ghost: 'bg-purple-800',
  Steel: 'bg-slate-400',
}

interface TypePillProps {
  tipo: string
  /** 'md' (padrão) ou 'xs' para espaços apertados (slots do time). */
  size?: 'md' | 'xs'
}

export function TypePill({ tipo, size = 'md' }: TypePillProps) {
  const cor = TYPE_COLORS[tipo] ?? 'bg-gray-500'
  const dim = size === 'xs' ? 'text-[9px] px-1.5 py-0' : 'text-xs px-2 py-0.5'
  return (
    <span className={`${cor} ${dim} text-white font-bold rounded-full`}>
      {tipo}
    </span>
  )
}
