import { mkdirSync, cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

mkdirSync(dist, { recursive: true });

// Copy root index.html and assets folder
cpSync(join(root, 'index.html'), join(dist, 'index.html'));
// Rewrite script path inside dist/index.html (original references ./dist/main.js)
try {
  const fs = await import('node:fs/promises');
  const idxPath = join(dist, 'index.html');
  let html = await fs.readFile(idxPath, 'utf8');
  html = html.replace(/src=("|')\.\/dist\/main\.js\1/, 'src="./main.js"');
  await fs.writeFile(idxPath, html);
} catch (e) {
  console.warn('Could not rewrite script path in index.html:', e.message);
}
if (existsSync(join(root, 'assets'))) {
  cpSync(join(root, 'assets'), join(dist, 'assets'), { recursive: true });
}

// Also copy any static files directly under src (like index.html there if needed)
if (existsSync(join(root, 'src', 'index.html'))) {
  // If there's an index inside src, prefer it (apply same rewrite)
  cpSync(join(root, 'src', 'index.html'), join(dist, 'index.html'));
}

console.log('Static assets copied to dist');
