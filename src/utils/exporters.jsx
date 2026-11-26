import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import JSZip from 'jszip';
import { StoryboardSvg } from '../components/StoryboardCanvas';
import { resolveMood, MOOD_VARIATIONS, ROYALTY_FREE_TRACKS } from '../data/storyEngine';
import { generateBlenderPrevizScript } from './blenderGenerator';
import { loadImage, hexToRgb } from './color';
import { PHOTO_GRADES } from './color';
import { renderSynthTrack, renderAudioFileCut, audioBufferToWav } from './audioSynth';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
export const slug = (s = 'storyforge') =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 48) || 'storyforge';
const pad = (n, w = 2) => String(n).padStart(w, '0');
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const csvCell = (v) => {
  const s = Array.isArray(v) ? v.join(' ') : v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (rows) => rows.map((r) => r.map(csvCell).join(',')).join('\n');
const tc = (frames, fps) => {
  const f = Math.max(0, Math.round(frames));
  const s = Math.floor(f / fps);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % fps)}`;
};
const srtTime = (sec) => {
  const ms = Math.round(sec * 1000);
  return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)},${pad(ms % 1000, 3)}`;
};
const dataUrlParts = (dataUrl) => {
  const [meta, b64] = dataUrl.split(',');
  const mime = meta.slice(5).split(';')[0];
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : mime.includes('gif') ? 'gif' : 'jpg';
  return { mime, b64, ext };
};

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const shotTimeline = (shots, fps) => {
  let t = 0, f = 0;
  return shots.map((s) => {
    const dur = Number(s.duration || 2);
    const frames = Math.max(12, Math.round(dur * fps));
    const row = { shot: s, start: t, end: t + dur, startF: f, endF: f + frames, frames };
    t += dur;
    f += frames;
    return row;
  });
};

// ---------------------------------------------------------------------------
// Storyboard panel rasterizer (identical to on-screen board)
// ---------------------------------------------------------------------------
export async function renderPanelPng(shot, project, { moodKey, width = 1280, slate = true, cache } = {}) {
  const key = `${shot.id}|${moodKey || project.moodKey}|${width}|${slate}`;
  if (cache?.has(key)) return cache.get(key);

  const mood = resolveMood(project, moodKey);
  const markup = renderToStaticMarkup(
    <StoryboardSvg shot={shot} project={project} moodOverride={moodKey} showGuides={false} />
  );
  const img = await loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup));
  const h = Math.round((width * 9) / 16);
  const c = document.createElement('canvas');
  c.width = width;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, h);
  ctx.filter = mood.svgFilter && mood.svgFilter !== 'none' ? mood.svgFilter : 'none';
  ctx.drawImage(img, 0, 0, width, h);
  if (shot.sketchDataUrl) {
    try {
      ctx.drawImage(await loadImage(shot.sketchDataUrl), 0, 0, width, h);
    } catch {
      /* ignore */
    }
  }
  ctx.filter = 'none';
  if (slate) {
    const s = width / 1280;
    const label = `SH${pad(shot.number)}  ${shot.shotType}  ${shot.focalLength}mm  ·  ${shot.cameraAngle} → ${shot.cameraMove}  ·  ${Number(shot.duration).toFixed(1)}s`;
    ctx.font = `600 ${Math.round(20 * s)}px "JetBrains Mono", monospace`;
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.beginPath();
    ctx.roundRect?.(16 * s, 16 * s, tw + 28 * s, 38 * s, 19 * s);
    ctx.fill();
    ctx.fillStyle = '#FDE68A';
    ctx.fillText(label, 30 * s, 42 * s);
  }
  const url = c.toDataURL('image/png');
  cache?.set(key, url);
  return url;
}

