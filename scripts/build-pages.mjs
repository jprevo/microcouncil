/**
 * Regenerates the per-language entry points this app is built from — one HTML
 * file and one bootstrap module per locale in `src/locales/registry.json`:
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
 * Canonical and `hreflang` links are emitted as relative paths, not absolute
 * URLs: this project deliberately has no fixed deployment domain (it works
 * equally from a domain root or a sub-path — see `vite.config.ts`), so an
 * absolute URL isn't available at build time. Most crawlers resolve relative
 * `hreflang`/`canonical` hrefs against the page they were found on, which is
 * good enough here; a deployment pinned to one domain could tighten this.
 *
 * They are also extensionless — `./fr`, not `./fr.html` — because the host maps
 * one onto the other (Cloudflare Pages serves `fr.html` at `/fr` and redirects
 * `/fr.html` there). A host that doesn't would need `pageHref()` below, and
 * `localeHref()` in `src/locale/registry.ts`, to name the files instead.
 *
 * Each of those links carries `vite-ignore`, which Vite honours and then strips
 * from the output. Without it every `link[href]` is taken for an asset: a
 * canonical pointing at `./fr.html` had Vite copy the page to
 * `dist/assets/fr-<hash>.html` and rewrite the link onto that copy, so each page
 * ended up declaring a canonical URL that was neither its own nor meant to be
 * crawled. These hrefs address pages; they are not references to build inputs,
 * and Vite has no business resolving them.
 */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const ENTRIES_DIR = join(SRC, "entries");

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

function escapeAttr(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

/** The file written for a language — what Vite takes as a Rollup entry. */
function htmlPath(locale) {
  return locale.default ? "index.html" : `${locale.code}.html`;
}

/**
 * The URL that same page is linked by, which is not its file name: the host
 * serves `fr.html` at `/fr` and redirects the `.html` form onto it, so a
 * canonical pointing at the file would only redirect onto this address.
 *
 * Mirrored by `localeHref()` in `src/locale/registry.ts`, which the picker and
 * the landing redirect navigate with — the two must agree.
 */
function pageHref(locale) {
  return locale.default ? "./" : `./${locale.code}`;
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

function renderHtml(locale, registry, meta) {
  const hreflangs = registry
    .map(
      (other) =>
        `    <link rel="alternate" hreflang="${other.code}" href="${pageHref(other)}" vite-ignore />`,
    )
    .join("\n");
  const defaultLocale = registry.find((entry) => entry.default);

  return `<!doctype html>
<html lang="${locale.code}" dir="${locale.dir}" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover"
    />
    <title>${escapeAttr(meta.title)}</title>
    <meta name="description" content="${escapeAttr(meta.description)}" />
    <link rel="canonical" href="${pageHref(locale)}" vite-ignore />
${hreflangs}
    <link rel="alternate" hreflang="x-default" href="${pageHref(defaultLocale)}" vite-ignore />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeAttr(meta.title)}" />
    <meta property="og:description" content="${escapeAttr(meta.description)}" />
    <meta property="og:locale" content="${meta.ogLocale}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeAttr(meta.title)}" />
    <meta name="twitter:description" content="${escapeAttr(meta.description)}" />
    <link rel="icon" type="image/svg+xml" href="${FAVICON}" />
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./${entryPath(locale.code)}"></script>
  </body>
</html>
`;
}

const registry = readJson("src/locales/registry.json");
if (registry.filter((locale) => locale.default).length !== 1) {
  throw new Error(
    "src/locales/registry.json must have exactly one default locale.",
  );
}

rmSync(ENTRIES_DIR, { recursive: true, force: true });
mkdirSync(ENTRIES_DIR, { recursive: true });

for (const locale of registry) {
  const meta = readJson(`src/locales/${locale.code}/meta.json`);
  writeFileSync(join(SRC, entryPath(locale.code)), renderEntry(locale));
  writeFileSync(
    join(SRC, htmlPath(locale)),
    renderHtml(locale, registry, meta),
  );
}

console.log(
  `Generated ${registry.length} page(s): ${registry.map(htmlPath).join(", ")}`,
);
