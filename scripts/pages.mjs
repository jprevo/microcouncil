/**
 * What the scripts that write pages have to agree on: which languages this build
 * has, what each one's page is called on disk, and what it is linked by.
 *
 * `scripts/build-pages.mjs` writes those pages, `scripts/prerender.mjs` reopens
 * them in `dist/` to fill their markup in, and both name the same files. Neither
 * reads the other, so the registry and the two path conventions live here rather
 * than being spelled out twice and drifting once — the same reason `share.mjs`
 * exists for the share metadata.
 *
 * Adding a language therefore stays what it has always been: a directory under
 * `src/locales/` and a line in `src/locales/registry.json`. Everything derived
 * from it — pages, entry points, share cards, `robots.txt`, the sitemap and the
 * pre-rendered markup — follows on the next build without a second edit.
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * The languages this build has, in the order they are declared — the order the
 * sitemap lists them in, and the order they are generated in.
 *
 * Checked on the way out rather than trusted: exactly one language is the
 * default, and it is the one served at `/`. With two of them, or none, every
 * path below would be wrong in a way that surfaces only as a bad canonical URL
 * in production.
 */
export function readRegistry() {
  const registry = JSON.parse(
    readFileSync(join(ROOT, "src/locales/registry.json"), "utf8"),
  );

  if (registry.filter((locale) => locale.default).length !== 1)
    throw new Error(
      "src/locales/registry.json must have exactly one default locale.",
    );

  return registry;
}

/** The file written for a language — what Vite takes as a Rollup entry. */
export function htmlPath(locale) {
  return locale.default ? "index.html" : `${locale.code}.html`;
}

/**
 * The path that same page is linked by, which is not its file name: the host
 * serves `fr.html` at `/fr` and redirects the `.html` form onto it, so a
 * canonical pointing at the file would only redirect onto this address.
 *
 * Rooted at the site rather than at the page, because everything it feeds — the
 * canonical, the `hreflang` links, `og:url`, the sitemap — is read by a crawler
 * that has nothing to resolve `./fr` against. `localeHref()` in
 * `src/locale/registry.ts` is the in-page counterpart the picker and the landing
 * redirect navigate with, and names the same pages relatively — the two must
 * agree.
 */
export function pagePath(locale) {
  return locale.default ? "/" : `/${locale.code}`;
}
