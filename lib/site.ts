/** Central site configuration used across pages and SEO metadata. */
export const SITE = {
  name: "vibe-fun",
  /** Production origin. Override with NEXT_PUBLIC_SITE_URL if the domain changes. */
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://vibefun.app",
  tagline: "Games for AI, on tap.",
  description:
    "vibe-fun is an MCP Apps server that delivers ready-to-play HTML games to any AI host. Connect once and every game shows up — no client updates, ever.",
  githubUrl: "https://github.com/sugarforever/vibe-fun",
  issuesUrl: "https://github.com/sugarforever/vibe-fun/issues",
  securityUrl: "https://github.com/sugarforever/vibe-fun/security/advisories/new",
  contactPath: "/contact",
  mcpPath: "/api/mcp",
  nav: [
    { label: "Games", href: "/#games" },
    { label: "Connect an agent", href: "/#connect" },
    { label: "Developers", href: "/#developers" },
  ],
} as const;

export function mcpEndpoint(): string {
  return `${SITE.url}${SITE.mcpPath}`;
}
