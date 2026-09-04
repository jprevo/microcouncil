import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * One Rollup input per language, so the production build emits every page in
 * `src/locales/registry.json` (`npm run pages` writes the HTML files this reads,
 * as a `predev`/`prebuild` step — see `scripts/build-pages.mjs`).
 */
const registry = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./src/locales/registry.json", import.meta.url)),
    "utf8",
  ),
);

const input = Object.fromEntries(
  registry.map((locale) => [
    locale.code,
    fileURLToPath(
      new URL(
        `./src/${locale.default ? "index" : locale.code}.html`,
        import.meta.url,
      ),
    ),
  ]),
);

export default defineConfig({
  root: "src",
  // Relative paths: dist/ is served from a domain root and from a sub-path alike.
  base: "./",
  plugins: [react()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    target: "es2022",
    rollupOptions: { input },
  },
});
