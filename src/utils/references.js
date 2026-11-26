import { downscaleToDataUrl, fileToDataUrl, extractPalette, analyzePalette, combinePalettes, deriveMoodSet } from './color';

const uid = () => `ref-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

async function finalizeImage(src, meta) {
  const { dataUrl, width, height } = await downscaleToDataUrl(src);
  let palette = null;
  let tags = [];
  try {
    palette = await extractPalette(dataUrl);
    tags = analyzePalette(palette).tags;
  } catch {
    /* palette optional */
  }
  return {
    id: uid(),
    kind: 'image',
    src: dataUrl,
    width,
    height,
    palette,
    tags,
    use: 'both',
    focus: { x: 50, y: 45 },
    note: '',
    addedAt: new Date().toISOString(),
    ...meta
  };
}

export async function ingestFile(file) {
  const raw = await fileToDataUrl(file);
  return finalizeImage(raw, { title: file.name.replace(/\.[^.]+$/, '').slice(0, 60), sourceUrl: null, origin: 'upload' });
}

export async function ingestUrl(url) {
  try {
    const res = await fetch(`/api/ref/resolve?url=${encodeURIComponent(url)}`);
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) {
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Could not resolve link');
      if (data.kind === 'image') {
        return finalizeImage(data.dataUrl, { title: data.title, sourceUrl: data.sourceUrl, origin: 'link' });
      }
      return {
        id: uid(),
        kind: 'link',
        src: null,
        title: data.title,
        sourceUrl: data.sourceUrl,
        palette: null,
        tags: ['link'],
        use: 'both',
        note: '',
        origin: 'link',
        addedAt: new Date().toISOString()
      };
    }
  } catch {
    // Fallback for static webapp hosting (GitHub Pages): load image directly via CORS in browser
  }
  try {
    const cleanTitle = decodeURIComponent(url.split('/').pop().split('?')[0] || 'Linked image').slice(0, 60);
    return await finalizeImage(url, { title: cleanTitle, sourceUrl: url, origin: 'link' });
  } catch {
    return {
      id: uid(),
      kind: 'link',
      src: null,
      title: new URL(url).hostname,
      sourceUrl: url,
      palette: null,
      tags: ['link'],
      use: 'both',
      note: '',
      origin: 'link',
      addedAt: new Date().toISOString()
    };
  }
}

export const extractUrls = (text) => (String(text).match(/https?:\/\/[^\s"'<>]+/gi) || []).map((u) => u.replace(/[),.;]+$/, ''));

const words = (s) =>
  new Set(
    String(s || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3)
  );

// Assign storyboard-eligible references to shots by keyword overlap, then round-robin.
export function autoMatchShots(project, { onlyEmpty = false } = {}) {
  const refs = (project.references || []).filter((r) => r.src && r.use !== 'mood');
  if (!refs.length) return { shots: project.shots, matched: 0 };
  const used = new Map();
  let rr = 0;
  let matched = 0;
  const shots = project.shots.map((s) => {
    if (onlyEmpty && s.refId) return s;
    const sw = words(`${s.title} ${s.action} ${s.notes}`);
    let best = null;
    let bestScore = 0;
    refs.forEach((r) => {
      const rw = words(`${r.title} ${r.note} ${(r.tags || []).join(' ')}`);
      let score = 0;
      rw.forEach((w) => sw.has(w) && score++);
      score -= (used.get(r.id) || 0) * 0.5;
      if (score > bestScore) {
        bestScore = score;
        best = r;
      }
    });
    if (!best) best = refs[rr++ % refs.length];
    used.set(best.id, (used.get(best.id) || 0) + 1);
    matched++;
    return { ...s, refId: best.id, refMode: s.refMode && s.refMode !== 'procedural' ? s.refMode : 'photo' };
  });
  return { shots, matched };
}

export function moodsFromReferences(project) {
  const pals = (project.references || []).filter((r) => r.palette && r.use !== 'storyboard').map((r) => r.palette);
  if (!pals.length) return null;
  return deriveMoodSet(combinePalettes(pals, 5));
}
