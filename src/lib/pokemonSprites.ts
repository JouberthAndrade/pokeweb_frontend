const SPRITE_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'

/**
 * Cadeia de fallback de sprites da PokéAPI, na ordem de prioridade pedida:
 * 1. official-artwork  2. home  3. default
 *
 * Como o domínio do Pokémon já vem com `id` numérico no pokemon.json,
 * montamos as URLs diretamente — sem precisar chamar a PokéAPI em runtime.
 */
export function spriteFallbackChain(id: number): string[] {
  return [
    `${SPRITE_BASE}/other/official-artwork/${id}.png`,
    `${SPRITE_BASE}/other/home/${id}.png`,
    `${SPRITE_BASE}/${id}.png`,
  ]
}

export function spritePrincipal(id: number): string {
  return spriteFallbackChain(id)[0]
}

/**
 * Gera uma lista de sprites aleatórios para a animação de roleta da captura.
 * Usa apenas IDs da 1ª geração (1–151), que sempre têm artwork disponível,
 * evitando imagens quebradas durante o giro.
 */
export function spritesRoleta(quantidade = 18): string[] {
  return Array.from({ length: quantidade }, () => {
    const id = 1 + Math.floor(Math.random() * 151)
    return spritePrincipal(id)
  })
}

/** Placeholder visual (Pokébola) quando todas as URLs falham. */
export const POKEBALL_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
      <circle cx='50' cy='50' r='46' fill='#1e293b' stroke='#475569' stroke-width='4'/>
      <path d='M4 50a46 46 0 0 1 92 0z' fill='#ef4444'/>
      <line x1='4' y1='50' x2='96' y2='50' stroke='#475569' stroke-width='4'/>
      <circle cx='50' cy='50' r='14' fill='#0f172a' stroke='#475569' stroke-width='4'/>
      <circle cx='50' cy='50' r='6' fill='#e2e8f0'/>
    </svg>`
  )
