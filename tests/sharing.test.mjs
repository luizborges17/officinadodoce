import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import { productImages } from '../src/product-images.js';

test('todas as fotografias da pasta fazem parte do carrossel', async () => {
  const files = await readdir(new URL('../public/images/bem-casados/', import.meta.url), { recursive: true });
  const expected = files.filter(file => /\.(jpe?g|jfif|png|webp|avif|gif)$/i.test(file)).map(file => '/images/bem-casados/' + file.replaceAll('\\', '/')).sort();
  assert.deepEqual(productImages['bem-casados'].map(decodeURIComponent).sort(), expected);
});

test('download PNG e compartilhamento usam a combinação atual; cancelamento e falha mantêm fallback', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => false });
    });
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5173');
    const download = page.getByRole('button', { name: 'Baixar print da combinação' });
    await page.waitForFunction(() => !document.querySelector('.customizer-download').disabled);
    assert.equal(await page.getByRole('button', { name: 'Compartilhar imagem e mensagem' }).isVisible(), false);
    await page.locator('#color-paper').fill('#de3163');
    await page.locator('#color-ribbon').fill('#203864');
    await page.waitForFunction(() => !document.querySelector('.customizer-download').disabled);
    const pending = page.waitForEvent('download');
    await download.click();
    const file = await pending;
    assert.equal(file.suggestedFilename(), 'bem-casado-de3163-203864.png');
    const path = await file.path();
    const metadata = await sharp(path).metadata();
    assert.equal(metadata.format, 'png');
    assert.equal(metadata.width, 1000);
    assert.equal(metadata.height, 1210);
    const previewPixel = await page.locator('#personalizar canvas').evaluate(canvas => [...canvas.getContext('2d').getImageData(414, 585, 1, 1).data].slice(0, 3));
    const exportedPixel = await sharp(path).extract({ left: 464, top: 680, width: 1, height: 1 }).removeAlpha().raw().toBuffer();
    assert.deepEqual([...exportedPixel], previewPixel);
    await file.saveAs('test-results/print-combinacao.png');
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'canShare', { configurable: true, value: ({ files }) => files?.[0]?.type === 'image/png' });
      Object.defineProperty(navigator, 'share', { configurable: true, value: async data => {
        if (window.shareError) throw new DOMException('Teste', window.shareError);
        window.shared = { text: data.text, title: data.title, name: data.files[0].name, type: data.files[0].type, size: data.files[0].size };
      } });
    });
    await page.locator('#color-paper').fill('#4169e1');
    await page.waitForFunction(() => !document.querySelector('.customizer-download').disabled);
    const share = page.getByRole('button', { name: 'Compartilhar imagem e mensagem' });
    await share.click();
    const payload = await page.evaluate(() => window.shared);
    assert.equal(payload.name, 'bem-casado-4169e1-203864.png');
    assert.equal(payload.type, 'image/png');
    assert.ok(payload.size > 10000);
    assert.match(payload.text, /Papel: Azul Royal \(#4169E1\)/);
    assert.match(payload.text, /Fita: Azul marinho \(#203864\)/);
    await page.evaluate(() => { window.shareError = 'AbortError'; });
    await share.click();
    assert.match(await page.locator('.customizer-share-status').innerText(), /cancelado/);
    assert.equal(await download.isEnabled(), true);
    await page.evaluate(() => { window.shareError = 'NotAllowedError'; });
    await share.click();
    assert.match(await page.locator('.customizer-share-status').innerText(), /Baixe o print/);
    assert.equal(await download.isEnabled(), true);
  } finally { await browser.close(); }
});
