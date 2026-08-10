import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App HTML is embedded as string constants (lib/apps/**), so no file tracing
  // config is needed — everything the MCP endpoint serves is in the JS bundle.
  reactStrictMode: true,
  // Don't auto-generate AGENTS.md / CLAUDE.md — this repo's docs are hand-written.
  agentRules: false,
  async redirects() {
    return [
      // The old host-emulator page moved into the routed /play experience.
      {
        source: "/harness.html",
        has: [{ type: "query", key: "app", value: "sudoku" }],
        destination: "/play/sudoku",
        permanent: false,
      },
      { source: "/harness.html", destination: "/play/2048", permanent: false },
    ];
  },
};

export default nextConfig;
