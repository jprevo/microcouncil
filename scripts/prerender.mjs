/**
 * Fills the built pages with the markup they describe, so the site says what it
 * is to a reader that never runs JavaScript:
 *
 *   npm run prerender
 *
 * `npm run build` runs this on its own, as its `postbuild` step. It rewrites the
 * files in `dist/` in place — the app is unchanged, and `npm run dev` serves the
 * same empty mount point it always has.
 *
 * ------------------------------------------------------------------ the why
 *
 * A page of this app ships as `<div id="root"></div>` and becomes a document
 * once React has run. Googlebot renders JavaScript and eventually sees it; the
 * crawlers reading on behalf of an assistant — GPTBot, ClaudeBot, PerplexityBot
 * and the rest — do not. They fetch the HTML, read the text they find in it, and
 * move on within seconds. Everything this site actually says (the lede, the
 * companions with their jobs, descriptions and traits, the settings) reached
 * them as an empty div.
 *
 * So the markup is written into the file at build time. Nothing is fetched and
 * nothing is asynchronous here: the whole document is a pure function of a
 * language's bundle, which is what makes a static pre-render the right shape.
 *
 * --------------------------------------------------------- and not hydration
 *
 * The pages are pre-rendered for crawlers, not resumed by the browser: the entry
 * points still call `createRoot`, which discards this markup and renders the app
 * from scratch. `hydrateRoot` would be the faster option, and it is deliberately
 * not taken.
 *
 * The reason is `loadState()` in `src/state/AppStateProvider.tsx`, read during
 * the first render. Here it finds no `localStorage` and returns the defaults;
 * in the browser it returns the visitor's name, their council and their custom
 * cards. Hydrating one onto the other is exactly the mismatch React warns about,
 * and papering over it would mean moving stored state into an effect — a second
 * render and a flash of the empty app for everyone who comes back — to buy a
 * paint that this page, entirely interactive, spends on nothing else.
 *
 * The trade is therefore explicit: the crawler gets the document, the visitor
 * gets the app they already had. If the first paint ever becomes worth
 * optimising, `hydrateRoot` plus a deferred restore is the upgrade path, and
 * this file needs no change for it.
 *
 * ------------------------------------------------------------ how it renders
 *
 * A Vite dev server is started as a module loader and nothing else: middleware
 * mode binds no port, and `ssrLoadModule` compiles the app's TSX, its JSON
 * catalogs and its `?raw` markdown with this project's own config. The
 * pre-render runs the very modules the browser will, so there is no second build
 * to configure and no second set of resolution rules to keep in step.
 *
 * This works because nothing in the tree touches the DOM while rendering:
 * `src/lib/json.ts` and `src/storage.ts` reach for storage through
 * `globalThis.localStorage?.`, the theme is applied in an effect, and `<dialog>`
 * renders server-side like any other element. Code added here that reads
 * `document` or `window` during a render would break this script rather than
 * fail quietly — which is the point.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { prerenderToNodeStream } from "react-dom/static";
import { createServer } from "vite";
import { htmlPath, readRegistry } from "./pages.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

/**
 * The mount point `scripts/build-pages.mjs` writes and Vite copies through
 * untouched. Matched as a whole rather than by a regular expression: it is one
 * exact string, it appears once, and a build that stops producing it should
 * stop this script rather than silently pre-render nothing.
 */
const MOUNT = '<div id="root"></div>';

/**
 * `react-dom/static` rather than `renderToString`: it settles the whole tree
 * before resolving, so a component that ever suspends is waited for instead of
 * coming out as a hole in the HTML.
 *
 * Errors are collected and rethrown once the stream is drained. React reports
 * them through `onError` and carries on; a page half-rendered around a thrown
 * component is worse than a failed build, since it would be published looking
 * complete.
 */
async function render(App, bundle) {
  const failures = [];
  const { prelude } = await prerenderToNodeStream(
    createElement(App, { bundle }),
    { onError: (error) => failures.push(error) },
  );

  const chunks = [];
  for await (const chunk of prelude) chunks.push(chunk);
  if (failures.length > 0) throw failures[0];

  return Buffer.concat(chunks).toString("utf8");
}

if (!existsSync(DIST))
  throw new Error("No dist/ to pre-render — run `npm run build` first.");

const registry = readRegistry();

const server = await createServer({
  configFile: join(ROOT, "vite.config.ts"),
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "warn",
});

try {
  const { App } = await server.ssrLoadModule("/App.tsx");

  for (const locale of registry) {
    const name = htmlPath(locale);
    const file = join(DIST, name);
    const page = readFileSync(file, "utf8");

    if (!page.includes(MOUNT))
      throw new Error(`${name} has no empty ${MOUNT} left to fill.`);

    const { bundle } = await server.ssrLoadModule(
      `/locales/${locale.code}/index.ts`,
    );
    const markup = await render(App, bundle);

    writeFileSync(file, page.replace(MOUNT, `<div id="root">${markup}</div>`));

    const size = (Buffer.byteLength(markup) / 1024).toFixed(1);
    console.log(`Pre-rendered ${name} (${size} kB of markup).`);
  }
} finally {
  await server.close();
}
