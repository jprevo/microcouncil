import { resolveUsername } from "../prompt";

/** Case and diacritics flattened, so free-text inputs can be compared. */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** `numberLocale` is a BCP 47 tag, e.g. `"en-US"` or `"fr-FR"` — see `LocaleMeta`. */
export function formatNumber(value: number, numberLocale: string): string {
  return value.toLocaleString(numberLocale);
}

/** A slug usable as a file name, empty when the source holds nothing usable. */
export function slugify(value: string): string {
  return normalize(value)
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
}

/** In the summaries on screen, the template token reads as `youWord` (e.g. "you"). */
export function humanizeUsernameToken(value: string, youWord: string): string {
  return value.replace(/\{\{username\}\}/gu, youWord);
}

/** On the cards on screen, the template token reads as it will in the final prompt. */
export function fillUsernameToken(
  value: string,
  username: string,
  usernameFallback: string,
): string {
  return value.replace(
    /\{\{username\}\}/gu,
    resolveUsername(username, usernameFallback),
  );
}

/** Short readable date, as shown next to a saved council. */
export function formatDate(timestamp: number, numberLocale: string): string {
  return new Date(timestamp).toLocaleDateString(numberLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
