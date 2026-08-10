import { createMcpHandler } from "mcp-handler";
import { registerApps } from "@/lib/mcp/register";

/**
 * The remote MCP endpoint (Streamable HTTP). This is what you deploy to Vercel
 * and what remote MCP hosts connect to at `https://<deployment>/api/mcp`.
 *
 * The server is stateless — it holds no per-user data (durable progress lives on
 * the host side) — so it needs no Redis/session store and scales as plain
 * serverless functions.
 */
const handler = createMcpHandler(
  (server) => {
    registerApps(server);
  },
  {
    serverInfo: { name: "vibe-fun", version: "0.1.0" },
    capabilities: { tools: {}, resources: {} },
  },
);

export { handler as GET, handler as POST };

export const runtime = "nodejs";
export const maxDuration = 60;
