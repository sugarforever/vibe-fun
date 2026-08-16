import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sitemap from "../app/sitemap";
import * as catalog from "../lib/apps/index";
import { SITE } from "../lib/site";
import Footer from "../components/Footer";

test("static sitemap entries do not claim they changed at build time", () => {
  const entries = sitemap();
  assert.ok(entries.length > 0);
  for (const entry of entries.filter((item) => !item.url.includes("/play/"))) {
    assert.equal(entry.lastModified, undefined);
  }
});

test("game sitemap entries use explicit per-game modification dates", () => {
  const expectedDates = new Map([
    ["2048", "2026-08-15"],
    ["sudoku", "2026-08-15"],
    ["minesweeper", "2026-08-15"],
    ["pacman", "2026-08-16"],
  ]);
  const entries = sitemap();

  for (const app of catalog.APPS) {
    const updatedAt = (app as unknown as { updatedAt?: string }).updatedAt;
    assert.equal(updatedAt, expectedDates.get(app.id));
    const entry = entries.find((item) => item.url.endsWith(`/play/${app.id}`));
    assert.ok(entry);
    assert.equal(new Date(entry.lastModified!).toISOString(), `${updatedAt}T00:00:00.000Z`);
  }

  assert.equal(entries.find((item) => item.url === "https://vibefun.app/")?.lastModified, undefined);
  assert.equal(entries.find((item) => item.url === "https://vibefun.app/about")?.lastModified, undefined);
});

test("every playable game has distinct indexable copy", () => {
  const bodies = new Set<string>();
  for (const app of catalog.APPS) {
    const seo = (app as unknown as { seo?: {
      title?: string;
      description?: string;
      intro?: string;
      sections?: Array<{ heading: string; body: string }>;
    } }).seo;
    assert.ok(seo, `${app.id} is missing SEO copy`);
    assert.match(seo.title ?? "", new RegExp(app.name, "i"));
    assert.ok((seo.description?.length ?? 0) >= 120);
    assert.ok((seo.sections?.length ?? 0) >= 2);
    const body = [seo.intro, ...(seo.sections ?? []).flatMap((s) => [s.heading, s.body])].join(" ");
    assert.ok(body.split(/\s+/).length >= 90, `${app.id} copy is too thin`);
    bodies.add(body);
  }
  assert.equal(bodies.size, catalog.APPS.length);
});

test("game schema describes each page as a free browser video game", () => {
  const buildGameJsonLd = (catalog as unknown as {
    buildGameJsonLd?: (app: (typeof catalog.APPS)[number]) => Record<string, unknown>;
  }).buildGameJsonLd;
  assert.equal(typeof buildGameJsonLd, "function");
  const schema = buildGameJsonLd!(catalog.APPS[0]);
  assert.equal(schema["@type"], "VideoGame");
  assert.equal(schema.url, "https://vibefun.app/play/2048");
  assert.equal(schema.isAccessibleForFree, true);
  assert.deepEqual(schema.publisher, { "@id": "https://vibefun.app/#organization" });
});

test("contact is a real indexed route reachable from the footer", () => {
  const site = SITE as unknown as { contactPath?: string; issuesUrl?: string };
  assert.equal(site.contactPath, "/contact");
  assert.equal(site.issuesUrl, "https://github.com/sugarforever/vibe-fun/issues");
  assert.ok(sitemap().some((entry) => entry.url === "https://vibefun.app/contact"));
  assert.match(renderToStaticMarkup(createElement(Footer)), /href="\/contact"/);
});
