import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "vibe-fun is free, open-source software provided under the MIT license, as-is and without warranty. Games are for entertainment.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="prose-page">
      <span className="eyebrow">Terms</span>
      <h1>Terms of Use</h1>
      <p className="prose-updated">Last updated: August 10, 2026</p>
      <div className="prose">
        <p>
          vibe-fun is a free, open-source project. By using the website or
          connecting the server to an AI host, you agree to these simple terms.
        </p>

        <h2>License</h2>
        <p>
          The software is released under the <strong>MIT License</strong>. You
          are free to use, copy, modify, self-host, and distribute it under those
          terms. The full license is in the{" "}
          <a href={SITE.githubUrl} target="_blank" rel="noopener noreferrer">
            source repository
          </a>
          .
        </p>

        <h2>No warranty</h2>
        <p>
          The service and games are provided <strong>“as is”</strong>, without
          warranty of any kind. To the extent permitted by law, the authors are
          not liable for any claim or damages arising from use of the project.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>The games are for personal entertainment.</li>
          <li>
            Don&apos;t abuse, overload, or attempt to disrupt the service or its
            infrastructure.
          </li>
          <li>
            Don&apos;t misrepresent the project or use its name to deceive
            others.
          </li>
        </ul>

        <h2>Third-party hosts</h2>
        <p>
          When you play through ChatGPT, Claude, or another MCP host, that
          host&apos;s own terms and policies also apply to your session.
        </p>

        <h2>Changes</h2>
        <p>These terms may be updated; the date above reflects the latest version.</p>
      </div>
    </main>
  );
}
