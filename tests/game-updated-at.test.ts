import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const checker = fileURLToPath(
  new URL("../scripts/check-game-updated-at.ts", import.meta.url),
);
const tsx = fileURLToPath(new URL("../node_modules/.bin/tsx", import.meta.url));

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function day(offset: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function gameSource(updatedAt: string | undefined, marker: string, prefix = ""): string {
  const dateField = updatedAt === undefined ? "" : `updatedAt: "${updatedAt}", `;
  return `${prefix}\nexport const game = { ${dateField}marker: "${marker}" };\n`;
}

function fixture(baseDate: string): { cwd: string; gamePath: string; base: string } {
  const cwd = mkdtempSync(join(tmpdir(), "vibe-fun-game-date-"));
  const gamePath = join(cwd, "lib/apps/game-2048.ts");
  execFileSync("mkdir", ["-p", join(cwd, "lib/apps")]);
  git(cwd, "init", "-q");
  git(cwd, "config", "user.email", "test@example.com");
  git(cwd, "config", "user.name", "Test User");
  writeFileSync(gamePath, gameSource(baseDate, "before"));
  git(cwd, "add", ".");
  git(cwd, "commit", "-qm", "base");
  return { cwd, gamePath, base: git(cwd, "rev-parse", "HEAD") };
}

function check(cwd: string, base: string) {
  return spawnSync(tsx, [checker, "--base", base], { cwd, encoding: "utf8" });
}

test("game date checker rejects stale dates even when embedded text contains a decoy", () => {
  const { cwd, gamePath, base } = fixture(day(-1));
  const decoy = `const embedded = 'updatedAt: "${day(0)}"';`;
  writeFileSync(gamePath, gameSource(day(-1), "changed", decoy));
  const result = check(cwd, base);
  assert.equal(result.status, 1);
  assert.match(result.stderr, new RegExp(`changed, but updatedAt is still ${day(-1)}`));
});

test("game date checker rejects missing, malformed, future, and backwards dates", () => {
  const { cwd, gamePath, base } = fixture(day(-1));

  writeFileSync(gamePath, gameSource(undefined, "changed"));
  let result = check(cwd, base);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /has no updatedAt/);

  writeFileSync(gamePath, gameSource("2026-8-5", "changed"));
  result = check(cwd, base);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /invalid updatedAt date: 2026-8-5/);

  writeFileSync(gamePath, gameSource(day(1), "changed"));
  result = check(cwd, base);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /updatedAt cannot be in the future/);

  const newer = fixture(day(0));
  writeFileSync(newer.gamePath, gameSource(day(-1), "changed"));
  result = check(newer.cwd, newer.base);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /updatedAt moved backwards/);
});

test("game date checker accepts an advanced date and repeated changes on the same UTC day", () => {
  const older = fixture(day(-1));
  writeFileSync(older.gamePath, gameSource(day(0), "changed"));
  let result = check(older.cwd, older.base);
  assert.equal(result.status, 0, result.stderr);

  const today = fixture(day(0));
  writeFileSync(today.gamePath, gameSource(day(0), "changed again"));
  result = check(today.cwd, today.base);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Verified 1 changed game file/);
});
