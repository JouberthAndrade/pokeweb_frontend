'use client'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { getLiga } from '@/lib/ligas'
import { rotuloFase, FASES } from '@/lib/battle/torneioFases'
import { carregarPokemon } from '@/lib/pokemonData'
import { dtoToBattleOutcome } from '@/lib/battle/dtoAdapter'
import type { Pokemon } from '@/store/types'
import type { BattleOutcome } from '@/lib/battle/types'
import TournamentBracket from '@/components/battle/TournamentBracket'
import PositioningBoard from '@/components/battle/PositioningBoard'
import BattleArena from '@/components/battle/BattleArena'
import PhaseResult from '@/components/battle/PhaseResult'
import { DefeatModal } from '@/components/battle/DefeatModal'
import { ligaPermitida } from '@/lib/access'
import { registrarVitoria } from '@/lib/api/leaderboard'

type Modo = 'posicionar' | 'arena' | 'resultado'

export default function BattlePage() {
  const router = useRouter()
  const teamSlots = useGameStore(s => s.teamSlots)
  const jornadaAtual = useGameStore(s => s.jornadaAtual)
  const torneio = useGameStore(s => s.torneio)
  const iniciarTorneio = useGameStore(s => s.iniciarTorneio)
  const registrarResultado = useGameStore(s => s.registrarResultado)
  const avancarFase = useGameStore(s => s.avancarFase)
  const abandonarTorneio = useGameStore(s => s.abandonarTorneio)
  const completarLiga = useGameStore(s => s.completarLiga)
  const reiniciarDraft = useGameStore(s => s.reiniciarDraft)

  // Server-authoritative battle actions (two-step)
  const iniciarSessaoBatalha = useGameStore(s => s.iniciarSessaoBatalha)
  const confirmarPosicao = useGameStore(s => s.confirmarPosicao)
  const trainerThemeTypes = useGameStore(s => s.trainerThemeTypes)
  const trainerTeamIds = useGameStore(s => s.trainerTeamIds)
  const batalhaErro = useGameStore(s => s.batalhaErro)
  const limparBatalhaErro = useGameStore(s => s.limparBatalhaErro)
  const battleSessionId = useGameStore(s => s.battleSessionId)

  const [modo, setModo] = useState<Modo>('posicionar')
  // outcomeArena is now server-derived (via confirmarPosicao), adapted to client shape
  const [outcomeArena, setOutcomeArena] = useState<BattleOutcome | null>(null)
  // Evita criar sessão duplicada (re-render / React Strict Mode em dev): guarda a
  // chave fase+modo para a qual a sessão já foi (ou está sendo) criada.
  const sessaoKeyRef = useRef<string | null>(null)
  // Loading states
  const [iniciandoSessao, setIniciandoSessao] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    // Guarda de acesso: convidado só joga ligas 1–2. URL direta sem permissão → home.
    if (!ligaPermitida(jornadaAtual, false)) {
      router.replace('/')
      return
    }
    if (torneio) return
    const ids = teamSlots.filter((p): p is Pokemon => p !== null).map(p => p.id)
    if (ids.length < 5) {
      router.replace('/draft')
      return
    }
    iniciarTorneio(jornadaAtual, ids)
  }, [torneio, teamSlots, jornadaAtual, iniciarTorneio, router])

  // Resolve ids contra o dataset completo: o time persiste no torneio (ordem),
  // mas teamSlots é transitório e some no refresh. Assim o tabuleiro sempre popula.
  const pokePorId = useMemo(() => {
    const m = new Map<number, Pokemon>()
    for (const p of carregarPokemon()) m.set(p.id, p)
    return m
  }, [])

  const nomePokemonDerrotado = useMemo(() => {
    const ultimo = torneio?.resultados[torneio.resultados.length - 1]
    if (!ultimo) return ''
    const perdido = ultimo.slots.find(s => s.winner === 'trainer')
    if (!perdido) return ''
    return pokePorId.get(perdido.playerPokemonId)?.name ?? ''
  }, [torneio, pokePorId])

  // Step 1: ao entrar no modo posicionar (ou ao avançar fase), criar sessão no servidor
  // para obter trainerThemeTypes. Roda sempre que o torneio/fase muda e o modo é 'posicionar'.
  const criarSessaoAtual = useCallback(async () => {
    if (!torneio) return
    setIniciandoSessao(true)
    try {
      const liga = getLiga(torneio.jornada)
      // Backend aceita leagueId 1..4 e stage 1..3 nesta fase. Há 6 ligas no front
      // (ligas.ts), então clampamos para não estourar 400 nas ligas 5-6. O suporte
      // real a ligas 5-6 + líder/fase>3 é PRD futuro (mesma razão do clamp de stage).
      const leagueId = Math.min(liga.jornada, 4)
      const stage = Math.min(torneio.faseAtual, 3)
      await iniciarSessaoBatalha(leagueId, stage, torneio.ordem)
    } catch {
      // Falha ao criar sessão (erro já gravado em batalhaErro pelo store). Libera a
      // chave para que o botão "Tentar novamente" (ou nova fase) possa recriar a sessão.
      sessaoKeyRef.current = null
    } finally {
      setIniciandoSessao(false)
    }
  }, [torneio, iniciarSessaoBatalha])

  useEffect(() => {
    if (modo === 'posicionar' && torneio) {
      const key = `${torneio.faseAtual}-${modo}`
      if (sessaoKeyRef.current === key) return // já criada para esta fase/modo
      sessaoKeyRef.current = key
      criarSessaoAtual()
    }
  // We only want to re-run when the phase actually changes, not on every torneio ref update.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [torneio?.faseAtual, modo])

  if (!torneio) return null

  const liga = getLiga(torneio.jornada)
  const adversario = torneio.adversarios[torneio.faseAtual - 1]
  const playerTeam = torneio.ordem.map(id => pokePorId.get(id)).filter((p): p is Pokemon => !!p)
  const ehFinal = torneio.faseAtual >= FASES.length
  const ultimoResultado = torneio.resultados[torneio.resultados.length - 1]

  // Times da arena derivados do resultado do servidor: garante que sprites e HP
  // correspondam ao time realmente lutado (slots[].playerPokemonId/trainerPokemonId),
  // não ao adversário gerado no cliente. Index alinhado com outcome.slots.
  const arenaPlayerTeam = outcomeArena
    ? outcomeArena.slots.map(s => pokePorId.get(s.playerPokemonId)).filter((p): p is Pokemon => !!p)
    : []
  const arenaOpponentTeam = outcomeArena
    ? outcomeArena.slots.map(s => pokePorId.get(s.trainerPokemonId)).filter((p): p is Pokemon => !!p)
    : []

  // Ligas 1–2: o servidor revela o time do oponente (ids) para exibição no
  // posicionamento. Resolvemos contra o dataset local. Ligas 3+: undefined → pílulas.
  const oponenteTimeReal = trainerTeamIds
    ? trainerTeamIds.map(id => pokePorId.get(id)).filter((p): p is Pokemon => !!p)
    : undefined

  // Step 2: confirmar posicionamento — chama /battle/position e recebe o outcome
  async function iniciarConfronto() {
    if (!torneio) return
    setConfirmando(true)
    limparBatalhaErro()
    try {
      const dto = await confirmarPosicao(torneio.ordem)
      // Adapt DTO → client BattleOutcome so BattleArena and registrarResultado work
      // unchanged. The server does not return per-round events, so events: [] causes
      // BattleArena to finish instantly (no per-round animation). Full replay is
      // deferred to a future PRD adding GET /battle/replay/:id → RoundEvent[].
      const outcome = dtoToBattleOutcome(dto)
      setOutcomeArena(outcome)
      setModo('arena')
    } catch {
      // erro já gravado em batalhaErro pelo store
    } finally {
      setConfirmando(false)
    }
  }

  function aoFimDaArena() {
    if (!outcomeArena) return
    registrarResultado(outcomeArena)
    setModo('resultado')
  }

  function continuar() {
    const t = useGameStore.getState().torneio!
    if (t.status === 'concluido') {
      // Registra vitória na liga (fire-and-forget — falha de rede não bloqueia o fluxo).
      const sid = useGameStore.getState().battleSessionId
      if (sid) {
        registrarVitoria(sid).catch((e) => console.error('[leaderboard] registrarVitoria falhou:', e))
      }
      completarLiga(t.jornada)
      abandonarTorneio()
      router.push('/')
    } else if (t.status === 'resolvido') {
      avancarFase()
      setModo('posicionar')
    }
  }

  function aoPerder() {
    // Derrota perde o draft: limpa o time/cartas e recomeça o draft na mesma liga.
    abandonarTorneio()
    reiniciarDraft()
    router.push('/draft')
  }

  return (
    <div className="px-4 py-8 min-h-[70vh]">
      <h2 className="text-center text-2xl font-extrabold text-white mb-1">⚔️ {liga.nome}</h2>
      <p className="text-center text-blue-300 text-sm mb-6">
        {rotuloFase(torneio.faseAtual)} · {adversario.tipo === 'lider' ? `Líder ${adversario.nome}` : adversario.nome}
      </p>
      <TournamentBracket faseAtual={torneio.faseAtual} />

      {batalhaErro && (
        <div className="mb-4 rounded-xl bg-rose-500/20 ring-1 ring-rose-400/40 px-4 py-3 text-sm text-rose-200 text-center">
          ⚠️ {batalhaErro}
          {modo === 'posicionar' && !battleSessionId && (
            <button
              onClick={() => { limparBatalhaErro(); criarSessaoAtual() }}
              disabled={iniciandoSessao}
              className="ml-3 underline text-rose-100 font-semibold hover:text-white cursor-pointer disabled:opacity-50"
            >
              Tentar novamente
            </button>
          )}
          <button
            onClick={limparBatalhaErro}
            className="ml-3 underline text-rose-300 hover:text-rose-100 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {modo === 'posicionar' && (
        <PositioningBoard
          ordemPokemon={playerTeam}
          oponente={adversario}
          mostrarHabilidade={ehFinal}
          rotuloFase={rotuloFase(torneio.faseAtual)}
          onConfirmar={iniciarConfronto}
          trainerThemeTypes={trainerThemeTypes.length > 0 ? trainerThemeTypes : undefined}
          oponenteTimeReal={oponenteTimeReal}
          confirmandoDisabled={iniciandoSessao || confirmando}
        />
      )}

      {modo === 'arena' && outcomeArena && (
        <BattleArena
          outcome={outcomeArena}
          playerTeam={arenaPlayerTeam}
          opponentTeam={arenaOpponentTeam}
          onFim={aoFimDaArena}
        />
      )}

      {modo === 'resultado' && ultimoResultado && torneio.status !== 'derrota' && (
        <PhaseResult
          outcome={ultimoResultado}
          ehFinal={ehFinal}
          rotuloProxima={rotuloFase(torneio.faseAtual + 1)}
          onContinuar={continuar}
        />
      )}

      {torneio.status === 'derrota' && (
        <DefeatModal
          onAssistirAnúncio={aoPerder}
          onDesistir={aoPerder}
          nomePokemonDerrotado={nomePokemonDerrotado}
        />
      )}
    </div>
  )
}
