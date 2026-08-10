import { catalogRows } from "@/lib/apps";

export const dynamic = "force-static";

export default function Home() {
  const apps = catalogRows();
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 40, margin: "0 0 6px" }}>vibe-fun</h1>
      <p style={{ fontSize: 18, opacity: 0.85, marginTop: 0 }}>
        An <strong>MCP Apps</strong> (SEP-1865) server that distributes
        self-contained HTML mini-games to any MCP host.
      </p>

      <section style={{ margin: "28px 0" }}>
        <h2 style={{ fontSize: 20 }}>Connect a host</h2>
        <p style={{ margin: "8px 0" }}>Streamable HTTP endpoint:</p>
        <pre style={codeBlock}>/api/mcp</pre>
        <p style={{ margin: "8px 0", fontSize: 14, opacity: 0.8 }}>
          Point any MCP client at <code>{"<this-origin>/api/mcp"}</code>, or run
          the local stdio server with <code>npm run stdio</code>.
        </p>
      </section>

      <section style={{ margin: "28px 0" }}>
        <h2 style={{ fontSize: 20 }}>Apps ({apps.length})</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {apps.map((a) => (
            <li key={a.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{a.name}</div>
                  <div style={{ fontSize: 14, opacity: 0.8 }}>{a.description}</div>
                  <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>
                    tool <code>{a.toolName}</code> &middot; {a.uiResourceUri} &middot; v
                    {a.version} &middot; {(a.htmlBytes / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <a style={btn} href={`/harness.html?app=${a.id}`}>
                    Test in host
                  </a>
                  <a style={btnGhost} href={`/games/${a.id}`}>
                    Raw preview
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer style={{ fontSize: 13, opacity: 0.6, marginTop: 40 }}>
        <p>
          <strong>Test in host</strong> opens a reference MCP-Apps host emulator
          (sandboxed iframe + postMessage/JSON-RPC bridge + localStorage
          persistence) so you can validate the full protocol without a compliant
          host.
        </p>
      </footer>
    </main>
  );
}

const codeBlock: React.CSSProperties = {
  background: "#efe9dc",
  padding: "10px 14px",
  borderRadius: 8,
  fontSize: 15,
  overflowX: "auto",
};
const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #eee4da",
  borderRadius: 12,
  padding: 16,
};
const btn: React.CSSProperties = {
  background: "#8f7a66",
  color: "#f9f6f2",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 14,
  textAlign: "center",
  whiteSpace: "nowrap",
};
const btnGhost: React.CSSProperties = {
  ...btn,
  background: "#efe9dc",
  color: "#33302b",
};
