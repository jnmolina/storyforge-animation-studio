// Color + image utilities: palette extraction from user references and
// derivation of Warm / Cold / Dark / Light mood variations from those palettes.

export const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
export const rgbToHex = (r, g, b) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}
export function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
export const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });
}

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

// Downscale so references stay light enough for localStorage + exports.
export async function downscaleToDataUrl(src, max = 960, quality = 0.84) {
  const img = await loadImage(src);
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d').drawImage(img, 0, 0, w, h);
  return { dataUrl: c.toDataURL('image/jpeg', quality), width: w, height: h };
}

function kmeans(pixels, k = 5, iters = 10) {
  if (pixels.length === 0) return [];
  // deterministic spread init
  let centers = Array.from({ length: k }, (_, i) => pixels[Math.floor((i + 0.5) * (pixels.length / k))].slice());
  let assign = new Array(pixels.length).fill(0);
  for (let it = 0; it < iters; it++) {
    for (let p = 0; p < pixels.length; p++) {
      let best = 0, bd = Infinity;
      for (let c = 0; c < centers.length; c++) {
        const dr = pixels[p][0] - centers[c][0], dg = pixels[p][1] - centers[c][1], db = pixels[p][2] - centers[c][2];
        const d = dr * dr + dg * dg + db * db;
        if (d < bd) { bd = d; best = c; }
      }
      assign[p] = best;
    }
    const sums = centers.map(() => [0, 0, 0, 0]);
    pixels.forEach((px, i) => {
      const s = sums[assign[i]];
      s[0] += px[0]; s[1] += px[1]; s[2] += px[2]; s[3]++;
    });
    centers = sums.map((s, i) => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : centers[i]));
  }
  const counts = centers.map(() => 0);
  assign.forEach((a) => counts[a]++);
  return centers.map((c, i) => ({ hex: rgbToHex(...c), weight: counts[i] / pixels.length }));
}

export async function samplePixels(src, size = 56) {
  const img = await loadImage(src);
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, size, size);
  const d = ctx.getImageData(0, 0, size, size).data;
  const out = [];
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128) out.push([d[i], d[i + 1], d[i + 2]]);
  return out;
}

const sortLightToDark = (hexes) => [...hexes].sort((a, b) => luminance(b) - luminance(a));

export async function extractPalette(src, count = 5) {
  const pixels = await samplePixels(src);
  return sortLightToDark(kmeans(pixels, count).map((c) => c.hex));
}

export function combinePalettes(palettes, count = 5) {
  const pixels = palettes.flat().map(hexToRgb);
  if (pixels.length <= count) return sortLightToDark(palettes.flat());
  return sortLightToDark(kmeans(pixels, count, 12).map((c) => c.hex));
}

// Classify a palette so references can be auto-tagged warm / cold / dark / light.
export function analyzePalette(palette) {
  const rgbs = palette.map(hexToRgb);
  const avgL = palette.reduce((a, h) => a + luminance(h), 0) / palette.length;
  const warmth = rgbs.reduce((a, [r, , b]) => a + (r - b), 0) / rgbs.length / 255;
  const tags = [];
  tags.push(warmth > 0.05 ? 'warm' : warmth < -0.03 ? 'cold' : 'neutral');
  tags.push(avgL < 0.33 ? 'dark' : avgL > 0.62 ? 'light' : 'mid');
  return { avgL, warmth, tags };
}

const shiftPalette = (palette, fn) =>
  palette.map((hex) => {
    const [h, s, l] = rgbToHsl(...hexToRgb(hex));
    const [nh, ns, nl] = fn(h, s, l);
    return rgbToHex(...hslToRgb(nh, Math.max(0, Math.min(1, ns)), Math.max(0, Math.min(1, nl))));
  });

const toward = (h, target, amt) => {
  let d = ((target - h + 540) % 360) - 180;
  return h + d * amt;
};

const toBlender = (hex, boost = 1) => {
  const [r, g, b] = hexToRgb(hex);
  const m = Math.max(r, g, b, 1);
  return [r / m, g / m, b / m].map((v) => Number(Math.min(1, v * boost).toFixed(3)));
};

