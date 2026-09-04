/**
 * What the two halves of social sharing have to agree on: where this build
 * believes it is deployed, and the size and address of the cards.
 *
 * `scripts/build-og.mjs` draws them; `scripts/build-pages.mjs` writes the tags
 * that point at them. Neither reads the other, so the geometry and the file
 * names live here rather than being spelled out twice and drifting once.
 *
 * ----------------------------------------------------------------- the address
 *
 * Everything else in the project is deliberately address-agnostic — relative
 * hrefs, `base: "./"` — so the same `dist/` works from a domain root and from a
 * sub-path alike (see `vite.config.ts` and `scripts/build-pages.mjs`).
 *
 * Social sharing is the one thing that cannot be: Open Graph and Twitter cards
 * are read by crawlers that fetch the tags on their own and resolve nothing
 * against the page they came from, so `og:image` and `og:url` have to be
 * absolute or the card comes out blank. That address is taken from
 * `package.json`'s `homepage`, and `SITE_URL` overrides it for a preview
 * deployment or a fork:
 *
 *   SITE_URL=https://preview.example.com npm run build
 *
 * Only the share metadata and the domain printed on the card use this. Nothing
 * the browser loads does, so a mismatched value degrades the preview card and
 * never the site.
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readHomepage() {
  const { homepage } = JSON.parse(
    readFileSync(join(ROOT, "package.json"), "utf8"),
  );
  if (typeof homepage !== "string" || homepage === "")
    throw new Error("package.json needs a `homepage` for the share metadata.");
  return homepage;
}

/** So callers can join with a leading slash and never double it. */
function withoutTrailingSlash(url) {
  let trimmed = url;
  while (trimmed.endsWith("/")) trimmed = trimmed.slice(0, -1);
  return trimmed;
}

export const SITE_URL = withoutTrailingSlash(
  process.env.SITE_URL || readHomepage(),
);

/** The bare host, as printed at the foot of the share cards: `microcouncil.me`. */
export const SITE_HOST = new URL(SITE_URL).host.replace(/^www\./, "");

/** An absolute URL for a path rooted at the site: `siteUrl("/og/en.png")`. */
export function siteUrl(path) {
  const rooted = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${rooted}`;
}

/* ------------------------------------------------------------------- cards */

/**
 * 1200x630 — the size every network crops its preview from, and the one none of
 * them upscales. Declared in the tags as well as drawn, because a crawler that
 * knows the dimensions before it has the file lays the card out immediately
 * instead of after the download.
 */
export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

/** The directory the cards are written into, under the site root. */
export const CARD_DIR = "og";

/** Where a language's card is written, and therefore where it is served from. */
export function cardPath(code) {
  return `/${CARD_DIR}/${code}.png`;
}
