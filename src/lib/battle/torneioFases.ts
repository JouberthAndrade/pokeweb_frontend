export interface Fase {
  n: number
  nome: string
  tipo: 'treinador' | 'lider'
}

export const FASES: Fase[] = [
  { n: 1, nome: 'Oitavas', tipo: 'treinador' },
  { n: 2, nome: 'Quartas', tipo: 'treinador' },
  { n: 3, nome: 'Semifinal', tipo: 'treinador' },
  { n: 4, nome: 'Final', tipo: 'lider' },
]

export const TOTAL_FASES = FASES.length

export function rotuloFase(n: number): string {
  return FASES.find(f => f.n === n)?.nome ?? `Fase ${n}`
}
