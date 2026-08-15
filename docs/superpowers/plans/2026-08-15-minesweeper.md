# Minesweeper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive, persistent Minesweeper MCP app with classic presets, custom boards, and a deterministic daily challenge.

**Architecture:** Follow the existing single-module game pattern: one TypeScript module embeds the game's CSS, markup, and browser JavaScript, then exports an `AppCatalogEntry`. Register that entry in the central `APPS` array so the existing MCP tools, resources, routes, and site catalog discover it automatically.

**Tech Stack:** TypeScript 5.9, self-contained HTML/CSS/ES5-compatible browser JavaScript, Node test runner, MCP Apps bridge, Next.js 16.

## Global Constraints

- The app ID is `minesweeper`, tool name is `play_minesweeper`, and UI resource URI is `ui://apps/minesweeper`.
- Classic presets are Beginner 9×9/10, Intermediate 16×16/40, and Expert 30×16/99.
- Custom width and height are 5–30; mine count is 1–`width * height - 9`.
- Daily mode is an Intermediate board deterministically seeded from the local ISO date and first revealed cell.
- The first revealed cell and its valid neighbors are always mine-free.
- The HTML is fully self-contained with no external requests or assets.
- The embedded JavaScript contains no backticks or template interpolation markers.
- Persist active play and daily completion history through `window.mcpApp`.
- Do not push until tests, typecheck, production build, and browser smoke validation succeed.

---

### Task 1: Define the Minesweeper Catalog and HTML Contract

**Files:**
- Create: `tests/minesweeper.test.ts`
- Modify: `lib/apps/index.ts`
- Create: `lib/apps/game-minesweeper.ts`

**Interfaces:**
- Consumes: `buildAppHtml(opts)` and `AppCatalogEntry` from the existing app framework.
- Produces: `htmlMinesweeper: string` and `appMinesweeper: AppCatalogEntry`.

- [ ] **Step 1: Write the failing catalog test**

```ts
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
  assert.doesNotMatch(app.html, /<script[^>]+src=|<link[^>]+href=|https?:\/\//i);
});
```

- [ ] **Step 2: Run the test and verify the missing app failure**

Run: `npm test -- tests/minesweeper.test.ts`

Expected: FAIL because `getApp("minesweeper")` returns `undefined`.

- [ ] **Step 3: Add the minimal app export and catalog registration**

Create the app module with `CSS`, `BODY`, and `JS` strings, compose it with:

```ts
export const htmlMinesweeper = buildAppHtml({
  appId: "minesweeper",
  title: "Minesweeper",
  css: CSS,
  body: BODY,
  js: JS,
});

export const appMinesweeper: AppCatalogEntry = {
  id: "minesweeper",
  name: "Minesweeper",
  description: "Clear the field without triggering a mine — classic, custom, and daily boards.",
  version: "1.0.0",
  toolName: "play_minesweeper",
  uiResourceUri: "ui://apps/minesweeper",
  suggestedSize: { width: 760, height: 720 },
  maxHtmlBytes: 128 * 1024,
  html: htmlMinesweeper,
};
```

Import `appMinesweeper` in `lib/apps/index.ts` and append it to `APPS`.

- [ ] **Step 4: Run the catalog test and verify it passes**

Run: `npm test -- tests/minesweeper.test.ts`

Expected: PASS.

### Task 2: Implement the Complete Game Contract

**Files:**
- Modify: `tests/minesweeper.test.ts`
- Modify: `lib/apps/game-minesweeper.ts`

**Interfaces:**
- Consumes: `window.mcpApp.ready()`, `load()`, `save(state)`, and `resize(width, height)`.
- Produces: browser-visible controls with IDs `mode`, `custom-controls`, `custom-width`, `custom-height`, `custom-mines`, `board`, `new-game`, `share`, and status elements `mine-count`, `timer`, `message`.

- [ ] **Step 1: Add failing feature-contract tests**

