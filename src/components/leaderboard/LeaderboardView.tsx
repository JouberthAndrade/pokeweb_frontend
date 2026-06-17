'use client'
import { useEffect, useState } from 'react'
import { topSemanal } from '@/lib/api/leaderboard'
import { getUserId } from '@/lib/api/guestId'
import type { LeaderboardEntry } from '@/lib/api/types'

export default function LeaderboardView() {
  const [linhas, setLinhas] = useState<LeaderboardEntry[]>([])
  const [erro, setErro] = useState<string | null>(null)
  // getUserId() toca localStorage (só existe no cliente); ler no efeito evita
  // mismatch de hidratação SSR ('ssr-anon') vs cliente (UUID real).
  const [eu, setEu] = useState('')

  useEffect(() => {
    setEu(getUserId())
    topSemanal().then(setLinhas).catch((e) => setErro(e instanceof Error ? e.message : 'erro desconhecido'))
  }, [])

  if (erro) return <p className="text-red-300 text-sm">Não foi possível carregar o ranking: {erro}</p>
  return (
    <ol className="space-y-1">
      {linhas.map((l, i) => (
        <li key={l.userId} className={`flex justify-between rounded px-3 py-1 ${l.userId === eu ? 'bg-blue-900/50 text-white' : 'text-blue-200'}`}>
          <span>{i + 1}. {l.userId === eu ? 'Você' : l.userId.slice(0, 8)}</span>
          <span className="font-bold">{l.score}</span>
        </li>
      ))}
    </ol>
  )
}
