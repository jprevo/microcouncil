/**
 * Mélange l'ordre des membres de src/members.json, sur place.
 *
 *   npm run shuffle
 *
 * Le fichier sert de catalogue au sélecteur de conseillers : son ordre est celui
 * dans lequel les membres sont proposés. Un ajout se faisant toujours en fin de
 * liste, les derniers arrivés resteraient sinon groupés en bas du catalogue.
 *
 * Le tirage est un Fisher-Yates, donc chaque permutation est équiprobable, et
 * `randomInt` évite le biais modulo d'un `Math.random()` mis à l'échelle. Seul
 * l'ordre change : aucun membre n'est ajouté, retiré ni modifié.
 */

import { randomInt } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = join(ROOT, "src", "members.json");

const members = JSON.parse(readFileSync(TARGET, "utf8"));
if (!Array.isArray(members))
  throw new Error("src/members.json ne contient pas un tableau de membres");

for (let i = members.length - 1; i > 0; i -= 1) {
  const j = randomInt(i + 1);
  [members[i], members[j]] = [members[j], members[i]];
}

writeFileSync(TARGET, `${JSON.stringify(members, null, 2)}\n`, "utf8");

// JSON.stringify éclate les tableaux de traits sur plusieurs lignes ; prettier les
// recompacte pour que le fichier reste dans le format du reste du dépôt.
const PRETTIER = join(ROOT, "node_modules", "prettier", "bin", "prettier.cjs");
execFileSync(process.execPath, [PRETTIER, "--write", TARGET], {
  cwd: ROOT,
  stdio: "ignore",
});

console.log(`\n  ✅  src/members.json — ${members.length} membres mélangés.\n`);
