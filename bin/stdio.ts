/**
 * Local stdio transport. Use this for MCP hosts that spawn a local process
 * (Claude Desktop, etc.). It exposes exactly the same tools/resources as the
 * HTTP endpoint because both call `registerApps`.
 *
 *   Run directly:   npm run stdio
 *   Host config:    { "command": "npx", "args": ["tsx", "bin/stdio.ts"] }
 *
 * (stdio cannot run on Vercel — that path is for HTTP. See README.)
 */
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { registerApps } from "../lib/mcp/register";

serveStdio(() => {
  const server = new McpServer(
    { name: "vibe-fun", version: "0.1.0" },
    { capabilities: { tools: {}, resources: {} } },
  );
  registerApps(server);
  return server;
});

// Keep stdout clean for the protocol; log to stderr.
process.stderr.write("vibe-fun MCP server listening on stdio\n");
