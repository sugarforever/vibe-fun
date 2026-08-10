import Link from "next/link";
import { Play, ArrowRight } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="container" style={{ padding: "120px 22px", textAlign: "center" }}>
      <span className="eyebrow">404</span>
      <h1 style={{ fontSize: "clamp(32px,5vw,52px)", marginTop: 14 }}>
        This one&apos;s off the board.
      </h1>
      <p className="lead" style={{ margin: "16px auto 0", maxWidth: 460 }}>
        The page you&apos;re after doesn&apos;t exist — but there&apos;s a game
        waiting for you.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
        <Link className="btn btn-primary" href="/play/2048">
          <Play /> Play 2048
        </Link>
        <Link className="btn btn-outline" href="/">
          Back home <ArrowRight />
        </Link>
      </div>
    </main>
  );
}
