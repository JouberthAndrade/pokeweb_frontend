import { API_BASE_URL } from './config'

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiOptions {
  method?: 'GET' | 'POST'
  body?: unknown
}

export async function apiFetch<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: opts.method ?? 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Sem conexão com o servidor')
  }

  if (!res.ok) {
    let message = `Erro ${res.status}`
    try {
      const erro = await res.json()
      if (erro?.message) message = Array.isArray(erro.message) ? erro.message.join(', ') : erro.message
    } catch { /* corpo não-JSON */ }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
