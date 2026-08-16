import Link from "next/link";
import { catalogRows } from "@/lib/apps";
import { SITE, mcpEndpoint } from "@/lib/site";
import {
  Play,
  ArrowRight,
  Github,
  Server,
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
const MINES_MINI = [
  "", "", "1", "⚑", "1", "", "", "", "",
  "1", "1", "2", "1", "1", "", "1", "1", "1",
  "1", "⚑", "2", "1", "", "", "1", "⚑", "1",
  "1", "2", "⚑", "1", "", "", "1", "1", "1",
  "", "1", "1", "1", "", "", "", "", "",
  "", "", "", "", "", "", "", "", "",
];
const PACMAN_MINI = [
  "wwwwwwwwwww", "wp...w...gw", "w.ww.w.ww.w", "w.........w", "w.ww.w.ww.w",
  "w....w....w", "www.w.w.www", "w...g.g...w", "w.ww.w.ww.w", "wo...p...ow", "wwwwwwwwwww",
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Can I play games inside ChatGPT?",
    a: "Yes. Turn on Developer mode in ChatGPT, add the vibe-fun MCP endpoint as a connector, and the games render as interactive apps right in the chat — no extension or download needed.",
  },
  {
    q: "What is a vibe-fun game, technically?",
    a: "Each game is a single, self-contained HTML app served over the Model Context Protocol using the MCP Apps extension (SEP-1865). Any MCP host lists it as a tool and renders it in a sandboxed iframe.",
  },
  {
    q: "Do I need an account or an install?",
    a: "No. Play instantly in your browser, or connect the endpoint to your assistant. There are no accounts, downloads, or plugins, and your game progress is saved by the host, not by us.",
  },
  {
    q: "Which AI assistants are supported?",
    a: "ChatGPT renders and plays the games today. Claude Desktop can connect and call them, with interactive rendering rolling out as MCP Apps support ships. Any MCP client can list and call the games as tools.",
  },
  {
    q: "Is it free and open source?",
    a: "Yes. vibe-fun is free to play and open source under the MIT license. You can self-host it and add your own games in a single file.",
  },
  {
    q: "How do new games reach players?",
    a: "Games live on the server, not in the client. Add one to the catalog and every connected host picks it up automatically — players never update anything.",
  },
];

function GameThumb({ id }: { id: string }) {
  if (id === "2048") {
    return (
      <div className="mini2048" aria-hidden>
        {HERO_TILES.map((v, i) => (
          <div key={i} className="t" data-v={v || undefined}>
            {v || ""}
          </div>
        ))}
      </div>
    );
  }
  if (id === "minesweeper") {
    return (
      <div className="minimines" aria-hidden>
        {MINES_MINI.map((value, i) => (
          <span key={i} className={value === "⚑" ? "flag" : value ? "open" : "closed"}>
            {value}
          </span>
        ))}
      </div>
    );
  }
  if (id === "pacman") {
    return (
      <div className="minipacman" aria-hidden>
        {PACMAN_MINI.join("").split("").map((cell, i) => (
          <span key={i} className={cell === "w" ? "wall" : cell === "p" ? "pac" : cell === "g" ? "ghost" : cell === "o" ? "power" : cell === "." ? "dot" : ""} />
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
      <section className="hero hero-compact">
        <div className="container hero-compact-inner">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkle style={{ width: 15, height: 15 }} /> The game catalog for AI assistants
            </span>
            <h1>
              Play here. Bring every game to your <span className="gradient-text">agent</span>.
            </h1>
            <p className="lead">
              Pick a game below, or connect the whole library to ChatGPT and
              other MCP-compatible agents.
            </p>
            <div className="hero-cta">
              <Link className="btn btn-primary" href="/#games">
                <Play /> Browse games
              </Link>
              <Link className="btn btn-outline" href="/#connect">
                <Plug /> Connect an agent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- GAMES ---------- */}
      <section className="section games-section" id="games">
        <div className="container">
          <div className="game-library-head">
            <div>
              <span className="eyebrow">The library</span>
              <h2>
                Four games. More on the way.
              </h2>
            </div>
            <p>
              Hand-built, keyboard- and touch-friendly, and playable the moment
              you open them.
            </p>
          </div>

          <div className="game-grid">
            {games.map((g) => (
              <article key={g.id} className="card card-hover game-card game-card-compact">
                <div className={`game-thumb g${g.id}`}>
                  <GameThumb id={g.id} />
                </div>
                <div className="game-body">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <h3>{g.name}</h3>
                    <span className="game-version">
                      v{g.version}
                    </span>
                  </div>
                  <p className="game-description">{g.description}</p>
                  <div className="game-actions">
                    <Link className="btn btn-primary btn-sm" href={`/play/${g.id}`}>
                      <Play /> Play
                    </Link>
                  </div>
                </div>
              </article>
            ))}

            <article className="card game-card" style={{ borderStyle: "dashed", opacity: 0.9 }}>
              <div className="game-thumb">
                <div style={{ textAlign: "center", color: "var(--text-dim)" }}>
                  <Bolt style={{ width: 30, height: 30, margin: "0 auto 10px" }} />
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 600 }}>More coming</div>
                </div>
              </div>
              <div className="game-body">
                <h3 style={{ color: "var(--text-muted)" }}>Your game here</h3>
                <p className="game-description">
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
            <span className="eyebrow">Connect an agent</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,42px)", marginTop: 14 }}>
              Bring the whole library to your agent.
            </h2>
            <p className="lead" style={{ marginTop: 14 }}>
              Add this MCP endpoint once. Your agent can discover every game now,
              and new games appear automatically as the library grows.
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

      {/* ---------- FAQ ---------- */}
      <section className="section" id="faq">
        <div className="container">
          <div className="center" style={{ maxWidth: 640, margin: "0 auto 40px" }}>
            <span className="eyebrow">FAQ</span>
            <h2 style={{ fontSize: "clamp(26px,3.6vw,38px)", marginTop: 12 }}>
              Questions, answered.
            </h2>
          </div>
          <div className="faq" style={{ maxWidth: 780, margin: "0 auto" }}>
            {FAQS.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>
                  {f.q}
                  <span className="faq-chevron" aria-hidden>
                    +
                  </span>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </main>
  );
}
