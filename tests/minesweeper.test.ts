import assert from "node:assert/strict";
import test from "node:test";
import { APPS, getApp, htmlBytes } from "../lib/apps/index";

test("Minesweeper is a self-contained catalog app within its byte budget", () => {
  const app = getApp("minesweeper");
  assert.ok(app);
  assert.equal(app.toolName, "play_minesweeper");
  assert.equal(app.uiResourceUri, "ui://apps/minesweeper");
  assert.ok(APPS.includes(app));
  assert.ok(htmlBytes(app) <= app.maxHtmlBytes);
  assert.doesNotMatch(
    app.html,
    /<script[^>]+src=|<link[^>]+href=|https?:\/\//i,
  );
});

test("Minesweeper exposes classic, custom, daily, and accessible controls", () => {
  const html = getApp("minesweeper")!.html;
  for (const value of [
    "beginner",
    "intermediate",
    "expert",
    "custom",
    "daily",
  ]) {
    assert.match(html, new RegExp('value="' + value + '"'));
  }
  assert.match(html, /id="custom-width"/);
  assert.match(html, /id="custom-height"/);
  assert.match(html, /id="custom-mines"/);
  assert.match(html, /role="grid"/);
  assert.match(html, /aria-label="Minefield"/);
  assert.match(html, /prefers-reduced-motion/);
});

test("Minesweeper includes safety, daily, touch, chord, and persistence behavior", () => {
  const html = getApp("minesweeper")!.html;
  assert.match(html, /safeZone/);
  assert.match(html, /seededRandom/);
  assert.match(html, /dailyHistory/);
  assert.match(html, /pointerdown/);
  assert.match(html, /contextmenu/);
  assert.match(html, /function chord/);
  assert.match(html, /mcpApp\.load/);
  assert.match(html, /mcpApp\.save/);
});

test("project metadata lists Minesweeper with the existing games", async () => {
  const { readFile } = await import("node:fs/promises");
  const readme = await readFile(
    new URL("../README.md", import.meta.url),
    "utf8",
  );
  const pkg = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  ) as { description: string };
  assert.match(readme, /2048, Sudoku, and Minesweeper/);
  assert.match(readme, /play\/minesweeper/);
  assert.match(pkg.description, /Minesweeper/);
});
