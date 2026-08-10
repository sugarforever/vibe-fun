import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App HTML is embedded as string constants (lib/apps/**), so no file tracing
  // config is needed — everything the MCP endpoint serves is in the JS bundle.
  reactStrictMode: true,
  // Don't auto-generate AGENTS.md / CLAUDE.md — this repo's docs are hand-written.
  agentRules: false,
};

export default nextConfig;
