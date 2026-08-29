// Renomme dist/index.html en un fichier autonome, facile à partager.
import { readdir, rename, stat, unlink } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const source = join(dist, 'index.html');
const target = join(dist, 'microcouncil.html');

// Le plugin single-file inline tout : les éventuels restes d'assets sont inutiles.
for (const entry of await readdir(dist, { withFileTypes: true })) {
  if (entry.isFile() && entry.name !== 'index.html') {
    await unlink(join(dist, entry.name));
  }
}

await rename(source, target);
const { size } = await stat(target);
console.log(`\n  ✅  dist/microcouncil.html  (${(size / 1024).toFixed(1)} Ko) — fichier unique, prêt à partager.\n`);
