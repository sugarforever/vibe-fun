# Connect vibe-fun to your AI — installation guide

This is the detailed, per-client setup guide. It is **not** a single command — each
host has its own flow, and (importantly) **only some hosts actually render the
interactive game UI**. Read the support matrix first so you know what to expect.

## The one value you need

vibe-fun is a **remote MCP server** over Streamable HTTP:

```
https://vibe-fun-gray.vercel.app/api/mcp
```

- **No account, no API key, no auth** — pick "No authentication" wherever asked.
- It must be reached over **public HTTPS** (it already is). `localhost` is only for
  the local-stdio path below.

You can also run it **locally over stdio** (for hosts that spawn a process). That
needs a checkout — see [Local stdio prerequisites](#local-stdio-prerequisites).

## What actually works where

Rendering an interactive MCP App (the playable board in an iframe) is the **host's**
job, and support varies. Calling the tools works much more widely than rendering them.

| Host | How to connect | Plays the games? |
| --- | --- | --- |
| **ChatGPT** — web (chatgpt.com) or **Windows** desktop app | Developer mode → remote URL | ✅ **Yes** — renders the interactive board |
| **ChatGPT** — **macOS** desktop app | *not supported* | ❌ Developer mode isn't exposed → use **chatgpt.com** instead |
| **Claude Desktop** | Custom connector (remote) or config file (stdio) | ⚠️ Connects & lists tools, but the interactive UI isn't rendered yet (shows a text fallback) |
| **Codex** — CLI / IDE extension / desktop app | `config.toml` or `codex mcp add` | ❌ Tool-caller only — no game rendering |
| **Any web browser** | nothing to install | ✅ **Yes** — [play here](https://vibe-fun-gray.vercel.app/play/2048) |

> **TL;DR:** to *play the games in an assistant today*, use **ChatGPT**. Claude and
> Codex can discover and call the tools, but won't render the board yet. To just
> play, the browser `/play` page always works.

---

## ChatGPT — plays the games ✅

**Requirements**
- A **paid** plan: Plus, Pro, Business/Team, Enterprise, or Edu. **Free is excluded.**
- Developer mode is available on **chatgpt.com (web)** and the **Windows** desktop
  app. The **macOS desktop app does not expose it** — on a Mac, do everything at
  **chatgpt.com** (the server would show up but stay unusable in the Mac app).
- On Business/Enterprise/Edu, a workspace **admin** may need to allow connectors.

**1 — Turn on Developer mode**
1. Open **chatgpt.com** and sign in.
2. **Profile icon → Settings**.
3. Open **Apps & Connectors** (some accounts label it **Connectors**).
4. Scroll down → **Advanced settings**.
5. Toggle **Developer mode** **ON** (you'll see an "unverified servers" warning).

**2 — Add vibe-fun as a connector**
1. **Settings → Apps & Connectors → Create** (the **Create** / **+** button).
2. Fill the form:
   - **Name:** `vibe-fun`
   - **Description:** `Play games (2048, Sudoku) as MCP Apps`
   - **MCP Server URL:** `https://vibe-fun-gray.vercel.app/api/mcp`
   - **Authentication:** **No authentication**
3. Tick the **"I trust this application"** confirmation.
4. Click **Create**. ChatGPT connects and lists the tools (`list_apps`, `play_2048`,
   `play_sudoku`).

**3 — Use it in a chat**
Connectors are enabled **per chat**. In a new chat, click **+** in the composer →
**More / Developer mode** → enable **vibe-fun** for that chat. Then ask:

> *"Use vibe-fun to open 2048"* — the board renders inline and is playable.
> *"Start a hard Sudoku"* — passes `difficulty: hard` to the app.

Each tool call shows a confirmation you approve.

**Troubleshooting**
- **Connected but no tools** → click **Refresh** on the connector; confirm Developer
  mode is actually ON; make sure the URL ends in `/api/mcp`.
- **Board doesn't render** → the connector must be enabled **in that specific chat**
  via the **+** menu.
- **On a Mac and nothing works in the desktop app** → that's expected; use chatgpt.com.

---

## Claude Desktop — connects today, UI rendering pending ⚠️

Claude Desktop will **list and call** vibe-fun's tools, but as of now it does **not
render** the interactive MCP App board — it shows the plain-text fallback. Useful for
verifying the server; not yet for playing. Two ways to connect:

### Option A — Remote custom connector (recommended, no checkout)

Custom connectors require a **paid** Claude plan (Pro / Max / Team / Enterprise).

1. Open **Settings**: on desktop press **Ctrl/⌘ + ,** (or top-left menu → **File →
   Settings**); in the browser, profile icon → **Settings**.
2. Click **Connectors** in the sidebar.
3. Click **Add** (top-right) → **Add custom connector**.
4. Paste the URL and click **Add**:
   ```
   https://vibe-fun-gray.vercel.app/api/mcp
   ```
5. **Authentication:** none needed — it connects directly.
6. Tools now appear under the **"Add files, connectors, and more"** (`+`) button at
   the bottom-left of the message box → **Connectors**.

### Option B — Local stdio via config file (any plan)

First complete [Local stdio prerequisites](#local-stdio-prerequisites).

1. **Claude menu (system menu bar) → Settings… → Developer tab → Edit Config.**
   This opens `claude_desktop_config.json`:
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
2. Add vibe-fun. **Use absolute paths** — Claude Desktop launches with a minimal
   `PATH`, so a bare `npx` often fails (`which npx` / `where npx` to find it):
   ```json
   {
     "mcpServers": {
       "vibe-fun": {
         "command": "/absolute/path/to/npx",
         "args": ["-y", "tsx", "/absolute/path/to/vibe-fun/bin/stdio.ts"]
       }
     }
   }
   ```
3. **Completely quit and reopen** Claude Desktop (a restart is required to load it).
4. Confirm via the `+` (**Add files, connectors, and more**) button →
   **Connectors → Manage connectors → vibe-fun**.

> You can't put a **remote URL** directly in this config file — the config file is
> for stdio commands. To route the remote server through the file anyway, use the
> `mcp-remote` bridge: `"command": "npx", "args": ["-y", "mcp-remote", "https://vibe-fun-gray.vercel.app/api/mcp"]`.
> Option A (custom connector) is simpler.

**Troubleshooting / logs**
- Server missing after restart → check the JSON is valid, paths are **absolute**,
  and fully restart the app.
- Logs: **macOS** `~/Library/Logs/Claude/mcp*.log`, **Windows** `%APPDATA%\Claude\logs\`.
  `mcp.log` = connection log; `mcp-server-vibe-fun.log` = the server's stderr.
- Follow logs (macOS): `tail -n 20 -f ~/Library/Logs/Claude/mcp*.log`.

---

## Codex — tool access, no game rendering ❌

Codex (the **CLI**, the **IDE extension**, and the **desktop app**) can list and call
vibe-fun's tools, but **no Codex surface renders MCP App UIs** — it's a coding agent,
not an app host. All surfaces share `~/.codex/config.toml`.

### Fastest — CLI

```bash
# remote (recommended)
codex mcp add vibe-fun --url https://vibe-fun-gray.vercel.app/api/mcp

# list configured servers
codex mcp list
```

Local stdio instead (note the `--` before the launch command; see prerequisites):
```bash
codex mcp add vibe-fun-local -- npx -y tsx /absolute/path/to/vibe-fun/bin/stdio.ts
```

### Or edit `~/.codex/config.toml`

```toml
# remote Streamable HTTP
[mcp_servers.vibe_fun]
url = "https://vibe-fun-gray.vercel.app/api/mcp"

# local stdio (absolute path recommended)
[mcp_servers.vibe_fun_local]
command = "npx"
args = ["-y", "tsx", "/absolute/path/to/vibe-fun/bin/stdio.ts"]

# raise if cold Vercel starts or `npx` downloads exceed the default 10s
# startup_timeout_sec = 30
```

If HTTP tools show up as `(none)` on an **older** Codex build, either upgrade or add:
```toml
[features]
experimental_use_rmcp_client = true
```

**IDE extension:** ⚙️ → **MCP Settings → + Add server** writes the same `config.toml`.
There's a known bug where CLI-working servers aren't always detected in the extension
([openai/codex#6465](https://github.com/openai/codex/issues/6465)) — if so, use the
CLI/TOML path.

**Verify:** run `/mcp` inside a Codex session to see connected servers and tools.

---

## Local stdio prerequisites

The stdio option runs the server from a checkout of this repo.

```bash
git clone https://github.com/sugarforever/vibe-fun
cd vibe-fun
npm install          # Node.js 20+ required
```

- Use the **absolute path** to `bin/stdio.ts` in host configs (desktop apps don't
  inherit your shell's working directory).
- `tsx` is pulled by `npx -y tsx`; keeping it in the repo's `node_modules` (via
  `npm install`) makes startup faster and more reliable.
- Quick self-test: `npm run stdio` should print `vibe-fun MCP server listening on
  stdio` and wait for input.

## No host handy?

Play immediately in any browser — same games, same protocol, nothing to install:

- https://vibe-fun-gray.vercel.app/play/2048
- https://vibe-fun-gray.vercel.app/play/sudoku

---

*Menus in ChatGPT and Claude get relabeled often (e.g. "Connectors" ↔ "Apps &
Connectors"). If a label here doesn't match exactly, look for the nearest
equivalent in Settings → Connectors.*
