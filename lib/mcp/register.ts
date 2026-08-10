import type { McpServer } from "@modelcontextprotocol/server";
import { APPS, catalogRows, htmlBytes } from "../apps/index";
import {
  MCP_APP_MIME,
  CATALOG_SCHEMA_VERSION,
  type AppCatalogEntry,
} from "../apps/types";

/** Plain-text fallback for hosts that cannot render MCP Apps UI. */
function fallbackText(app: AppCatalogEntry): string {
  return (
    `${app.name} is an interactive app served by this MCP Apps server. ` +
    `Open it in an MCP host that supports the "io.modelcontextprotocol/ui" extension ` +
    `to play. UI resource: ${app.uiResourceUri}`
  );
}

/**
 * Registers every catalogued app onto an McpServer instance:
 *   - a ui:// HTML resource (mimeType text/html;profile=mcp-app)
 *   - a tool that opens it, linked via _meta.ui.resourceUri
 *   - a plain-text fallback in the tool result
 * Plus a `list_apps` tool exposing the dynamic catalog.
 *
 * This is the single source of truth shared by the HTTP and stdio transports,
 * so both expose exactly the same surface.
 */
export function registerApps(server: McpServer): void {
  for (const app of APPS) {
    // Fail fast at startup if a self-contained HTML blows its size budget.
    const bytes = htmlBytes(app);
    if (bytes > app.maxHtmlBytes) {
      throw new Error(
        `App "${app.id}" HTML is ${bytes} bytes, over its ${app.maxHtmlBytes} byte limit.`,
      );
    }

    server.registerResource(
      app.id,
      app.uiResourceUri,
      {
        title: app.name,
        description: app.description,
        mimeType: MCP_APP_MIME,
        _meta: {
          "app/version": app.version,
          "app/suggestedSize": app.suggestedSize,
        },
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: MCP_APP_MIME,
            text: app.html,
          },
        ],
      }),
    );

    server.registerTool(
      app.toolName,
      {
        title: app.name,
        description: `Open the interactive ${app.name} app. ${app.description}`,
        inputSchema: app.inputSchema ?? {},
        _meta: {
          ui: {
            resourceUri: app.uiResourceUri,
            visibility: ["model", "app"],
            preferredSize: app.suggestedSize,
          },
          // ChatGPT / Apps SDK compatibility alias for the same UI link.
          // Standard hosts read _meta.ui.resourceUri; this is harmless extra.
          "openai/outputTemplate": app.uiResourceUri,
        },
      },
      async () => ({
        content: [{ type: "text" as const, text: fallbackText(app) }],
        _meta: { ui: { resourceUri: app.uiResourceUri } },
      }),
    );
  }

  server.registerTool(
    "list_apps",
    {
      title: "List apps",
      description:
        "List every app available in this MCP Apps server. The catalog is dynamic: " +
        "new apps appear here without any client change.",
      inputSchema: {},
    },
    async () => {
      const payload = {
        schemaVersion: CATALOG_SCHEMA_VERSION,
        apps: catalogRows(),
      };
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(payload, null, 2) },
        ],
        structuredContent: payload,
      };
    },
  );
}
