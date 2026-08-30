import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  root: 'src',
  base: './',
  // react() transforme le JSX ; viteSingleFile() inline le bundle produit — dans cet ordre.
  plugins: [react(), viteSingleFile()],
  server: {
    // Le gabarit du prompt et les instructions d'exemple vivent dans docs/data.
    fs: { allow: ['..'] },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2022',
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    reportCompressedSize: false,
  },
});
