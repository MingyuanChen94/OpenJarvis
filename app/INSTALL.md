# Installing & Running the OpenJarvis App

A complete, step-by-step guide to installing, running, building, and deploying the
standalone OpenJarvis web app (the project under **`app/`**).

This app is a self-contained **React + Vite PWA**. It can run two ways:

- **Demo mode** — no backend required. Every screen works and the chat "streams"
  simulated replies. Great for trying the UI or doing front-end work.
- **Live mode** — talks to a running `jarvis serve` backend for real models,
  streaming, and telemetry.

You do **not** need the Python backend, Ollama, or a model just to start the app.

---

## Table of contents

1. [TL;DR (fastest start)](#1-tldr-fastest-start)
2. [Prerequisites](#2-prerequisites)
3. [Get the code](#3-get-the-code)
4. [Install dependencies](#4-install-dependencies)
5. [Run in development (demo mode)](#5-run-in-development-demo-mode)
6. [Connect a real backend (live mode)](#6-connect-a-real-backend-live-mode)
7. [Production build & preview](#7-production-build--preview)
8. [Install it as an app (PWA)](#8-install-it-as-an-app-pwa)
9. [Deploy / serve the built app](#9-deploy--serve-the-built-app)
10. [Configuration reference](#10-configuration-reference)
11. [npm scripts reference](#11-npm-scripts-reference)
12. [Verify your setup](#12-verify-your-setup)
13. [Troubleshooting](#13-troubleshooting)
14. [Update / reset / uninstall](#14-update--reset--uninstall)
15. [Platform notes](#15-platform-notes)
16. [Optional: wrap as a native app](#16-optional-wrap-as-a-native-app)
17. [FAQ](#17-faq)

---

## 1. TL;DR (fastest start)

```bash
# from the repository root
cd app
npm install
npm run dev
```

Open **http://localhost:5174**. With no backend running you'll land in **demo mode**
(a banner says so) and can use the whole app immediately.

To go live later, start the backend in another terminal from the repo root
(`jarvis serve --port 8000`) and reload — the dev server proxies to it automatically.

---

## 2. Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | **≥ 20** (22 LTS recommended) | `node -v` to check. Install from [nodejs.org](https://nodejs.org) or via `nvm`/`fnm`/Volta. |
| **Package manager** | npm ≥ 10 (ships with Node) | `pnpm` ≥ 9 or `yarn` also work — pick one and be consistent. |
| **Git** | any recent | To clone the repository. |
| Modern browser | Chrome/Edge/Firefox/Safari | For PWA install, use a Chromium browser or Safari. |

**Optional (only for live mode):**

- The **OpenJarvis backend** (`jarvis` CLI), plus **Ollama** and a local model. See
  [§6](#6-connect-a-real-backend-live-mode).

Check your toolchain:

```bash
node -v   # v20.x or v22.x
npm -v    # 10.x or newer
```

> Using `nvm`? Run `nvm install 22 && nvm use 22`.

---

## 3. Get the code

If you already have the OpenJarvis repository, skip to [§4](#4-install-dependencies).

```bash
git clone https://github.com/open-jarvis/OpenJarvis.git
cd OpenJarvis/app
```

The app is fully contained in the `app/` directory.

---

## 4. Install dependencies

From inside `app/`:

```bash
npm install
```

This installs ~650 packages (React, Vite, Tailwind, Recharts, Radix, etc.) and takes
about a minute on a fresh machine. A `node_modules/` folder and a populated
`package-lock.json` are expected; both are git-ignored except the lockfile.

Prefer pnpm/yarn? Use `pnpm install` or `yarn install` instead — any of them works.

---

## 5. Run in development (demo mode)

```bash
npm run dev
```

Expected output:

```
  VITE v6.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

Open **http://localhost:5174**. Because no backend is running, the app:

- detects this via a `GET /health` probe,
- shows a **"Demo mode — no backend detected"** banner, and
- serves simulated models, telemetry, and a **streamed** mock chat reply (including a
  tool-call card when your prompt implies a tool, e.g. "search the news…").

This is the quickest way to explore Chat, Dashboard, Agents, and Settings, and to do
UI work. The dev server has hot-module reload — edits appear instantly.

**Force demo mode** even when a backend is reachable (handy for front-end work):

```bash
VITE_FORCE_MOCK=1 npm run dev
```

You can also toggle it at runtime in **Settings → General → Demo mode**, or from the
**⌘K / Ctrl+K** command palette ("Toggle demo mode").

---

## 6. Connect a real backend (live mode)

The app speaks the OpenAI-compatible API that `jarvis serve` exposes. There are three
ways to point it at a backend; pick one.

### 6.0 Start the backend

If you don't have the backend yet, install it (one-liner from the project root docs):

| Platform | Command |
|---|---|
| macOS · Linux · WSL2 | `curl -fsSL https://open-jarvis.github.io/OpenJarvis/install.sh \| bash` |
| Native Windows | `irm https://open-jarvis.github.io/OpenJarvis/install.ps1 \| iex` |

Then start the API server (from the OpenJarvis repo root, a separate terminal):

```bash
jarvis serve --port 8000
```

Wait until it reports it's listening and `GET http://localhost:8000/health` returns OK.

### 6.1 Method A — dev proxy (recommended, zero config)

Just run the app normally:

```bash
npm run dev
```

The Vite dev server **proxies** `/v1`, `/api`, and `/health` to
`http://localhost:8000`, so the browser makes **same-origin** requests and there are
no CORS issues. Reload the app — the demo banner disappears and the connection badge
(top-right) turns green. The chat now streams real model output.

Backend on a different host/port? Set the proxy target when starting the dev server:

```bash
VITE_API_URL=http://localhost:9000 npm run dev
```

### 6.2 Method B — absolute API URL via env

Create a `.env` from the template and set the base URL:

```bash
cp .env.example .env
# edit .env:
#   VITE_API_URL=http://localhost:8000
#   VITE_OPENJARVIS_API_KEY=        # only if the server requires a key
```

With `VITE_API_URL` set, the app calls that URL directly. For `localhost:8000` this
works out of the box because the backend's CORS allow-list includes the dev origin
(`localhost:5174`). For a **remote/LAN** backend, that origin must be in the server's
allow-list (see [§13](#13-troubleshooting)).

### 6.3 Method C — configure it in the UI

Open **Settings → Connection** and set:

- **API base URL** — e.g. `http://localhost:8000` (leave blank to use the proxy/same
  origin),
- **API key** — only if the server was started with auth enabled,

then click **Test connection**. These settings are saved in your browser.

> **Auth:** if `jarvis serve` runs with an API key, set the key (env `VITE_OPENJARVIS_API_KEY`
> or Settings → Connection). The app sends it as `Authorization: Bearer <key>`.

---

## 7. Production build & preview

Build an optimized, static bundle (also generates the PWA service worker + manifest):

```bash
npm run build
```

Output goes to **`app/dist/`**. The build runs a TypeScript check first and fails on
type errors. You'll see chunk sizes printed, plus:

```
PWA v1.x
mode      generateSW
precache  …
files generated  dist/sw.js, dist/manifest.webmanifest
```

Locally preview the production build:

```bash
npm run preview
```

This serves `dist/` at **http://localhost:4173**. Use this to test the installable
PWA and offline behavior.

> Note: when you open the **preview** (or any deploy) without a backend on the same
> origin, the app falls back to demo mode — that's expected. Put a backend behind the
> same origin (or set an API URL) for live data.

---

## 8. Install it as an app (PWA)

The production build is an installable Progressive Web App.

1. Run `npm run build && npm run preview` (or deploy — see [§9](#9-deploy--serve-the-built-app)).
2. Open the URL over **http://localhost** or **https://** (PWAs require a secure
   context; `localhost` counts as secure).

**Desktop (Chrome / Edge):** click the **install icon** in the address bar, or menu →
*Install OpenJarvis…*. It opens in its own standalone window.

**Android (Chrome):** menu → *Add to Home screen* / *Install app*.

**iOS / iPadOS (Safari):** Share → *Add to Home Screen*.

Once installed it runs full-window with its own icon, and the app shell works offline
(API calls still need a backend).

---

## 9. Deploy / serve the built app

`dist/` is plain static files — host it anywhere:

```bash
npm run build
# then serve the dist/ folder with any static host
npx serve dist            # quick local check
# or copy dist/ to Netlify, Vercel, GitHub Pages, Nginx, S3+CloudFront, etc.
```

**SPA routing:** configure your host to fall back to `index.html` for unknown paths
(client-side routes like `/dashboard`). `vite preview` and most static hosts do this
automatically; for Nginx use `try_files $uri /index.html;`.

**Containerized (Docker / Podman / Apple `container`):** the repo ships a `Dockerfile`
that builds an nginx image serving the static PWA (with SPA fallback and an optional,
SSE-safe backend proxy). See **[CONTAINER.md](./CONTAINER.md)** — it covers Apple's
`container` tool on Apple Silicon Macs as well as Docker/Podman.

**Connecting to a backend in production:**

- **Same origin (simplest):** serve `dist/` behind the same host/proxy as the backend
  so `/v1`, `/api`, `/health` resolve to `jarvis serve`. No CORS needed.
- **Different origin:** set the API base URL (build-time `VITE_API_URL`, or per-user in
  Settings) **and** ensure the backend's CORS allow-list includes your app's origin.

---

## 10. Configuration reference

### Environment variables (`.env`, copy from `.env.example`)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | _(unset)_ | Absolute backend base URL. Unset = same-origin (dev proxy / co-hosted). Also sets the dev-proxy target. |
| `VITE_OPENJARVIS_API_KEY` | _(unset)_ | Bearer key sent to the backend if it requires auth. |
| `VITE_FORCE_MOCK` | _(unset)_ | `1`/`true` forces demo mode regardless of backend availability. |

> `VITE_*` vars are read at **build/dev-server start**, baked into the client. Restart
> `npm run dev` after changing `.env`.

### Runtime settings (stored in your browser, no rebuild)

Set in **Settings**: theme (system/light/dark), demo mode (auto/on/off), API base URL,
API key, model, persona. Persisted under `localStorage` keys `oj-app-settings` and
`oj-app-conversations`.

### Key ports

| Port | What |
|---|---|
| **5174** | `npm run dev` (Vite dev server) |
| **4173** | `npm run preview` (production preview) |
| **8000** | default `jarvis serve` backend (proxy target) |

---

## 11. npm scripts reference

| Script | Command | Does |
|---|---|---|
| `npm run dev` | `vite` | Dev server with HMR on :5174. |
| `npm run build` | `tsc --noEmit && vite build` | Type-check then build `dist/` (+ PWA assets). |
| `npm run preview` | `vite preview --port 4173` | Serve the production build on :4173. |
| `npm run typecheck` | `tsc --noEmit` | Type-check only. |
| `npm test` | `vitest run` | Run the unit-test suite once. |
| `npm run test:watch` | `vitest` | Run tests in watch mode. |

---

## 12. Verify your setup

A quick end-to-end check (all run **without** a backend, thanks to demo mode):

```bash
npm run typecheck   # no type errors
npm test            # all tests pass
npm run build       # produces dist/ + sw.js + manifest.webmanifest
npm run dev         # open http://localhost:5174 — demo banner, chat streams a reply
```

If all four succeed, your install is good.

---

## 13. Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| **`npm install` fails** | Check Node ≥ 20 (`node -v`). Behind a proxy/firewall? Ensure npm registry access. Retry; clear cache with `npm cache clean --force` if needed. |
| **Port 5174 already in use** | Stop the other process, or run `npm run dev -- --port 5180`. |
| **Stuck in demo mode with a backend running** | Backend not reachable at the expected URL. Confirm `curl http://localhost:8000/health` returns OK. Check Settings → Connection → **Test connection**. If using `VITE_API_URL`, restart `npm run dev` after editing `.env`. |
| **CORS error in the console (live mode)** | Happens only when calling a backend on a **different origin**. Use the dev proxy (don't set `VITE_API_URL`), co-host behind one origin, or add your origin to the backend's CORS allow-list. The dev origin `localhost:5174` is allowed by default. |
| **401 / Unauthorized** | The server requires an API key. Set `VITE_OPENJARVIS_API_KEY` or Settings → Connection → API key. |
| **Blank page after deploy, or stale content** | SPA fallback not configured (serve `index.html` for unknown routes). For stale assets, the service worker may be caching — hard-reload, or in DevTools → Application → Service Workers → *Unregister*, then reload. |
| **Type errors on `npm run build`** | Run `npm run typecheck` to see them. Ensure you're on Node ≥ 20 and ran `npm install` after pulling changes. |
| **`vite: command not found`** | Dependencies aren't installed — run `npm install` inside `app/`. |
| **Charts/markdown briefly missing then appear** | Expected — Recharts (Dashboard) and react-markdown are code-split and load on demand. |

---

## 14. Update / reset / uninstall

**Update to the latest code:**

```bash
git pull
cd app
npm install        # pick up any dependency changes
npm run dev
```

**Reset local state** (conversations, settings): in the browser DevTools console,
`localStorage.clear()` on the app's origin, or clear site data. (Uninstalling the PWA
does not necessarily clear storage.)

**Clean rebuild:**

```bash
rm -rf node_modules dist
npm install
npm run build
```

**Uninstall the PWA:** from the installed app's menu choose *Uninstall*, or remove it
from your OS app list / home screen.

---

## 15. Platform notes

- **macOS / Linux:** no special steps. Use `nvm`/`fnm` to manage Node if you like.
- **Windows:** use PowerShell or Windows Terminal. Node from nodejs.org includes npm.
  All scripts are cross-platform (no shell-specific syntax).
- **WSL2:** run everything inside the Linux environment. To open the dev server from
  the Windows browser, `localhost:5174` is forwarded automatically by WSL2. If you run
  the backend on Windows but the app in WSL2 (or vice-versa), use `VITE_API_URL` with
  the correct host and ensure CORS allows the origin.

---

## 16. Optional: wrap as a native app

The PWA is the supported "app" form. The same `dist/` can later be wrapped without
changing app code:

- **Tauri:** point `tauri.conf.json` `frontendDist` at `app/dist` and reuse a desktop
  shell. (Requires the Rust toolchain; not built here.)
- **Capacitor:** `npm i -D @capacitor/cli && npx cap init` with `webDir: dist`, then
  `npx cap add ios` / `android`.

Only the API-base resolution would need a small native-host branch.

---

## 17. FAQ

**Do I need Python / Ollama / a model to start the app?**
No. The app starts in demo mode with zero backend. You only need the backend for real
model responses and live telemetry.

**Where do conversations and settings live?**
In your browser's `localStorage` (keys `oj-app-conversations`, `oj-app-settings`).
Nothing is sent anywhere unless a backend is connected.

**Which port does the app use?**
`5174` in dev, `4173` for the production preview. The backend default is `8000`.

**How do I switch models?**
Use the model picker in the chat composer (populated from `/v1/models` when live, or a
sample list in demo mode).

**Is voice input working?**
Speech-to-text and file upload aren't wired yet, so the mic/attachment buttons are
hidden by default. Set `VITE_FEATURE_VOICE=1` / `VITE_FEATURE_ATTACHMENTS=1` to show
the placeholder controls.