```ts
test("Minesweeper HTML exposes classic, custom, daily, and accessible controls", () => {
  const html = getApp("minesweeper")!.html;
  for (const value of ["beginner", "intermediate", "expert", "custom", "daily"]) {
    assert.match(html, new RegExp('value="' + value + '"'));
  }
  assert.match(html, /id="custom-width"/);
  assert.match(html, /id="custom-height"/);
  assert.match(html, /id="custom-mines"/);
  assert.match(html, /role="grid"/);
  assert.match(html, /aria-label/);
  assert.match(html, /prefers-reduced-motion/);
});

test("Minesweeper HTML includes safety, daily, touch, chord, and persistence hooks", () => {
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
```

- [ ] **Step 2: Run tests and verify feature markers fail**

Run: `npm test -- tests/minesweeper.test.ts`

Expected: FAIL on the first missing mode or control marker.

- [ ] **Step 3: Implement board state and rules**

In the embedded script, implement configuration selection, delayed mine placement, a nine-cell first-click exclusion zone, neighbor counts, empty-cell flood reveal, flag toggling, chord reveal, loss, and win detection. Use a flat array indexed by `row * width + column` and guard every action when status is won or lost.

- [ ] **Step 4: Implement interaction and responsive rendering**

Render semantic grid cells as buttons with state-specific accessible labels. Add click, context-menu, pointer long-press, and keyboard navigation handlers. Scale cells using CSS custom properties, permit horizontal scrolling for Expert boards, and honor reduced-motion preferences.

- [ ] **Step 5: Implement custom and daily modes**

Validate custom values against the global constraints and show an inline error without starting invalid boards. Build daily seeds from local `YYYY-MM-DD` plus first-click index using a string hash and deterministic PRNG. Record daily wins and best time, render a non-spoiling emoji summary, and copy it with a visible manual-copy fallback.

- [ ] **Step 6: Implement persistence and restoration**

Persist configuration, placed board, revealed/flagged arrays, timer, status, and daily history. Validate restored shapes and dimensions before using them, resume the timer only for active started games, and otherwise start a clean selected board.

- [ ] **Step 7: Run the focused tests**

Run: `npm test -- tests/minesweeper.test.ts`

Expected: PASS with all Minesweeper contract tests green.

### Task 3: Verify Integration and Publish

**Files:**
- Modify: `README.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: the completed `appMinesweeper` catalog entry.
- Produces: accurate project documentation and a pushed commit on the current branch.

- [ ] **Step 1: Add a failing documentation assertion**

```ts
test("project metadata names Minesweeper", async () => {
  const readFile = (await import("node:fs/promises")).readFile;
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.match(readme, /2048, Sudoku, and Minesweeper/);
  assert.match(pkg.description, /Minesweeper/);
});
```

- [ ] **Step 2: Run the test and verify the documentation failure**

Run: `npm test -- tests/minesweeper.test.ts`

Expected: FAIL because the current README and package description name only 2048 and Sudoku.

- [ ] **Step 3: Update documentation and metadata**

Change the README catalog summary, browser play examples, and project description to include Minesweeper. Update the package description to list all three games.

- [ ] **Step 4: Run complete automated verification**

Run: `npm test && npm run typecheck && npm run build`

Expected: all tests pass, TypeScript exits cleanly, and the Next.js production build exits 0.

- [ ] **Step 5: Run browser smoke validation**

Start the development server and exercise `/play/minesweeper?debug=1`. Verify first-click safety, empty expansion, flagging, chord behavior, each preset, invalid and valid custom values, deterministic daily restart, state restoration after reload, share feedback, keyboard control, touch long-press emulation, win/loss overlays, and Expert-board scrolling.

- [ ] **Step 6: Review the final diff and commit**

Run: `git diff --check && git status --short`, inspect every changed file, then commit only the Minesweeper work with message `feat: add Minesweeper game`.

- [ ] **Step 7: Push the validated branch**

Run: `git push`.

Expected: the remote accepts the current branch and reports its updated commit.
