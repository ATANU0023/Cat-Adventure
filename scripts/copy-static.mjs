import { mkdirSync, cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

mkdirSync(dist, { recursive: true });

// Copy root index.html
cpSync(join(root, 'index.html'), join(dist, 'index.html'));

try {
  const fs = await import('node:fs/promises');
  const idxPath = join(dist, 'index.html');
  let html = await fs.readFile(idxPath, 'utf8');

  // Normalize script src paths
  html = html.replace(/src=("|')\.\/dist\/main\.js\1/, 'src="./src/main.js"');

  if (!existsSync(join(dist, 'main.js')) && existsSync(join(dist, 'src', 'main.js'))) {
    html = html.replace(
      /<script([^>]*?)src=("|\')\.\/main\.js\2(.*?)><\/script>/,
      '<script type="module" src="./src/main.js"></script>'
    );
  }

  // Ensure favicon link
  if (!/rel=("|')icon\1/.test(html)) {
    html = html.replace(
      /<title>Cat Adventure<\/title>/,
      '<title>Cat Adventure</title>\n  <link rel="icon" type="image/svg+xml" href="./favicon.svg" />'
    );
  }

  await fs.writeFile(idxPath, html);
} catch (e) {
  console.warn('Index rewrite skipped:', e.message);
}

// Copy assets
if (existsSync(join(root, 'assets'))) {
  cpSync(join(root, 'assets'), join(dist, 'assets'), { recursive: true });
}

// Favicon duplicate
try {
  const faviconSrc = join(root, 'assets', 'favicon.svg');
  if (existsSync(faviconSrc)) {
    cpSync(faviconSrc, join(dist, 'favicon.svg'));
    cpSync(faviconSrc, join(dist, 'favicon.ico'));
  }
} catch (e) {
  console.warn('Favicon copy skipped:', e.message);
}

console.log('Static assets copied to dist');
