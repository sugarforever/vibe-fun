import type { ZodType } from "zod";

/**
 * Shared types and protocol constants for the MCP Apps server.
 *
 * This server implements MCP Apps (SEP-1865). The relevant wire-level facts,
 * pinned to the authoritative spec (modelcontextprotocol/ext-apps), are:
 *
 *  - UI resources are declared under the `ui://` URI scheme.
 *  - The HTML UI MIME type is `text/html;profile=mcp-app`.
 *  - A tool is linked to its UI resource via `_meta.ui.resourceUri` on the
 *    tool definition. The legacy `_meta["ui/resourceUri"]` alias is emitted
 *    alongside it for compatibility with hosts that have not migrated yet.
 *  - Hosts advertise support with the `io.modelcontextprotocol/ui` extension.
 */

/** MIME type for MCP Apps HTML UI resources (SEP-1865). */
export const MCP_APP_MIME = "text/html;profile=mcp-app";

/** Extension identifier a host advertises to signal MCP Apps support. */
export const MCP_APPS_EXTENSION = "io.modelcontextprotocol/ui";

/**
 * A single onboarded app in the catalog. Adding an app means adding one entry
 * here plus one HTML file — nothing else in the server changes.
 */
export interface AppCatalogEntry {
  /** Stable machine id, e.g. "2048". Used to build the ui:// URI and routes. */
  id: string;
  /** Human-facing title, e.g. "2048". */
  name: string;
  /** Short description surfaced in tools/list and resource metadata. */
  description: string;
  /** Indexable, game-specific copy for the public play page. */
  seo: {
    title: string;
    description: string;
    intro: string;
    sections: Array<{ heading: string; body: string }>;
  };
  /** Semantic version of this app's HTML. Bump when the HTML changes. */
  version: string;
  /** The tool name a host calls to open this app, e.g. "play_2048". */
  toolName: string;
  /** The ui:// resource URI, e.g. "ui://apps/2048". */
  uiResourceUri: string;
  /** Suggested initial window size for hosts that honor it. */
  suggestedSize: { width: number; height: number };
  /** Upper bound (bytes) enforced on the self-contained HTML at load time. */
  maxHtmlBytes: number;
  /** The fully self-contained HTML document (inline CSS + JS, no externals). */
  html: string;
  /**
   * Optional zod raw shape for tool arguments. Most apps take none. Sudoku
   * accepts an optional `difficulty`.
   */
  inputSchema?: Record<string, ZodType>;
}

/** Public catalog row (schema returned by the `list_apps` tool). */
export interface AppCatalogRow {
  id: string;
  name: string;
  description: string;
  version: string;
  toolName: string;
  uiResourceUri: string;
  suggestedSize: { width: number; height: number };
  htmlBytes: number;
}

/** Version of the catalog schema itself, for client-side caching/gating. */
export const CATALOG_SCHEMA_VERSION = "1.0.0";