// ---------------------------------------------------------------------------
// Text exporters
// ---------------------------------------------------------------------------
function storyMarkdown(p) {
  const sl = p.plotSlots || {};
  return `# ${p.title}

**Tier:** ${p.tier}  ·  **Mood:** ${resolveMood(p).name}  ·  **Shots:** ${p.shots.length}

> ${p.logline}

**Theme & Emotional Arc:** ${p.theme}

## Plot, Acting & Cinematography Matrix
- **Protagonist & Stake:** ${sl.protagonist || '—'}
- **Core Action / 51-Exercises Drill:** ${sl.activity || '—'}
- **Midpoint Complication:** ${sl.complication || '—'}
- **3-Beat Emotional Arc:** ${sl.emotionArc || '—'}
- **Line of Action & Acting Subtext:** ${sl.actingCue || '—'}
- **Camera Grammar & Lighting Style:** ${sl.cinemaStyle || '—'}
- **Payoff Beat:** ${sl.payoff || '—'}

## Story Spine
1. **Hook** — ${p.hook}
2. **Escalation / Conflict** — ${p.conflict}
3. **Payoff / Release** — ${p.resolution}

## Beat List
${p.shots.map((s) => `- **SH${pad(s.number)} ${s.title}** (${s.shotType} · ${s.focalLength}mm · ${s.cameraMove} · ${s.duration}s) — ${s.action}`).join('\n')}
`;
}

function castMarkdown(p) {
  const env = p.environment || {};
  return `# Cast & Set — ${p.title}

## Characters
${(p.characters || [])
  .map(
    (c) => `### ${c.name} — ${c.archetype}
- **Shape Language:** ${(c.shape || 'circle').toUpperCase()}  ·  **Body Build:** ${(c.bodyType || 'tall').toUpperCase()}
- **Silhouette:** ${c.silhouette}
- **Goal:** ${c.motivation}
- **Acting quirk:** ${c.quirk}
- **Color:** ${c.colorHex}  ·  **Blender proxy:** SF_Char_${String(c.name).replace(/\s+/g, '_')}`
  )
  .join('\n\n')}

## Set — ${env.name || ''}
- **Setting:** ${env.settingType || ''}
- **Time / atmosphere:** ${env.timeOfDay || ''}
- **Props:** ${(env.props || []).map((pr, idx) => `${pr} [${(env.propShapes?.[idx] || 'box').toUpperCase()}]`).join(', ')}
`;
}

