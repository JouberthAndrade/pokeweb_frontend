import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, Pokemon } from './types'
import { TEAM_SIZE, MAX_LOCKS } from '@/lib/draftRound'

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      draftCards: [],
      teamSlots: Array(TEAM_SIZE).fill(null),
      lockedCards: [],
      cartasReveladas: false,
      bannedType: null,

      pokémoedas: 100,
      faíscas: 0,
      gemas: 0,
      rerollsDisponíveis: 3,

      jornadaAtual: 1,
      vitórias: 0,
      derrotas: 0,
      ligasCompletas: [],
      emBatalha: false,

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
        gemas: state.gemas,
        vitórias: state.vitórias,
        derrotas: state.derrotas,
      }),
    }
  )
)
