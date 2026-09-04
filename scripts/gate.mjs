/**
 * Runs the four quality checks of the gate concurrently instead of one after the
 * other:
 *
 *   npm run gate
 *
 * They are independent — each only reads the sources — so the wall clock is that of
 * the slowest one (ESLint) rather than the sum of all four.
 *
 * Their outputs would interleave into noise if they shared the terminal, so each
 * one is buffered and replayed in declaration order once every check has settled.
 * The exit code is non-zero as soon as one check fails, and every failure is
 * reported: unlike the sequential chain, a broken format no longer hides the rest.
 */

import { spawn } from "node:child_process";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BIN = join(ROOT, "node_modules", ".bin");

/** Kept in sync with the individual npm scripts, which stay usable on their own. */
const CHECKS = [
  { name: "format", command: "prettier --check ." },
  { name: "lint", command: "eslint ." },
  { name: "typecheck", command: "tsc --noEmit" },
  { name: "knip", command: "knip" },
];

function run({ name, command }) {
  const started = Date.now();
  return new Promise((settle) => {
    // Local binaries are resolved the way `npm run` does it, so the commands above
    // stay identical to the ones spelled out in package.json.
    const child = spawn(command, {
      cwd: ROOT,
      shell: true,
      env: { ...process.env, PATH: BIN + delimiter + process.env.PATH },
    });

    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));

    const finish = (code) =>
      settle({ name, output, ok: code === 0, ms: Date.now() - started });
    child.on("close", finish);
    child.on("error", (error) => {
      output += `${error.message}\n`;
      finish(1);
    });
  });
}

const results = await Promise.all(CHECKS.map(run));

for (const { name, output, ok, ms } of results) {
  const seconds = (ms / 1000).toFixed(1);
  if (ok) {
    console.log(`✔ ${name} (${seconds}s)`);
    continue;
  }
  console.log(`\n✖ ${name} (${seconds}s)`);
  console.log(output.trimEnd());
}

const failed = results.filter((result) => !result.ok);
if (failed.length > 0) {
  console.log(`\n${failed.length}/${results.length} checks failed.`);
  process.exitCode = 1;
}
