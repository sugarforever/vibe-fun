# Game Updated-At Enforcement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish truthful per-game sitemap modification dates and make CI reject game-code changes that do not update the corresponding date.

**Architecture:** Store an ISO `YYYY-MM-DD` date beside each game catalog entry. Sitemap output consumes that explicit value. A standalone TypeScript checker compares changed `lib/apps/game-*.ts` files against a Git base revision and GitHub Actions runs it for pushes and pull requests.

**Tech Stack:** TypeScript, Node.js test runner, tsx, Next.js MetadataRoute, GitHub Actions.

## Global Constraints

- Do not derive dates from Vercel build time or filesystem timestamps.
- Any changed `lib/apps/game-*.ts` file must change its own `updatedAt` value.
- Dates use strict `YYYY-MM-DD` format and cannot be in the future.

---

### Task 1: Game metadata and sitemap output

**Files:**
- Modify: `lib/apps/types.ts`
- Modify: `lib/apps/game-2048.ts`
- Modify: `lib/apps/game-sudoku.ts`
- Modify: `lib/apps/game-minesweeper.ts`
- Modify: `app/sitemap.ts`
- Test: `tests/seo.test.ts`

**Interfaces:**
- Produces: `AppCatalogEntry.updatedAt: string`
- Consumes: `updatedAt` as the `lastModified` value for game sitemap entries only.

- [ ] Add failing assertions for strict dates and exact sitemap output.
- [ ] Run `npm test -- tests/seo.test.ts` and confirm failure because `updatedAt` is absent.
- [ ] Add the metadata and wire it to `app/sitemap.ts`.
- [ ] Run the focused tests and confirm they pass.

### Task 2: Git-aware enforcement command

**Files:**
- Create: `scripts/check-game-updated-at.ts`
- Create: `tests/game-updated-at.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run check:game-dates -- --base <git-ref>`
- Behavior: exit 1 with the changed game filenames when code changed but `updatedAt` did not; exit 0 when every changed game advances its date.

- [ ] Add an integration test using a temporary real Git repository.
- [ ] Run the test and confirm failure because the command is absent.
- [ ] Implement argument parsing, Git comparison, date extraction and validation.
- [ ] Run the focused test and confirm pass.

### Task 3: CI enforcement and verification

**Files:**
- Create: `.github/workflows/game-dates.yml`

**Interfaces:**
- Consumes: GitHub push `before` SHA or pull-request base SHA.
- Runs: `npm run check:game-dates -- --base "$BASE_SHA"` with full Git history.

- [ ] Add the workflow for pushes and pull requests.
- [ ] Run `npm test`, `npm run check:game-dates -- --base HEAD^`, `npm run typecheck`, and `npm run build`.
- [ ] Inspect `git diff --check` and the final diff.
