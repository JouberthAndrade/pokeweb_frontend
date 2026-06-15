import { describe, it, expect } from 'vitest'
import { computeBst, parseGeneration, capitalizeType, buildStageMap } from '../derive'

describe('computeBst', () => {
  it('soma os 6 stats base', () => {
    const stats = [
      { base_stat: 78, stat: { name: 'hp' } },
      { base_stat: 84, stat: { name: 'attack' } },
      { base_stat: 78, stat: { name: 'defense' } },
      { base_stat: 109, stat: { name: 'special-attack' } },
      { base_stat: 85, stat: { name: 'special-defense' } },
      { base_stat: 100, stat: { name: 'speed' } },
    ]
    expect(computeBst(stats)).toBe(534)
  })
})

describe('parseGeneration', () => {
  it('converte generation-i em 1 e generation-ix em 9', () => {
    expect(parseGeneration('generation-i')).toBe(1)
    expect(parseGeneration('generation-iv')).toBe(4)
    expect(parseGeneration('generation-ix')).toBe(9)
  })
})

describe('capitalizeType', () => {
  it('capitaliza o nome do tipo da API', () => {
    expect(capitalizeType('fire')).toBe('Fire')
    expect(capitalizeType('water')).toBe('Water')
  })
})

describe('buildStageMap', () => {
  it('mapeia cada especie para sua profundidade na cadeia (1-based)', () => {
    const chain = {
      species: { name: 'charmander' },
      evolves_to: [
        { species: { name: 'charmeleon' }, evolves_to: [
          { species: { name: 'charizard' }, evolves_to: [] },
        ] },
      ],
    }
    const map = buildStageMap(chain)
    expect(map.get('charmander')).toBe(1)
    expect(map.get('charmeleon')).toBe(2)
    expect(map.get('charizard')).toBe(3)
  })

  it('limita o estagio em 3 para cadeias mais longas (ex.: eevee)', () => {
    const chain = {
      species: { name: 'a' },
      evolves_to: [
        { species: { name: 'b' }, evolves_to: [
          { species: { name: 'c' }, evolves_to: [
            { species: { name: 'd' }, evolves_to: [] },
          ] },
        ] },
      ],
    }
    const map = buildStageMap(chain)
    expect(map.get('d')).toBe(3)
  })
})
