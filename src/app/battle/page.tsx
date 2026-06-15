'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { getLiga } from '@/lib/ligas'
import { rotuloFase, FASES } from '@/lib/battle/torneioFases'
import { simulateBattle } from '@/lib/battle/simulateBattle'
import { carregarPokemon } from '@/lib/pokemonData'
import type { Pokemon } from '@/store/types'
import TournamentBracket from '@/components/battle/TournamentBracket'
import PositioningBoard from '@/components/battle/PositioningBoard'
import BattleArena from '@/components/battle/BattleArena'
import PhaseResult from '@/components/battle/PhaseResult'
import { DefeatModal } from '@/components/battle/DefeatModal'

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

  const [modo, setModo] = useState<Modo>('posicionar')

  useEffect(() => {
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

  const outcomeArena = useMemo(
    () =>
      modo === 'arena' && torneio
        ? simulateBattle(
            torneio.ordem.map(id => pokePorId.get(id)).filter((p): p is Pokemon => !!p),
            torneio.adversarios[torneio.faseAtual - 1].time,
            torneio.seed + torneio.faseAtual,
          )
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modo, torneio?.seed, torneio?.faseAtual],
  )

  const nomePokemonDerrotado = useMemo(() => {
    const ultimo = torneio?.resultados[torneio.resultados.length - 1]
    if (!ultimo) return ''
    const perdido = ultimo.slots.find(s => s.winner === 'trainer')
    if (!perdido) return ''
    return pokePorId.get(perdido.playerPokemonId)?.name ?? ''
  }, [torneio, pokePorId])

  if (!torneio) return null

  const liga = getLiga(torneio.jornada)
  const adversario = torneio.adversarios[torneio.faseAtual - 1]
  const playerTeam = torneio.ordem.map(id => pokePorId.get(id)).filter((p): p is Pokemon => !!p)
  const opponentTeam = adversario.time
  const ehFinal = torneio.faseAtual >= FASES.length
  const ultimoResultado = torneio.resultados[torneio.resultados.length - 1]

  function iniciarConfronto() {
    setModo('arena')
  }

  function aoFimDaArena() {
    if (!outcomeArena) return
    registrarResultado(outcomeArena)
    setModo('resultado')
  }

  function continuar() {
    const t = useGameStore.getState().torneio!
    if (t.status === 'concluido') {
      completarLiga(t.jornada)
      abandonarTorneio()
      router.push('/')
    } else if (t.status === 'resolvido') {
      avancarFase()
      setModo('posicionar')
    }
  }

  function aoPerder() {
    abandonarTorneio()
    router.push('/draft')
  }

  return (
    <div className="px-4 py-8 min-h-[70vh]">
      <h2 className="text-center text-2xl font-extrabold text-white mb-1">⚔️ {liga.nome}</h2>
      <p className="text-center text-blue-300 text-sm mb-6">
        {rotuloFase(torneio.faseAtual)} · {adversario.tipo === 'lider' ? `Líder ${adversario.nome}` : adversario.nome}
      </p>
      <TournamentBracket faseAtual={torneio.faseAtual} />

      {modo === 'posicionar' && (
        <PositioningBoard
          ordemPokemon={playerTeam}
          oponente={adversario}
          mostrarHabilidade={ehFinal}
          rotuloFase={rotuloFase(torneio.faseAtual)}
          onConfirmar={iniciarConfronto}
        />
      )}

      {modo === 'arena' && outcomeArena && (
        <BattleArena
          outcome={outcomeArena}
          playerTeam={playerTeam}
          opponentTeam={opponentTeam}
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