function parseDialogue(d, fallbackName) {
  if (!d) return null;
  let text = d.trim();
  let name = fallbackName;
  const m = text.match(/^([A-Z][A-Z0-9 .'()-]{1,30}):\s*(.*)$/);
  if (m) {
    name = m[1].trim();
    text = m[2];
  }
  let paren = null;
  const pm = text.match(/^\(([^)]+)\)\s*(.*)$/);
  if (pm) {
    paren = pm[1];
    text = pm[2];
  }
  return { name: name.toUpperCase(), paren, text: text.replace(/^"|"$/g, '') };
}

function fountain(p) {
  const env = p.environment || {};
  const intExt = /ext/i.test(env.settingType || '') ? 'EXT.' : 'INT.';
  const hero = p.characters?.[0]?.name || 'HERO';
  const lines = [
    `Title: ${p.title}`,
    `Credit: Written with StoryForge Studio`,
    `Draft date: ${new Date().toLocaleDateString()}`,
    `Notes: ${p.logline}`,
    '',
    '',
    `${intExt} ${(env.name || 'LOCATION').toUpperCase()} - ${(env.timeOfDay || 'DAY').toUpperCase()}`,
    ''
  ];
  p.shots.forEach((s) => {
    lines.push(
      `[[SH${pad(s.number)} · ${s.shotType} (${s.shotTypeName || ''}) · ${s.focalLength}mm · ${s.cameraAngle} · ${s.cameraMove} · ${s.duration}s]]`,
      '',
      `${s.shotType === 'ECU' || s.shotType === 'CU' ? 'CLOSE ON' : s.shotType === 'WS' || s.shotType === 'EWS' ? 'WIDE' : 'ANGLE ON'} - ${String(s.title).toUpperCase()}`,
      '',
      s.action,
      ''
    );
    const d = parseDialogue(s.dialogue, hero);
    if (d && d.text) {
      lines.push(d.name);
      if (d.paren) lines.push(`(${d.paren})`);
      lines.push(d.text, '');
    } else if (d?.paren) {
      lines.push(`${hero.toUpperCase()}`, `(${d.paren})`, '...', '');
    }
    if (s.soundCue) lines.push(`SFX: ${s.soundCue}`, '');
    if (s.notes) lines.push(`[[Animation note: ${s.notes}]]`, '');
    lines.push('CUT TO:', '');
  });
  lines.push('> FADE OUT.');
  return lines.join('\n');
}

function scriptMarkdown(p) {
  return `# Shooting Script — ${p.title}

| # | Shot | Type | Lens | Angle | Move | Dur |
|---|------|------|------|-------|------|-----|
${p.shots.map((s) => `| ${pad(s.number)} | ${s.title} | ${s.shotType} | ${s.focalLength}mm | ${s.cameraAngle} | ${s.cameraMove} | ${s.duration}s |`).join('\n')}

${p.shots
  .map(
    (s) => `## SH${pad(s.number)} — ${s.title}
- **Action:** ${s.action}
- **Dialogue:** ${s.dialogue || '—'}
- **Sound:** ${s.soundCue || '—'}
- **Camera:** ${s.shotType} · ${s.focalLength}mm · ${s.cameraAngle} · ${s.cameraMove}
- **Blender:** cam start [${(s.camStart || []).join(', ')}] → end [${(s.camEnd || []).join(', ')}], subject [${(s.subjectPos || []).join(', ')}]
- **Notes:** ${s.notes || '—'}`
  )
  .join('\n\n')}
`;
}

const shotCsv = (p, fps) =>
  toCsv([
    ['shot', 'title', 'shot_type', 'focal_mm', 'angle', 'move', 'duration_s', 'frames', 'start_frame', 'end_frame', 'action', 'dialogue', 'sound', 'cam_start', 'cam_end', 'subject', 'notes'],
    ...shotTimeline(p.shots, fps).map(({ shot: s, startF, endF, frames }) => [
      `SH${pad(s.number)}`, s.title, s.shotType, s.focalLength, s.cameraAngle, s.cameraMove, s.duration, frames, startF + 1, endF,
      s.action, s.dialogue, s.soundCue, (s.camStart || []).join(' '), (s.camEnd || []).join(' '), (s.subjectPos || []).join(' '), s.notes
    ])
  ]);

const cleanShots = (shots) => shots.map(({ sketchDataUrl, aiImage, ...s }) => s);

function gpl(mood) {
  return `GIMP Palette\nName: StoryForge ${mood.name}\nColumns: ${mood.palette.length}\n#\n${mood.palette
    .map((h) => `${hexToRgb(h).map((v) => String(v).padStart(3)).join(' ')}\t${h}`)
    .join('\n')}\n`;
}

const htmlShell = (title, body, extraCss = '') => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:Inter,Segoe UI,system-ui,sans-serif;background:#0b0a10;color:#eee;padding:32px}
h1{font-size:28px;margin:0 0 4px}h2{font-size:18px;margin:28px 0 10px}.muted{color:#9a98a8;font-size:13px}
.mono{font-family:"JetBrains Mono",Consolas,monospace}
img{max-width:100%;display:block}
${extraCss}
@media print{body{background:#fff;color:#111;padding:12px}.noprint{display:none}.muted{color:#555}}
</style></head><body>${body}</body></html>`;

// ---------------------------------------------------------------------------
// Step file builders
// ---------------------------------------------------------------------------
export const EXPORT_STEPS = [
  { id: 'idea', folder: '01_idea', label: 'Idea & Story Spine', files: ['story.md', 'story.json'] },
  { id: 'world', folder: '02_cast_and_set', label: 'Cast & Set', files: ['cast_and_set.md', 'characters.csv', 'environment.json'] },
  { id: 'script', folder: '03_script', label: 'Script & Camera Directions', files: ['script.fountain', 'shooting_script.md', 'shot_list.csv', 'camera_directions.json'] },
  { id: 'refs', folder: '04_references', label: 'Reference Library', files: ['images/*', 'references.json', 'reference_board.html'] },
  { id: 'storyboard', folder: '05_storyboards', label: 'Storyboards', files: ['panels/SH##.png', 'storyboard_sheet.html'] },
  { id: 'mood', folder: '06_mood_board', label: 'Mood Boards', files: ['mood_board.html', 'palettes/*.gpl', 'palettes.json', 'palettes.css', 'variations/*.png'] },
  { id: 'animatic', folder: '07_animatic', label: 'Animatic & Edit', files: ['animatic_player.html', 'edit.edl', 'dialogue.srt', 'timing.csv'] },
  { id: 'previz', folder: '08_blender_previz', label: 'Blender Previz', files: ['storyforge_previz.py', 'shot_manifest.json'] },
  { id: 'music', folder: '09_temp_music', label: 'Temp Music', files: ['temp_music_cut.wav', 'cue_sheet.md', 'music_sources.md'] }
];

export async function buildStepFiles(stepId, ctx) {
  const { project: p, fps = 24 } = ctx;
  const cache = (ctx.cache ||= new Map());
  const files = [];
  const add = (name, data, opts = {}) => files.push({ name, data, ...opts });

  switch (stepId) {
    case 'idea':
      add('story.md', storyMarkdown(p));
      add(
        'story.json',
        JSON.stringify({ title: p.title, tier: p.tier, exerciseId: p.exerciseId || null, logline: p.logline, theme: p.theme, plotSlots: p.plotSlots || {}, hook: p.hook, conflict: p.conflict, resolution: p.resolution }, null, 2)
      );
      break;

    case 'world':
      add('cast_and_set.md', castMarkdown(p));
      add(
        'characters.csv',
        toCsv([['name', 'shape', 'body_type', 'archetype', 'silhouette', 'motivation', 'quirk', 'color'], ...(p.characters || []).map((c) => [c.name, c.shape || 'circle', c.bodyType || 'tall', c.archetype, c.silhouette, c.motivation, c.quirk, c.colorHex])])
      );
      add('environment.json', JSON.stringify(p.environment || {}, null, 2));
      break;

    case 'script':
      add('script.fountain', fountain(p));
      add('shooting_script.md', scriptMarkdown(p));
      add('shot_list.csv', shotCsv(p, fps));
      add('camera_directions.json', JSON.stringify({ fps, units: 'meters', up_axis: 'Z', shots: cleanShots(p.shots) }, null, 2));
      break;

    case 'refs': {
      const refs = p.references || [];
      const meta = [];
      refs.forEach((r, i) => {
        let file = null;
        if (r.src?.startsWith('data:')) {
          const { b64, ext } = dataUrlParts(r.src);
          file = `images/${pad(i + 1)}_${slug(r.title)}.${ext}`;
          add(file, b64, { base64: true });
        }
        const { src, ...rest } = r;
        meta.push({ ...rest, file });
      });
      add('references.json', JSON.stringify(meta, null, 2));
      add(
        'reference_board.html',
        htmlShell(
          `${p.title} — References`,
          `<h1>${esc(p.title)} — Reference Library</h1><p class="muted">${refs.length} references · exported ${new Date().toLocaleString()}</p>
<div class="grid">${refs
            .map(
              (r) => `<figure>${r.src ? `<img src="${r.src}">` : `<div class="link">🔗</div>`}<figcaption><b>${esc(r.title)}</b><br>
<span class="muted">${esc((r.tags || []).join(' · '))} · use: ${esc(r.use || 'both')}</span>
${r.palette ? `<div class="pal">${r.palette.map((h) => `<i style="background:${h}"></i>`).join('')}</div>` : ''}
${r.sourceUrl ? `<a href="${esc(r.sourceUrl)}">${esc(r.sourceUrl)}</a>` : ''}${r.note ? `<p>${esc(r.note)}</p>` : ''}</figcaption></figure>`
            )
            .join('')}</div>`,
          `.grid{columns:3 280px;gap:16px}figure{break-inside:avoid;margin:0 0 16px;background:#16141f;border-radius:14px;overflow:hidden}
figcaption{padding:10px 12px;font-size:13px}a{color:#c4b5fd;word-break:break-all;font-size:11px}.pal{display:flex;margin:6px 0}.pal i{flex:1;height:14px}
.link{height:120px;display:grid;place-items:center;font-size:40px}`
        )
      );
      break;
    }

    case 'storyboard': {
      const panels = [];
      for (const s of p.shots) {
        const url = await renderPanelPng(s, p, { cache });
        panels.push({ s, url });
        add(`panels/SH${pad(s.number)}_${slug(s.title)}.png`, url.split(',')[1], { base64: true });
      }
      add(
        'storyboard_sheet.html',
        htmlShell(
          `${p.title} — Storyboard`,
          `<h1>${esc(p.title)}</h1><p class="muted">${esc(p.logline)}</p>
<p class="muted mono">${p.shots.length} panels · ${p.shots.reduce((a, s) => a + Number(s.duration), 0).toFixed(1)}s · mood: ${esc(resolveMood(p).name)}</p>
<button class="noprint" onclick="print()">Print / Save as PDF</button>
<div class="sheet">${panels
            .map(
              ({ s, url }) => `<div class="panel"><img src="${url}"><div class="meta mono">SH${pad(s.number)} · ${s.shotType} · ${s.focalLength}mm · ${esc(s.cameraAngle)} · ${esc(s.cameraMove)} · ${s.duration}s</div>
<h3>${esc(s.title)}</h3><p>${esc(s.action)}</p>${s.dialogue ? `<p class="dlg">${esc(s.dialogue)}</p>` : ''}${s.soundCue ? `<p class="muted">🔊 ${esc(s.soundCue)}</p>` : ''}${s.notes ? `<p class="muted">✎ ${esc(s.notes)}</p>` : ''}</div>`
            )
            .join('')}</div>`,
          `.sheet{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:20px}.panel{background:#16141f;border-radius:14px;padding:12px;break-inside:avoid}
.panel img{border-radius:8px}.meta{font-size:11px;color:#fbbf24;margin-top:8px}h3{margin:6px 0 4px;font-size:15px}p{margin:4px 0;font-size:13px;line-height:1.45}
.dlg{font-style:italic;color:#fde68a}button{background:#f59e0b;border:0;border-radius:999px;padding:8px 16px;font-weight:700;cursor:pointer}
@media print{.panel{background:#f5f5f5}.dlg{color:#7c4a00}}`
        )
      );
      break;
    }

    case 'mood': {
      const moods = { ...MOOD_VARIATIONS, ...(p.customMoods || {}) };
      const activeShot = p.shots[ctx.activeShotIndex || 0] || p.shots[0];
      const blocks = [];
      for (const m of Object.values(moods)) {
        add(`palettes/${slug(m.name)}.gpl`, gpl(m));
        const url = await renderPanelPng(activeShot, p, { moodKey: m.id, cache });
        add(`variations/${slug(m.name)}.png`, url.split(',')[1], { base64: true });
        blocks.push({ m, url });
      }
      add(
        'palettes.json',
        JSON.stringify(Object.values(moods).map((m) => ({ id: m.id, name: m.name, palette: m.palette, lightingNotes: m.lightingNotes, blender: { key: m.blenderKeyColor, fill: m.blenderFillColor, world: m.blenderBgColor, keyEnergy: m.keyEnergy, fillEnergy: m.fillEnergy } })), null, 2)
      );
      add(
        'palettes.css',
        `:root {\n${Object.values(moods)
          .map((m) => m.palette.map((h, i) => `  --${slug(m.id)}-${i + 1}: ${h};`).join('\n'))
          .join('\n')}\n}\n`
      );
      const refs = (p.references || []).filter((r) => r.src && r.use !== 'storyboard');
      add(
        'mood_board.html',
        htmlShell(
          `${p.title} — Mood Board`,
          `<h1>${esc(p.title)} — Mood Board</h1><p class="muted">Active mood: ${esc(resolveMood(p).name)} · tested on SH${pad(activeShot.number)} “${esc(activeShot.title)}”</p>
<div class="moods">${blocks
            .map(
              ({ m, url }) => `<div class="mood ${m.id === p.moodKey ? 'on' : ''}"><img src="${url}"><h3>${esc(m.name)}</h3><p class="muted">${esc(m.subtitle || '')}</p>
<div class="pal">${m.palette.map((h) => `<div><i style="background:${h}"></i><span class="mono">${h}</span></div>`).join('')}</div><p class="note">${esc(m.lightingNotes)}</p></div>`
            )
            .join('')}</div>
${refs.length ? `<h2>Your references graded Warm · Cold · Dark · Light</h2><div class="grades">${refs
                .map(
                  (r) => `<div class="row"><b>${esc(r.title)}</b><div class="strip">${Object.entries(PHOTO_GRADES)
                    .map(([k, g]) => `<figure><div class="ph"><img src="${r.src}" style="filter:${g.filter}">${g.tint ? `<i style="background:${g.tint}"></i>` : ''}</div><figcaption>${g.label}</figcaption></figure>`)
                    .join('')}</div></div>`
                )
                .join('')}</div>` : ''}`,
          `.moods{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:18px}.mood{background:#16141f;border-radius:14px;padding:12px;border:2px solid transparent}
.mood.on{border-color:#f59e0b}.mood img{border-radius:8px}h3{margin:8px 0 2px}.pal{display:flex;gap:6px;margin:8px 0}.pal div{flex:1}.pal i{display:block;height:28px;border-radius:6px}
.pal span{font-size:9px;color:#999}.note{font-size:12px;color:#ccc}.row{margin-bottom:16px}.strip{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:6px}
figure{margin:0}.ph{position:relative;border-radius:8px;overflow:hidden;aspect-ratio:4/3}.ph img{width:100%;height:100%;object-fit:cover}.ph i{position:absolute;inset:0;mix-blend-mode:soft-light;opacity:.55}
figcaption{font-size:11px;color:#aaa;margin-top:4px;text-align:center}`
        )
      );
      break;
    }

    case 'animatic': {
      const tl = shotTimeline(p.shots, fps);
      const edl = [`TITLE: ${p.title.toUpperCase().slice(0, 60)}`, 'FCM: NON-DROP FRAME', ''];
      tl.forEach(({ shot: s, startF, endF }, i) => {
        edl.push(
          `${pad(i + 1, 3)}  SH${pad(s.number)}     V     C        ${tc(0, fps)} ${tc(endF - startF, fps)} ${tc(3600 * fps + startF, fps)} ${tc(3600 * fps + endF, fps)}`,
          `* FROM CLIP NAME: SH${pad(s.number)}_${slug(s.title)}.png`,
          `* COMMENT: ${s.shotType} ${s.focalLength}MM ${s.cameraMove.toUpperCase()}`,
          ''
        );
      });
      add('edit.edl', edl.join('\n'));
      add(
        'dialogue.srt',
        tl
          .filter(({ shot: s }) => s.dialogue)
          .map(({ shot: s, start, end }, i) => `${i + 1}\n${srtTime(start + 0.1)} --> ${srtTime(end - 0.1)}\n${s.dialogue}\n`)
          .join('\n')
      );
      add(
        'timing.csv',
        toCsv([['shot', 'title', 'start_s', 'end_s', 'duration_s', 'start_tc', 'end_tc', 'frames'], ...tl.map(({ shot: s, start, end, startF, endF, frames }) => [`SH${pad(s.number)}`, s.title, start.toFixed(2), end.toFixed(2), s.duration, tc(startF, fps), tc(endF, fps), frames])])
      );
      const frames = [];
      for (const { shot: s, start, end } of tl) frames.push({ url: await renderPanelPng(s, p, { cache }), s, start, end });
      const data = JSON.stringify(frames.map(({ url, s, start, end }) => ({ url, start, end, title: s.title, action: s.action, dialogue: s.dialogue || '', sound: s.soundCue || '', label: `SH${pad(s.number)} · ${s.shotType} · ${s.cameraMove}`, move: s.cameraMove })));
      add(
        'animatic_player.html',
        htmlShell(
          `${p.title} — Animatic`,
          `<h1>${esc(p.title)} — Animatic</h1><p class="muted">Offline player · ${tl.length} shots · ${tl.length ? tl[tl.length - 1].end.toFixed(1) : 0}s · temp music loads from ../09_temp_music/temp_music_cut.wav if present</p>
<div class="stage"><img id="f"><div class="sub"><div id="a"></div><div id="d" class="mono"></div><div id="snd" class="mono"></div></div><div id="lbl" class="lbl mono"></div></div>
<div class="bar noprint"><button id="pb">▶ Play</button><input id="sc" type="range" min="0" step="0.01" value="0"><span id="tc" class="mono"></span></div>
<audio id="au" src="../09_temp_music/temp_music_cut.wav" preload="auto"></audio>
<script>
const F=${data};const T=F.length?F[F.length-1].end:0;let t=0,play=false,last=0;
const $=id=>document.getElementById(id);$('sc').max=T;
function draw(){const i=Math.max(0,F.findIndex(x=>t<x.end));const fr=F[i===-1?F.length-1:i];if(!fr)return;const lp=(t-fr.start)/(fr.end-fr.start);
let s=1,x=0,y=0;if(/push/i.test(fr.move))s=1+lp*.12;if(/pull/i.test(fr.move))s=1.12-lp*.12;if(/pan|dolly|follow|orbit/i.test(fr.move))x=(lp-.5)*-4;if(/crane/i.test(fr.move))y=(.5-lp)*4;
if($('f').dataset.u!==fr.url){$('f').src=fr.url;$('f').dataset.u=fr.url}$('f').style.transform='scale('+s+') translate('+x+'%,'+y+'%)';
$('a').textContent=fr.action;$('d').textContent=fr.dialogue;$('snd').textContent=fr.sound?'🔊 '+fr.sound:'';$('lbl').textContent=fr.label;$('sc').value=t;$('tc').textContent=t.toFixed(2)+' / '+T.toFixed(2)+'s';}
function loop(ts){if(play){t+=(ts-last)/1000;if(t>=T){t=0;play=false;$('pb').textContent='▶ Play';$('au').pause()}}last=ts;draw();requestAnimationFrame(loop)}
$('pb').onclick=()=>{play=!play;$('pb').textContent=play?'❚❚ Pause':'▶ Play';const a=$('au');if(play){a.currentTime=t;a.play().catch(()=>{})}else a.pause()};
$('sc').oninput=e=>{t=+e.target.value;$('au').currentTime=t};requestAnimationFrame(loop);
</script>`,
          `.stage{position:relative;overflow:hidden;border-radius:16px;aspect-ratio:16/9;background:#000;max-width:1100px}.stage img{width:100%;height:100%;object-fit:cover;transition:transform .05s linear}
.sub{position:absolute;left:6%;right:6%;bottom:6%;background:rgba(0,0,0,.7);border-radius:12px;padding:10px 14px;text-align:center;font-size:14px}#d{color:#fde68a;font-weight:700}#snd{color:#7dd3fc;font-size:11px}
.lbl{position:absolute;top:12px;left:12px;background:rgba(0,0,0,.6);border-radius:99px;padding:4px 10px;font-size:11px;color:#fde68a}
.bar{display:flex;gap:12px;align-items:center;max-width:1100px;margin-top:12px}.bar input{flex:1}button{background:#f59e0b;border:0;border-radius:999px;padding:8px 18px;font-weight:700;cursor:pointer}`
        )
      );
      break;
    }

    case 'previz':
      add('storyforge_previz.py', generateBlenderPrevizScript(p, fps));
      add(
        'shot_manifest.json',
        JSON.stringify(
          {
            fps,
            mood: resolveMood(p).name,
            cameras: shotTimeline(p.shots, fps).map(({ shot: s, startF, endF }, i) => ({ camera: `SF_Cam_SH${pad(i + 1)}_${s.shotType}`, frame_start: startF + 1, frame_end: endF, lens_mm: s.focalLength, move: s.cameraMove, cam_start: s.camStart, cam_end: s.camEnd, subject: s.subjectPos }))
          },
          null,
          2
        )
      );
      break;

    case 'music': {
      const m = p.music || {};
      const track = ROYALTY_FREE_TRACKS.find((t) => t.id === m.trackId) || ROYALTY_FREE_TRACKS[0];
      const trimStart = m.trimStart ?? 1.5, trimEnd = m.trimEnd ?? 14, offset = m.offset ?? 0, vol = m.volume ?? 0.75;
      try {
        const buf = ctx.customAudioFile
          ? await renderAudioFileCut(ctx.customAudioFile, trimStart, trimEnd, vol, offset)
          : await renderSynthTrack(track, Math.min(120, trimEnd - trimStart), vol, offset);
        add('temp_music_cut.wav', audioBufferToWav(buf));
      } catch (e) {
        add('temp_music_ERROR.txt', `Could not render audio: ${e.message}`);
      }
      if (ctx.customAudioFile) add(`original/${ctx.customAudioFile.name}`, ctx.customAudioFile);
      const tl = shotTimeline(p.shots, fps);
      add(
        'cue_sheet.md',
        `# Temp Music Cue Sheet — ${p.title}

- **Track:** ${ctx.customAudioFile ? ctx.customAudioFile.name + ' (imported)' : `${track.title} — ${track.artist}`}
- **Trim:** ${trimStart.toFixed(2)}s → ${trimEnd.toFixed(2)}s (${(trimEnd - trimStart).toFixed(2)}s)
- **Offset into animatic:** ${offset.toFixed(2)}s  ·  **Level:** ${Math.round(vol * 100)}%
- **BPM:** ${ctx.customAudioFile ? 'n/a' : track.bpm}

| Shot | Animatic in | Track position |
|------|-------------|----------------|
${tl.map(({ shot: s, start }) => `| SH${pad(s.number)} ${s.title} | ${start.toFixed(2)}s | ${(trimStart + Math.max(0, start - offset)).toFixed(2)}s |`).join('\n')}
`
      );
      add(
        'music_sources.md',
        `# Royalty-free music sources\n\nReplace the temp cut with a licensed track. Always check each track's license (CC0 / CC-BY attribution).\n\n${[
          ['Pixabay Music (CC0-style license)', 'https://pixabay.com/music/'],
          ['Free Music Archive', 'https://freemusicarchive.org/'],
          ['Incompetech — Kevin MacLeod (CC-BY)', 'https://incompetech.com/music/royalty-free/music.html'],
          ['FreePD (public domain)', 'https://freepd.com/'],
          ['ccMixter', 'https://dig.ccmixter.org/'],
          ...ROYALTY_FREE_TRACKS.map((t) => [`Similar to “${t.title}”`, t.externalUrl])
        ]
          .map(([n, u]) => `- [${n}](${u})`)
          .join('\n')}\n`
      );
      break;
    }
    default:
      break;
  }
  return files;
}

const README = (p) => `# ${p.title} — StoryForge export

Exported ${new Date().toLocaleString()}. Everything here works offline.

| Folder | What's inside | Reuse it in |
|---|---|---|
| 01_idea | story.md / story.json | Any editor, Notion, Obsidian |
| 02_cast_and_set | character sheet (md/csv), environment.json | Sheets, Excel |
| 03_script | script.fountain, shooting script, shot_list.csv, camera_directions.json | Highland, Fade In, WriterDuet, Beat (Fountain) |
| 04_references | your images + references.json + reference_board.html | Browser, PureRef |
| 05_storyboards | PNG panels + printable storyboard_sheet.html | Browser → Print to PDF, Krita, Photoshop |
| 06_mood_board | mood_board.html, .gpl palettes, palettes.css/json, variation PNGs | Krita/GIMP/Inkscape (.gpl), web |
| 07_animatic | animatic_player.html, edit.edl, dialogue.srt, timing.csv | DaVinci Resolve, Premiere, Kdenlive (EDL + PNGs) |
| 08_blender_previz | storyforge_previz.py, shot_manifest.json | Blender → Scripting → Open → Run |
| 09_temp_music | temp_music_cut.wav, cue_sheet.md | Any NLE / DAW, Blender VSE |

**project.storyforge.json** re-opens the whole project in StoryForge (Export → Import project).
`;

async function addToZip(zip, folder, files) {
  for (const f of files) {
    const path = folder ? `${folder}/${f.name}` : f.name;
    if (f.base64) zip.file(path, f.data, { base64: true });
    else zip.file(path, f.data);
  }
}

export async function exportStepZip(stepId, ctx) {
  const step = EXPORT_STEPS.find((s) => s.id === stepId);
  const files = await buildStepFiles(stepId, ctx);
  const zip = new JSZip();
  await addToZip(zip, step.folder, files);
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, `${slug(ctx.project.title)}_${step.folder}.zip`);
  return files.length;
}

export async function exportAllZip(ctx, onProgress) {
  const zip = new JSZip();
  const root = slug(ctx.project.title);
  ctx.cache = new Map();
  let count = 0;
  for (const [i, step] of EXPORT_STEPS.entries()) {
    onProgress?.(step.label, i / EXPORT_STEPS.length);
    const files = await buildStepFiles(step.id, ctx);
    await addToZip(zip, `${root}/${step.folder}`, files);
    count += files.length;
  }
  zip.file(`${root}/project.storyforge.json`, JSON.stringify(ctx.project, null, 2));
  zip.file(`${root}/README.md`, README(ctx.project));
  onProgress?.('Compressing', 1);
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, `${root}_storyforge_export.zip`);
  return count + 2;
}

export async function downloadStepFile(stepId, fileName, ctx) {
  const files = await buildStepFiles(stepId, ctx);
  const f = files.find((x) => x.name === fileName);
  if (!f) return false;
  let blob;
  if (f.data instanceof Blob) blob = f.data;
  else if (f.base64) {
    const bin = atob(f.data);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    blob = new Blob([arr]);
  } else blob = new Blob([f.data], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, fileName.split('/').pop());
  return true;
}

export function exportProjectJson(project) {
  downloadBlob(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${slug(project.title)}.storyforge.json`);
}
