import { resolveUsername } from "../prompt";

/** Case and diacritics flattened, so free-text inputs can be compared. */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function plural(count: number, singular: string, suffix = "s"): string {
  return count > 1 ? `${singular}${suffix}` : singular;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("fr-FR");
}

/** A slug usable as a file name, empty when the source holds nothing usable. */
export function slugify(value: string): string {
  return normalize(value)
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
}

/** In the summaries on screen, the template token reads as "vous". */
export function humanizeUsernameToken(value: string): string {
  return value.replace(/\{\{username\}\}/gu, "vous");
}

/** On the cards on screen, the template token reads as it will in the final prompt. */
export function fillUsernameToken(value: string, username: string): string {
  return value.replace(/\{\{username\}\}/gu, resolveUsername(username));
}

/** Short readable date, as shown next to a saved council. */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
