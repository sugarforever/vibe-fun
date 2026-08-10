# vibe-fun

An **MCP Apps** server that distributes self-contained HTML mini-games to any MCP host.

Games live only here. A host that already speaks the MCP Apps protocol gains new
games with **zero client changes** — it just re-reads the catalog.

- Protocol: [MCP Apps / SEP-1865](https://modelcontextprotocol.io/seps/1865-mcp-apps-interactive-user-interfaces-for-mcp)
- Built on MCP SDK v2 (`@modelcontextprotocol/server`) + [`mcp-handler`](https://www.npmjs.com/package/mcp-handler)
- First two apps: **2048** and **Sudoku**

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

Whether the games actually *render and play* depends on the host. Rendering the
MCP Apps UI (a sandboxed HTML iframe over the postMessage/JSON-RPC bridge) is the
**host's** job — this server just ships spec-correct apps. State of the desktop
hosts today (verify against your installed version — this is moving fast):

| Host | Connect | Renders & plays the games? |
| --- | --- | --- |
| **ChatGPT** (desktop/web, Apps SDK) | Developer mode → remote MCP URL | ✅ Yes — interactive iframe |
| **Claude Desktop** | config file (stdio) or Connectors (remote) | ⚠️ Not yet — tools work, UI falls back to text |
| **Codex** (CLI / IDE agent) | `config.toml` | ❌ No — tool-caller only, no app rendering |

This server emits the standard SEP-1865 contract (`text/html;profile=mcp-app` +
`_meta.ui.resourceUri`) and also sets the `openai/outputTemplate` alias, so it
renders **as-is** in ChatGPT — no OpenAI-specific build needed.

> Want a guaranteed-playable target right now, on any machine? Use the built-in
> **play page** (bottom of this section) — a reference host that renders and
> plays the apps locally.

### ChatGPT — renders the apps

Requirements: a **paid** ChatGPT plan (Plus/Pro/Business/Enterprise/Edu) and a
**public HTTPS** MCP URL (deploy to Vercel, or tunnel localhost with ngrok —
ChatGPT connects from OpenAI's servers, not your machine).

1. **Settings → Connectors → Advanced → Developer mode** → turn it on.
2. In **Connectors**, click **+** → create a developer-mode app for a **remote
   MCP server** → paste your URL:
   ```
   https://vibe-fun.vercel.app/api/mcp
   ```
   Transport: **Streaming HTTP**. Auth: **No authentication**.
3. The app appears in the composer's **Developer mode** tool. Ask, e.g.
   *"open 2048"* or *"start a hard sudoku"* — the board renders inline and is
   playable, and progress persists via the host bridge.

### Claude Desktop — connects today, UI rendering pending

Claude Desktop can list and call the tools, but **does not yet render** MCP Apps
interactive UI (it currently shows the text fallback — tracked upstream in
`modelcontextprotocol/ext-apps`). Still useful for exercising the tools; not yet
for playing.

**Local (stdio)** — edit `claude_desktop_config.json`, then restart the app:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vibe-fun": {
      "command": "/absolute/path/to/npx",
      "args": ["tsx", "/absolute/path/to/vibe-fun/bin/stdio.ts"]
    }
  }
}
```

Use **absolute paths** — Claude Desktop launches with a minimal `PATH`, so bare
`npx`/`node` often fail (`which npx` to find it). Run `npm install` in the repo
first.

**Remote (Streamable HTTP)** — not via the config file. Add it in **Settings →
Connectors → Add custom connector** and paste `https://vibe-fun.vercel.app/api/mcp`.

### Codex — tool-caller, no rendering

Codex (CLI and IDE agent) consumes MCP servers as **tools only** — it has no app
iframe, so the games aren't playable there. If you just want it to see/call the
tools, add to `~/.codex/config.toml`:

```toml
[mcp_servers.vibe-fun]
url = "https://vibe-fun.vercel.app/api/mcp"
```

### Play it now (no host needed)

```bash
npm run dev
# open http://localhost:3000/play/2048
#      http://localhost:3000/play/sudoku
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
    index.ts             # the catalog (APPS)
  mcp/register.ts        # registerApps(server) — shared by both transports
  site.ts                # site config used by pages + SEO
docs/                    # protocol + "add an app" guide
```

## Add a new app

See [`docs/adding-an-app.md`](docs/adding-an-app.md). Short version: build one
self-contained HTML document and add one catalog entry. Nothing else changes.

## Docs

- [`docs/protocol.md`](docs/protocol.md) — the MCP Apps wire contract this server
  implements, plus the app-layer persistence convention.
- [`docs/adding-an-app.md`](docs/adding-an-app.md) — the single-point onboarding flow.
