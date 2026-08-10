import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "vibe-fun is an open-source MCP Apps server that delivers ready-to-play HTML games to any AI assistant — one catalog, every host.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="prose-page">
      <span className="eyebrow">About</span>
      <h1>About vibe-fun</h1>
      <div className="prose">
        <p>
          <strong>vibe-fun</strong> is an open-source game server for the age of
          AI assistants. It delivers polished, self-contained HTML games to any
          host that speaks the{" "}
          <a
            href="https://modelcontextprotocol.io/seps/1865-mcp-apps-interactive-user-interfaces-for-mcp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Model Context Protocol&apos;s MCP Apps extension
          </a>{" "}
          — so the same game you play in your browser can play right inside
          ChatGPT or Claude.
        </p>

        <h2>Why it exists</h2>
        <p>
          Game portals are invisible to the assistant you actually talk to, and
          one-off chat apps are locked to a single game and host. vibe-fun is the
          layer in between: a shared <strong>catalog</strong> that travels with
          you. Connect once, and every game shows up — add a new game and it
          reaches every connected host at once, with no client update.
        </p>

        <h2>Open source</h2>
        <p>
          vibe-fun is free and open source under the MIT license. The whole
          server, the games, and the reference host all live in one repository —
          adding a game is a single self-contained HTML file. Contributions and
          new games are welcome.
        </p>
        <ul>
          <li>
            Source, issues, and discussion:{" "}
            <a href={SITE.githubUrl} target="_blank" rel="noopener noreferrer">
              github.com/sugarforever/vibe-fun
            </a>
          </li>
          <li>
            See <Link href="/#how">how it works</Link> and{" "}
            <Link href="/#connect">connect a host</Link>.
          </li>
          <li>
            Play now: <Link href="/play/2048">2048</Link> ·{" "}
            <Link href="/play/sudoku">Sudoku</Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
