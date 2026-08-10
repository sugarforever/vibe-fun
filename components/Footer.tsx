import Link from "next/link";
import { SITE } from "@/lib/site";
import { BrandMark } from "./icons";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div style={{ maxWidth: 300 }}>
            <Link href="/" className="brand-logo" aria-label={`${SITE.name} home`}>
              <span className="brand-mark">
                <BrandMark />
              </span>
              {SITE.name}
            </Link>
            <p style={{ color: "var(--text-muted)", marginTop: 14, fontSize: 15 }}>
              Ready-to-play games for every AI host, delivered over the open MCP
              Apps protocol.
            </p>
          </div>

          <div className="footer-col">
            <h4>Play</h4>
            <Link href="/play/2048">2048</Link>
            <Link href="/play/sudoku">Sudoku</Link>
            <Link href="/#games">All games</Link>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <Link href="/#how">How it works</Link>
            <Link href="/#connect">Connect a host</Link>
            <Link href="/#developers">For developers</Link>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <a href={SITE.githubUrl} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={SITE.mcpPath}>MCP endpoint</a>
            <a
              href="https://modelcontextprotocol.io/seps/1865-mcp-apps-interactive-user-interfaces-for-mcp"
              target="_blank"
              rel="noopener noreferrer"
            >
              MCP Apps spec
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {SITE.name}. Built on the open Model
            Context Protocol.
          </span>
          <span>Open source · MIT</span>
        </div>
      </div>
    </footer>
  );
}
