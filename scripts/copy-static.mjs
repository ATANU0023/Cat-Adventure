import { mkdirSync, cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

mkdirSync(dist, { recursive: true });

// Copy root index.html and assets folder
// Always start from root index.html (canonical home page)
cpSync(join(root, 'index.html'), join(dist, 'index.html'));

// Rewrite script path inside dist/index.html (normalize any ./dist/main.js -> ./main.js)
try {
  const fs = await import('node:fs/promises');
  const idxPath = join(dist, 'index.html');
  let html = await fs.readFile(idxPath, 'utf8');
  html = html.replace(/src=("|')\.\/dist\/main\.js\1/, 'src="./src/main.js"');
  // If main.js (no src/ prefix) is referenced but only dist/src/main.js exists, rewrite:
  if (!existsSync(join(dist, 'main.js')) && existsSync(join(dist,'src','main.js'))) {
    html = html.replace(/<script([^>]*?)src=("|\')\.\/main\.js\2(.*?)><\/script>/,
      '<script type="module" src="./src/main.js"></script>');
  }
  // Ensure favicon link exists & not lost (add if missing)
  if(!/rel=("|')icon\1/.test(html)) {
    html = html.replace('<title>Cat Adventure</title>', '<title>Cat Adventure</title>\n  <link rel="icon" type="image/svg+xml" href="./favicon.svg" />');
  }
  await fs.writeFile(idxPath, html);
} catch (e) {
  console.warn('Could not rewrite script path in index.html:', e.message);
}
if (existsSync(join(root, 'assets'))) {
  cpSync(join(root, 'assets'), join(dist, 'assets'), { recursive: true });
}

// If there is NO root index.html but there is one in src, copy it instead
// We no longer promote src/index.html; root version is authoritative.

// Favicon convenience: copy favicon.svg (and duplicate as favicon.ico) to dist root so /favicon.ico works
try {
  const faviconSrc = join(root, 'assets', 'favicon.svg');
  if (existsSync(faviconSrc)) {
    cpSync(faviconSrc, join(dist, 'favicon.svg'));
    // Duplicate as .ico (some browsers still auto-request /favicon.ico)
    cpSync(faviconSrc, join(dist, 'favicon.ico'));
  }
} catch (e) {
  console.warn('Favicon copy skipped:', e.message);
}

console.log('Static assets copied to dist');

<script>
if(!('noModule' in HTMLScriptElement.prototype)){/*modern only*/}
</script>
