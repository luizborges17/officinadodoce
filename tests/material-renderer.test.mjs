import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareMaterialFrame, renderMaterialFrame } from '../src/material-renderer.js';

const prepare = pixels => prepareMaterialFrame({ data: Uint8ClampedArray.from(pixels.flat()), width: pixels.length, height: 1 });
const pixel = (frame, index) => [...frame.slice(index * 4, index * 4 + 4)];
const toByte = value => Math.round(255 * (value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055));
const fromLight = values => [...values.map(toByte), 255];

test('neutral background, subtle camera tint and alpha remain byte-for-byte intact', () => {
  const input = [[210, 210, 210, 255], [193, 193, 195, 255], [31, 29, 31, 173], [200, 0, 0, 0]];
  const frame = renderMaterialFrame(prepare(input), '#00ff00', '#ff00ff');
  assert.deepEqual([...frame], input.flat());
});

test('paper and satin change independently, including their dark areas', () => {
  const prepared = prepare([[200, 0, 0, 255], [63, 0, 0, 255], [0, 100, 255, 255], [0, 20, 65, 255]]);
  const initial = renderMaterialFrame(prepared, '#efc2aa', '#183047');
  const paper = renderMaterialFrame(prepared, '#008000', '#183047');
  const ribbon = renderMaterialFrame(prepared, '#efc2aa', '#ffff00');
  for (const index of [0, 1]) {
    assert.notDeepEqual(pixel(initial, index), pixel(paper, index));
    assert.deepEqual(pixel(initial, index), pixel(ribbon, index));
  }
  for (const index of [2, 3]) {
    assert.deepEqual(pixel(initial, index), pixel(paper, index));
    assert.notDeepEqual(pixel(initial, index), pixel(ribbon, index));
  }
});

test('a dark ribbon does not retain the blue reference green channel as grey haze', () => {
  const result = renderMaterialFrame(prepare([[0, 100, 255, 255]]), '#ffffff', '#000000');
  const [red, green, blue] = pixel(result, 0);
  assert.equal(red, green);
  assert.equal(green, blue);
  assert.ok(blue < 30);
});

test('black keeps both diffuse texture and neutral satin highlights', () => {
  const prepared = prepare([fromLight([0.8, 0, 0]), fromLight([0.2, 0, 0]), fromLight([0.16, 0.16 + 0.14 * 0.6, 0.76])]);
  const result = renderMaterialFrame(prepared, '#000000', '#000000');
  assert.ok(result[0] > result[4] && result[4] > 0);
  assert.ok(result[8] > result[0] + 50);
  assert.equal(result[8], result[9]);
  assert.equal(result[9], result[10]);
});

test('white materials preserve the ordering of illuminated folds and deep shadows', () => {
  const prepared = prepare([fromLight([0.8, 0, 0]), fromLight([0.25, 0, 0]), fromLight([0.02, 0, 0])]);
  const result = renderMaterialFrame(prepared, '#ffffff', '#ffffff');
  assert.ok(result[0] > result[4] && result[4] > result[8]);
  for (const index of [0, 1, 2]) {
    const [red, green, blue] = pixel(result, index);
    assert.equal(red, green);
    assert.equal(green, blue);
  }
});

test('mixed paper/ribbon boundary pixels retain contributions from both materials', () => {
  const prepared = prepare([fromLight([0.45, 0.1 + 0.14 * 0.4, 0.5])]);
  const bothBlack = renderMaterialFrame(prepared, '#000000', '#000000');
  const whitePaper = renderMaterialFrame(prepared, '#ffffff', '#000000');
  const whiteRibbon = renderMaterialFrame(prepared, '#000000', '#ffffff');
  assert.ok(whitePaper[0] > bothBlack[0] + 50);
  assert.ok(whiteRibbon[0] > bothBlack[0] + 50);
});

test('soft object edges are recolored in linear light without losing their neutral background', () => {
  const neutral = 0.4;
  const pixels = [0, 0.25, 0.5, 0.75, 1].map(alpha => fromLight([neutral * (1 - alpha) + 0.7 * alpha, neutral * (1 - alpha), neutral * (1 - alpha)]));
  const output = renderMaterialFrame(prepare(pixels), '#00ff00', '#ffffff');
  assert.deepEqual(pixel(output, 0), pixels[0]);
  for (let i = 1; i < pixels.length; i++) {
    assert.ok(output[i * 4 + 1] >= output[(i - 1) * 4 + 1]);
    assert.ok(output[i * 4] < output[(i - 1) * 4]);
  }
});

test('repeated changes always render from the original and never mutate it', () => {
  const prepared = prepare([[200, 0, 0, 255], [0, 100, 255, 127]]);
  const original = [...prepared.original];
  const first = renderMaterialFrame(prepared, '#f5e5cb', '#b8955a');
  renderMaterialFrame(prepared, '#002244', '#aa2288');
  assert.deepEqual(renderMaterialFrame(prepared, '#f5e5cb', '#b8955a'), first);
  assert.deepEqual([...prepared.original], original);
  assert.equal(first[7], 127);
});
