import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "src",
  // Chemins relatifs : dist/ se sert depuis la racine d'un domaine comme depuis un sous-chemin.
  base: "./",
  plugins: [react()],
  server: {
    // Le gabarit du prompt et les instructions d'exemple vivent dans docs/data.
    fs: { allow: [".."] },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    target: "es2022",
  },
});
