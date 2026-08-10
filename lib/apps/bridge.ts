/**
 * The MCP Apps <-> Host postMessage bridge, shared by every app's HTML.
 *
 * It speaks JSON-RPC 2.0 over `window.postMessage`, per SEP-1865:
 *   - View -> Host request  `ui/initialize`          (handshake)
 *   - View -> Host notif    `ui/notifications/initialized`
 *   - View -> Host notif    `ui/notifications/size-changed`
 *   - Host -> View notif    `ui/notifications/tool-input`   (original tool args)
 *   - Host -> View notif    `ui/notifications/tool-result`  (tool output / structuredContent)
 *
 * On top of that it defines a small, clearly-namespaced *app-layer* convention
 * for durable progress (the spec has no host-storage method):
 *   - View -> Host notif    `app/state-changed`  { appId, schemaVersion, state }
 *   - View -> Host request  `app/load-state`     { appId } -> { state | null }
 * A host that does not implement these simply ignores the notification and
 * never answers the request (the view times out and starts fresh).
 *
 * When opened outside any host (e.g. the standalone preview route), the bridge
 * transparently falls back to `localStorage` so the game is still playable.
 *
 * IMPORTANT: this string is embedded verbatim inside a <script> tag, so it must
 * not contain backticks or `${` sequences.
 */
export const BRIDGE_JS = `
(function () {
  var inIframe = false;
  try { inIframe = window.parent && window.parent !== window; } catch (e) { inIframe = true; }
  var APP_ID = window.__APP_ID__ || 'app';
  var SAVE_SCHEMA = 1;
  var nextId = 1;
  var pending = {};
  var toolResultHandlers = [];
  var toolInputHandlers = [];

  function post(msg) {
    if (!inIframe) return;
    try { window.parent.postMessage(msg, '*'); } catch (e) {}
  }
  function request(method, params, timeoutMs) {
    return new Promise(function (resolve, reject) {
      if (!inIframe) { reject(new Error('no-host')); return; }
      var id = nextId++;
      pending[id] = { resolve: resolve, reject: reject };
      post({ jsonrpc: '2.0', id: id, method: method, params: params || {} });
      setTimeout(function () {
        if (pending[id]) { delete pending[id]; reject(new Error('timeout')); }
      }, timeoutMs || 800);
    });
  }
  function notify(method, params) {
    post({ jsonrpc: '2.0', method: method, params: params || {} });
  }

  window.addEventListener('message', function (ev) {
    var data = ev.data;
    if (!data || data.jsonrpc !== '2.0') return;
    if (typeof data.id !== 'undefined' && (typeof data.result !== 'undefined' || typeof data.error !== 'undefined')) {
      var p = pending[data.id];
      if (p) {
        delete pending[data.id];
        if (data.error) { p.reject(new Error((data.error && data.error.message) || 'rpc-error')); }
        else { p.resolve(data.result); }
      }
      return;
    }
    var m = data.method;
    if (m === 'ui/notifications/tool-result') {
      toolResultHandlers.forEach(function (h) { try { h(data.params || {}); } catch (e) {} });
    } else if (m === 'ui/notifications/tool-input') {
      toolInputHandlers.forEach(function (h) { try { h(data.params || {}); } catch (e) {} });
    }
  });

  function lsKey() { return 'vibe-fun:' + APP_ID; }

  var api = {
    appId: APP_ID,
    inHost: false,
    onToolResult: function (cb) { toolResultHandlers.push(cb); },
    onToolInput: function (cb) { toolInputHandlers.push(cb); },
    ready: function () {
      if (!inIframe) { api.inHost = false; return Promise.resolve({ host: null }); }
      return request('ui/initialize', { clientInfo: { name: APP_ID, version: '1' } })
        .then(function (res) {
          api.inHost = true;
          notify('ui/notifications/initialized', {});
          return res;
        })
        .catch(function () { api.inHost = false; return { host: null }; });
    },
    load: function () {
      if (api.inHost) {
        return request('app/load-state', { appId: APP_ID })
          .then(function (r) { return r && r.state ? r.state : null; })
          .catch(function () { return null; });
      }
      try {
        var raw = localStorage.getItem(lsKey());
        return Promise.resolve(raw ? JSON.parse(raw).state : null);
      } catch (e) { return Promise.resolve(null); }
    },
    save: function (state) {
      var payload = { appId: APP_ID, schemaVersion: SAVE_SCHEMA, state: state };
      if (api.inHost) { notify('app/state-changed', payload); return; }
      try { localStorage.setItem(lsKey(), JSON.stringify(payload)); } catch (e) {}
    },
    resize: function (w, h) { notify('ui/notifications/size-changed', { width: w, height: h }); }
  };

  window.mcpApp = api;
})();
`;

/** Base CSS shared by every app (theme tokens, resets, fonts). */
export const BASE_CSS = `
  :root {
    color-scheme: light;
    --bg: #fbfbf9; --fg: #1c293c; --ink: #1c293c; --muted: #55617a;
    --primary: #fdc800; --violet: #432dd7; --panel: #ffffff;
    --sh: 4px 4px 0 var(--ink); --sh-sm: 3px 3px 0 var(--ink);
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; height: 100%; }
  body {
    background: var(--bg); color: var(--fg);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
    display: flex; flex-direction: column; align-items: center;
    padding: 16px; gap: 14px; min-height: 100%;
  }
  button {
    font: inherit; cursor: pointer; border: 2px solid var(--ink); border-radius: 8px;
    background: var(--primary); color: var(--ink);
    padding: 9px 16px; font-weight: 800; box-shadow: var(--sh-sm);
    transition: transform .1s ease, box-shadow .1s ease;
  }
  button:hover { transform: translate(1px, 1px); box-shadow: 2px 2px 0 var(--ink); }
  button:active { transform: translate(3px, 3px); box-shadow: 0 0 0 var(--ink); }
  button:focus-visible { outline: 3px solid var(--violet); outline-offset: 2px; }
  .header { width: 100%; max-width: 520px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .title { font-size: 40px; font-weight: 900; color: var(--ink); letter-spacing: -1.5px; }
  .scores { display: flex; gap: 10px; }
  .score-box { background: var(--ink); color: #fff; border: 2px solid var(--ink); border-radius: 8px; padding: 6px 12px; text-align: center; min-width: 66px; box-shadow: var(--sh-sm); }
  .score-box .label { font-size: 11px; text-transform: uppercase; letter-spacing: .6px; font-weight: 700; opacity: .75; }
  .score-box .val { font-size: 20px; font-weight: 900; }
  .toolbar { width: 100%; max-width: 520px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .hint { font-size: 13px; font-weight: 600; color: var(--muted); }
`;

/** Compose a full, self-contained HTML document for an app. */
export function buildAppHtml(opts: {
  appId: string;
  title: string;
  css: string;
  body: string;
  js: string;
}): string {
  const appIdJson = JSON.stringify(opts.appId);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${opts.title}</title>
<style>${BASE_CSS}${opts.css}</style>
</head>
<body>
${opts.body}
<script>window.__APP_ID__ = ${appIdJson};</script>
<script>${BRIDGE_JS}</script>
<script>${opts.js}</script>
</body>
</html>`;
}
