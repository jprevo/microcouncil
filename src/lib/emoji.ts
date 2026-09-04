import { normalize } from "./text";

export interface EmojiEntry {
  readonly code: string;
  readonly char: string;
}

/**
 * Shortcode -> character, generated from the emoji cheat sheet by `npm run emoji`.
 * Shortcodes are English by convention (GitHub's own emoji API), shared by every
 * language rather than duplicated per locale, and loaded on demand — only once the
 * picker actually opens — so its ~45 KB never rides along with the rest of a page.
 */
let entries: Promise<readonly EmojiEntry[]> | null = null;

/**
 * A failed chunk load (offline, or a redeploy invalidating this session's content
 * hashes) must not cache the rejection forever: the next call — the next time the
 * picker opens — gets a fresh `import()` instead of a permanently broken picker.
 */
export function loadEmojiEntries(): Promise<readonly EmojiEntry[]> {
  entries ??= import("../catalog/emoji.json")
    .then((module) =>
      Object.entries(module.default as Record<string, string>).map(
        ([code, char]) => ({ code, char }),
      ),
    )
    .catch((error: unknown) => {
      entries = null;
      throw error;
    });
  return entries;
}

/** `:Grinning Face:` and `grinning face` both end up looking for `grinning_face`. */
function normalizeQuery(query: string): string {
  return normalize(query)
    .replace(/[^a-z0-9+]+/gu, "_")
    .replace(/^_|_$/gu, "");
}

/** Best matches first: the exact shortcode, then prefixes, then anything containing it. */
export function searchEmojis(
  entries: readonly EmojiEntry[],
  query: string,
  limit: number,
): readonly EmojiEntry[] {
  const needle = normalizeQuery(query);
  if (needle === "") return entries.slice(0, limit);

  const exact: EmojiEntry[] = [];
  const prefixed: EmojiEntry[] = [];
  const rest: EmojiEntry[] = [];
  for (const entry of entries) {
    if (entry.code === needle) exact.push(entry);
    else if (entry.code.startsWith(needle)) prefixed.push(entry);
    else if (entry.code.includes(needle)) rest.push(entry);
  }
  return [...exact, ...prefixed, ...rest].slice(0, limit);
}
