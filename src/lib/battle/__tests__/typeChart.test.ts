import { describe, it, expect } from 'vitest'
import { getTypeEffectiveness } from '../typeChart'

describe('typeChart', () => {
  it('efetividades clássicas (tipos EN capitalizados)', () => {
    expect(getTypeEffectiveness('Water', ['Fire'])).toBe(2)
    expect(getTypeEffectiveness('Water', ['Fire', 'Rock'])).toBe(4)
    expect(getTypeEffectiveness('Electric', ['Ground'])).toBe(0)
    expect(getTypeEffectiveness('Fire', ['Water'])).toBe(0.5)
    expect(getTypeEffectiveness('Ice', ['Water', 'Dragon'])).toBe(1)
    expect(getTypeEffectiveness('Normal', ['Normal'])).toBe(1)
  })
})
