import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { APPS, getApp, htmlBytes } from "../lib/apps/index";

test("Pacman is a self-contained catalog app within its byte budget", () => {
  const app = getApp("pacman");
  assert.ok(app);
  assert.equal(app.toolName, "play_pacman");
  assert.equal(app.uiResourceUri, "ui://apps/pacman");
  assert.ok(APPS.includes(app));
  assert.ok(htmlBytes(app) <= app.maxHtmlBytes);
  assert.doesNotMatch(app.html, /<script[^>]+src=|<link[^>]+href=|https?:\/\//i);
});

test("Pacman embedded scripts are valid JavaScript", () => {
  const html = getApp("pacman")!.html;
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.ok(scripts.length >= 3);
  for (const script of scripts) new vm.Script(script[1]);
});

test("Pacman contains a validated maze and complete arcade rules", () => {
  const html = getApp("pacman")!.html;
  assert.match(html, /var MAZE = \[/);
  assert.match(html, /validateMaze/);
  assert.match(html, /function fixedUpdate/);
  assert.match(html, /function chooseGhostDirection/);
  assert.match(html, /frightenedUntil/);
  assert.match(html, /powerPellet/);
  assert.match(html, /levelComplete/);
  assert.match(html, /loseLife/);
  const mazeSource = html.match(/var MAZE = \[([\s\S]*?)\];/)?.[1];
  assert.ok(mazeSource);
  const rows = [...mazeSource.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  assert.equal(rows.length, 19);
  assert.ok(rows.every((row) => row.length === 19));
});

test("Pacman supports efficient rendering, accessibility, input, and persistence", () => {
  const html = getApp("pacman")!.html;
  assert.match(html, /devicePixelRatio/);
  assert.match(html, /requestAnimationFrame/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /aria-label="Pacman maze"/);
  assert.match(html, /pointerdown/);
  assert.match(html, /keydown/);
  assert.match(html, /data-dir="left"/);
  assert.match(html, /mcpApp\.load/);
  assert.match(html, /mcpApp\.save/);
  assert.match(html, /data:image\/webp;base64,/);
});

test("Pacman starts at an approachable pace and ramps gently", () => {
  const html = getApp("pacman")!.html;
  assert.match(html, /function playerSpeed\(\)\{return 4\.4\+\(level-1\)\*\.08;\}/);
  assert.match(html, /function ghostSpeed\(\)\{return 3\.2\+\(level-1\)\*\.07;\}/);
  assert.match(html, /function frightenedSpeed\(\)\{return 2\.55\+\(level-1\)\*\.05;\}/);
});
