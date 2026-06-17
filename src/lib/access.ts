// Convidado joga até a liga Intermediária (jornada 2). Autenticado libera tudo.
// Quando o OAuth chegar, basta passar autenticado=true nos call sites.
export const LIGA_MAX_CONVIDADO = 2

export function ligaPermitida(jornada: number, autenticado: boolean): boolean {
  return autenticado || jornada <= LIGA_MAX_CONVIDADO
}
