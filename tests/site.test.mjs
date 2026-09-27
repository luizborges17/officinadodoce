import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { site, whatsappUrl, instagramUrl } from '../src/config.js';
test('contatos ausentes ou inválidos não criam links fictícios', () => {
  assert.equal(whatsappUrl(''), '');
  assert.equal(whatsappUrl('123'), '');
  assert.equal(instagramUrl('javascript:alert(1)'), '');
  assert.equal(instagramUrl('https://example.com/perfil'), '');
  assert.equal(new URL(whatsappUrl('5511999999999')).searchParams.get('text'), site.message);
});
test('navegação, contatos, teclado e layouts responsivos', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5173');
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('h1').count(), 1);
    assert.deepEqual(await page.locator('.desktop-nav a').allTextContents(), ['Início', 'Bem-casados', 'Personalize', 'Sobre', 'Contato']);
    assert.equal(await page.locator('.header .brand-image').count(), 1);
    assert.equal(await page.locator('.header .brand-text').textContent(), 'Officina do Doce');
    assert.equal(await page.locator('.product').count(), 1);
    assert.equal(await page.locator('#celebracoes, .occasion-strip').count(), 0);
    assert.doesNotMatch(await page.locator('main').innerText(), /doces finos|bem-vividos|bolos|festas de 15 anos/i);
    assert.deepEqual(site.products.map(product => product.id), ['bem-casados']);
    assert.match(await page.locator('#contato a[href*="wa.me"]').getAttribute('href'), /^https:\/\/wa.me\/5516991547539\?/);
    assert.equal(await page.locator('#contato a[href*="instagram.com"]').getAttribute('href'), 'https://www.instagram.com/officina.do.doce/');
    for (const product of site.products) {
      const card = page.locator('[data-carousel="' + product.id + '"]');
      const img = card.locator('img');
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(el => el.decode());
      const originalHeight = await card.evaluate(el => el.getBoundingClientRect().height);
      for (let i = 1; i <= product.images.length; i++) {
        await card.locator('[data-step="1"]').click();
        await img.evaluate(el => el.decode());
        assert.equal(await img.getAttribute('src'), product.images[i % product.images.length]);
        assert.equal(await card.evaluate(el => el.getBoundingClientRect().height), originalHeight);
      }
      await card.press('ArrowLeft');
      assert.equal(await img.getAttribute('src'), product.images.at(-1));
      await card.locator('[data-step="1"]').click();
      assert.equal(await img.getAttribute('src'), product.images[0]);
    }
    assert.equal(await page.locator('#galeria').count(), 0);
    assert.equal(await page.locator('.lightbox').count(), 0);
    const customizer = page.locator('#personalizar');
    await customizer.scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Cor do papel: Rosé', exact: true }).waitFor();
    await page.waitForFunction(() => !document.querySelector('#personalizar fieldset').disabled);
    const pixels = () => customizer.locator('canvas').evaluate(canvas => {
      const ctx = canvas.getContext('2d');
      const sample = (x, y) => [...ctx.getImageData(Math.round(canvas.width * x), Math.round(canvas.height * y), 1, 1).data];
      return { paper: sample(.46, .65), ribbon: sample(.65, .60), background: sample(.04, .04) };
    });
    const waitForRender = () => page.waitForFunction(() => {
      const canvas = document.querySelector('#personalizar canvas');
      return canvas.dataset.paper === document.querySelector('#color-paper').value && canvas.dataset.ribbon === document.querySelector('#color-ribbon').value;
    });
    await waitForRender();
    const original = await pixels();
    await page.getByRole('button', { name: 'Cor do papel: Rosé', exact: true }).click();
    await waitForRender();
    const pinkPaper = await pixels();
    assert.notDeepEqual(pinkPaper.paper, original.paper);
    assert.deepEqual(pinkPaper.ribbon, original.ribbon);
    assert.deepEqual(pinkPaper.background, original.background);
    await page.getByRole('button', { name: 'Cor da fita: Verde pistache', exact: true }).click();
    await waitForRender();
    const greenRibbon = await pixels();
    assert.notDeepEqual(greenRibbon.ribbon, original.ribbon);
    assert.deepEqual(greenRibbon.paper, pinkPaper.paper);
    assert.deepEqual(greenRibbon.background, original.background);
    const combinationUrl = new URL(await customizer.locator('.customizer-send').getAttribute('href'));
    assert.match(combinationUrl.searchParams.get('text'), /Papel: Rosé \(#DCA5AD\)/);
    assert.match(combinationUrl.searchParams.get('text'), /Fita: Verde pistache \(#B3C583\)/);
    await customizer.screenshot({ path: 'test-results/personalizacao.png' });
    for (const [paper, ribbon, variant] of [['#f5efdf', '#792f43', 'claro'], ['#493024', '#e6cda0', 'chocolate'], ['#000000', '#ffffff', 'contraste']]) {
      await page.locator('#color-paper').fill(paper);
      await page.locator('#color-ribbon').fill(ribbon);
      await waitForRender();
      assert.deepEqual((await pixels()).background, original.background);
      await customizer.screenshot({ path: `test-results/personalizacao-${variant}.png` });
    }
    await page.locator('#color-ribbon').fill('#123456');
    assert.match(await customizer.locator('[data-value="ribbon"]').textContent(), /#123456/);
    await page.getByRole('button', { name: 'Restaurar cores iniciais' }).click();
    await waitForRender();
    assert.deepEqual(await pixels(), original);
    assert.equal(await page.locator('#color-paper').inputValue(), site.customizer.paper);
    assert.equal(await page.locator('#color-ribbon').inputValue(), site.customizer.ribbon);
    const quoteLinks = page.locator('a').filter({ hasText: 'Solicitar' });
    assert.equal(await quoteLinks.count(), 3);
    for (const link of await quoteLinks.all()) {
      const url = new URL(await link.getAttribute('href'));
      assert.equal(url.origin + url.pathname, 'https://wa.me/5516991547539');
      assert.equal(url.searchParams.get('text'), site.message);
      assert.equal(await link.getAttribute('target'), '_blank');
    }
    if (!site.whatsapp) assert.equal(await page.locator('a[href*="wa.me"]').count(), 0);
    if (!site.instagram) assert.equal(await page.locator('a[href*="instagram.com"]').count(), 0);
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Sem overflow em ${width}px`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await customizer.scrollIntoViewIfNeeded();
    await customizer.screenshot({ path: 'test-results/personalizacao-mobile.png' });
    await page.goto('http://127.0.0.1:5173');
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    assert.equal(await page.locator('#mobile-nav').isVisible(), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#mobile-nav').isVisible(), false);
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.locator('#mobile-nav').getByRole('link', { name: 'Bem-casados', exact: true }).click();
    assert.equal(await page.locator('#mobile-nav').isVisible(), false);
    assert.equal(new URL(page.url()).hash, '#bem-casados');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    for (const img of await page.locator('main img').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(el => el.decode());
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
    assert.deepEqual(await page.locator('img').evaluateAll(images => images.filter(img => img.offsetParent !== null && (!img.complete || img.naturalWidth === 0)).map(img => img.src)), []);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});
