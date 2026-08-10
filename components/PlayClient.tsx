"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plug, ArrowRight, Sparkle } from "./icons";

type GameRef = { id: string; name: string };
type LogEntry = { kind: "in" | "out" | "meta"; head: string; body?: string };

/**
 * Renders a game in a sandboxed iframe and speaks the host half of the MCP Apps
 * postMessage bridge, so the game is fully playable in the browser (progress is
 * saved to localStorage). The raw JSON-RPC log is hidden by default and only
 * shown when a developer opts in (toggle, or ?debug=1).
 */
export default function PlayClient({
  game,
  games,
}: {
  game: { id: string; name: string; description: string };
  games: GameRef[];
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [srcDoc, setSrcDoc] = useState("");
  const [debug, setDebug] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const debugRef = useRef(false);

  const storageKey = `vibe-fun:play:${game.id}`;

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("debug") === "1") setDebug(true);
  }, []);
  useEffect(() => {
    debugRef.current = debug;
  }, [debug]);

  const log = useCallback((kind: LogEntry["kind"], head: string, body?: unknown) => {
    if (!debugRef.current) return;
    const b = body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body);
    setLogs((prev) => [...prev.slice(-100), { kind, head, body: b }]);
  }, []);

  // load the self-contained game HTML into the iframe
  useEffect(() => {
    let alive = true;
    setSrcDoc("");
    setLogs([]);
    fetch(`/games/${game.id}`, { cache: "no-store" })
      .then((r) => r.text())
      .then((html) => {
        if (alive) setSrcDoc(html);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [game.id]);

  // host side of the MCP Apps bridge
  useEffect(() => {
    function send(source: MessageEventSource | null, msg: Record<string, unknown>) {
      (source as Window | null)?.postMessage(msg, "*");
      if (msg.method) log("out", `host → app  ${msg.method}`, msg.params);
      else log("out", `host → app  response #${msg.id}`, msg.result);
    }
    function onMsg(e: MessageEvent) {
      const win = iframeRef.current?.contentWindow;
      if (!win || e.source !== win) return;
      const data = e.data;
      if (!data || data.jsonrpc !== "2.0") return;

      // request from app
      if (data.method && typeof data.id !== "undefined") {
        log("in", `app → host  ${data.method}  #${data.id}`, data.params);
        if (data.method === "ui/initialize") {
          send(e.source, {
            jsonrpc: "2.0",
            id: data.id,
            result: {
              protocolVersion: "2026-07-28",
              hostInfo: { name: "vibe-fun", version: "1.0.0" },
              capabilities: { extensions: { "io.modelcontextprotocol/ui": {} } },
            },
          });
        } else if (data.method === "app/load-state") {
          let state = null;
          try {
            const raw = localStorage.getItem(storageKey);
            state = raw ? JSON.parse(raw).state : null;
          } catch {}
          send(e.source, { jsonrpc: "2.0", id: data.id, result: { state } });
        } else {
          send(e.source, { jsonrpc: "2.0", id: data.id, result: {} });
        }
        return;
      }

      // notification from app
      if (data.method) {
        log("in", `app → host  ${data.method}`, data.params);
        if (data.method === "ui/notifications/initialized") {
          send(e.source, { jsonrpc: "2.0", method: "ui/notifications/tool-input", params: { arguments: {} } });
          send(e.source, {
            jsonrpc: "2.0",
            method: "ui/notifications/tool-result",
            params: { content: [{ type: "text", text: `Opened ${game.name}` }], structuredContent: {} },
          });
        } else if (data.method === "app/state-changed") {
          try {
            localStorage.setItem(
              storageKey,
              JSON.stringify({ appId: data.params.appId, schemaVersion: data.params.schemaVersion, state: data.params.state }),
            );
          } catch {}
        } else if (data.method === "ui/notifications/size-changed") {
          const h = data.params?.height;
          if (h && iframeRef.current) iframeRef.current.style.height = `${Math.min(h + 4, 920)}px`;
        }
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [game.id, game.name, storageKey, log]);

  const reload = useCallback(() => {
    const doc = srcDoc;
    setSrcDoc("");
    requestAnimationFrame(() => setSrcDoc(doc));
  }, [srcDoc]);

  const newGame = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    reload();
  }, [storageKey, reload]);

  return (
    <main className="container play-wrap">
      <div className="play-head">
        <div className="play-title">
          <Link className="btn btn-ghost btn-sm" href="/#games">
            ← All games
          </Link>
          <h1>{game.name}</h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="switcher" role="tablist" aria-label="Choose a game">
            {games.map((g) => (
              <Link key={g.id} href={`/play/${g.id}`} className={g.id === game.id ? "active" : ""}>
                {g.name}
              </Link>
            ))}
          </div>
          <Link className="btn btn-outline btn-sm" href="/#connect">
            <Plug /> Add to your assistant
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 15, maxWidth: 620 }}>{game.description}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={newGame}>
            New game
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setDebug((d) => !d)}
            aria-pressed={debug}
          >
            <Sparkle style={{ width: 15, height: 15 }} />
            {debug ? "Hide" : "Developer"} log
          </button>
        </div>
      </div>

      <div className={`play-stage ${debug ? "with-log" : ""}`}>
        <div className="card stage-frame">
          {srcDoc ? (
            <iframe
              ref={iframeRef}
              sandbox="allow-scripts"
              srcDoc={srcDoc}
              title={`${game.name} game`}
              style={{ height: 640 }}
            />
          ) : (
            <div style={{ color: "var(--text-dim)", padding: 60 }}>Loading {game.name}…</div>
          )}
        </div>

        {debug && (
          <aside className="devlog">
            <div className="devlog-head">
              <span>JSON-RPC over postMessage</span>
              <button className="btn btn-ghost btn-sm" style={{ padding: "2px 8px" }} onClick={() => setLogs([])}>
                Clear
              </button>
            </div>
            <div className="devlog-body">
              {logs.length === 0 ? (
                <div style={{ color: "var(--text-dim)" }}>Interact with the game to see live protocol traffic…</div>
              ) : (
                logs.map((l, i) => (
                  <div key={i} className={`logmsg ${l.kind}`}>
                    <div className="lm-h">{l.head}</div>
                    {l.body && <div>{l.body}</div>}
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>

      <p style={{ color: "var(--text-dim)", fontSize: 13.5, marginTop: 18, textAlign: "center" }}>
        Playing in a live MCP Apps host emulator — the same bridge your assistant uses.{" "}
        <Link href="/#connect" style={{ color: "var(--brand-2)" }}>
          Add it to your own assistant <ArrowRight style={{ width: 13, height: 13, display: "inline", verticalAlign: "-1px" }} />
        </Link>
      </p>
    </main>
  );
}
