import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  root: 'src',
  base: './',
  plugins: [viteSingleFile()],
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
