/**
 * Shuffles the order of the members in src/catalog/members.json, in place.
 *
 *   npm run shuffle
 *
 * That file is the structural catalog behind the member picker — ids and icons
 * only, shared by every language — and its order is the order the members are
 * offered in, in every locale at once. New members are always appended, so
 * without a shuffle the most recent arrivals would stay bunched at the bottom.
 *
 * The draw is a Fisher-Yates, so every permutation is equally likely, and `randomInt`
 * avoids the modulo bias of a scaled `Math.random()`. Only the order changes: no
 * member is added, removed or edited.
 */

import { randomInt } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = join(ROOT, "src", "catalog", "members.json");

const members = JSON.parse(readFileSync(TARGET, "utf8"));
if (!Array.isArray(members))
  throw new Error("src/catalog/members.json does not hold an array of members");

for (let i = members.length - 1; i > 0; i -= 1) {
  const j = randomInt(i + 1);
  [members[i], members[j]] = [members[j], members[i]];
}

writeFileSync(TARGET, `${JSON.stringify(members, null, 2)}\n`, "utf8");

// JSON.stringify spreads the trait arrays over several lines; prettier packs them
// back so the file keeps the same shape as the rest of the repo.
const PRETTIER = join(ROOT, "node_modules", "prettier", "bin", "prettier.cjs");
execFileSync(process.execPath, [PRETTIER, "--write", TARGET], {
  cwd: ROOT,
  stdio: "ignore",
});

console.log(
  `\n  ✅  src/catalog/members.json — ${members.length} members shuffled.\n`,
);
