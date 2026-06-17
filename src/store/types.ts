import type { BattleOutcome } from '@/lib/battle/types'
import type { Adversario } from '@/lib/battle/generateOpponents'
import type { BattleOutcomeDto } from '@/lib/api/types'

export interface TorneioState {
  jornada: number
  faseAtual: number
  ordem: number[]
  trocaGratisUsada: boolean
  adversarios: Adversario[]
  resultados: BattleOutcome[]
  seed: number
  status: 'posicionando' | 'resolvido' | 'derrota' | 'concluido'
}

export interface Pokemon {
  id: number
  name: string
  types: string[]          // 1 ou 2 tipos, EN capitalizado ("Fire", "Flying")
  stats: {
    hp: number; atk: number; def: number
    spAtk: number; spDef: number; speed: number
  }
  bst: number              // soma dos 6 stats (ex-status_total)
  stage: number            // 1, 2 ou 3 (ex-estagio)
  generation: number       // 1..9 (ex-geracao)
  abilities: string[]
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
  seedId: string | null          // seed atual do draft (criada 1x pelo servidor)
  rodadaAtual: number            // 1..5 (espelha o estado do servidor)
  rerollNonce: number            // contador de rerolls da rodada atual (reseta a cada rodada)
  draftErro: string | null       // mensagem de erro da última operação de draft

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
  torneio: TorneioState | null

  // Batalha server-authoritative
  battleSessionId: string | null
  battleOutcome: BattleOutcomeDto | null
  trainerThemeTypes: string[]
  trainerTeamIds: number[] | null   // time real do oponente (ligas 1–2); null nas ligas 3+
  batalhaErro: string | null

  // Torneio
  iniciarTorneio: (jornada: number, ids: number[]) => void
  definirOrdem: (ids: number[]) => void
  trocarSlots: (a: number, b: number) => boolean
  registrarResultado: (resultado: BattleOutcome) => void
  avancarFase: () => void
  abandonarTorneio: () => void
  gastarFaísca: (valor: number) => boolean

  // Batalha server-authoritative actions (two-step flow)
  // Step 1: create session when entering positioning → stores trainerThemeTypes + battleSessionId
  iniciarSessaoBatalha: (leagueId: number, stage: number, playerSlotIds: number[]) => Promise<void>
  // Step 2: send positioning on confirm → stores battleOutcome
  confirmarPosicao: (playerSlots: number[]) => Promise<BattleOutcomeDto>
  limparBatalhaErro: () => void

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
  reiniciarDraft: () => void

  // Ações de draft server-authoritative
  setDraftCards: (cards: DraftCard[]) => void
  iniciarDraft: (jornadaId: number) => Promise<void>        // cria seed + carrega rodada 1
  proximaRodada: (índiceCapturado: number) => Promise<void> // avança rodada via servidor
  limparDraftErro: () => void
}
