import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const imageDirectory = fileURLToPath(new URL('../public/images/bem-casados/', import.meta.url));
const manifest = fileURLToPath(new URL('../src/product-images.js', import.meta.url));
export function syncProductImages() {
  const images = [];
  function scan(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) scan(path);
      else if (/\.(jpe?g|jfif|png|webp|avif|gif)$/i.test(entry.name)) {
        images.push('/images/bem-casados/' + relative(imageDirectory, path).split(sep).map(encodeURIComponent).join('/'));
      }
    }
  }
  scan(imageDirectory);
  images.sort((a, b) => decodeURIComponent(a).localeCompare(decodeURIComponent(b), 'pt-BR', { numeric: true }));
  const source = '// Gerado automaticamente a partir de public/images/bem-casados/. Não editar manualmente.\nexport const productImages = ' + JSON.stringify({ 'bem-casados': images }, null, 2) + ';\n';
  if (readFileSync(manifest, 'utf8') !== source) writeFileSync(manifest, source);
  return images;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) syncProductImages();
