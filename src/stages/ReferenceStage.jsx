import React, { useState, useRef } from 'react';
import { UploadCloud, Link2, Trash2, ExternalLink, Crosshair, Wand2, LayoutGrid, Palette as PaletteIcon, Loader2, ImagePlus, Globe } from 'lucide-react';
import { useStudio, Panel, Palette, Empty } from '../studio';

export function RefDropzone({ compact = false }) {
  const { addFiles, addUrls, refBusy } = useStudio();
  const [drag, setDrag] = useState(false);
  const [url, setUrl] = useState('');
  const fileRef = useRef(null);

  const onDrop = async (e) => {
    e.preventDefault();
    setDrag(false);
    const files = [...(e.dataTransfer.files || [])].filter((f) => f.type.startsWith('image/'));
    if (files.length) return addFiles(files);
    const text = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (text) addUrls(text);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      className={`glass relative overflow-hidden border-dashed transition ${drag ? 'ring-accent scale-[1.01]' : ''} ${compact ? 'p-3' : 'p-6'}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: 'radial-gradient(600px 200px at 50% 0%, color-mix(in srgb, var(--accent) 16%, transparent), transparent)' }} />
      <div className={`relative flex ${compact ? 'flex-row items-center gap-3' : 'flex-col items-center gap-4 text-center'}`}>
        {!compact && (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/40 ring-1 ring-white/10">
            {refBusy ? <Loader2 className="h-6 w-6 animate-spin text-accent" /> : <UploadCloud className="h-6 w-6 text-accent" />}
          </div>
        )}
        {!compact && (
          <div>
            <div className="h-display text-lg">Drop images, paste (Ctrl+V), or add links</div>
            <p className="mt-1 text-sm text-white/45">
              JPG/PNG/WebP files, direct image links, or page links (Pinterest, ArtStation, Unsplash, Flickr, film-grab…) — we pull the preview image.
            </p>
          </div>
        )}
        <div className={`flex w-full flex-wrap items-center gap-2 ${compact ? '' : 'max-w-2xl'}`}>
          <button className="btn btn-primary" onClick={() => fileRef.current?.click()}>
            <ImagePlus className="h-4 w-4" /> {compact ? 'Add images' : 'Choose images'}
          </button>
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full border border-white/10 bg-black/30 pl-3">
            <Link2 className="h-4 w-4 shrink-0 text-white/40" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && url.trim()) {
                  addUrls(url);
                  setUrl('');
                }
              }}
              placeholder="Paste one or more image / page links…"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white placeholder-white/30 outline-none"
            />
            <button
              className="btn btn-ghost btn-sm m-0.5"
              disabled={!url.trim() || refBusy}
              onClick={() => {
                addUrls(url);
                setUrl('');
              }}
            >
              {refBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />} Add link
            </button>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles([...(e.target.files || [])]);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}

function RefCard({ r }) {
  const { project, setProject, updateRef, removeRef } = useStudio();
  const [pickFocus, setPickFocus] = useState(false);
  const assigned = project.shots.filter((s) => s.refId === r.id);

  return (
    <div className="glass glass-hover mb-4 break-inside-avoid overflow-hidden p-0">
      {r.src ? (
        <div
          className={`relative ${pickFocus ? 'cursor-crosshair' : ''}`}
          onClick={(e) => {
            if (!pickFocus) return;
            const rect = e.currentTarget.getBoundingClientRect();
            updateRef(r.id, { focus: { x: Math.round(((e.clientX - rect.left) / rect.width) * 100), y: Math.round(((e.clientY - rect.top) / rect.height) * 100) } });
            setPickFocus(false);
          }}
        >
          <img src={r.src} alt={r.title} className="block w-full" />
          {(pickFocus || r.focus) && (
            <div
              className={`pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_3px_rgba(0,0,0,0.5)] ${pickFocus ? 'animate-pulse' : 'opacity-70'}`}
              style={{ left: `${r.focus?.x ?? 50}%`, top: `${r.focus?.y ?? 45}%` }}
            />
          )}
          {pickFocus && <div className="absolute inset-x-0 top-0 bg-black/70 py-1.5 text-center text-[11px] text-white">Click the subject — storyboard crops zoom here</div>}
          <div className="absolute right-2 top-2 flex gap-1">
            {(r.tags || []).filter((t) => t !== 'mid' && t !== 'neutral').map((t) => (
              <span key={t} className="rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] uppercase text-white/80 backdrop-blur">{t}</span>
            ))}
          </div>
        </div>
      ) : (
        <a href={r.sourceUrl} target="_blank" rel="noreferrer" className="flex h-28 items-center justify-center gap-2 bg-black/30 text-white/50 hover:text-white">
          <Link2 className="h-5 w-5" /> Link reference (no preview image)
        </a>
      )}
      {r.palette && <div className="px-3 pt-3"><Palette colors={r.palette} size="sm" /></div>}
      <div className="space-y-2.5 p-3">
        <input value={r.title} onChange={(e) => updateRef(r.id, { title: e.target.value })} className="w-full bg-transparent text-sm font-semibold text-white outline-none" />
        <textarea
          rows={1}
          value={r.note || ''}
          onChange={(e) => updateRef(r.id, { note: e.target.value })}
          placeholder="Note / keywords (helps auto-match shots)…"
          className="w-full resize-none bg-transparent text-xs text-white/55 placeholder-white/25 outline-none"
        />
        {r.src && (
          <div className="flex items-center justify-between gap-2">
            <div className="seg">
              {[
                ['storyboard', 'Boards'],
                ['both', 'Both'],
                ['mood', 'Mood']
              ].map(([k, l]) => (
                <button key={k} data-on={(r.use || 'both') === k} onClick={() => updateRef(r.id, { use: k })}>
                  {l}
                </button>
              ))}
            </div>
            <button className={`btn btn-sm ${pickFocus ? 'btn-accent-soft' : 'btn-ghost'}`} onClick={() => setPickFocus(!pickFocus)} title="Set focal point for auto-framing">
              <Crosshair className="h-3.5 w-3.5" /> Focus
            </button>
          </div>
        )}
        {r.src && (
          <select
            className="sf-input py-1.5 text-xs"
            value=""
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return;
              setProject((p) => ({
                ...p,
                shots: p.shots.map((s) => (id === 'all' || s.id === id ? { ...s, refId: r.id, refMode: s.refMode && s.refMode !== 'procedural' ? s.refMode : 'photo' } : s))
              }));
            }}
          >
            <option value="">{assigned.length ? `Used on ${assigned.map((s) => 'SH' + s.number).join(', ')} — assign to…` : 'Assign to storyboard panel…'}</option>
            {project.shots.map((s) => (
              <option key={s.id} value={s.id}>SH{String(s.number).padStart(2, '0')} · {s.title}</option>
            ))}
            <option value="all">All panels</option>
          </select>
        )}
        <div className="flex items-center justify-between pt-1 text-[11px] text-white/35">
          {r.sourceUrl ? (
            <a href={r.sourceUrl} target="_blank" rel="noreferrer" className="flex max-w-[75%] items-center gap-1 truncate hover:text-white">
              <ExternalLink className="h-3 w-3 shrink-0" /> {new URL(r.sourceUrl).hostname}
            </a>
          ) : (
            <span>Uploaded file</span>
          )}
          <button onClick={() => removeRef(r.id)} className="hover:text-rose-400">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReferenceStage() {
  const { project, runAutoMatch, generateRefMoods, go } = useStudio();
  const refs = project.references || [];
  const [filter, setFilter] = useState('all');
  const shown = refs.filter((r) => filter === 'all' || (filter === 'storyboard' ? r.use !== 'mood' : r.use !== 'storyboard'));

  return (
    <div className="space-y-6">
      <RefDropzone />

      {refs.length > 0 && (
        <Panel className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <span className="h-display text-2xl">{refs.length}</span>
            <span className="text-sm text-white/50">references</span>
            <div className="seg ml-2">
              {[
                ['all', 'All'],
                ['storyboard', 'For boards'],
                ['mood', 'For mood']
              ].map(([k, l]) => (
                <button key={k} data-on={filter === k} onClick={() => setFilter(k)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-accent-soft"
              onClick={() => {
                runAutoMatch();
                go('storyboard');
              }}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Generate storyboards from refs
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                generateRefMoods();
                go('mood');
              }}
            >
              <PaletteIcon className="h-3.5 w-3.5" /> Generate mood boards from refs
            </button>
          </div>
        </Panel>
      )}

      {refs.length === 0 ? (
        <Empty icon={Wand2} title="Your reference wall is empty">
          Add photos, film stills, paintings or your own sketches. StoryForge extracts their palettes, tags them warm/cold/dark/light, auto-frames them into
          storyboard panels per shot type, and builds mood-board variations from them.
        </Empty>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
          {shown.map((r) => (
            <RefCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}
