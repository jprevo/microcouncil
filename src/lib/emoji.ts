import emojiTable from "../emoji.json";
import { normalize } from "./text";

/** Shortcode -> character, generated from the emoji cheat sheet by `npm run emoji`. */
const TABLE: Readonly<Record<string, string>> = emojiTable;

export interface EmojiEntry {
  readonly code: string;
  readonly char: string;
}

const ENTRIES: readonly EmojiEntry[] = Object.entries(TABLE).map(
  ([code, char]) => ({ code, char }),
);

/** `:Grinning Face:` and `grinning face` both end up looking for `grinning_face`. */
function normalizeQuery(query: string): string {
  return normalize(query)
    .replace(/[^a-z0-9+]+/gu, "_")
    .replace(/^_+|_+$/gu, "");
}

/** Best matches first: the exact shortcode, then prefixes, then anything containing it. */
export function searchEmojis(
  query: string,
  limit: number,
): readonly EmojiEntry[] {
  const needle = normalizeQuery(query);
  if (needle === "") return ENTRIES.slice(0, limit);

  const exact: EmojiEntry[] = [];
  const prefixed: EmojiEntry[] = [];
  const rest: EmojiEntry[] = [];
  for (const entry of ENTRIES) {
    if (entry.code === needle) exact.push(entry);
    else if (entry.code.startsWith(needle)) prefixed.push(entry);
    else if (entry.code.includes(needle)) rest.push(entry);
  }
  return [...exact, ...prefixed, ...rest].slice(0, limit);
}
