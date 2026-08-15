# Minesweeper Design

## Goal

Add a polished, self-contained Minesweeper game to the vibe-fun MCP Apps catalog. It must support classic presets, custom boards, and a deterministic daily challenge while following the same catalog, HTML, bridge, persistence, and visual conventions as the existing 2048 and Sudoku apps.

## Product Scope

The app exposes one catalog entry with ID `minesweeper`, tool name `play_minesweeper`, and UI resource URI `ui://apps/minesweeper`.

It provides these modes:

- Beginner: 9 columns, 9 rows, 10 mines.
- Intermediate: 16 columns, 16 rows, 40 mines.
- Expert: 30 columns, 16 rows, 99 mines.
- Custom: user-selected width, height, and mine count. Width and height are limited to 5–30 and mines to 1–`width * height - 9`, ensuring the first-click safe zone can always exist.
- Daily: an Intermediate board generated deterministically from the player's local calendar date. The same date produces the same board on every client.

The daily mode records completion status and best completion time for each date in persisted app state. A completed daily game can copy a compact emoji result containing the date, outcome, time, and a non-spoiling summary. There is no remote leaderboard, account, or cross-device synchronization beyond storage supplied by the MCP host.

## Gameplay Rules

Mines are placed only after the first reveal. The clicked cell and its valid neighboring cells are excluded from mine placement, so the first action always opens a safe area. In daily mode, the seeded generator combines the date seed with the first revealed cell so that identical inputs create an identical board.

A reveal on an empty cell expands through adjacent empty cells and exposes their numbered boundary. Flagged cells cannot be revealed. Revealing a mine ends the game and shows all mines. Revealing every non-mine cell wins the game and flags all remaining mines.

Clicking or tapping an already revealed numbered cell performs a chord when its adjacent flag count equals its number. The chord reveals all adjacent unflagged cells and can lose the game if flags are incorrect, matching classic behavior.

## Interaction Design

Desktop interaction uses left-click to reveal, right-click to toggle a flag, and click on a revealed number to chord. Keyboard users move focus with arrow keys, reveal with Enter or Space, toggle a flag with `F`, and chord a revealed number with Enter or Space.

Touch interaction uses tap to reveal and a long press to toggle a flag. Tapping a revealed numbered cell chords it. Long-press handling suppresses the following synthetic click so it cannot accidentally reveal the cell.

The header displays the title, remaining-mine estimate, and elapsed time. A mode control switches among preset, custom, and daily games. The custom controls validate values before starting. A new-game control restarts the selected configuration. Win and loss overlays provide a replay action; daily wins also provide the share action.

The board scales to the available viewport. Expert mode may use horizontal scrolling when individual cells would otherwise become unusably small. Cell states use color, symbols, and accessible labels rather than color alone. Motion respects `prefers-reduced-motion`.

## Architecture

Create `lib/apps/game-minesweeper.ts` following the existing single-module app convention. The module contains app-specific CSS, body markup, browser JavaScript, the `buildAppHtml` call, and the exported `AppCatalogEntry`. It has no external requests, fonts, images, or runtime dependencies.

Register `appMinesweeper` in `lib/apps/index.ts`. Existing MCP registration, routes, landing-page catalog rendering, and browser host support discover it automatically from `APPS`; they require no feature-specific changes.

All gameplay runs in the embedded browser script. Board state uses flat arrays for mine, revealed, flagged, and neighboring-mine values. A small seeded PRNG is used only for daily mode; normal modes use `Math.random`.

## Persistence

The app loads and saves through `window.mcpApp`. Persisted state includes:

- schema version and selected mode;
- custom dimensions and mine count;
- board dimensions, mine positions, revealed cells, and flags after placement;
- whether the board has started, the first revealed cell, elapsed seconds, and game status;
- daily completion records keyed by ISO local date.

Loading rejects malformed or dimensionally inconsistent data and starts a fresh game instead. The timer resumes only for an active started game. A fresh, unstarted normal game does not need to preserve a future random layout because mines do not yet exist.

## Error Handling and Boundaries

Custom values are parsed as integers, clamped to the documented ranges, and accompanied by an inline validation message when the mine count is incompatible with the chosen dimensions. The app never constructs an impossible first-click safe zone.

Clipboard failure leaves the result visible and changes the share feedback to instruct the player to copy manually. Storage and host bridge failures remain non-fatal because the shared bridge already degrades to standalone local storage or a fresh state.

The generated HTML must stay below its declared byte budget and must not contain external resource URLs. Script content follows the repository constraint forbidding nested backticks or template interpolation markers.

## Testing and Validation

Automated tests will assert that Minesweeper appears in the catalog with the expected metadata, is registered as a callable tool and UI resource, remains within its HTML byte limit, and emits self-contained HTML containing the required preset, custom, daily, accessibility, persistence, and interaction hooks.

Implementation follows a red-green cycle: add failing catalog and feature-contract tests, observe the expected failure, implement the minimum app and registration changes, and rerun the suite.

Final validation consists of:

- the complete automated test suite;
- TypeScript type-checking;
- a production Next.js build;
- a browser smoke test covering first-click safety, reveal expansion, flagging, chord behavior, custom validation, daily restart determinism, persistence reload, win/loss overlays, and responsive Expert layout.

Only after all validation succeeds will the implementation be committed and pushed to the current branch.
