/**
 * Regenerates src/catalog/emoji.json — the shortcode -> character table used by the emoji
 * picker when creating or editing a council member.
 *
 *   npm run emoji
 *
 * Two sources, both public and both refreshed upstream automatically:
 *
 *   - ikatyang/emoji-cheat-sheet gives the curated shortcode list (and its aliases),
 *     but its README only *renders* the pictograms, it never spells them out;
 *   - the GitHub emoji API gives, for each shortcode, an image URL whose file name is
 *     the Unicode code point sequence — which is the character itself.
 *
 * Shortcodes without a Unicode mapping (GitHub's own :octocat:, :shipit:… served as
 * bitmaps) are dropped: this application can only display real characters.
 */

import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = join(ROOT, "src", "catalog", "emoji.json");

const CHEAT_SHEET_URL =
  "https://raw.githubusercontent.com/ikatyang/emoji-cheat-sheet/master/README.md";
const GITHUB_EMOJI_API = "https://api.github.com/emojis";

/** Section of the cheat sheet holding bitmap-only shortcodes: nothing to import there. */
const CUSTOM_SECTION = "## GitHub Custom Emoji";

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "microcouncil-build" },
  });
  if (!response.ok)
    throw new Error(
      `${url} answered ${response.status} ${response.statusText}`,
    );
  return response.text();
}

/**
 * Shortcodes in cheat-sheet order. Every table row quotes its shortcodes as inline
 * code, one per alias, so a single pattern over the tables collects them all.
 */
function parseShortcodes(readme) {
  const codes = [];
  for (const line of readme.split("\n")) {
    if (line.startsWith(CUSTOM_SECTION)) break;
    if (!line.startsWith("|")) continue;
    for (const [, code] of line.matchAll(/`:([a-z0-9_+-]+):`/g))
      codes.push(code);
  }
  return codes;
}

/** `.../unicode/1f1eb-1f1f7.png?v8` -> 🇫🇷, or null for a bitmap-only emoji. */
function characterFromUrl(url) {
  const match = /\/unicode\/([0-9a-f-]+)\.png/.exec(url);
  if (match === null) return null;
  const points = match[1].split("-").map((point) => Number.parseInt(point, 16));
  return String.fromCodePoint(...points);
}

const [readme, apiBody] = await Promise.all([
  fetchText(CHEAT_SHEET_URL),
  fetchText(GITHUB_EMOJI_API),
]);
const urls = JSON.parse(apiBody);

const table = {};
let missing = 0;
for (const code of parseShortcodes(readme)) {
  if (code in table) continue;
  const url = urls[code];
  const character = typeof url === "string" ? characterFromUrl(url) : null;
  if (character === null) {
    missing += 1;
    continue;
  }
  table[code] = character;
}

const count = Object.keys(table).length;
if (count < 1000)
  throw new Error(
    `only ${count} emoji parsed: the upstream format probably changed`,
  );

writeFileSync(TARGET, `${JSON.stringify(table, null, 0)}\n`, "utf8");
console.log(
  `\n  ✅  src/catalog/emoji.json — ${count} shortcodes (${missing} without a Unicode character).\n`,
);
