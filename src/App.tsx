import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Activity, ArrowDownUp, ArrowRight, Bookmark, Check, ChevronDown, Code2, ExternalLink, GitFork, Github, Globe2, LayoutGrid, List, Moon, Search, ShieldCheck, SlidersHorizontal, Sparkles, Star, Sun, X, Download, RefreshCw, CircleHelp } from 'lucide-react'
import { formatCompact, relativeDate, searchRepositories, type Repository } from './lib/github'

type Theme = 'dark' | 'light'
type SortKey = 'stars' | 'updated' | 'forks'
const starterQueries = [
  { label: 'KI & Machine Learning', query: 'machine-learning stars:>5000' },
  { label: 'Developer Tools', query: 'developer-tools stars:>3000' },
  { label: 'Web Frameworks', query: 'web-framework stars:>5000' },
  { label: 'Self-hosted', query: 'self-hosted stars:>1000' },
]
function readSaved<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback }
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => readSaved('gitscope-theme', 'dark'))
  const [query, setQuery] = useState('open-source stars:>1000')
  const [activeQuery, setActiveQuery] = useState('open-source stars:>1000')
  const [repos, setRepos] = useState<Repository[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sort, setSort] = useState<SortKey>('stars')
  const [language, setLanguage] = useState('Alle Sprachen')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [saved, setSaved] = useState<number[]>(() => readSaved('gitscope-saved', []))
  const [compare, setCompare] = useState<number[]>([])
  const [showSaved, setShowSaved] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [mobileFilters, setMobileFilters] = useState(false)

  useEffect(() => { localStorage.setItem('gitscope-theme', JSON.stringify(theme)) }, [theme])
  useEffect(() => { localStorage.setItem('gitscope-saved', JSON.stringify(saved)) }, [saved])

  async function runSearch(search = activeQuery) {
    setLoading(true); setError(''); setActiveQuery(search)
    try { const data = await searchRepositories(search); setRepos(data.items); setTotal(data.total_count) }
    catch (e) { setError(e instanceof Error ? e.message : 'Unbekannter Fehler bei der Suche.'); setRepos([]); setTotal(0) }
    finally { setLoading(false) }
  }
  useEffect(() => { void runSearch('open-source stars:>1000') }, [])

  const languages = useMemo(() => ['Alle Sprachen', ...Array.from(new Set(repos.map(r => r.language).filter((x): x is string => Boolean(x)))).sort()], [repos])
  const visibleRepos = useMemo(() => [...repos.filter(r => (!showSaved || saved.includes(r.id)) && (language === 'Alle Sprachen' || r.language === language))]
    .sort((a, b) => sort === 'stars' ? b.stargazers_count - a.stargazers_count : sort === 'forks' ? b.forks_count - a.forks_count : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
  [repos, showSaved, saved, language, sort])
  const compareRepos = repos.filter(r => compare.includes(r.id))
  function submitSearch(e: FormEvent) { e.preventDefault(); void runSearch(query.trim() || 'stars:>1000') }
  function toggleSaved(id: number) { setSaved(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]) }
  function toggleCompare(id: number) { setCompare(old => old.includes(id) ? old.filter(x => x !== id) : old.length >= 3 ? old : [...old, id]) }
  function exportJson() {
    const blob = new Blob([JSON.stringify(visibleRepos, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = 'gitscope-repositories.json'; a.click(); URL.revokeObjectURL(url)
  }

  return <div className={`app ${theme}`} data-testid="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#" aria-label="GitScope Startseite"><span className="brand-mark"><Activity size={21}/></span><span>Git<span>Scope</span><small>OPEN SOURCE INTELLIGENCE</small></span></a>
      <div className="workspace"><div className="workspace-icon"><Globe2 size={17}/></div><div><strong>Public Explorer</strong><small>GitHub Daten live</small></div><ChevronDown size={15} className="muted"/></div>
      <div className="side-label">WORKSPACE</div>
      <button className={`nav-item ${!showSaved ? 'active' : ''}`} onClick={() => setShowSaved(false)}><LayoutGrid size={17}/> Entdecken <span className="nav-count">01</span></button>
      <button className={`nav-item ${showSaved ? 'active' : ''}`} onClick={() => setShowSaved(true)}><Bookmark size={17}/> Merkliste <span className="nav-count">{saved.length}</span></button>
      <button className={`nav-item ${showCompare ? 'active' : ''}`} onClick={() => setShowCompare(v => !v)}><ArrowDownUp size={17}/> Vergleichen <span className="nav-count">{compare.length}/3</span></button>
      <div className="side-label side-label-gap">QUICK DISCOVER</div>
      {starterQueries.map((item, i) => <button className="quick-link" key={item.label} onClick={() => { setQuery(item.query); setShowSaved(false); void runSearch(item.query) }}><span className={`quick-dot dot-${i}`}/>{item.label}<ArrowRight size={14}/></button>)}
      <div className="sidebar-bottom"><div className="api-status"><span className="status-dot"/><div><strong>GitHub API</strong><small>Verbindung bereit</small></div><ShieldCheck size={17}/></div><div className="profile"><div className="profile-avatar">GS</div><div><strong>Guest Explorer</strong><small>Lokale Sitzung</small></div><CircleHelp size={17}/></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{showSaved ? 'Merkliste' : showCompare ? 'Vergleich' : 'Entdecken'}</strong></div><div className="top-actions"><span className="live-label"><span className="status-dot"/> LIVE DATA</span><button className="icon-btn" title="Darstellung umschalten" aria-label="Darstellung umschalten" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button><a className="github-link" href="https://github.com" target="_blank" rel="noreferrer"><Github size={17}/> GitHub <ExternalLink size={13}/></a></div></header>
      <div className="content">
        <section className="hero"><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> OPEN SOURCE INTELLIGENCE</div><h1>Das Open-Source-Universum.<br/><span>Durchsuche es.</span></h1><p>Finde spannende Repositories, erkenne Trends und entdecke die Tools, die die nächste Generation von Software antreiben.</p>
          <form className="search-form" onSubmit={submitSearch}><Search size={19}/><input aria-label="GitHub-Repositories suchen" value={query} onChange={e => setQuery(e.target.value)} placeholder="Repos, Topics, Sprachen suchen …"/><kbd>↵</kbd><button type="submit" disabled={loading}>{loading ? <RefreshCw className="spin" size={17}/> : 'Entdecken'}</button></form>
          <div className="search-hint"><span>TRY:</span>{[['react','react stars:>10000'],['llm','llm stars:>5000'],['rust','rust stars:>3000'],['cli tools','topic:cli stars:>1000']].map(([label,q])=><button key={label} onClick={() => { setQuery(q); void runSearch(q) }}>{label}</button>)}</div>
        </div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><div className="art-core"><Github size={45}/></div><div className="float-card float-stars"><Star size={14} fill="currentColor"/><span><strong>Stars</strong><small>Community signal</small></span></div><div className="float-card float-code"><Code2 size={15}/><span><strong>Open source</strong><small>Built in the open</small></span></div><div className="art-spark spark-a">✳</div><div className="art-spark spark-b">✦</div></div></section>
        <section className="stats-grid">
          <div className="stat-card"><div className="stat-top"><span>GEFUNDENE REPOS</span><span className="stat-icon purple"><Search size={16}/></span></div><div className="stat-value">{loading ? '…' : formatCompact(total)}</div><div className="stat-foot"><span className="stat-neutral">Suchergebnisse</span><span>GitHub Index</span></div></div>
          <div className="stat-card"><div className="stat-top"><span>GEMERKT</span><span className="stat-icon amber"><Bookmark size={16}/></span></div><div className="stat-value">{saved.length}</div><div className="stat-foot"><span className="stat-neutral">Deine Sammlung</span><span>lokal gespeichert</span></div></div>
          <div className="stat-card"><div className="stat-top"><span>IM VERGLEICH</span><span className="stat-icon blue"><ArrowDownUp size={16}/></span></div><div className="stat-value">{compare.length}<span className="stat-sub"> / 3</span></div><div className="stat-foot"><span className="stat-neutral">Repositories</span><span>Side-by-side</span></div></div>
          <div className="stat-card"><div className="stat-top"><span>DATENQUELLE</span><span className="stat-icon green"><Activity size={16}/></span></div><div className="stat-value status-value"><span className="status-dot"/>Live API</div><div className="stat-foot"><span className="stat-neutral">GitHub REST API</span><span>ohne Token</span></div></div>
        </section>
        {showCompare && <section className="compare-panel"><div className="section-heading"><div><div className="eyebrow">SIDE-BY-SIDE</div><h2>Repository-Vergleich <span className="count-pill">{compareRepos.length}/3</span></h2></div><button className="text-button" onClick={() => setCompare([])}>Auswahl leeren <X size={14}/></button></div>{compareRepos.length ? <div className="compare-grid">{compareRepos.map(r => <div className="compare-card" key={r.id}><strong>{r.full_name}</strong><span><Star size={14}/> {formatCompact(r.stargazers_count)} Stars</span><span><GitFork size={14}/> {formatCompact(r.forks_count)} Forks</span><span>{r.language || 'Sprache unbekannt'}</span><button onClick={() => toggleCompare(r.id)}>Entfernen</button></div>)}</div> : <p className="empty-note">Wähle bis zu drei Repositories über „Vergleichen“ auf den Karten aus.</p>}</section>}
        <section className="results-section">
          <div className="section-heading"><div><div className="eyebrow">{showSaved ? 'DEINE SAMMLUNG' : 'DISCOVERY FEED'}</div><h2>{showSaved ? 'Deine Merkliste' : 'Entdecke Repositories'} <span className="count-pill">{visibleRepos.length}</span></h2><p className="section-description">{showSaved ? 'Deine gespeicherten Open-Source-Favoriten.' : 'Beliebte Projekte aus der Community, live von GitHub geladen.'}</p></div><div className="section-tools"><button className="tool-btn" onClick={() => setMobileFilters(v => !v)}><SlidersHorizontal size={16}/> Filter</button><button className="tool-btn" onClick={exportJson} title="Sichtbare Repositories als JSON exportieren"><Download size={16}/> Export</button><div className="view-switch"><button aria-label="Rasteransicht" className={view === 'grid' ? 'selected' : ''} onClick={() => setView('grid')}><LayoutGrid size={16}/></button><button aria-label="Listenansicht" className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')}><List size={16}/></button></div></div></div>
          <div className={`filters ${mobileFilters ? 'filters-open' : ''}`}><div className="filter-search"><Search size={15}/><span>{activeQuery}</span><button aria-label="Suche zurücksetzen" onClick={() => { setQuery(''); setActiveQuery('') }}><X size={13}/></button></div><label>Sprache<select aria-label="Sprache filtern" value={language} onChange={e => setLanguage(e.target.value)}>{languages.map(l => <option key={l}>{l}</option>)}</select></label><label>Sortieren<select aria-label="Sortierung" value={sort} onChange={e => setSort(e.target.value as SortKey)}><option value="stars">Meiste Stars</option><option value="updated">Zuletzt aktualisiert</option><option value="forks">Meiste Forks</option></select></label><span className="filter-result">{visibleRepos.length} Ergebnisse</span></div>
          {error && <div role="alert" className="error-box"><div><strong>Suche fehlgeschlagen</strong><p>{error}</p></div><button onClick={() => void runSearch()}><RefreshCw size={15}/> Erneut versuchen</button></div>}
          {loading && <div className="loading-state"><div className="loader"/><strong>Durchsuche GitHub …</strong><span>Hole aktuelle Repository-Daten</span></div>}
          {!loading && !error && visibleRepos.length === 0 && <div className="empty-state"><div className="empty-icon"><Search size={23}/></div><h3>Keine Repositories gefunden</h3><p>Versuche einen anderen Suchbegriff oder entferne den Sprachfilter.</p><button className="primary-btn" onClick={() => { setLanguage('Alle Sprachen'); setShowSaved(false); setQuery('stars:>1000'); void runSearch('stars:>1000') }}>Beliebte Projekte anzeigen</button></div>}
          {!loading && !error && visibleRepos.length > 0 && <div className={`repo-grid ${view === 'list' ? 'list-view' : ''}`}>{visibleRepos.map(repo => <article className="repo-card" key={repo.id}>
            <div className="repo-card-top"><div className="repo-owner"><img src={repo.owner.avatar_url} alt="" loading="lazy"/><span>{repo.owner.login}</span><span className="slash">/</span></div><button className={`bookmark-btn ${saved.includes(repo.id) ? 'is-saved' : ''}`} aria-label={saved.includes(repo.id) ? `${repo.full_name} aus Merkliste entfernen` : `${repo.full_name} merken`} title="Merken" onClick={() => toggleSaved(repo.id)}>{saved.includes(repo.id) ? <Check size={16}/> : <Bookmark size={16}/>}</button></div>
            <a className="repo-title" href={repo.html_url} target="_blank" rel="noreferrer">{repo.name}<ExternalLink size={13}/></a><p className="repo-description">{repo.description || 'Keine Beschreibung für dieses Repository vorhanden.'}</p>
            <div className="topic-row">{(repo.topics || []).slice(0,3).map(topic => <span className="topic" key={topic}>{topic}</span>)}</div>
            <div className="repo-metrics"><span><Star size={15}/> {formatCompact(repo.stargazers_count)}</span><span><GitFork size={15}/> {formatCompact(repo.forks_count)}</span><span className="issues-label">{formatCompact(repo.open_issues_count)} Issues</span></div>
            <div className="repo-footer"><span className="language-label">{repo.language && <i className={`language-dot ${repo.language.toLowerCase().replace(/[^a-z]/g,'')}`}/ >}{repo.language || 'Unbekannt'}</span><span className="updated-label">Update {relativeDate(repo.updated_at)}</span><button className={`compare-toggle ${compare.includes(repo.id) ? 'on' : ''}`} title="Zum Vergleich hinzufügen" onClick={() => toggleCompare(repo.id)}>{compare.includes(repo.id) ? <Check size={14}/> : <ArrowDownUp size={14}/>}</button></div>
          </article>)}</div>}
          <div className="results-bottom"><span>Live-Ergebnisse von <strong>GitHub API</strong> · Daten können sich jederzeit ändern</span><button onClick={() => void runSearch()} disabled={loading}><RefreshCw size={14}/> Aktualisieren</button></div>
        </section>
        <footer className="footer"><span>© 2026 GitScope. Für die Open-Source-Community gebaut.</span><span><a href="https://docs.github.com/en/rest" target="_blank" rel="noreferrer">GitHub API Docs <ExternalLink size={11}/></a><i/>React + TypeScript</span></footer>
      </div>
    </main>
  </div>
}
