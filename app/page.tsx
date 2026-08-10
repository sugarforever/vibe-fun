import Link from "next/link";
import { catalogRows } from "@/lib/apps";
import { SITE, mcpEndpoint } from "@/lib/site";
import {
  Play,
  ArrowRight,
  Github,
  Server,
  Layers,
  Sparkle,
  Bolt,
  Plug,
  Code,
  Check,
  Clock,
} from "@/components/icons";

export const dynamic = "force-static";

const HERO_TILES = [0, 2, 4, 0, 4, 8, 16, 2, 0, 32, 64, 4, 128, 8, 0, 2];
const SUDOKU_MINI = "53__7____6__195____98____6_8___6___34".padEnd(81, "_");

function GameThumb({ id }: { id: string }) {
  if (id === "2048") {
    return (
      <div className="mini2048" aria-hidden style={{ width: "72%" }}>
        {HERO_TILES.map((v, i) => (
          <div key={i} className="t" data-v={v || undefined}>
            {v || ""}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="minisudoku" aria-hidden>
      {SUDOKU_MINI.split("").map((c, i) => (
        <span key={i}>{c === "_" ? "" : c}</span>
      ))}
    </div>
  );
}

export default function Home() {
  const games = catalogRows();
  const endpoint = mcpEndpoint();

  return (
    <main>
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">
              <Sparkle style={{ width: 15, height: 15 }} /> MCP Apps · open protocol
            </span>
            <h1 style={{ marginTop: 16 }}>
              Games for <span className="gradient-text">AI</span>, on tap.
            </h1>
            <p className="lead">
              vibe-fun is a game server for AI assistants. Connect it to your MCP
              host once, and a growing library of polished, playable games shows
              up right inside the chat — no installs, no updates.
            </p>
            <div className="hero-cta">
              <Link className="btn btn-primary" href="/play/2048">
                <Play /> Play 2048
              </Link>
              <Link className="btn btn-outline" href="/#connect">
                <Plug /> Add to your assistant
              </Link>
            </div>
            <div className="hero-proof">
              <span className="badge">
                <span className="dot" /> Renders in ChatGPT today
              </span>
              <span className="badge">
                <span className="dot" /> Open MCP protocol
              </span>
              <span className="badge amber">
                <span className="dot" /> Zero client updates
              </span>
            </div>
          </div>

          <div className="mock" aria-hidden>
            <div className="mock-bar">
              <span className="mock-dot" />
              <span className="mock-dot" />
              <span className="mock-dot" />
              <span className="mock-title">ui://apps/2048</span>
            </div>
            <div className="mini2048">
              {HERO_TILES.map((v, i) => (
                <div key={i} className="t" data-v={v || undefined}>
                  {v || ""}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="section" id="how">
        <div className="container">
          <div className="center" style={{ maxWidth: 640, margin: "0 auto 44px" }}>
            <span className="eyebrow">How it works</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,42px)", marginTop: 14 }}>
              One server. Every host. New games for free.
            </h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Games live in one place. Every assistant that connects stays in sync
              automatically — the whole point of building on an open protocol.
            </p>
          </div>

          <div className="grid-3">
            {[
              {
                icon: <Server />,
                n: "Step 1",
                h: "The server hosts the games",
                p: "Every game is a single, self-contained HTML app served over MCP. No app store, no download, no plugin to maintain.",
              },
              {
                icon: <Layers />,
                n: "Step 2",
                h: "Your assistant reads the catalog",
                p: "Any MCP host lists the games as tools and renders each one as an interactive app, right in the conversation.",
              },
              {
                icon: <Sparkle />,
                n: "Step 3",
                h: "New games just appear",
                p: "Add a game here and every connected host gets it instantly. Clients never update — the library grows on its own.",
              },
            ].map((f) => (
              <article key={f.h} className="card feature">
                <div className="feature-ico">{f.icon}</div>
                <span className="step-num">{f.n}</span>
                <h3 style={{ marginTop: 6 }}>{f.h}</h3>
                <p>{f.p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- GAMES ---------- */}
      <section className="section" id="games" style={{ paddingTop: 20 }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 20, marginBottom: 32, flexWrap: "wrap" }}>
            <div>
              <span className="eyebrow">The library</span>
              <h2 style={{ fontSize: "clamp(26px,3.6vw,38px)", marginTop: 12 }}>
                Two to start. More on the way.
              </h2>
            </div>
            <p className="lead" style={{ maxWidth: 340 }}>
              Hand-built, keyboard- and touch-friendly, and playable the moment
              you open them.
            </p>
          </div>

          <div className="grid-3">
            {games.map((g) => (
              <article key={g.id} className="card card-hover game-card">
                <div className={`game-thumb ${g.id === "2048" ? "g2048" : "gsudoku"}`}>
                  <GameThumb id={g.id} />
                </div>
                <div className="game-body">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <h3>{g.name}</h3>
                    <span className="badge dim" style={{ padding: "4px 10px", fontSize: 12 }}>
                      v{g.version}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: 15 }}>{g.description}</p>
                  <div className="game-actions">
                    <Link className="btn btn-primary btn-sm" href={`/play/${g.id}`}>
                      <Play /> Play
                    </Link>
                    <Link className="btn btn-outline btn-sm" href="/#connect">
                      Add to host
                    </Link>
                  </div>
                </div>
              </article>
            ))}

            <article className="card game-card" style={{ borderStyle: "dashed", opacity: 0.9 }}>
              <div className="game-thumb" style={{ background: "radial-gradient(120% 120% at 50% 0%, #14161f, #0e1017)" }}>
                <div style={{ textAlign: "center", color: "var(--text-dim)" }}>
                  <Bolt style={{ width: 30, height: 30, margin: "0 auto 10px" }} />
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 600 }}>More coming</div>
                </div>
              </div>
              <div className="game-body">
                <h3 style={{ color: "var(--text-muted)" }}>Your game here</h3>
                <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
                  Every new game ships to all connected hosts at once. Want to add
                  one? It takes a single file.
                </p>
                <div className="game-actions">
                  <Link className="btn btn-outline btn-sm" href="/#developers">
                    <Code /> How to add <ArrowRight />
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ---------- CONNECT ---------- */}
      <section className="section" id="connect">
        <div className="container">
          <div className="center" style={{ maxWidth: 660, margin: "0 auto 40px" }}>
            <span className="eyebrow">Connect a host</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,42px)", marginTop: 14 }}>
              Bring the games to your assistant.
            </h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Point any MCP host at the endpoint below. Support for rendering
              interactive apps is rolling out across assistants — here&apos;s where
              each one stands today.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="endpoint">
              <span className="badge">
                <Server style={{ width: 15, height: 15 }} /> MCP endpoint
              </span>
              <code className="code" style={{ flex: 1, minWidth: 240 }}>
                {endpoint}
              </code>
            </div>
          </div>

          <div className="grid-3">
            <article className="card host-card">
              <div className="host-head">
                <span className="host-ico"><Sparkle /></span>
                <div>
                  <strong style={{ fontFamily: "var(--font-head)" }}>ChatGPT</strong>
                  <div className="host-status ok"><Check style={{ width: 15, height: 15 }} /> Plays now</div>
                </div>
              </div>
              <p>
                Turn on Developer mode, add the endpoint as a connector, and the
                games render and play right in the chat.
              </p>
              <a className="btn btn-outline btn-sm" href="https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt" target="_blank" rel="noopener noreferrer">
                Setup guide <ArrowRight />
              </a>
            </article>

            <article className="card host-card">
              <div className="host-head">
                <span className="host-ico"><Bolt /></span>
                <div>
                  <strong style={{ fontFamily: "var(--font-head)" }}>Claude Desktop</strong>
                  <div className="host-status soon"><Clock style={{ width: 15, height: 15 }} /> Connects · UI soon</div>
                </div>
              </div>
              <p>
                Add it as a custom connector today to call the games. Interactive
                rendering is on the way as MCP Apps support ships.
              </p>
              <a className="btn btn-ghost btn-sm" href={SITE.githubUrl} target="_blank" rel="noopener noreferrer">
                Read the docs <ArrowRight />
              </a>
            </article>

            <article className="card host-card">
              <div className="host-head">
                <span className="host-ico"><Code /></span>
                <div>
                  <strong style={{ fontFamily: "var(--font-head)" }}>Any MCP client</strong>
                  <div className="host-status no">Tools &amp; catalog</div>
                </div>
              </div>
              <p>
                Coding agents and other clients can list and call the games as
                tools over Streamable HTTP or stdio.
              </p>
              <Link className="btn btn-ghost btn-sm" href="/#developers">
                Developer setup <ArrowRight />
              </Link>
            </article>
          </div>

          <p className="center" style={{ color: "var(--text-dim)", marginTop: 24, fontSize: 14 }}>
            No host handy?{" "}
            <Link href="/play/2048" style={{ color: "var(--brand-2)" }}>
              Play in your browser
            </Link>{" "}
            — same games, same protocol.
          </p>
        </div>
      </section>

      {/* ---------- DEVELOPERS ---------- */}
      <section className="section" id="developers" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: "center", gap: 40 }}>
            <div>
              <span className="eyebrow">For developers</span>
              <h2 style={{ fontSize: "clamp(26px,3.6vw,38px)", marginTop: 14 }}>
                Ship a game in one file.
              </h2>
              <p className="lead" style={{ marginTop: 14 }}>
                Adding a game is one self-contained HTML file and one catalog
                entry. It goes live everywhere at once — no client to rebuild, no
                store review.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "grid", gap: 12 }}>
                {[
                  "Built on the official MCP SDK + mcp-handler",
                  "Streamable HTTP and stdio transports",
                  "Standard MCP Apps contract — renders as-is in ChatGPT",
                  "Stateless and serverless — deploys to Vercel with zero config",
                ].map((t) => (
                  <li key={t} style={{ display: "flex", gap: 10, alignItems: "start", color: "var(--text-muted)" }}>
                    <Check style={{ width: 20, height: 20, color: "var(--brand-2)", flex: "none", marginTop: 1 }} />
                    {t}
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
                <a className="btn btn-primary" href={SITE.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github /> View on GitHub
                </a>
                <a className="btn btn-outline" href={SITE.mcpPath}>
                  <Server /> MCP endpoint
                </a>
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div className="mock-bar" style={{ padding: "2px 2px 12px" }}>
                <span className="mock-dot" />
                <span className="mock-dot" />
                <span className="mock-dot" />
                <span className="mock-title">lib/apps/index.ts</span>
              </div>
              <pre className="code" style={{ margin: 0, lineHeight: 1.7 }}>
{`// 1. Build one self-contained HTML app
export const htmlSnake = buildAppHtml({ /* ... */ });

// 2. Register it in the catalog
export const APPS = [
  app2048,
  appSudoku,
  appSnake,  // <- live on every host
];`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section-sm">
        <div className="container">
          <div className="cta-band">
            <span className="eyebrow">Ready when you are</span>
            <h2 style={{ marginTop: 12 }}>Start playing in seconds.</h2>
            <p className="lead" style={{ margin: "14px auto 0", maxWidth: 520 }}>
              Open a game in your browser now, or wire it into your assistant and
              let the library come to you.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/play/2048">
                <Play /> Play now
              </Link>
              <a className="btn btn-outline" href={SITE.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github /> Star on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
