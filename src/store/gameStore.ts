import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, Pokemon } from './types'
import { TEAM_SIZE, MAX_LOCKS, RODADAS_TOTAL } from '@/lib/draftRound'
import { gerarTorneio } from '@/lib/battle/generateOpponents'
import type { BattleOutcome } from '@/lib/battle/types'
import { TOTAL_FASES } from '@/lib/battle/torneioFases'
import { criarSeed, construirRodada } from '@/lib/api/draft'
import { criarSessao, posicionar } from '@/lib/api/battle'
import { ApiError } from '@/lib/api/http'
import type { BattleOutcomeDto } from '@/lib/api/types'

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      draftCards: [],
      teamSlots: Array(TEAM_SIZE).fill(null),
      lockedCards: [],
      cartasReveladas: false,
      bannedType: null,
      seedId: null,
      rodadaAtual: 1,
      rerollNonce: 0,
      draftErro: null,

      pokémoedas: 100,
      faíscas: 0,
      gemas: 0,
      rerollsDisponíveis: 3,

      jornadaAtual: 1,
      vitórias: 0,
      derrotas: 0,
      ligasCompletas: [],
      emBatalha: false,
      torneio: null,
      battleSessionId: null,
      battleOutcome: null,
      trainerThemeTypes: [],
      trainerTeamIds: null,
      batalhaErro: null,

      lockCard: (índice) =>
        set(state => {
          if (state.lockedCards.includes(índice)) return state
          // Limite de travas: no máximo MAX_LOCKS cartas por rodada.
          if (state.lockedCards.length >= MAX_LOCKS) return state
          return {
            draftCards: state.draftCards.map((card, i) =>
              i === índice ? { ...card, locked: true } : card
            ),
            lockedCards: [...state.lockedCards, índice],
          }
        }),

      unlockCard: (índice) =>
        set(state => ({
          draftCards: state.draftCards.map((card, i) =>
            i === índice ? { ...card, locked: false } : card
          ),
          lockedCards: state.lockedCards.filter(i => i !== índice),
        })),

      revelarCartas: () => set({ cartasReveladas: true }),

      addToTeam: (pokemon) =>
        set(state => {
          const slotVazio = state.teamSlots.findIndex(s => s === null)
          if (slotVazio === -1) return state
          const novoTeam = [...state.teamSlots]
          novoTeam[slotVazio] = pokemon
          return { teamSlots: novoTeam }
        }),

      removeFromTeam: (slot) =>
        set(state => {
          const novoTeam = [...state.teamSlots]
          novoTeam[slot] = null
          return { teamSlots: novoTeam }
        }),

      setBannedType: (tipo) => set({ bannedType: tipo }),

      gastarPokémoedas: (valor) => {
        const { pokémoedas } = get()
        if (pokémoedas < valor) return false
        set({ pokémoedas: pokémoedas - valor })
        return true
      },

      ganharFaíscas: (valor) =>
        set(state => ({ faíscas: state.faíscas + valor })),

      gastarFaísca: (valor) => {
        const { faíscas } = get()
        if (faíscas < valor) return false
        set({ faíscas: faíscas - valor })
        return true
      },

      iniciarTorneio: (jornada, ids) =>
        set(() => {
          const seed = Math.floor(Math.random() * 0xffffffff)
          return {
            torneio: {
              jornada,
              faseAtual: 1,
              ordem: [...ids],
              trocaGratisUsada: false,
              adversarios: gerarTorneio(jornada, seed),
              resultados: [],
              seed,
              status: 'posicionando' as const,
            },
          }
        }),

      definirOrdem: (ids) =>
        set(state => (state.torneio ? { torneio: { ...state.torneio, ordem: [...ids] } } : state)),

      trocarSlots: (a, b) => {
        const t = get().torneio
        if (!t) return false
        // Posicionamento inicial (oitavas) é livre e ilimitado; nas fases seguintes,
        // a 1ª troca é grátis (prêmio por avançar) e as extras custam 1 faísca.
        const inicial = t.faseAtual === 1
        if (!inicial && t.trocaGratisUsada) {
          if (!get().gastarFaísca(1)) return false
        }
        const ordem = [...t.ordem]
        ;[ordem[a], ordem[b]] = [ordem[b], ordem[a]]
        set({
          torneio: {
            ...get().torneio!,
            ordem,
            trocaGratisUsada: inicial ? t.trocaGratisUsada : true,
          },
        })
        return true
      },

      registrarResultado: (resultado: BattleOutcome) =>
        set(state => {
          if (!state.torneio) return state
          const venceu = resultado.result === 'PLAYER_WIN'
          const ehFinal = state.torneio.faseAtual >= TOTAL_FASES
          return {
            torneio: {
              ...state.torneio,
              resultados: [...state.torneio.resultados, resultado],
              status: !venceu ? 'derrota' : ehFinal ? 'concluido' : 'resolvido',
            },
          }
        }),

      avancarFase: () =>
        set(state =>
          state.torneio
            ? {
                torneio: {
                  ...state.torneio,
                  faseAtual: state.torneio.faseAtual + 1,
                  trocaGratisUsada: false,
                  status: 'posicionando',
                },
                // Cada fase tem sua própria sessão server-side; limpa a anterior
                // para nunca posicionar com uma sessionId de fase passada.
                battleSessionId: null,
                battleOutcome: null,
                trainerThemeTypes: [],
                trainerTeamIds: null,
              }
            : state
        ),

      abandonarTorneio: () => set({ torneio: null }),

      // Recomeça o draft do zero (mesma liga): limpa time, cartas, travas e
      // restaura os rerolls gratuitos. Usado após derrota → redraft.
      reiniciarDraft: () =>
        set({
          teamSlots: Array(TEAM_SIZE).fill(null),
          draftCards: [],
          lockedCards: [],
          cartasReveladas: false,
          bannedType: null,
          rerollsDisponíveis: 3,
          torneio: null,
          seedId: null,
          rodadaAtual: 1,
          rerollNonce: 0,
          draftErro: null,
          battleSessionId: null,
          battleOutcome: null,
          trainerThemeTypes: [],
          trainerTeamIds: null,
          batalhaErro: null,
        }),

      // --- Draft server-authoritative ---

      setDraftCards: (cards) => set({ draftCards: cards }),

      iniciarDraft: async (jornadaId) => {
        try {
          const { seedId } = await criarSeed()
          const { cards } = await construirRodada({ seedId, jornadaId, rodada: 1 })
          set({
            seedId,
            rodadaAtual: 1,
            rerollNonce: 0,
            draftCards: cards.map((p) => ({ pokemon: p, locked: false })),
            lockedCards: [],
            cartasReveladas: false,
            draftErro: null,
          })
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : 'Falha ao buscar cartas'
          set({ draftErro: msg })
        }
      },

      proximaRodada: async (índiceCapturado) => {
        const st = get()
        if (!st.seedId) return
        const novosTravados = st.lockedCards.filter((i) => i !== índiceCapturado)
        const proxima = st.rodadaAtual + 1
        // Guard: não avançar além do total de rodadas definido
        if (proxima > RODADAS_TOTAL) return
        try {
          const { cards } = await construirRodada({
            seedId: st.seedId,
            jornadaId: st.jornadaAtual,
            rodada: proxima,
            indicesTravados: novosTravados,
            playerLockedIds: novosTravados.map((i) => st.draftCards[i].pokemon.id),
          })
          // Contrato de ordem: o servidor retorna os Pokémon travados nos mesmos
          // índices de slot enviados em `indicesTravados`; o flag `locked` é
          // aplicado posicionalmente com base nesse contrato.
          set({
            rodadaAtual: proxima,
            rerollNonce: 0,
            lockedCards: novosTravados,
            draftCards: cards.map((p, i) => ({ pokemon: p, locked: novosTravados.includes(i) })),
            cartasReveladas: false,
            draftErro: null,
          })
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : 'Falha ao buscar cartas'
          set({ draftErro: msg })
        }
      },

      limparDraftErro: () => set({ draftErro: null }),

      // --- Batalha server-authoritative (two-step) ---

      // Step 1: criar sessão ao entrar em posicionamento → guarda trainerThemeTypes + battleSessionId
      iniciarSessaoBatalha: async (leagueId, stage, playerSlotIds) => {
        try {
          const sessao = await criarSessao({ leagueId, stage, draftPokemonIds: playerSlotIds })
          set({
            battleSessionId: sessao.sessionId,
            trainerThemeTypes: sessao.trainerThemeTypes,
            trainerTeamIds: sessao.trainerTeamIds,
            batalhaErro: null,
          })
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : 'Falha ao criar sessão de batalha'
          set({ batalhaErro: msg })
          throw err
        }
      },

      // Step 2: posicionar time ao confirmar → guarda battleOutcome
      confirmarPosicao: async (playerSlots) => {
        const { battleSessionId } = get()
        if (!battleSessionId) {
          const msg = 'Sessão de batalha não iniciada'
          set({ batalhaErro: msg })
          throw new Error(msg)
        }
        try {
          const outcome = await posicionar({ sessionId: battleSessionId, playerSlots })
          set({ battleOutcome: outcome, batalhaErro: null })
          return outcome
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : 'Falha ao posicionar time'
          set({ batalhaErro: msg })
          throw err
        }
      },

      limparBatalhaErro: () => set({ batalhaErro: null }),

      completarLiga: (jornada) =>
        set(state => (
          state.ligasCompletas.includes(jornada)
            ? state
            : { ligasCompletas: [...state.ligasCompletas, jornada], vitórias: state.vitórias + 1 }
        )),
    }),
    {
      name: 'pokeweb-progress',
      // Persistimos apenas a progressão/economia; o estado transitório do
      // draft (cartas, slots, travas) sempre recomeça limpo.
      partialize: (state) => ({
        ligasCompletas: state.ligasCompletas,
        pokémoedas: state.pokémoedas,
        faíscas: state.faíscas,
        gemas: state.gemas,
        vitórias: state.vitórias,
        derrotas: state.derrotas,
        torneio: state.torneio,
      }),
    }
  )
)
