# AGENTS.md — Guidance for AI Coding Agents

For general project information, see [CLAUDE.md](../CLAUDE.md). This file provides AI-specific patterns and conventions.

## Quick Reference

### Adding a New Route
1. Create file: `app/<route>/page.tsx`
2. Export default React component
3. Use `@/*` path alias for imports from datajuri root

**Example:**
```typescript
// app/about/page.tsx
import { MyComponent } from "@/components/MyComponent";

export default function About() {
  return <main>{/* content */}</main>;
}
```

### Adding a New Component
1. Create file: `components/<ComponentName>.tsx` (create `components/` directory if needed)
2. Use `"use client"` directive if the component uses hooks, event handlers, or browser APIs
3. Export named component; keep reusable

**Example:**
```typescript
"use client";

import { useState } from "react";

export function MyComponent() {
  const [state, setState] = useState("");
  return <div>{state}</div>;
}
```

### Styling

- **Tailwind utility classes**: Apply directly to elements (e.g., `className="flex items-center justify-between"`)
- **CSS variables for colors**: Use `--background` and `--foreground` from [app/globals.css](app/globals.css)
  - Automatically adapt to dark mode via `prefers-color-scheme: dark`
  - Example: `className="bg-[var(--background)] text-[var(--foreground)]"`
- **Global styles**: Add to [app/globals.css](app/globals.css) using Tailwind directives or standard CSS
- **Custom fonts**: Configured in [app/layout.tsx](app/layout.tsx); use CSS variable `--font-geist-sans` or `--font-geist-mono`

### TypeScript Conventions

- Strict mode enabled; no implicit `any` types
- Import types explicitly: `import type { MyType } from "@/types"` (if types exist)
- Use `.tsx` for files with JSX, `.ts` for pure TypeScript
- Use `@/*` alias for all imports from the datajuri root to avoid relative paths

### Linting & Formatting

- ESLint: `npm run lint` (uses flat config in `eslint.config.mjs`)
- Runs Next.js core Web Vitals and TypeScript rules
- Fix issues: ESLint may auto-fix some issues when re-running; others require manual fixes

### Dark Mode

The app automatically respects the user's OS dark mode preference via `prefers-color-scheme: dark`. CSS variables in `:root` switch colors. When adding new colors:
- Define in `app/globals.css` within `:root` (light) and `@media (prefers-color-scheme: dark)` (dark)
- Reference via `className="bg-[var(--color-name)]"`

## Common Tasks

| Task | Command | Notes |
|---|---|---|
| Start dev server | `npm run dev` from `datajuri/` | Opens `http://localhost:3000` |
| Build for production | `npm run build` | Creates optimized build |
| Lint code | `npm run lint` | Check for ESLint violations |
| Add dependencies | `npm install <package>` | Run from `datajuri/` |

## Conventions & Patterns

1. **Routing**: Prefer file-based routing in `app/` (Next.js App Router)
2. **Components**: Reusable components go in `components/` at datajuri root
3. **Imports**: Always use `@/*` path alias; never relative imports across folders
4. **Server vs. Client**: Use `"use client"` only when necessary (hooks, events, browser APIs)
5. **Types**: Define in same file or create a `types/` directory as needed

## Potential Gotchas

- **Path alias resolution**: If imports fail, ensure the path is relative to `datajuri/` root (not `app/`)
- **PostCSS & Tailwind 4**: Uses `@tailwindcss/postcss` plugin; some old Tailwind patterns may not work
- **Dark mode CSS vars**: Always define colors in both `:root` and `@media (prefers-color-scheme: dark)` for proper switching
- **TypeScript strict mode**: All values must have explicit types; no implicit `any`
- **ESLint flat config**: Configuration is in `eslint.config.mjs` (not `.eslintrc.json`)

## When to Update This File

- Adding project-wide conventions
- Documenting patterns that differ from Next.js defaults
- Clarifying gotchas encountered during development
- Adding tooling or build process changes
