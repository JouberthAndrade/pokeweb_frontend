import { describe, it, expect, beforeEach } from 'vitest'
import { getUserId } from '../guestId'

describe('getUserId', () => {
  beforeEach(() => localStorage.clear())

  it('gera e persiste um id na primeira chamada', () => {
    const id = getUserId()
    expect(id).toMatch(/[0-9a-f-]{36}/)
    expect(localStorage.getItem('pokeweb-user-id')).toBe(id)
  })

  it('reusa o mesmo id em chamadas seguintes', () => {
    const a = getUserId()
    const b = getUserId()
    expect(a).toBe(b)
  })
})
