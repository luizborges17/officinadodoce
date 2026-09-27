// The reference uses red paper and blue satin under neutral light. Separating
// those two diffuse signals from reflected white light preserves the photograph's
// wrinkles, weave, shadows, highlights and partially covered edge pixels.
const LINEAR = Float32Array.from({ length: 256 }, (_, byte) => {
  const value = byte / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
});
const SRGB = Uint8ClampedArray.from({ length: 65536 }, (_, index) => {
  const value = index / 65535;
  return 255 * (value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055);
});
const encode = value => SRGB[Math.round(Math.max(0, Math.min(1, value)) * 65535)];

function ribbonGreenRatio(data) {
  // Satin in the reference contains some green in addition to blue. Estimate
  // that dye component from saturated pixels, excluding neutral highlights.
  const histogram = new Uint32Array(201);
  let samples = 0;
  for (let i = 0; i < data.length; i += 16) {
    const red = LINEAR[data[i]], green = LINEAR[data[i + 1]], blue = LINEAR[data[i + 2]];
    if (blue < 0.1 || red > blue * 0.08 || green > blue * 0.45 || green < red) continue;
    const ratio = (green - red) / (blue - red);
    histogram[Math.min(200, Math.round(ratio * 500))]++;
    samples++;
  }
  if (samples < 32) return 0.14;
  let total = 0;
  for (let i = 0; i < histogram.length; i++) {
    total += histogram[i];
    if (total >= samples / 2) return i / 500;
  }
  return 0.14;
}

export function prepareMaterialFrame({ data, width, height }) {
  if (data.length !== width * height * 4) throw new Error('Expected an RGBA reference image.');
  const original = new Uint8ClampedArray(data);
  const lighting = new Float32Array(width * height * 4);
  const active = [];
  const blueGreen = ribbonGreenRatio(data);

  for (let i = 0; i < data.length; i += 4) {
    const chroma = Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);
    // Sensor/compression tint on the neutral studio background is not a material.
    if (chroma <= 3 || data[i + 3] === 0) continue;
    const red = LINEAR[data[i]], green = LINEAR[data[i + 1]], blue = LINEAR[data[i + 2]];
    const blueSignal = Math.max(0, (blue - green) / (1 - blueGreen));
    const neutral = Math.max(0, Math.min(red, green, blue, green - blueGreen * blueSignal));
    const coverage = Math.min(1, (chroma - 3) / 7);
    lighting[i] = neutral;
    lighting[i + 1] = Math.max(0, red - neutral);
    lighting[i + 2] = Math.max(0, blue - neutral);
    lighting[i + 3] = coverage * coverage * (3 - 2 * coverage);
    active.push(i);
  }
  return { width, height, original, lighting, active: new Uint32Array(active) };
}

function reflectance(hex) {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error('Expected a six-digit color.');
  return [1, 3, 5].map(offset => {
    // Even black fabric reflects a little diffuse light; retaining that small
    // component makes its folds visible while the neutral satin sheen survives.
    return 0.008 + LINEAR[parseInt(hex.slice(offset, offset + 2), 16)] * 0.992;
  });
}

export function renderMaterialFrame(prepared, paperHex, ribbonHex) {
  const paper = reflectance(paperHex), ribbon = reflectance(ribbonHex);
  const { original, lighting, active } = prepared;
  const output = new Uint8ClampedArray(original);
  for (const i of active) {
    const neutral = lighting[i], paperLight = lighting[i + 1], ribbonLight = lighting[i + 2], coverage = lighting[i + 3];
    for (let channel = 0; channel < 3; channel++) {
      const recolored = neutral + paperLight * paper[channel] + ribbonLight * ribbon[channel];
      const source = LINEAR[original[i + channel]];
      output[i + channel] = encode(source + (recolored - source) * coverage);
    }
  }
  return output;
}
