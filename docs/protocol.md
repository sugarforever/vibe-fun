# Protocol

This server implements **MCP Apps (SEP-1865)**. Facts below are pinned to the
authoritative spec (`modelcontextprotocol/ext-apps`), not to older summaries.

## 1. UI resources

Each app is a predeclared resource under the `ui://` scheme:

- URI: `ui://apps/<id>` (e.g. `ui://apps/2048`)
- mimeType: **`text/html;profile=mcp-app`**
- body: a single, fully self-contained HTML document (inline CSS + JS, no
  external network requests), returned by `resources/read`.

Hosts advertise support during `initialize` with the extension identifier
**`io.modelcontextprotocol/ui`**:

```json
{ "capabilities": { "extensions": {
  "io.modelcontextprotocol/ui": { "mimeTypes": ["text/html;profile=mcp-app"] }
} } }
```

## 2. Tool ↔ UI association

Each app has a tool (`play_2048`, `play_sudoku`). The link to its UI resource is
declared on the tool via `_meta.ui`:

```jsonc
// tools/list entry
{
  "name": "play_2048",
  "_meta": { "ui": {
    "resourceUri": "ui://apps/2048",
    "visibility": ["model", "app"],
    "preferredSize": { "width": 520, "height": 640 }
  } }
}
```

The tool result repeats `_meta.ui.resourceUri` and always includes a plain-text
fallback in `content` for hosts without UI support.

## 3. View ↔ Host bridge (JSON-RPC 2.0 over postMessage)

The host renders the HTML in a **sandboxed iframe**. The iframe and host exchange
JSON-RPC over `window.postMessage`. Messages this server's apps use:

| Direction | Method | Purpose |
| --- | --- | --- |
| View → Host (request) | `ui/initialize` | Handshake; host replies with host info/capabilities |
| View → Host (notif) | `ui/notifications/initialized` | Handshake complete |
| View → Host (notif) | `ui/notifications/size-changed` | Report content size for iframe resize |
| Host → View (notif) | `ui/notifications/tool-input` | Original tool arguments (e.g. Sudoku `difficulty`) |
| Host → View (notif) | `ui/notifications/tool-result` | Tool output / `structuredContent` |

The bridge implementation is `lib/apps/bridge.ts` (`window.mcpApp`). The
reference **host** side is `public/harness.html`.

## 4. Persistence (app-layer convention)

SEP-1865 has no method for durable host-side storage, so this server defines a
small, clearly-namespaced convention carried over the same postMessage channel.
The server never stores user data.

| Direction | Method | Params |
| --- | --- | --- |
| View → Host (notif) | `app/state-changed` | `{ appId, schemaVersion, state }` |
| View → Host (request) | `app/load-state` | `{ appId }` → `{ state \| null }` |

- On startup the view calls `app/load-state`; the host returns the last saved
  `state` (or `null`).
- On every meaningful change the view emits `app/state-changed`; a host that
  wants persistence writes it to disk.
- A host that implements neither simply ignores the notification and never
  answers the request — the view times out and starts fresh.
- `schemaVersion` (currently `1`) lets a host migrate or discard stale saves.

When opened **outside any host** (the `/games/<id>` preview route), the bridge
falls back to `localStorage`, so every app stays playable standalone.

## 5. Catalog schema

`list_apps` returns:

```jsonc
{
  "schemaVersion": "1.0.0",
  "apps": [{
    "id": "2048",
    "name": "2048",
    "description": "…",
    "version": "1.0.0",
    "toolName": "play_2048",
    "uiResourceUri": "ui://apps/2048",
    "suggestedSize": { "width": 520, "height": 640 },
    "htmlBytes": 14255
  }]
}
```

Both the catalog and each app carry a version, so a client can cache and gate
per app.
