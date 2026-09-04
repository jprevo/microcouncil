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
 */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const ENTRIES_DIR = join(SRC, "entries");

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='88'%3E%F0%9F%92%AC%3C/text%3E%3C/svg%3E";

function readJson(path) {
  return JSON.parse(readFileSync(join(ROOT, path), "utf8"));
}

function escapeAttr(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

function htmlPath(locale) {
  return locale.default ? "index.html" : `${locale.code}.html`;
}

function entryPath(code) {
  return `entries/${code}.tsx`;
}

function renderEntry(locale) {
  return `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "../App";
import { bundle } from "../locales/${locale.code}";

const container = document.getElementById("root");
if (container === null) throw new Error("Mount point #root not found.");

createRoot(container).render(
  <StrictMode>
    <App bundle={bundle} />
  </StrictMode>,
);
`;
}

function renderHtml(locale, registry, meta) {
  const hreflangs = registry
    .map(
      (other) =>
        `    <link rel="alternate" hreflang="${other.code}" href="./${htmlPath(other)}" />`,
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
    <link rel="canonical" href="./${htmlPath(locale)}" />
${hreflangs}
    <link rel="alternate" hreflang="x-default" href="./${htmlPath(defaultLocale)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeAttr(meta.title)}" />
    <meta property="og:description" content="${escapeAttr(meta.description)}" />
    <meta property="og:locale" content="${meta.ogLocale}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeAttr(meta.title)}" />
    <meta name="twitter:description" content="${escapeAttr(meta.description)}" />
    <link rel="icon" href="${FAVICON}" />
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
