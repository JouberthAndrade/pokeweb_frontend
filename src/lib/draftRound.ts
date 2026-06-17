// LEGACY: resolverCaptura e buildCardPool são usados APENAS em testes unitários.
// Em produção, o sorteio de cartas é feito pelo servidor via gameStore.proximaRodada
// → api/draft (criarSeed + construirRodada). Não remova as funções — os testes dependem delas.
// As constantes TEAM_SIZE, RODADAS_TOTAL e MAX_LOCKS continuam em uso em produção.
import { buildCardPool } from './buildCardPool'
import type { DraftCard } from '@/store/types'

export const TEAM_SIZE = 5       // 5 slots no time
export const RODADAS_TOTAL = 5   // 5 rodadas de captura
export const MAX_LOCKS = 2       // o jogador pode travar até 2 cartas

interface ResolverCapturaInput {
  draftCards: DraftCard[]
  lockedCards: number[]
  índice: number               // índice da carta capturada
  bstMin: number
  bstMax: number
  tipoBanido?: string
}

/**
 * Resolve a transição de rodada após o jogador capturar a carta `índice`.
 *
 * Regras:
 * - Cartas travadas que NÃO foram capturadas permanecem na mesma posição.
 * - Se o jogador captura a própria carta travada, a trava é CONSUMIDA:
 *   aquela posição é resorteada normalmente na próxima rodada.
 * - Cartas não travadas são sempre resorteadas.
 *
 * Não decide nada sobre o time — só devolve o novo pool e as travas restantes.
 */
export function resolverCaptura(input: ResolverCapturaInput): {
  novasCartas: DraftCard[]
  novosTravados: number[]
} {
  const { draftCards, lockedCards, índice, bstMin, bstMax, tipoBanido } = input

  // Capturar uma carta travada consome a trava.
  const novosTravados = lockedCards.filter(i => i !== índice)

  const novasCartas = buildCardPool({
    bstMin,
    bstMax,
    tipoBanido,
    cartasTravadas: draftCards,
    índicesTravados: novosTravados,
  })

  return { novasCartas, novosTravados }
}
