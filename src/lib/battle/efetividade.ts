export type NivelEfetividade = 'super' | 'eficaz' | 'neutro' | 'fraco' | 'imune'

export interface EstiloEfetividade {
  nivel: NivelEfetividade
  rotulo: string | null
  cor: string // classe tailwind de cor de texto
  escala: number // multiplicador de tamanho do número flutuante
}

/**
 * Mapeia o multiplicador de efetividade (0 | 0.25 | 0.5 | 1 | 2 | 4) para o
 * estilo do dano flutuante no replay. Maior efetividade = mais destaque.
 */
export function estiloEfetividade(mult: number): EstiloEfetividade {
  if (mult <= 0) {
    return { nivel: 'imune', rotulo: 'Não afeta', cor: 'text-white/40', escala: 0.85 }
  }
  if (mult >= 4) {
    return { nivel: 'super', rotulo: 'SUPER EFICAZ!', cor: 'text-emerald-300', escala: 1.5 }
  }
  if (mult > 1) {
    return { nivel: 'eficaz', rotulo: 'Eficaz!', cor: 'text-emerald-400', escala: 1.25 }
  }
  if (mult === 1) {
    return { nivel: 'neutro', rotulo: null, cor: 'text-white', escala: 1 }
  }
  if (mult >= 0.5) {
    return { nivel: 'fraco', rotulo: 'Pouco eficaz…', cor: 'text-rose-300', escala: 0.9 }
  }
  return { nivel: 'fraco', rotulo: 'Pouco eficaz…', cor: 'text-rose-400', escala: 0.8 }
}
