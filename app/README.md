# OpenJarvis App

A fresh, standalone, installable web app (PWA) for OpenJarvis — a modern, highly
interactive UI over the `jarvis serve` API. Built from scratch with its own design
system; it does **not** touch or depend on the existing `frontend/` (Tauri) app.

> Runs fully **without a backend** thanks to an auto-detected demo/mock mode, so you
> can click through every screen and watch chat "stream" with zero setup.

> 📖 **New here? See [INSTALL.md](./INSTALL.md)** for a comprehensive step-by-step
> install, run, build, deploy, and troubleshooting guide. To run it as a container
> on an Apple Silicon Mac, see **[CONTAINER.md](./CONTAINER.md)** (Apple `container`,
> Docker, or Podman).

## Highlights

- **Flagship chat** — streaming responses with an animated caret, markdown + syntax
  highlighting, animated tool-call cards, model picker, conversation history, a rich
  composer (multiline, ⌘⏎ to send, stop button, attach/voice affordances).
- **Dashboard** — animated stat counters and live charts for cost-avoided-vs-cloud,
  power draw (radial gauge), and token throughput.
- **Agents** & **Settings** — manage background agents; configure theme, model, API
  base URL + key, demo mode, and persona.
- **App-wide polish** — ⌘K command palette, keyboard shortcuts, toasts, light/dark
  themes, motion micro-interactions, responsive layout (desktop → mobile), installable
  PWA with offline app-shell.

## Stack

React 19 · Vite 6 · TypeScript (strict) · Tailwind CSS v4 · Zustand · React Router ·
`motion` · Recharts · Radix primitives · `react-markdown` · `vite-plugin-pwa` · Vitest.

## Develop

```bash
cd app
npm install
npm run dev          # http://localhost:5174
```

With no backend running, the app starts in **demo mode** (a banner shows this) and
streams simulated replies. To go live, start the backend from the repo root and the
dev server will proxy to it (same-origin, so no CORS issues):

```bash
jarvis serve --port 8000     # in the OpenJarvis repo root
```

The Vite dev server proxies `/v1`, `/api`, and `/health` to `http://localhost:8000`.
Point at a different backend with `VITE_API_URL`, or set the API base URL / key in
**Settings → Connection**. Copy `.env.example` to `.env` to configure.

## Build, typecheck, test

```bash
npm run typecheck    # tsc --noEmit
npm run build        # tsc + vite build → dist/ (+ service worker, manifest)
npm test             # vitest (SSE parser, mock stream, formatters, a component)
npm run preview      # serve the production build on :4173
```

All of the above run without a backend (mock mode), so they work in CI.

## Demo / mock mode

`useBackendStatus` (`src/hooks/useBackendStatus.ts`) probes `GET /health` on load. If
unreachable, `src/lib/transport.ts` routes every data call and the chat stream to
`src/lib/mock.ts` (simulated token stream, fake models/telemetry/savings). Force it
with `VITE_FORCE_MOCK=1`, or toggle it in **Settings → General** / the command palette.

## How it talks to the backend

OpenAI-compatible, mirroring the contracts the server exposes:

- `POST /v1/chat/completions` (SSE; OpenAI-style `data:` chunks ending in `[DONE]`,
  plus named `event: tool_call_start|tool_call_end` blocks) — `src/lib/sse.ts`.
- `GET /v1/models`, `/v1/info`, `/v1/savings`, `/v1/telemetry/energy`,
  `/v1/telemetry/stats`, `/v1/managed-agents`, `/health` — `src/lib/api.ts`.
- Optional `Authorization: Bearer <key>` when a key is set.

## Making it a native app later

The PWA is installable as-is. The same `dist/` can be wrapped without app-code changes:
**Tauri** (point `tauri.conf.json` `frontendDist` at `app/dist`) or **Capacitor**
(`webDir: dist`). Only the API base resolution would gain a native-host branch.

## Layout

```
src/
  components/  ui · layout · chat · dashboard · agents · settings · common
  hooks/       theme · backend status · models · telemetry · streaming chat · hotkeys
  lib/         api · sse · mock · transport · format · cn
  store/       settings · chat · ui   (Zustand, persisted)
  index.css    Tailwind v4 @theme design tokens (light/dark)
```
