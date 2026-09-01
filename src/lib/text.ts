import { resolveUsername } from "../prompt";

/** Casse et diacritiques neutralisées, pour comparer des saisies libres. */
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

/** Slug utilisable comme nom de fichier, vide si la source ne contient rien d'exploitable. */
export function slugify(value: string): string {
  return normalize(value)
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
}

/** Dans les résumés affichés, le jeton du gabarit se lit « vous ». */
export function humanizeUsernameToken(value: string): string {
  return value.replace(/\{\{username\}\}/gu, "vous");
}

/** Dans les fiches affichées, le jeton du gabarit se lit comme dans le prompt final. */
export function fillUsernameToken(value: string, username: string): string {
  return value.replace(/\{\{username\}\}/gu, resolveUsername(username));
}
