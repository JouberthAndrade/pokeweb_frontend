/** HP efetivo de batalha — mesma fórmula usada na arena (BattleArena.maxHp). */
export function hpDeBatalha(hpStat: number): number {
  return Math.floor(hpStat * 2 + 110)
}

/** Percentual (0–100) para a largura de uma mini-barra de stat. */
export function pctBarra(valor: number, max = 255): number {
  return Math.max(0, Math.min(100, (valor / max) * 100))
}
