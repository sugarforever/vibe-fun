import { app2048 } from "./game-2048";
import { appMinesweeper } from "./game-minesweeper";
import { appSudoku } from "./game-sudoku";
import type { AppCatalogEntry, AppCatalogRow } from "./types";
import { SITE } from "../site";

/**
 * The app catalog. To onboard a new app, build its self-contained HTML in a
 * sibling module and add its entry to this array — nothing else changes.
 */
export const APPS: AppCatalogEntry[] = [app2048, appSudoku, appMinesweeper];

export function getApp(id: string): AppCatalogEntry | undefined {
  return APPS.find((a) => a.id === id);
}

export function htmlBytes(app: AppCatalogEntry): number {
  return new TextEncoder().encode(app.html).length;
}

export function buildGameJsonLd(app: AppCatalogEntry): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: app.name,
    url: `${SITE.url}/play/${app.id}`,
    description: app.seo.description,
    applicationCategory: "Game",
    gamePlatform: ["Web browser", "MCP Apps host"],
    operatingSystem: "Any",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${SITE.url}/#organization` },
  };
}

/** The public catalog rows returned by the `list_apps` tool. */
export function catalogRows(): AppCatalogRow[] {
  return APPS.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    version: a.version,
    toolName: a.toolName,
    uiResourceUri: a.uiResourceUri,
    suggestedSize: a.suggestedSize,
    htmlBytes: htmlBytes(a),
  }));
}
