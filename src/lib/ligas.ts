export interface Liga {
  jornada: number
  nome: string
  lider: string       // nome do líder de ginásio (ex: "Misty")
  emoji: string
  cor: string         // gradiente Tailwind do card de seleção
  accent: string      // cor hex de destaque (glow/dots/avatar)
  descricao: string   // subtítulo no card
  lideres: number     // nº de líderes da liga
  forca: string        // faixa de força dos líderes (display), ex: "490–560"
  regiao: string      // região do sorteio
  bstMin: number      // alimenta o buildCardPool do draft
  bstMax: number
}

// Ligas/Jornadas. As faixas de BST alimentam o buildCardPool do draft.
export const LIGAS: Liga[] = [
  {
    jornada: 1,
    nome: 'Liga Iniciante',
    lider: 'Brock',
    emoji: '🥉',
    cor: 'from-emerald-500 to-teal-600',
    accent: '#10B981',
    descricao: 'Primeiros passos — fundamentos do draft',
    lideres: 3,
    forca: '260–340',
    regiao: 'Kanto',
    bstMin: 200,
    bstMax: 400,
  },
  {
    jornada: 2,
    nome: 'Liga Intermediária',
    lider: 'Misty',
    emoji: '🥈',
    cor: 'from-sky-500 to-indigo-600',
    accent: '#06B6D4',
    descricao: 'Cobertura de tipos e sinergias básicas',
    lideres: 4,
    forca: '340–430',
    regiao: 'Johto',
    bstMin: 300,
    bstMax: 500,
  },
  {
    jornada: 3,
    nome: 'Liga Profissional',
    lider: 'Lt. Surge',
    emoji: '🥇',
    cor: 'from-amber-500 to-orange-600',
    accent: '#EAB308',
    descricao: 'Times competitivos e estratégia',
    lideres: 4,
    forca: '430–490',
    regiao: 'Hoenn',
    bstMin: 400,
    bstMax: 600,
  },
  {
    jornada: 4,
    nome: 'Liga Mundial',
    lider: 'Cynthia',
    emoji: '🌍',
    cor: 'from-blue-500 to-cyan-600',
    accent: '#3B82F6',
    descricao: 'Elite de Pokémon e cobertura de tipos',
    lideres: 5,
    forca: '490–560',
    regiao: 'Sinnoh',
    bstMin: 480,
    bstMax: 580,
  },
  {
    jornada: 5,
    nome: 'Liga Platina',
    lider: 'Iris',
    emoji: '💎',
    cor: 'from-violet-500 to-purple-700',
    accent: '#8B5CF6',
    descricao: 'Lendários e batalhas épicas',
    lideres: 5,
    forca: '540–650',
    regiao: 'Unova',
    bstMin: 540,
    bstMax: 650,
  },
  {
    jornada: 6,
    nome: 'Liga Mestre Pokémon',
    lider: 'Diantha',
    emoji: '👑',
    cor: 'from-amber-400 to-yellow-600',
    accent: '#F59E0B',
    descricao: 'O ápice — Míticos e Lendários supremos',
    lideres: 6,
    forca: '580–720',
    regiao: 'Kalos',
    bstMin: 580,
    bstMax: 720,
  },
]

export function getLiga(jornada: number): Liga {
  return LIGAS.find(l => l.jornada === jornada) ?? LIGAS[0]
}

/**
 * Progressão sequencial: a Liga 1 está sempre aberta; as demais só liberam
 * após concluir a liga imediatamente anterior.
 */
export function ligaDesbloqueada(jornada: number, completas: number[]): boolean {
  if (jornada <= 1) return true
  return completas.includes(jornada - 1)
}

export function ligaConcluida(jornada: number, completas: number[]): boolean {
  return completas.includes(jornada)
}

/** Iniciais do líder para o avatar placeholder (ex: "Lt. Surge" -> "LS"). */
export function iniciaisLider(nome: string): string {
  const palavras = nome.replace(/\./g, '').split(/\s+/).filter(Boolean)
  if (palavras.length === 0) return '?'
  if (palavras.length === 1) return palavras[0].slice(0, 1).toUpperCase()
  return (palavras[0][0] + palavras[palavras.length - 1][0]).toUpperCase()
}
