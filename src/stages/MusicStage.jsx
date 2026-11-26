import React from 'react';
import { ExternalLink, Upload, Play, Pause, Scissors, Film, Music2, Check } from 'lucide-react';
import { ROYALTY_FREE_TRACKS } from '../data/storyEngine';
import { useStudio, Panel, SectionTitle } from '../studio';

const SOURCES = (kinetic) => [
  { name: 'Pixabay Music', tag: 'CC0-style', url: `https://pixabay.com/music/search/${encodeURIComponent(kinetic ? 'chase action' : 'lofi morning')}/` },
  { name: 'Free Music Archive', tag: 'CC', url: 'https://freemusicarchive.org/' },
  { name: 'Incompetech', tag: 'CC-BY', url: 'https://incompetech.com/music/royalty-free/music.html' },
  { name: 'FreePD', tag: 'Public domain', url: 'https://freepd.com/' },
  { name: 'ccMixter', tag: 'CC', url: 'https://dig.ccmixter.org/' }
];

function Slider({ label, value, min, max, step, onChange, color = 'text-accent', unit = 's' }) {
  return (
    <label className="block">
      <div className="mb-1 flex justify-between text-[11px] text-white/45">
        <span className="uppercase tracking-wider">{label}</span>
        <span className={`font-mono ${color}`}>{unit === '%' ? `${Math.round(value * 100)}%` : `${value.toFixed(1)}s`}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}

export default function MusicStage() {
  const { project, music, setMusic, customAudio, setCustomAudio, customAudioRef, selectedTrack, isMusicPreviewing, toggleMusicPreview, totalDurationSec, notify, go } = useStudio();
  const span = 24;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-5">
        <Panel>
          <SectionTitle eyebrow="Browse, download, then import" title="Royalty-free sources" />
          <div className="grid grid-cols-2 gap-2">
            {SOURCES(project.tier === 'kinetic').map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="glass-soft glass-hover group flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-semibold">{s.name}</div>
                  <div className="font-mono text-[10px] text-white/40">{s.tag}</div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-white/30 group-hover:text-accent" />
              </a>
            ))}
          </div>
          <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-white/15 p-4 transition hover:border-[color:var(--accent)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40"><Upload className="h-4 w-4 text-accent" /></div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Import downloaded track</div>
              <div className="truncate text-xs text-white/45">{customAudio.name || '.mp3 · .wav · .ogg — stays on your machine'}</div>
            </div>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setCustomAudio({ url: URL.createObjectURL(f), name: f.name, file: f });
                notify(`Imported “${f.name}”`);
              }}
            />
          </label>
        </Panel>

        <Panel>
          <SectionTitle eyebrow="Zero-setup, playable instantly" title="Built-in temp tracks" />
          <div className="space-y-2">
            {ROYALTY_FREE_TRACKS.map((t) => {
              const on = music.trackId === t.id && !customAudio.url;
              return (
                <div
                  key={t.id}
                  onClick={() => { setCustomAudio({ url: null, name: '', file: null }); setMusic({ trackId: t.id }); }}
                  className={`glass-soft flex cursor-pointer items-center gap-3 p-3 transition hover:bg-white/[0.04] ${on ? 'ring-accent' : ''}`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${on ? 'text-black' : 'bg-black/40 text-white/40'}`} style={on ? { background: 'var(--accent)' } : {}}>
                    {on ? <Check className="h-4 w-4" /> : <Music2 className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{t.title}</div>
                    <div className="font-mono text-[10px] text-white/40">{t.genre} · {t.bpm} BPM · {t.mood}</div>
                  </div>
                  <a href={t.externalUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[11px] text-white/35 hover:text-accent">similar ↗</a>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel className="space-y-5 lg:col-span-7">
        <SectionTitle
          eyebrow="Land the music hit on your story beat"
          title="Cut & trim"
          right={
            <button onClick={toggleMusicPreview} className="btn btn-primary">
              {isMusicPreviewing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />} {isMusicPreviewing ? 'Stop' : 'Audition cut'}
            </button>
          }
        />
        {customAudio.url && (
          <audio
            ref={customAudioRef}
            src={customAudio.url}
            onTimeUpdate={() => {
              const a = customAudioRef.current;
              if (a && a.currentTime >= music.trimEnd) a.currentTime = music.trimStart;
            }}
          />
        )}
        <div className="font-mono text-xs text-emerald-300">{customAudio.name || selectedTrack.title}</div>
        <div className="relative h-40 overflow-hidden rounded-2xl bg-black/50 ring-1 ring-white/10">
          <svg viewBox="0 0 600 140" preserveAspectRatio="none" className="h-full w-full">
            <rect x={(music.trimStart / span) * 600} y="0" width={((music.trimEnd - music.trimStart) / span) * 600} height="140" fill="var(--accent)" opacity="0.08" />
            {Array.from({ length: 100 }).map((_, i) => {
              const sec = (i / 100) * span;
              const inT = sec >= music.trimStart && sec <= music.trimEnd;
              const h = 14 + Math.abs(Math.sin(i * 0.55 + (selectedTrack.bpm || 100)) * 50 + Math.cos(i * 1.3) * 24);
              return <rect key={i} x={i * 6 + 1} y={70 - h / 2} width="3.6" height={h} rx="1.8" fill={inT ? '#34D399' : '#ffffff'} opacity={inT ? 0.9 : 0.12} />;
            })}
            {(() => {
              let t = music.trimStart + music.offset * 0;
              return project.shots.map((s, i) => {
                const x = (t / span) * 600;
                t += Number(s.duration);
                return (
                  <g key={s.id}>
                    <line x1={x} y1="0" x2={x} y2="140" stroke="#FBBF24" strokeWidth="1.2" strokeDasharray="3 3" />
                    <text x={x + 3} y="12" fill="#FDE68A" fontSize="9" fontFamily="JetBrains Mono, monospace">SH{i + 1}</text>
                  </g>
                );
              });
            })()}
          </svg>
          <div className="absolute bottom-2 left-3 font-mono text-[10px] text-white/40">0s</div>
          <div className="absolute bottom-2 right-3 font-mono text-[10px] text-white/40">{span}s</div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Slider label="In point" value={music.trimStart} min={0} max={20} step={0.1} color="text-emerald-300" onChange={(v) => setMusic({ trimStart: Math.min(v, music.trimEnd - 0.5) })} />
          <Slider label="Out point" value={music.trimEnd} min={1} max={span} step={0.1} color="text-emerald-300" onChange={(v) => setMusic({ trimEnd: Math.max(v, music.trimStart + 0.5) })} />
          <Slider label="Offset into animatic" value={music.offset} min={0} max={5} step={0.1} onChange={(v) => setMusic({ offset: v })} />
          <Slider label="Level" value={music.volume} min={0.1} max={1} step={0.05} unit="%" color="text-sky-300" onChange={(v) => setMusic({ volume: v })} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4">
          <button
            className="btn btn-accent-soft"
            onClick={() => {
              setMusic({ trimEnd: Math.min(span, +(music.trimStart + totalDurationSec).toFixed(1)) });
              notify(`Cut snapped to animatic length (${totalDurationSec.toFixed(1)}s)`);
            }}
          >
            <Scissors className="h-3.5 w-3.5" /> Snap to animatic ({totalDurationSec.toFixed(1)}s)
          </button>
          <button className="btn btn-ghost" onClick={() => go('animatic')}>
            <Film className="h-3.5 w-3.5" /> Play with animatic
          </button>
        </div>
      </Panel>
    </div>
  );
}
