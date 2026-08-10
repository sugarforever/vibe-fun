import { getApp } from "@/lib/apps";

/**
 * Raw HTML preview of an app, served as ordinary `text/html`. This is NOT the
 * MCP transport — it exists so humans (and the test harness iframe) can load an
 * app directly in a browser. The MCP wire form is served via /api/mcp as a
 * `ui://` resource with mimeType `text/html;profile=mcp-app`.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const app = getApp(id);
  if (!app) {
    return new Response("App not found", { status: 404 });
  }
  return new Response(app.html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
