import { describe, expect, it, vi, afterEach } from 'vitest'
import { formatCompact, relativeDate, searchRepositories } from './github'
describe('formatCompact', () => { it('formats large values compactly', () => { expect(formatCompact(1200)).toBeTruthy() }) })
describe('relativeDate', () => {
  afterEach(() => vi.useRealTimers())
  it('describes today', () => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-01-10T12:00:00Z')); expect(relativeDate('2026-01-10T08:00:00Z')).toBe('heute') })
  it('describes yesterday', () => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-01-10T12:00:00Z')); expect(relativeDate('2026-01-09T08:00:00Z')).toBe('gestern') })
})
describe('searchRepositories', () => {
  afterEach(() => vi.restoreAllMocks())
  it('encodes query and returns parsed data', async () => {
    const payload = { total_count: 1, incomplete_results: false, items: [] }
    const mock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }))
    await expect(searchRepositories('react stars:>10')).resolves.toEqual(payload)
    expect(mock.mock.calls[0][0]).toContain(encodeURIComponent('react stars:>10'))
  })
  it('explains API rate limits', async () => { vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 403 })); await expect(searchRepositories('react')).rejects.toThrow(/API-Limit/) })
})
