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
