# Adding an app

Onboarding a game touches exactly **two things**: one HTML builder module and one
catalog entry. No other app, and none of the transport/registration code,
changes. That is the whole point of this server.

## Steps

### 1. Build the self-contained HTML

Create `lib/apps/game-<id>.ts`. Use the shared helpers so you inherit the base
theme and the host bridge:

```ts
import { buildAppHtml } from "./bridge";
import type { AppCatalogEntry } from "./types";

const CSS = `/* app-specific styles */`;
const BODY = `<!-- app markup -->`;
const JS = `
  // Your game logic. IMPORTANT: no backticks or ${'${...}'} inside this string.
  // The bridge is available as window.mcpApp.
  mcpApp.ready()
    .then(function () { return mcpApp.load(); })
    .then(function (state) { /* restore or start fresh */ });
`;

export const htmlMyGame = buildAppHtml({ appId: "<id>", title: "My Game", css: CSS, body: BODY, js: JS });

export const appMyGame: AppCatalogEntry = {
  id: "<id>",
  name: "My Game",
  description: "One-line description shown in tools/list.",
  version: "1.0.0",
  toolName: "play_<id>",
  uiResourceUri: "ui://apps/<id>",
  suggestedSize: { width: 520, height: 640 },
  maxHtmlBytes: 96 * 1024,
  html: htmlMyGame,
  // Optional zod raw shape for tool args (delivered to the view via
  // ui/notifications/tool-input). Omit if the app takes none.
  // inputSchema: { level: z.enum(["a","b"]).optional() },
};
```

### 2. Register it in the catalog

Add the entry to `lib/apps/index.ts`:

```ts
import { appMyGame } from "./game-<id>";
export const APPS: AppCatalogEntry[] = [app2048, appSudoku, appMyGame];
```

Done. `tools/list`, `resources/list`, `list_apps`, the preview route, the play
page, and the site's game list all pick it up automatically.

## The `window.mcpApp` API (available inside your app HTML)

| Call | Purpose |
| --- | --- |
| `mcpApp.ready()` | Perform the `ui/initialize` handshake. Resolves in host mode; also resolves (standalone) when opened outside a host. |
| `mcpApp.load()` | Get the last saved `state` (or `null`). Host storage in host mode, `localStorage` standalone. |
| `mcpApp.save(state)` | Persist `state` (emits `app/state-changed`, or writes `localStorage`). |
| `mcpApp.resize(w, h)` | Emit `ui/notifications/size-changed`. |
| `mcpApp.onToolInput(cb)` | Receive the tool's original arguments (e.g. a difficulty). |
| `mcpApp.onToolResult(cb)` | Receive tool output / `structuredContent`. |

## Rules

- **Self-contained only.** No external URLs, CDNs, fonts, or images — MCP Apps
  currently supports only self-contained HTML. Inline everything.
- **Respect the size budget.** `registerApps` throws at startup if an app's HTML
  exceeds its `maxHtmlBytes`.
- **No backticks / `${` in the `JS` string** — it is embedded verbatim in a
  `<script>` tag inside a template literal. Use string concatenation.
- **Bump `version`** whenever the HTML changes, so hosts can cache per app.

## Verify

```bash
npm run typecheck && npm run build
npm run dev
# open http://localhost:3000/play/<id>?debug=1
```

The play page's developer log shows the full JSON-RPC exchange, so you can
confirm the handshake, tool-input, size-changed, and save/load all fire.
