export type Repository = {
  id: number; name: string; full_name: string; description: string | null; html_url: string
  stargazers_count: number; forks_count: number; open_issues_count: number; language: string | null
  updated_at: string; created_at: string; topics: string[]; license: { spdx_id: string } | null
  owner: { login: string; avatar_url: string; html_url: string }
}
export type SearchResponse = { total_count: number; incomplete_results: boolean; items: Repository[] }

export async function searchRepositories(query: string, signal?: AbortSignal): Promise<SearchResponse> {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30`,
    { headers: { Accept: 'application/vnd.github+json' }, signal },
  )
  if (!response.ok) {
    if (response.status === 403 || response.status === 429) throw new Error('GitHub-API-Limit erreicht. Bitte warte kurz und versuche es erneut.')
    if (response.status === 422) throw new Error('Die Suche ist ungültig. Passe deinen Suchbegriff an.')
    throw new Error(`GitHub-API antwortet mit Fehler ${response.status}.`)
  }
  return response.json() as Promise<SearchResponse>
}
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('de-DE', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}
export function relativeDate(value: string): string {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime())
  const days = Math.floor(elapsed / 86400000)
  if (days === 0) return 'heute'
  if (days === 1) return 'gestern'
  if (days < 30) return `vor ${days} Tagen`
  if (days < 365) return `vor ${Math.floor(days / 30)} Mon.`
  return `vor ${Math.floor(days / 365)} J.`
}
