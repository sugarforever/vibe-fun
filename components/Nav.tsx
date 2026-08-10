import Link from "next/link";
import { SITE } from "@/lib/site";
import { BrandMark, Play, Github } from "./icons";

/** Site-wide top navigation. Present on every page via the root layout. */
export default function Nav() {
  return (
    <header className="nav">
      <div className="container">
        <nav className="nav-inner" aria-label="Primary">
          <Link href="/" className="brand-logo" aria-label={`${SITE.name} home`}>
            <span className="brand-mark">
              <BrandMark />
            </span>
            {SITE.name}
          </Link>

          <div className="nav-links">
            {SITE.nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="nav-spacer" />

          <div className="nav-cta">
            <a
              className="btn btn-ghost btn-sm"
              href={SITE.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
            >
              <Github />
              <span className="only-desktop">GitHub</span>
            </a>
            <Link className="btn btn-primary btn-sm" href="/play/2048">
              <Play />
              Play
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