export function buildMoodFromPalette({ id, name, subtitle, palette, grade = 'base', notes }) {
  const sorted = sortLightToDark(palette);
  const avgL = sorted.reduce((a, h) => a + luminance(h), 0) / sorted.length;
  const filters = {
    base: 'none',
    warm: 'sepia(0.18) saturate(1.2)',
    cold: 'saturate(1.1) hue-rotate(8deg) contrast(1.06)',
    dark: 'contrast(1.25) brightness(0.82)',
    light: 'brightness(1.1) contrast(0.94)'
  };
  const darkest = hexToRgb(sorted[4] || sorted[sorted.length - 1]).map((v) => Number(((v / 255) * 0.6).toFixed(3)));
  return {
    id,
    name,
    subtitle,
    custom: true,
    grade,
    palette: sorted,
    bgGradient: `linear-gradient(135deg, ${sorted[4]} 0%, ${sorted[2]} 55%, ${sorted[1]} 100%)`,
    svgFilter: filters[grade] || 'none',
    lightingNotes:
      notes ||
      `Derived from your references. Key light tinted ${sorted[1]}, fill tinted ${sorted[2]}, world/background ${sorted[4]}.`,
    blenderKeyColor: toBlender(sorted[1]),
    blenderFillColor: toBlender(sorted[2], 0.9),
    blenderBgColor: darkest,
    keyEnergy: Number((3.5 + avgL * 3).toFixed(1)),
    fillEnergy: Number((grade === 'dark' ? 0.4 : 0.8 + avgL * 2.5).toFixed(1))
  };
}

// From one base palette (extracted from user refs) produce 5 moods.
export function deriveMoodSet(basePalette) {
  const warm = shiftPalette(basePalette, (h, s, l) => [toward(h, 32, 0.45), s * 1.15 + 0.05, l]);
  const cold = shiftPalette(basePalette, (h, s, l) => [toward(h, 205, 0.5), s * 1.05 + 0.04, l * 0.95]);
  const dark = shiftPalette(basePalette, (h, s, l) => [h, s * 0.8, l * 0.45]);
  const light = shiftPalette(basePalette, (h, s, l) => [h, s * 0.75, l + (1 - l) * 0.55]);
  return {
    ref: buildMoodFromPalette({ id: 'ref', name: 'Your References', subtitle: 'Exact palette pulled from your images', palette: basePalette, grade: 'base' }),
    ref_warm: buildMoodFromPalette({ id: 'ref_warm', name: 'Refs · Warm', subtitle: 'Your palette pushed toward amber/gold', palette: warm, grade: 'warm' }),
    ref_cold: buildMoodFromPalette({ id: 'ref_cold', name: 'Refs · Cold', subtitle: 'Your palette pushed toward steel/cyan', palette: cold, grade: 'cold' }),
    ref_dark: buildMoodFromPalette({ id: 'ref_dark', name: 'Refs · Dark', subtitle: 'Your palette crushed into low-key noir', palette: dark, grade: 'dark' }),
    ref_light: buildMoodFromPalette({ id: 'ref_light', name: 'Refs · Light', subtitle: 'Your palette lifted to airy high-key', palette: light, grade: 'light' })
  };
}

// CSS grades applied to the user's own photos in the mood board collage.
export const PHOTO_GRADES = {
  base: { label: 'Original', filter: 'none', tint: null },
  warm: { label: 'Warm', filter: 'sepia(0.35) saturate(1.35) hue-rotate(-12deg) brightness(1.04)', tint: '#F59E0B' },
  cold: { label: 'Cold', filter: 'saturate(0.85) hue-rotate(12deg) brightness(0.96) contrast(1.08)', tint: '#0EA5E9' },
  dark: { label: 'Dark', filter: 'brightness(0.55) contrast(1.45) saturate(0.7)', tint: '#1E1B4B' },
  light: { label: 'Light', filter: 'brightness(1.22) contrast(0.82) saturate(0.85)', tint: '#FCE7F3' }
};
