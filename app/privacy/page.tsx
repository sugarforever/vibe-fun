import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "vibe-fun collects no personal data. No accounts, no ad trackers — game progress is saved locally by your browser or AI host, not by us.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="prose-page">
      <span className="eyebrow">Privacy</span>
      <h1>Privacy</h1>
      <p className="prose-updated">Last updated: August 10, 2026</p>
      <div className="prose">
        <p>
          The short version: <strong>vibe-fun collects no personal data.</strong>{" "}
          There are no accounts, no sign-ups, and no advertising or third-party
          analytics trackers.
        </p>

        <h2>What we don&apos;t collect</h2>
        <ul>
          <li>No accounts, names, emails, or profiles.</li>
          <li>No advertising or cross-site tracking cookies.</li>
          <li>No third-party analytics SDKs.</li>
        </ul>

        <h2>Your game progress</h2>
        <p>
          When you play in the browser, your progress (scores, board state) is
          stored in your own browser using <code>localStorage</code> and never
          sent to us. When you play through an AI assistant, progress is handled
          by that host under its own privacy policy — vibe-fun does not store
          your saves on the server.
        </p>

        <h2>Server logs</h2>
        <p>
          vibe-fun is hosted on a third-party platform (Vercel). Like any web
          host, it may process standard technical request data (such as IP
          address and user agent) to serve pages and protect the service. We do
          not use this data to identify or profile you. See your host
          platform&apos;s policy for details.
        </p>

        <h2>Contact</h2>
        <p>
          Questions or requests? Open an issue on{" "}
          <a href={SITE.githubUrl} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          . This is an open-source project; you can also read exactly what the
          code does.
        </p>

        <h2>Changes</h2>
        <p>
          If this policy changes, the updated date above will change with it.
        </p>
      </div>
    </main>
  );
}
