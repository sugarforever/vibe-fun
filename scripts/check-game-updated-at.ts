import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import ts from "typescript";

const GAME_FILE = /^lib\/apps\/game-[^/]+\.ts$/;

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function dateFields(source: string): Array<string | undefined> {
  const file = ts.createSourceFile("game.ts", source, ts.ScriptTarget.Latest, true);
  const values: Array<string | undefined> = [];

  function visit(node: ts.Node): void {
    if (ts.isPropertyAssignment(node)) {
      const name = ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)
        ? node.name.text
        : undefined;
      if (name === "updatedAt") {
        values.push(ts.isStringLiteralLike(node.initializer) ? node.initializer.text : undefined);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(file);
  return values;
}

function validDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

const base = argument("--base");
if (!base) {
  process.stderr.write("Usage: npm run check:game-dates -- --base <git-ref>\n");
  process.exit(2);
}

let changedFiles: string[];
try {
  changedFiles = git(["diff", "--name-only", "--diff-filter=ACMRT", base, "--", "lib/apps"])
    .split("\n")
    .filter((file) => GAME_FILE.test(file));
} catch {
  process.stderr.write(`Unable to compare game files with base ref ${base}.\n`);
  process.exit(2);
}

const errors: string[] = [];
const today = todayUtc();

for (const file of changedFiles) {
  const currentFields = dateFields(readFileSync(file, "utf8"));
  const currentDate = currentFields[0];
  let previousDate: string | undefined;
  try {
    previousDate = dateFields(git(["show", `${base}:${file}`]))[0];
  } catch {
    previousDate = undefined;
  }

  if (currentFields.length === 0) {
    errors.push(`${file} changed, but it has no updatedAt property.`);
    continue;
  }
  if (currentFields.length > 1) {
    errors.push(`${file} has multiple updatedAt properties; keep exactly one catalog date.`);
    continue;
  }
  if (currentDate === undefined) {
    errors.push(`${file} updatedAt must be a YYYY-MM-DD string literal.`);
    continue;
  }
  if (!validDate(currentDate)) {
    errors.push(`${file} has an invalid updatedAt date: ${currentDate}.`);
    continue;
  }
  if (currentDate > today) {
    errors.push(`${file} updatedAt cannot be in the future: ${currentDate}.`);
    continue;
  }
  if (previousDate && currentDate < previousDate) {
    errors.push(`${file} updatedAt moved backwards from ${previousDate} to ${currentDate}.`);
    continue;
  }
  if (previousDate === currentDate && currentDate !== today) {
    errors.push(`${file} changed, but updatedAt is still ${currentDate}.`);
  }
}

if (errors.length) {
  process.stderr.write(`${errors.join("\n")}\n`);
  process.exit(1);
}

if (changedFiles.length === 0) {
  process.stdout.write("No game files changed.\n");
} else {
  const noun = changedFiles.length === 1 ? "file" : "files";
  process.stdout.write(`Verified ${changedFiles.length} changed game ${noun}.\n`);
}
