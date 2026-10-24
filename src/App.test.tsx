import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
const repo = {
  id: 1, name: 'awesome-project', full_name: 'octocat/awesome-project', description: 'A useful open-source project',
  html_url: 'https://github.com/octocat/awesome-project', stargazers_count: 1234, forks_count: 120,
  open_issues_count: 12, language: 'TypeScript', updated_at: '2026-01-10T10:00:00Z',
  created_at: '2024-01-10T10:00:00Z', topics: ['awesome', 'tools'], license: { spdx_id: 'MIT' },
  owner: { login: 'octocat', avatar_url: 'https://example.com/avatar.png', html_url: 'https://github.com/octocat' },
}
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear() })
describe('GitScope app', () => {
  it('renders API repository results', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ total_count: 1, incomplete_results: false, items: [repo] }), { status: 200 }))
    render(<App />); expect(await screen.findByText('awesome-project')).toBeInTheDocument(); expect(screen.getByText('octocat')).toBeInTheDocument()
  })
  it('shows an error when the API fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 403 }))
    render(<App />); expect(await screen.findByRole('alert')).toHaveTextContent('API-Limit')
  })
  it('toggles theme', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ total_count: 0, incomplete_results: false, items: [] }), { status: 200 }))
    render(<App />); await waitFor(() => expect(screen.getByTestId('app-shell')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'Darstellung umschalten' }))
    expect(screen.getByTestId('app-shell')).toHaveClass('light')
  })
})
