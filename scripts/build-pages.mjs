/**
 * Regenerates everything derived from the list of languages that a build needs
 * before Vite runs: one HTML file and one bootstrap module per locale in
 * `src/locales/registry.json`, plus the two files a crawler reads before the
 * pages themselves — `robots.txt` and `sitemap.xml`.
 *
 *   npm run pages
 *
 * Adding a language is then: a new `src/locales/<code>/` directory with its own
 * text, plus a line in the registry. Nothing here needs to change, and no page
 * ends up carrying another language's content — each entry statically imports
 * only its own locale's bundle, so Vite's per-entry code splitting keeps every
 * other language's JSON and markdown out of that page's chunk.
 *
 * This is generated output: it is wiped and rewritten on every run, and it is
 * git-ignored (see `.gitignore`) rather than committed — `npm run dev` and
 * `npm run build` both regenerate it first (`predev` / `prebuild`).
 *
 * Canonical and `hreflang` links are emitted as absolute URLs, built on the same
 * site address as the share metadata (`scripts/share.mjs`). They used to be
 * relative — this project has no fixed deployment domain, and a browser resolves
 * `./fr` against the page perfectly well — but these two links are not read by a
 * browser: `rel=canonical` and `hreflang` are specified to carry a fully
 * qualified URL, and Lighthouse's SEO audits fail a relative one outright. The
 * site's own navigation stays relative (`localeHref()` in
 * `src/locale/registry.ts`), so only the crawler-facing hrefs are pinned to a
 * domain, and a preview build moves them with `SITE_URL`, like the cards.
 *
 * They are extensionless — `/fr`, not `/fr.html` — because the host maps one
 * onto the other (Cloudflare Pages serves `fr.html` at `/fr` and redirects
 * `/fr.html` there). A host that doesn't would need `pagePath()` in
 * `scripts/pages.mjs`, and `localeHref()` in `src/locale/registry.ts`, to name
 * the files instead.
 *
 * Vite leaves an absolute `http(s)` href alone, so these links need nothing to
 * protect them. While they were relative they carried `vite-ignore`: without it
 * every `link[href]` is taken for an asset, and a canonical pointing at
 * `./fr.html` had Vite copy the page to `dist/assets/fr-<hash>.html` and rewrite
 * the link onto that copy, so each page ended up declaring a canonical URL that
 * was neither its own nor meant to be crawled. Anything relative added here
 * still needs the attribute.
 */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { htmlPath, pagePath, readRegistry } from "./pages.mjs";
import { CARD_HEIGHT, CARD_WIDTH, cardPath, siteUrl } from "./share.mjs";

/**
 * Mirrors `STORAGE_VERSION` in `src/storage.ts`: the inline theme script below
 * reads the very key that module writes, and the two have to name it the same.
 */
const STORAGE_VERSION = "v2";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const ENTRIES_DIR = join(SRC, "entries");

/**
 * Vite's public directory: what lands in `dist/` untouched, and therefore the
 * only place a file served from the site root can be written to. The share
 * cards are drawn into `og/` under it by `scripts/build-og.mjs`, which clears
 * that subdirectory alone — the two scripts write side by side, in either order.
 */
const PUBLIC_DIR = join(SRC, "public");

/**
 * Scanned rather than matched with `/<!--[\s\S]*?-->/`: that pattern backtracks
 * super-linearly on a file whose last comment is never closed, and `indexOf`
 * has no such cliff.
 */
function stripXmlComments(text) {
  let kept = "";
  let from = 0;

  for (;;) {
    const opened = text.indexOf("<!--", from);
    if (opened === -1) return kept + text.slice(from);

    kept += text.slice(from, opened);
    const closed = text.indexOf("-->", opened);
    if (closed === -1) return kept;

    from = closed + 3;
  }
}

/**
 * The favicon, inlined from `src/assets/favicon.svg` as a data URI: it is on the
 * page before the first request goes out, and it survives being served from a
 * sub-path, which a relative href would not do on every host.
 *
 * Comments and indentation are dropped before encoding — the drawing is the
 * payload, and the file's prose has no business travelling in every page.
 */
