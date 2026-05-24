# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**DataJuri** — a Next.js 16 web application. All source code lives in the `datajuri/` subdirectory; run all commands from there.

## Dev environment setup

**Y: é um drive de rede.** Windows Defender quarentena arquivos `.js` escritos em `node_modules/` em compartilhamentos de rede. O workaround: o projeto roda a partir de um diretório local onde o Defender não interfere.

- **Source files (edit here):** `y:\PROJETO CLAUDE\4 - SISTEMA-GESTAO-INOVE\1 - GCJ-JURIDICO\datajuri\`
- **Dev runtime (node_modules + server):** `C:\Users\sandr\AppData\Local\Temp\datajuri-dev\`

### Starting the dev server

Double-click `y:\PROJETO CLAUDE\4 - SISTEMA-GESTAO-INOVE\1 - GCJ-JURIDICO\datajuri-start.bat` (syncs files, then starts server) **or** start manually:

```powershell
# Sync source files to dev dir
robocopy "y:\PROJETO CLAUDE\4 - SISTEMA-GESTAO-INOVE\1 - GCJ-JURIDICO\datajuri" C:\Users\sandr\AppData\Local\Temp\datajuri-dev /E /XD node_modules .next /NFL /NDL

# Start server
cd C:\Users\sandr\AppData\Local\Temp\datajuri-dev
node node_modules\next\dist\bin\next dev
```

App runs at **`http://localhost:3000`**

### After editing files

If the dev server doesn't hot-reload a change (because it's watching the temp dir, not X:), run robocopy manually to sync, or re-run `datajuri-start.bat`.

### npm commands (run from the temp dev dir)

```bat
cd C:\Users\sandr\AppData\Local\Temp\datajuri-dev
```

| Command | What it does |
|---|---|
| `node node_modules\next\dist\bin\next dev` | Dev server |
| `node node_modules\next\dist\bin\next build` | Production build |
| `node node_modules\.bin\eslint .` | Lint |

## Architecture

- **Framework**: Next.js 16 App Router (`datajuri/app/`)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 via PostCSS; global styles and CSS variables in `app/globals.css`; dark mode via `prefers-color-scheme`
- **Path alias**: `@/*` maps to the `datajuri/` root

### App Router conventions

| Path | Role |
|---|---|
| `app/layout.tsx` | Root layout — font loading (Geist), metadata, shell |
| `app/page.tsx` | Home route (`/`) |
| `app/globals.css` | Tailwind base + CSS custom properties |

New routes go in `app/<route>/page.tsx`; shared UI components belong in a `components/` directory at the `datajuri/` root (create it when needed).

## Key dependencies

| Package | Version | Notes |
|---|---|---|
| next | 16.2.6 | App Router only |
| react / react-dom | 19.2.4 | |
| typescript | 5.x | |
| tailwindcss | 4.x | `@tailwindcss/postcss` plugin |
| eslint | 9.x | Flat config in `eslint.config.mjs` |
