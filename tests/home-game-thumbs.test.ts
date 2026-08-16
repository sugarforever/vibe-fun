import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "../app/page";

test("the Minesweeper catalog card renders a Minesweeper board thumbnail", () => {
  const html = renderToStaticMarkup(createElement(Home));
  const cardStart = html.indexOf('href="/play/minesweeper"');
  assert.notEqual(cardStart, -1);

  const nearbyMarkup = html.slice(Math.max(0, cardStart - 5000), cardStart);
  assert.match(nearbyMarkup, /class="minimines"/);
  assert.doesNotMatch(nearbyMarkup.slice(-2500), /class="minisudoku"/);
});

test("the Pacman catalog card renders a Pacman maze thumbnail", () => {
  const html = renderToStaticMarkup(createElement(Home));
  const cardStart = html.indexOf('href="/play/pacman"');
  assert.notEqual(cardStart, -1);
  const nearbyMarkup = html.slice(Math.max(0, cardStart - 5000), cardStart);
  assert.match(nearbyMarkup, /class="minipacman"/);
});

test("the growing game catalog uses a compact dedicated grid", () => {
  const html = renderToStaticMarkup(createElement(Home));
  assert.match(html, /class="game-library-head"/);
  assert.match(html, /class="game-grid"/);
  assert.match(html, /class="card card-hover game-card game-card-compact"/);
  assert.match(html, /class="game-description"/);
});

test("the homepage prioritizes games, then agent integration, then supporting content", () => {
  const html = renderToStaticMarkup(createElement(Home));
  const games = html.indexOf('id="games"');
  const connect = html.indexOf('id="connect"');
  const developers = html.indexOf('id="developers"');
  assert.ok(games > -1 && connect > games && developers > connect);
  assert.doesNotMatch(html.slice(0, games), /id="why"|id="how"/);
  assert.match(html.slice(0, games), /Browse games/);
});

test("compact 2048 thumbnail uses card-relative sizing and clips tile labels", async () => {
  const { readFile } = await import("node:fs/promises");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.game-card \.mini2048 \.t \{[^}]*font-size:clamp\(9px,1vw,16px\)/);
  assert.match(css, /\.game-card \.mini2048 \.t \{[^}]*overflow:hidden/);
  assert.match(css, /\.game-card \.mini2048[^}]*height:82%/);
});
