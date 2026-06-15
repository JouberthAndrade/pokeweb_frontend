import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../gameStore'

const IDS = [1, 4, 7, 10, 13]

function reset() {
  useGameStore.setState({ torneio: null, faíscas: 0 })
}

describe('torneio slice', () => {
  beforeEach(reset)

  it('iniciarTorneio cria estado na fase 1 posicionando, com 4 adversários', () => {
    useGameStore.getState().iniciarTorneio(1, IDS)
    const t = useGameStore.getState().torneio!
    expect(t.faseAtual).toBe(1)
    expect(t.status).toBe('posicionando')
    expect(t.ordem).toEqual(IDS)
    expect(t.adversarios).toHaveLength(4)
    expect(t.trocaGratisUsada).toBe(false)
  })

  it('fase 1 (oitavas) permite reordenar livre e ilimitado sem faísca', () => {
    useGameStore.setState({ faíscas: 0 })
    useGameStore.getState().iniciarTorneio(1, IDS)
    expect(useGameStore.getState().trocarSlots(0, 1)).toBe(true)
    expect(useGameStore.getState().trocarSlots(1, 2)).toBe(true)
    expect(useGameStore.getState().trocarSlots(2, 3)).toBe(true)
    expect(useGameStore.getState().torneio!.trocaGratisUsada).toBe(false)
    expect(useGameStore.getState().faíscas).toBe(0)
  })

  it('da fase 2 em diante: 1ª troca grátis, a 2ª debita 1 faísca', () => {
    useGameStore.setState({ faíscas: 1 })
    useGameStore.getState().iniciarTorneio(1, IDS)
    useGameStore.getState().avancarFase() // fase 2
    expect(useGameStore.getState().trocarSlots(0, 1)).toBe(true)
    expect(useGameStore.getState().torneio!.trocaGratisUsada).toBe(true)
    expect(useGameStore.getState().faíscas).toBe(1)
    expect(useGameStore.getState().trocarSlots(1, 2)).toBe(true)
    expect(useGameStore.getState().faíscas).toBe(0)
  })

  it('da fase 2 em diante: troca paga falha sem faísca', () => {
    useGameStore.setState({ faíscas: 0 })
    useGameStore.getState().iniciarTorneio(1, IDS)
    useGameStore.getState().avancarFase() // fase 2
    useGameStore.getState().trocarSlots(0, 1)
    const ordemAposPrimeira = useGameStore.getState().torneio!.ordem[1]
    expect(useGameStore.getState().trocarSlots(1, 2)).toBe(false)
    expect(useGameStore.getState().torneio!.ordem[1]).toBe(ordemAposPrimeira)
  })

  it('avancarFase reseta a troca grátis e segue para a próxima', () => {
    useGameStore.getState().iniciarTorneio(1, IDS)
    useGameStore.getState().trocarSlots(0, 1)
    useGameStore.getState().avancarFase()
    const t = useGameStore.getState().torneio!
    expect(t.faseAtual).toBe(2)
    expect(t.trocaGratisUsada).toBe(false)
    expect(t.status).toBe('posicionando')
  })

  it('abandonarTorneio limpa o estado', () => {
    useGameStore.getState().iniciarTorneio(1, IDS)
    useGameStore.getState().abandonarTorneio()
    expect(useGameStore.getState().torneio).toBeNull()
  })

  it('troca grátis reordena torneio.ordem sem alterar teamSlots', () => {
    useGameStore.setState({ teamSlots: [null, null, null, null, null] })
    useGameStore.getState().iniciarTorneio(1, IDS)
    expect(useGameStore.getState().trocarSlots(0, 1)).toBe(true)
    expect(useGameStore.getState().torneio!.ordem).toEqual([4, 1, 7, 10, 13])
    expect(useGameStore.getState().teamSlots).toEqual([null, null, null, null, null])
  })
})
