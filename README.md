# vibe-fun

An **MCP Apps** server that distributes self-contained HTML mini-games to any MCP host.

Games live only here. A host that already speaks the MCP Apps protocol gains new
games with **zero client changes** — it just re-reads the catalog.

- Protocol: [MCP Apps / SEP-1865](https://modelcontextprotocol.io/seps/1865-mcp-apps-interactive-user-interfaces-for-mcp)
- Built on MCP SDK v2 (`@modelcontextprotocol/server`) + [`mcp-handler`](https://www.npmjs.com/package/mcp-handler)
- Included games: **2048, Sudoku, and Minesweeper**

## What it exposes

Every app is published as:

| Piece | Value |
| --- | --- |
| **UI resource** | `ui://apps/<id>`, mimeType `text/html;profile=mcp-app`, a fully self-contained HTML document (inline CSS/JS, no external requests) |
| **Tool** | e.g. `play_2048`, linked to its UI via `_meta.ui.resourceUri`, with a plain-text fallback for non-UI hosts |
| **Catalog** | the `list_apps` tool returns the dynamic catalog (id, name, version, uiResourceUri, suggested size, size) |

## Run it

```bash
npm install

# HTTP (Streamable HTTP) — what you deploy
npm run dev            # http://localhost:3000/api/mcp

# stdio — for hosts that spawn a local process
npm run stdio
```

Open `http://localhost:3000` for the site, or
`http://localhost:3000/play/2048` to **play in the browser** — a reference
implementation of the host side of the MCP Apps bridge (sandboxed iframe +
JSON-RPC over postMessage + localStorage persistence). Add `?debug=1` (or use
the in-page “Developer log” toggle) to watch the full protocol live.

## How to use

Point any MCP host at the endpoint:

```
https://vibe-fun-gray.vercel.app/api/mcp
```

No account, no API key — pick **No authentication** wherever asked. Whether the
games actually *render and play* depends on the host (rendering the MCP Apps UI is
the host's job); calling the tools works much more widely.

| Host | How to connect | Plays the games? |
| --- | --- | --- |
| **ChatGPT** — web / Windows desktop | Developer mode → remote URL | ✅ Yes — interactive board |
| **ChatGPT** — macOS desktop app | *not supported* → use chatgpt.com | ❌ Dev mode not exposed on Mac |
| **Claude Desktop** | Custom connector (remote) or config (stdio) | ⚠️ Connects & calls tools; UI not rendered yet |
| **Codex** — CLI / IDE / desktop | `config.toml` or `codex mcp add` | ❌ Tool-caller only |
| **Any browser** | nothing to install | ✅ Yes — `/play/2048`, `/play/sudoku`, `/play/minesweeper` |

**→ Full step-by-step for each client (with exact click-paths, config files, and
troubleshooting): [`docs/install.md`](docs/install.md).**

Quick reference:

- **ChatGPT** (plays it): chatgpt.com → Settings → **Apps & Connectors → Advanced →
  Developer mode** on → **Create** a connector with the URL above and **No
  authentication** → enable it per chat → *"open 2048"*.
- **Claude Desktop**: Settings → **Connectors → Add → Add custom connector** → paste
  the URL. (Or stdio via `claude_desktop_config.json` — see the guide.)
- **Codex**: `codex mcp add vibe-fun --url https://vibe-fun-gray.vercel.app/api/mcp`

### Play it now (no host needed)

```bash
npm run dev
# open http://localhost:3000/play/2048
#      http://localhost:3000/play/sudoku
#      http://localhost:3000/play/minesweeper
```

The `/play` page is a reference MCP Apps **host**: it renders the app in a
sandboxed iframe, speaks the postMessage/JSON-RPC bridge, and persists progress
to localStorage. The raw protocol log is hidden by default — toggle “Developer
log” (or add `?debug=1`) to watch every message.

## Deploy to Vercel

Zero-config — it's a Next.js app. Push the repo and import it in Vercel, or:

```bash
npx vercel
```

The MCP endpoint is a standard serverless function at `/api/mcp`. The server is
**stateless** (durable game progress lives on the host side), so it needs **no
Redis/session store** and scales as plain functions.

> Note: the **stdio** transport is for local hosts only and does not run on
> Vercel. Vercel serves the **HTTP** endpoint. Both transports expose the exact
> same tools/resources because they share `lib/mcp/register.ts`.

## Project layout

```
app/
  api/mcp/route.ts       # Streamable HTTP MCP endpoint (mcp-handler)
  games/[id]/route.ts    # raw text/html preview (humans + play-page iframe)
  play/[id]/page.tsx     # in-browser play page (reference MCP Apps host)
  page.tsx               # marketing landing page
  layout.tsx             # site chrome + SEO metadata + JSON-LD
  sitemap.ts, robots.ts  # SEO
  opengraph-image.tsx    # dynamic OG image
bin/stdio.ts             # local stdio transport
components/              # Nav, Footer, PlayClient (host bridge), icons
lib/
  apps/
    types.ts             # catalog schema + protocol constants
    bridge.ts            # shared postMessage/JSON-RPC bridge + HTML builder
    game-2048.ts         # 2048 app (HTML + catalog entry)
    game-sudoku.ts       # Sudoku app (HTML + catalog entry)
    game-minesweeper.ts  # Minesweeper app (HTML + catalog entry)
    index.ts             # the catalog (APPS)
  mcp/register.ts        # registerApps(server) — shared by both transports
  site.ts                # site config used by pages + SEO
docs/                    # protocol + "add an app" guide
```

## Add a new app

See [`docs/adding-an-app.md`](docs/adding-an-app.md). Short version: build one
self-contained HTML document and add one catalog entry. Nothing else changes.

## Docs

- [`docs/install.md`](docs/install.md) — detailed per-client setup (ChatGPT, Claude
  Desktop, Codex) with exact click-paths, config files, and troubleshooting.
- [`docs/protocol.md`](docs/protocol.md) — the MCP Apps wire contract this server
  implements, plus the app-layer persistence convention.
- [`docs/adding-an-app.md`](docs/adding-an-app.md) — the single-point onboarding flow.
