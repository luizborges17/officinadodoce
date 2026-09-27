import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
const root = process.argv[2];
if (!root) throw new Error('Informe a pasta das imagens originais.');
await mkdir('public/images', { recursive: true });
const originals = {
  'celebracao': 'exec-6787b094-c15b-4da6-9eb7-b325b23c2703.png',
  'bem-casados': 'exec-8c654694-68ae-4440-b1f1-086014662346.png',
  'bem-vividos': 'exec-b01cd3cf-4095-43ba-941e-900126fe0781.png',
  'bolo': 'exec-544cd678-a0c2-4f05-b08d-768e0df5e5b4.png'
};
for (const [name, file] of Object.entries(originals)) {
  await sharp(`${root}/${file}`).resize({ width: name === 'celebracao' ? 1400 : 900, withoutEnlargement: true }).webp({ quality: 84 }).toFile(`public/images/${name}.webp`);
}
await sharp(`${root}/${originals.celebracao}`).extract({ left: 110, top: 200, width: 860, height: 820 }).resize(800).webp({ quality: 85 }).toFile('public/images/doces-finos.webp');
