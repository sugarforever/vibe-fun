import assert from "node:assert/strict";
import test from "node:test";
import type { McpServer } from "@modelcontextprotocol/server";
import { registerApps } from "../lib/mcp/register";

test("app tools expose both current and legacy UI resource metadata", () => {
  const tools = new Map<string, Record<string, unknown>>();
  const server = {
    registerResource() {},
    registerTool(name: string, config: Record<string, unknown>) {
      tools.set(name, config);
    },
  } as unknown as McpServer;

  registerApps(server);

  const config = tools.get("play_2048");
  assert.ok(config);
  const meta = config._meta as Record<string, unknown>;
  assert.equal(
    (meta.ui as { resourceUri: string }).resourceUri,
    "ui://apps/2048",
  );
  assert.equal(meta["ui/resourceUri"], "ui://apps/2048");
});
