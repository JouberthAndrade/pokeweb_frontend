const TYPE_COLORS: Record<string, string> = {
  Fogo: 'bg-orange-500',
  Água: 'bg-blue-500',
  Planta: 'bg-green-500',
  Elétrico: 'bg-yellow-400 text-gray-800',
  Psíquico: 'bg-pink-500',
  Gelo: 'bg-cyan-400 text-gray-800',
  Dragão: 'bg-indigo-600',
  Sombrio: 'bg-gray-800',
  Fada: 'bg-pink-300 text-gray-800',
  Normal: 'bg-gray-400',
  Lutador: 'bg-red-700',
  Voador: 'bg-sky-400 text-gray-800',
  Veneno: 'bg-purple-500',
  Terra: 'bg-yellow-600',
  Pedra: 'bg-stone-500',
  Inseto: 'bg-lime-500 text-gray-800',
  Fantasma: 'bg-purple-800',
  Aço: 'bg-slate-400',
}

interface TypePillProps {
  tipo: string
}

export function TypePill({ tipo }: TypePillProps) {
  const cor = TYPE_COLORS[tipo] ?? 'bg-gray-500'
  return (
    <span className={`${cor} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
      {tipo}
    </span>
  )
}
