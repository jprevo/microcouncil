/**
 * Regenerates src/catalog/emoji.json — the name -> character table used by the emoji
 * picker when creating or editing a council member.
 *
 *   npm run emoji
 *
 * One source: `emoji-test.txt`, the file Unicode itself publishes to say which emoji a
 * keyboard should offer and in which order. Every new version of the standard reissues
 * it under `latest/`, so the table follows the standard rather than a snapshot of it.
 *
 * Its virtue here is that it spells each character out *fully qualified* — variation
 * selectors and zero-width joiners included. A source that only names code points, as
 * GitHub's emoji API did, loses exactly those: ❤ comes out as a monochrome letter and
 * 👨‍👩‍👧‍👦 as four separate people.
 *
 * There are no shortcodes in it, so the searchable key is the Unicode name turned into
 * one: `grinning face with big eyes` -> `grinning_face_with_big_eyes`.
 */

import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = join(ROOT, "src", "catalog", "emoji.json");

const EMOJI_TEST_URL = "https://unicode.org/Public/emoji/latest/emoji-test.txt";

/**
 * `1F44B ; fully-qualified # 👋 E0.6 waving hand` — code points, status, then a comment
 * holding the character, the version that introduced it, and its name. Cut on the two
 * separators rather than matched in one go: the fields are read apart below.
 */
const ENTRY = /^([^;]+);([^#]+)#(.+)$/;

/** `👋 E0.6 waving hand`: the character, the version that brought it, then the name. */
const COMMENT = /^(\S+) E\d+(?:\.\d+)? (.+)$/;

/**
 * The two statuses that make up the set keyboards are expected to offer: whole emoji,
 * plus the handful of pieces that stand on their own (skin tones, hair). The other two
 * — `minimally-qualified` and `unqualified` — are the same emoji stripped of the very
 * selectors this table exists to keep, and are skipped.
 */
const OFFERED = new Set(["fully-qualified", "component"]);

/** Skin tones multiply every person by five without adding an icon worth picking. */
const SKIN_TONE = /[\u{1F3FB}-\u{1F3FF}]/u;

/** Names are ASCII but for these two, which would otherwise slug down to nothing. */
const SPELLED_OUT = { "#": " hash ", "*": " asterisk " };

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
 * `flag: Åland Islands` -> `flag_aland_islands`, the shape `searchEmojis` matches
 * queries against — and the shape `normalizeQuery` folds a typed query into, accents
 * and punctuation alike.
 */
function shortcodeFromName(name) {
  return name
    .replace(/[#*]/g, (symbol) => SPELLED_OUT[symbol])
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Data rows in file order — which is chart order, smileys first, and so the order the
 * picker offers them in. Comments carry the group and subgroup headings; nothing here
 * needs them.
 */
function offeredEmoji(file) {
  const emoji = [];
  for (const line of file.split("\n")) {
    if (line.startsWith("#") || line.trim() === "") continue;

    const row = ENTRY.exec(line);
    if (row === null) throw new Error(`unreadable row: ${line}`);
    const [, points, status, comment] = row;
    if (!OFFERED.has(status.trim())) continue;

    const described = COMMENT.exec(comment.trim());
    if (described === null) throw new Error(`unreadable comment: ${comment}`);
    const [, character, name] = described;
    if (SKIN_TONE.test(character)) continue;

    emoji.push({ points: points.trim(), character, name });
  }
  return emoji;
}

/** The character must be exactly what the code point column announces, joiners included. */
function assertCharacter({ points, character, name }) {
  const expected = String.fromCodePoint(
    ...points.split(" ").map((point) => Number.parseInt(point, 16)),
  );
  if (character !== expected)
    throw new Error(`${name}: ${points} does not spell ${character}`);
}

const table = {};
for (const entry of offeredEmoji(await fetchText(EMOJI_TEST_URL))) {
  assertCharacter(entry);
  const code = shortcodeFromName(entry.name);
  if (code in table) throw new Error(`two emoji answer to :${code}:`);
  table[code] = entry.character;
}

const count = Object.keys(table).length;
if (count < 1500)
  throw new Error(
    `only ${count} emoji parsed: the upstream format probably changed`,
  );

writeFileSync(TARGET, `${JSON.stringify(table, null, 2)}\n`, "utf8");
console.log(`\n  ✅  src/catalog/emoji.json — ${count} emoji.\n`);
