import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "src",
  // Relative paths: dist/ is served from a domain root and from a sub-path alike.
  base: "./",
  plugins: [react()],
  server: {
    // The prompt template and the example instructions live in docs/data.
    fs: { allow: [".."] },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    target: "es2022",
  },
});
