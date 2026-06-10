export interface Pokemon {
  id: number
  nome: string
  geracao: number
  tipo1: string
  tipo2: string | null
  estagio: number           // 1, 2 ou 3
  status_total: number      // BST
}

export interface DraftCard {
  pokemon: Pokemon
  locked: boolean
}

export interface SynergyBonus {
  label: string             // Ex: "Time Puro: Fogo"
  descricao: string         // Ex: "+25% dano, fraqueza dobrada"
  multiplicador: number     // Ex: 1.25
  tipo?: string             // Tipo envolvido, quando aplicável
}

export interface GameState {
  // Draft
  draftCards: DraftCard[]        // 3 cartas atuais
  teamSlots: (Pokemon | null)[]  // 5 slots do time
  lockedCards: number[]          // índices de cartas travadas (máx. 2)
  cartasReveladas: boolean       // true após clicar "Capture seu Pokémon" na rodada
  bannedType: string | null      // tipo vetado no início da jornada

  // Economia
  pokémoedas: number
  faíscas: number
  gemas: number
  rerollsDisponíveis: number

  // Progressão
  jornadaAtual: number
  vitórias: number
  derrotas: number
  ligasCompletas: number[]       // jornadas já concluídas (persistido em localStorage)

  // Batalha
  emBatalha: boolean

  // Ações
  lockCard: (índice: number) => void
  unlockCard: (índice: number) => void
  revelarCartas: () => void
  addToTeam: (pokemon: Pokemon) => void
  removeFromTeam: (slot: number) => void
  setBannedType: (tipo: string | null) => void
  gastarPokémoedas: (valor: number) => boolean
  ganharFaíscas: (valor: number) => void
  completarLiga: (jornada: number) => void
}
