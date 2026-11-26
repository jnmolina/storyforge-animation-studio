import React, { useState } from 'react';
import { PenTool, Plus, Wand2, Shuffle, Loader2, ImageOff, Maximize2, ExternalLink } from 'lucide-react';
import { useStudio, Panel } from '../studio';
import StoryboardCanvas, { REF_MODES, getShotImage } from '../components/StoryboardCanvas';
import { RefDropzone } from './ReferenceStage';

function PanelCard({ shot }) {
  const { project, updateShot, setSketchModalShot, generateAiBoard, aiBoardBusy, geminiApiKey } = useStudio();
  const refs = (project.references || []).filter((r) => r.src && r.use !== 'mood');
  const { mode } = getShotImage(shot, project);
  const busy = aiBoardBusy === shot.id;

  return (
    <div className="glass glass-hover flex flex-col p-3.5">
      <div className="mb-2.5 flex items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-accent">{String(shot.number).padStart(2, '0')}</span>
          <h3 className="truncate text-sm font-semibold text-white">{shot.title}</h3>
        </div>
        <button onClick={() => setSketchModalShot(shot)} className="btn btn-ghost btn-sm" title="Draw over this panel">
          <PenTool className="h-3 w-3" /> Draw
        </button>
      </div>

      <div className="relative">
        <StoryboardCanvas shot={shot} project={project} />
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        )}
      </div>

      {/* Mode selector */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="seg">
          {REF_MODES.map((m) => (
            <button
              key={m.id}
              title={m.hint}
              data-on={(shot.refMode || (mode === 'photo' ? 'photo' : 'procedural')) === m.id}
              onClick={() => {
                if (m.id === 'ai' && !shot.aiImage) return generateAiBoard(shot);
                updateShot(shot.id, { refMode: m.id });
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
        {(shot.refMode === 'photo' || shot.refMode === 'sketch') && (
          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-white/50">
            <input type="checkbox" checked={shot.refAutoFrame !== false} onChange={(e) => updateShot(shot.id, { refAutoFrame: e.target.checked })} />
            <Maximize2 className="h-3 w-3" /> Auto-frame
          </label>
        )}
      </div>

      {/* Reference strip */}
      <div className="mt-3">
        <div className="eyebrow mb-1.5">Reference</div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
          <button
            onClick={() => updateShot(shot.id, { refId: null, refMode: 'procedural', referenceImageUrl: '' })}
            className={`flex h-11 w-14 shrink-0 items-center justify-center rounded-lg ring-1 ${!shot.refId ? 'ring-2 ring-[color:var(--accent)]' : 'ring-white/10'} bg-black/30`}
            title="No reference"
          >
            <ImageOff className="h-4 w-4 text-white/40" />
          </button>
          {refs.map((r) => (
            <button
              key={r.id}
              onClick={() => updateShot(shot.id, { refId: r.id, refMode: shot.refMode && shot.refMode !== 'procedural' && shot.refMode !== 'ai' ? shot.refMode : 'photo' })}
              className={`h-11 w-14 shrink-0 overflow-hidden rounded-lg ring-1 transition ${shot.refId === r.id ? 'ring-2 ring-[color:var(--accent)]' : 'ring-white/10 opacity-70 hover:opacity-100'}`}
              title={r.title}
            >
              <img src={r.src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-white/70">{shot.action}</p>
      {shot.dialogue && <p className="mt-1 font-mono text-[11px] italic text-amber-200/80">{shot.dialogue}</p>}

      <div className="mt-auto flex items-center justify-between pt-3">
        <button
          className="btn btn-ghost btn-sm"
          disabled={busy}
          onClick={() => generateAiBoard(shot)}
          title={geminiApiKey ? 'Generate a sketch panel with Gemini from your reference + this shot' : 'Add a Gemini key (top bar) to enable'}
        >
          <Wand2 className="h-3 w-3 text-accent" /> {shot.aiImage ? 'Regenerate AI board' : 'AI board'}
        </button>
        {shot.sketchDataUrl && (
          <button className="text-[11px] text-white/35 hover:text-rose-300" onClick={() => updateShot(shot.id, { sketchDataUrl: null })}>
            Clear drawing
          </button>
        )}
      </div>
    </div>
  );
}

export default function StoryboardStage() {
  const { project, setProject, addShot, runAutoMatch, notify } = useStudio();
  const refs = (project.references || []).filter((r) => r.src && r.use !== 'mood');
  const [q] = useState(project.tier === 'kinetic' ? 'chase night' : 'morning apartment');

  const setAll = (mode) => {
    setProject((p) => ({ ...p, shots: p.shots.map((s) => ({ ...s, refMode: mode })) }));
    notify(`All panels set to ${REF_MODES.find((m) => m.id === mode)?.label}`);
  };

  return (
    <div className="space-y-6">
      <Panel className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn btn-primary" onClick={runAutoMatch} disabled={!refs.length}>
            <Shuffle className="h-3.5 w-3.5" /> Auto-match my refs to panels
          </button>
          <span className="eyebrow ml-2">All panels:</span>
          <div className="seg">
            {REF_MODES.filter((m) => m.id !== 'ai').map((m) => (
              <button key={m.id} data-on={false} onClick={() => setAll(m.id)} title={m.hint}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href="https://livlily.blogspot.com/" title="Living Lines Library — Model Sheets, Storyboards & Layouts">
            <ExternalLink className="h-3 w-3" /> Living Lines
          </a>
          <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href="https://design.tutsplus.com/tutorials/storyboarding-part-2-lingo-camera-shots-techniques--cms-31171" title="Tuts+ Storyboarding Lingo & Camera Shots">
            <ExternalLink className="h-3 w-3" /> Tuts+ Camera Lingo
          </a>
          <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href={`https://film-grab.com/?s=${encodeURIComponent(q)}`}>
            <ExternalLink className="h-3 w-3" /> Film-Grab
          </a>
          <a className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer" href={`https://www.pexels.com/search/${encodeURIComponent(project.title)}/`}>
            <ExternalLink className="h-3 w-3" /> Pexels
          </a>
          <button className="btn btn-ghost btn-sm" onClick={addShot}>
            <Plus className="h-3.5 w-3.5" /> Panel
          </button>
        </div>
      </Panel>

      {refs.length === 0 && <RefDropzone compact />}

      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3 stagger">
        {project.shots.map((s) => (
          <PanelCard key={s.id} shot={s} />
        ))}
      </div>
    </div>
  );
}
