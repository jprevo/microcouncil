import registryJson from "../locales/registry.json";

/** One entry of `src/locales/registry.json` — a language this app is built for. */
export interface LocaleEntry {
  readonly code: string;
  readonly label: string;
  readonly dir: "ltr" | "rtl";
  readonly default: boolean;
}

/**
 * Every language the site ships, in registry order.
 *
 * This is the single list the whole app reads: the footer picker, the language
 * negotiation and the landing redirect all derive from it, so adding a language
 * stays exactly what it is today — one entry in `src/locales/registry.json` plus
 * its `src/locales/<code>/` directory. Nothing else knows a language by name.
 *
 * It is the only locale data every page carries (a code, a label and a direction
 * per language); the *content* of a language still lives in its own chunk and is
 * only ever loaded by its own page.
 */
export const LOCALES = registryJson as readonly LocaleEntry[];

function findDefault(): LocaleEntry {
  const entry = LOCALES.find((locale) => locale.default) ?? LOCALES[0];
  if (entry === undefined)
    throw new Error("src/locales/registry.json lists no locale.");
  return entry;
}

/** The language served at the root (`/`), and the fallback for everything. */
export const DEFAULT_LOCALE: LocaleEntry = findDefault();

/**
 * Where a language's page sits, relative to any other page.
 *
 * Extensionless, because the host serves `fr.html` at `/fr` and redirects the
 * `.html` form onto it — linking to the file would spend a round trip landing on
 * this same address anyway. Relative, because the languages are built side by
 * side into one directory and this project has no fixed deployment domain: it
 * works from a domain root and from a sub-path alike (see `vite.config.ts`).
 * `/fr` and `/app/fr` both resolve `./en` and `./` the way you would want.
 *
 * This mirrors `pageHref()` in `scripts/build-pages.mjs`, which writes the same
 * URLs into every page's `canonical` and `hreflang` links. A Node build script
 * can't import a TypeScript module, so the rule is spelled out in both places;
 * keep them in step.
 */
export function localeHref(code: string): string {
  return code === DEFAULT_LOCALE.code ? "./" : `./${code}`;
}

function baseLanguage(tag: string): string {
  return tag.toLowerCase().split("-")[0] ?? "";
}

/**
 * The best language this site has for a visitor, given the BCP 47 tags they
 * asked for, most-wanted first — the shape of `navigator.languages`.
 *
 * An exact match wins; failing that, the first language sharing its base wins,
 * so `fr-CA` lands on `fr` and, the day the registry carries a regional entry,
 * `pt` lands on `pt-BR`. Null when the visitor asked for nothing we speak, which
 * is the caller's cue to leave them where they are.
 */
export function matchLocale(tags: readonly string[]): string | null {
  const exact = new Map(LOCALES.map(({ code }) => [code.toLowerCase(), code]));
  const byBase = new Map<string, string>();
  for (const { code } of LOCALES) {
    const base = baseLanguage(code);
    if (!byBase.has(base)) byBase.set(base, code);
  }

  for (const tag of tags) {
    const hit = exact.get(tag.toLowerCase()) ?? byBase.get(baseLanguage(tag));
    if (hit !== undefined) return hit;
  }
  return null;
}
