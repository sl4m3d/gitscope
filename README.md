# GitScope — Open Source Intelligence Dashboard

GitScope ist ein responsives Dashboard zum Entdecken, Filtern, Merken und Vergleichen öffentlicher GitHub-Repositories. Es nutzt die echte GitHub REST API — ohne Backend und ohne API-Key.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- Live-Suche über die GitHub Repository Search API, inklusive Suchsyntax (`stars:>1000`, `language:TypeScript`, `topic:cli`).
- Dark und Light Mode, responsives Layout für Desktop, Tablet und Smartphone.
- Filtern nach Sprache und Sortieren nach Stars, Forks oder letztem Update.
- Merkliste im Browser und Vergleich von bis zu drei Repositories.
- JSON-Export der aktuell sichtbaren Ergebnisse.
- Lade-, Fehler- und Leerzustände sowie verständliche Rate-Limit-Meldung.
- Tests mit Vitest und Testing Library.
- Automatisches Deployment über GitHub Actions zu GitHub Pages.

## Lokal starten

Voraussetzung: Node.js 20+ und npm.

```bash
npm install
npm run dev
```

## Tests und Build

```bash
npm test
npm run lint
npm run build
npm run preview
```

## GitHub Pages Deployment

1. Erstelle ein GitHub-Repository mit dem Namen **`gitscope`**.
2. Entpacke dieses Projekt und pushe den Inhalt in den `main`-Branch:

   ```bash
   git init
   git add .
   git commit -m "Initial GitScope release"
   git branch -M main
   git remote add origin https://github.com/DEIN-NUTZERNAME/gitscope.git
   git push -u origin main
   ```

3. Öffne **Settings → Pages** und stelle unter **Build and deployment → Source** die Option **GitHub Actions** ein.
4. Der Workflow `.github/workflows/deploy.yml` installiert die Abhängigkeiten, führt Tests und Build aus und veröffentlicht die App bei jedem Push auf `main`.
5. Den Fortschritt findest du unter **Actions → Deploy GitScope to GitHub Pages**. Nach erfolgreichem Lauf ist die Website unter `https://DEIN-NUTZERNAME.github.io/gitscope/` erreichbar.

**Hinweis:** Das Projekt-Repository heißt standardmäßig `gitscope`. Bei einem anderen Namen ändere in `vite.config.ts` die Base-URL `/gitscope/` entsprechend. Für ein User-/Organization-Repository namens `DEIN-NUTZERNAME.github.io` verwende `base: '/'`.

## GitHub API und Rate Limits

Die App ruft `https://api.github.com/search/repositories` direkt aus dem Browser auf. Unauthentifizierte Anfragen sind limitiert. Bei zu vielen Suchanfragen zeigt GitScope eine Fehlermeldung; warte dann kurz und versuche es erneut. Für eine öffentliche Demo ist kein Token notwendig. Lege persönliche Tokens niemals in Frontend-Code oder ein öffentliches Repository.

API-Dokumentation: https://docs.github.com/en/rest/search/search#search-repositories

## Projektstruktur

```text
gitscope/
├── .github/workflows/deploy.yml
├── src/
│   ├── lib/github.ts
│   ├── lib/github.test.ts
│   ├── test/setup.ts
│   ├── App.tsx
│   ├── App.test.tsx
│   ├── main.tsx
│   └── styles.css
├── index.html
├── package.json
├── tsconfig*.json
└── vite.config.ts
```

## Tech Stack

React 18 · TypeScript · Vite · GitHub REST API · Lucide React · Vitest · Testing Library · GitHub Actions · GitHub Pages

## Lizenz

MIT — siehe `LICENSE`.