function readFavicon() {
  const svg = stripXmlComments(
    readFileSync(join(SRC, "assets/favicon.svg"), "utf8"),
  )
    .replace(/\s+/g, " ")
    .replace(/> </g, "><")
    .trim();

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const FAVICON = readFavicon();

function readJson(path) {
  return JSON.parse(readFileSync(join(ROOT, path), "utf8"));
}

/**
 * The theme, settled before the first pixel is drawn.
 *
 * `data-theme` used to be written as `light` and corrected by React once the app
 * had mounted, which meant anyone who reads on a dark screen — and anyone for
 * whom a white flash is a migraine rather than a nuisance — got one on every
 * load. This runs in the `<head>`, ahead of the stylesheet doing anything, so
 * the page is only ever painted in the theme it is going to keep.
 *
 * It reads the same two sources, in the same order, as `src/storage.ts`: what
 * the visitor chose last, then what their system asks for. Kept deliberately
 * small and total — a corrupt or absent entry falls through to the media query,
 * and a failing `localStorage` (private mode, blocked storage) falls through to
 * the attribute already on the element.
 */
function themeScript(locale) {
  const key = `microcouncil.state.${locale.code}.${STORAGE_VERSION}`;

  return `<script>
      (function () {
        try {
          var stored = JSON.parse(localStorage.getItem("${key}") || "null");
          var theme = stored && stored.theme;
          if (theme !== "light" && theme !== "dark")
            theme = matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light";
          document.documentElement.dataset.theme = theme;
        } catch (error) {}
      })();
    </script>`;
}

function escapeAttr(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

function entryPath(code) {
  return `entries/${code}.tsx`;
}

function renderEntry(locale) {
  return `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "../App";
import { redirectToPreferredLocale } from "../locale/redirect";
import { bundle } from "../locales/${locale.code}";

// A visitor whose language lives on another page is sent there before anything
// mounts, so they never see a flash of the one they did not ask for.
if (!redirectToPreferredLocale(bundle.meta.code)) {
  const container = document.getElementById("root");
  if (container === null) throw new Error("Mount point #root not found.");

  createRoot(container).render(
    <StrictMode>
      <App bundle={bundle} />
    </StrictMode>,
  );
}
`;
}

function renderHtml(page, pages) {
  const { meta, ui } = page;
  const hreflangs = pages
    .map(
      (other) =>
        `    <link rel="alternate" hreflang="${other.code}" href="${escapeAttr(siteUrl(pagePath(other)))}" />`,
    )
    .join("\n");
  const defaultLocale = pages.find((entry) => entry.default);

  // The languages this one is not, named the way Open Graph names them, so a
  // reader who lands on the card knows the page exists in theirs too.
  const alternateLocales = pages
    .filter((other) => other.code !== page.code)
    .map(
      (other) =>
        `    <meta property="og:locale:alternate" content="${other.meta.ogLocale}" />`,
    )
    .join("\n");

  // The one place absolute URLs are unavoidable. Everything a browser loads
  // stays relative, but a share card is assembled by a crawler that fetched the
  // page out of context and resolves nothing against it: a relative `og:image`
  // is the difference between a card with a picture and a bare grey box.
  // `scripts/site.mjs` explains where the address comes from.
  const card = siteUrl(cardPath(page.code));
  const cardAlt = `${meta.title} — ${ui.lede}`;

  return `<!doctype html>
<html lang="${page.code}" dir="${page.dir}" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover"
    />
    <title>${escapeAttr(meta.title)}</title>
    <meta name="description" content="${escapeAttr(meta.description)}" />
    <link rel="canonical" href="${escapeAttr(siteUrl(pagePath(page)))}" />
${hreflangs}
    <link rel="alternate" hreflang="x-default" href="${escapeAttr(siteUrl(pagePath(defaultLocale)))}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeAttr(meta.title)}" />
    <meta property="og:url" content="${escapeAttr(siteUrl(pagePath(page)))}" />
    <meta property="og:title" content="${escapeAttr(meta.title)}" />
    <meta property="og:description" content="${escapeAttr(meta.description)}" />
    <meta property="og:locale" content="${meta.ogLocale}" />
${alternateLocales}
    <meta property="og:image" content="${escapeAttr(card)}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="${CARD_WIDTH}" />
    <meta property="og:image:height" content="${CARD_HEIGHT}" />
    <meta property="og:image:alt" content="${escapeAttr(cardAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(meta.title)}" />
    <meta name="twitter:description" content="${escapeAttr(meta.description)}" />
    <meta name="twitter:image" content="${escapeAttr(card)}" />
    <meta name="twitter:image:alt" content="${escapeAttr(cardAlt)}" />
    <meta name="theme-color" content="#f2f5fa" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#060b18" media="(prefers-color-scheme: dark)" />
    <link rel="icon" type="image/svg+xml" href="${FAVICON}" />
    <link rel="stylesheet" href="./styles.css" />
    ${themeScript(page)}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./${entryPath(page.code)}"></script>
  </body>
</html>
`;
}

/* --------------------------------------------------------- crawler-facing files */

/**
 * `robots.txt`. Generated rather than kept as a fixture for the same reason as
 * everything else here: it names the sitemap, whose address is the deployment's,
 * so `SITE_URL` has to move it along with the share metadata.
 */
function renderRobots() {
  return `# Every crawler is welcome, the ones reading on behalf of an assistant
# included: this is a public tool, and its pages carry their content in the HTML
# itself — see scripts/prerender.mjs — rather than only after a JavaScript run.
User-agent: *
Allow: /

Sitemap: ${siteUrl("/sitemap.xml")}
`;
}

/**
 * A multilingual sitemap: one entry per page, each naming every language that
 * page exists in — the `xhtml:link` alternates the protocol asks for, the same
 * set the pages themselves declare as `hreflang` links. A crawler that reaches
 * one language then learns of the others without having to guess an address.
 *
 * This is the file that makes a new language discoverable, which is why it is
 * built from the registry rather than written by hand: adding a line there has
 * to be enough, or the pages it adds sit unlisted until someone remembers.
 *
 * `escapeAttr` does for XML what it does for HTML: `&`, `"` and `<` are the
 * three characters that would break either one, and neither `>` nor `'` needs
 * escaping inside an attribute delimited by double quotes.
 *
 * No `<lastmod>`: nothing in this build knows when a page's content last
 * changed, and a date taken from the build clock would claim every page was
 * modified on every deploy — a signal a crawler learns to ignore, which is worse
 * than not sending one.
 */
function renderSitemap(pages) {
  const defaultLocale = pages.find((entry) => entry.default);

  const entries = pages
    .map((page) => {
      const alternates = [...pages, { ...defaultLocale, code: "x-default" }]
        .map(
          (other) =>
            `    <xhtml:link rel="alternate" hreflang="${other.code}" href="${escapeAttr(siteUrl(pagePath(other)))}" />`,
        )
        .join("\n");

      return `  <url>
    <loc>${escapeAttr(siteUrl(pagePath(page)))}</loc>
${alternates}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${entries}
</urlset>
`;
}

/* ------------------------------------------------------------------- main */

const registry = readRegistry();

rmSync(ENTRIES_DIR, { recursive: true, force: true });
mkdirSync(ENTRIES_DIR, { recursive: true });

// Every language's text, read before the first page is written: a page names
// the others in its `hreflang` and its `og:locale:alternate`, so none of them
// can be rendered from its own bundle alone.
const pages = registry.map((locale) => ({
  ...locale,
  meta: readJson(`src/locales/${locale.code}/meta.json`),
  ui: readJson(`src/locales/${locale.code}/ui.json`),
}));

for (const page of pages) {
  writeFileSync(join(SRC, entryPath(page.code)), renderEntry(page));
  writeFileSync(join(SRC, htmlPath(page)), renderHtml(page, pages));
}

mkdirSync(PUBLIC_DIR, { recursive: true });
writeFileSync(join(PUBLIC_DIR, "robots.txt"), renderRobots());
writeFileSync(join(PUBLIC_DIR, "sitemap.xml"), renderSitemap(pages));

console.log(
  `Generated ${pages.length} page(s): ${pages.map(htmlPath).join(", ")}`,
);
console.log("Generated robots.txt and sitemap.xml.");
