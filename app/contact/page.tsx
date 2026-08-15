import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact the vibe-fun open-source project for technical support, bug reports, feature requests, contributions, and responsible security reports.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="prose-page">
      <span className="eyebrow">Contact</span>
      <h1>Contact vibe-fun</h1>
      <div className="prose">
        <p>
          vibe-fun is an open-source project. The fastest way to reach the
          maintainers is through the project&apos;s public GitHub channels, where
          reports can be tracked and resolved transparently.
        </p>

        <h2>Bug reports and technical support</h2>
        <p>
          Found a broken game, browser issue, or MCP integration problem?{" "}
          <a href={SITE.issuesUrl} target="_blank" rel="noopener noreferrer">
            Open a GitHub issue
          </a>{" "}
          with the affected game, browser or AI host, steps to reproduce, and
          the result you expected.
        </p>

        <h2>Feature requests and contributions</h2>
        <p>
          Use{" "}
          <a href={SITE.issuesUrl} target="_blank" rel="noopener noreferrer">
            GitHub Issues
          </a>{" "}
          to propose a game or product improvement. Code contributions are
          welcome through the same repository.
        </p>

        <h2>Security reports</h2>
        <p>
          Do not disclose a vulnerability in a public issue. Send it privately
          through{" "}
          <a href={SITE.securityUrl} target="_blank" rel="noopener noreferrer">
            GitHub&apos;s private vulnerability reporting form
          </a>
          . Include reproduction steps and the potential impact.
        </p>
      </div>
    </main>
  );
}
