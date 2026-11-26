import React, { useState } from 'react';
import {
  PenTool,
  Plus,
  Wand2,
  Shuffle,
  Loader2,
  ImageOff,
  Maximize2,
  ExternalLink,
  Sliders,
  Trash2
} from 'lucide-react';
import { CAMERA_SHOT_TYPES, CAMERA_ANGLES, CAMERA_MOVES } from '../data/storyEngine';
import { useStudio, Panel } from '../studio';
import StoryboardCanvas, { REF_MODES, getShotImage, pitchToAngleLabel } from '../components/StoryboardCanvas';
import { RefDropzone } from './ReferenceStage';

function PanelCard({ shot }) {
  const {
    project,
    updateShot,
    deleteShot,
    applySmartBlenderCoords,
    setSketchModalShot,
    generateAiBoard,
    aiBoardBusy,
    geminiApiKey
  } = useStudio();

  const [showSliders, setShowSliders] = useState(true);
  const refs = (project.references || []).filter((r) => r.src && r.use !== 'mood');
  const { mode } = getShotImage(shot, project);
  const busy = aiBoardBusy === shot.id;

  const defaultPitch =
    /worm/i.test(shot.cameraAngle) ? -30 : /low/i.test(shot.cameraAngle) ? -16 : /bird/i.test(shot.cameraAngle) ? 32 : /high/i.test(shot.cameraAngle) ? 16 : 0;
  const pitchDeg = shot.pitchDeg !== undefined ? Number(shot.pitchDeg) : defaultPitch;
  const dutchDeg = shot.dutchDeg !== undefined ? Number(shot.dutchDeg) : (/dutch/i.test(shot.cameraAngle) ? -9 : 0);

  const changeCamPreset = (field, value) => {
    const next = {
      shotType: shot.shotType,
      cameraAngle: shot.cameraAngle,
      cameraMove: shot.cameraMove,
      [field]: value
    };
    const patch = applySmartBlenderCoords(shot, next.shotType, next.cameraAngle, next.cameraMove);
    const nextPitch =
      /worm/i.test(next.cameraAngle) ? -30 : /low/i.test(next.cameraAngle) ? -16 : /bird/i.test(next.cameraAngle) ? 32 : /high/i.test(next.cameraAngle) ? 16 : 0;
    const nextDutch = /dutch/i.test(next.cameraAngle) ? -9 : 0;
    updateShot(shot.id, { ...patch, pitchDeg: nextPitch, dutchDeg: nextDutch });
  };

  return (
    <div className="glass glass-hover flex flex-col p-3.5">
      {/* Editable Shot Header */}
      <div className="mb-2.5 flex items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-accent">
            {String(shot.number).padStart(2, '0')}
          </span>
          <input
            value={shot.title}
            onChange={(e) => updateShot(shot.id, { title: e.target.value })}
            className="min-w-0 flex-1 truncate bg-transparent text-sm font-semibold outline-none focus:underline"
            style={{ color: 'var(--text)' }}
            title="Click to edit shot title directly"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSliders(!showSliders)}
            className={`btn btn-sm px-2 ${showSliders ? 'btn-accent-soft' : 'btn-ghost'}`}
            title="Toggle inline camera & timing sliders"
          >
            <Sliders className="h-3 w-3" />
          </button>
          <button
            onClick={() => setSketchModalShot(shot)}
            className="btn btn-ghost btn-sm"
            title="Draw pose over this panel"
          >
            <PenTool className="h-3 w-3" /> Draw
          </button>
          {project.shots.length > 1 && (
            <button
              onClick={() => deleteShot(shot.id)}
              className="btn btn-ghost btn-sm px-2 hover:text-rose-400"
              title="Delete shot"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Storyboard Canvas (Supports direct drag to tilt/pan & wheel to zoom!) */}
      <div className="relative">
        <StoryboardCanvas shot={shot} project={project} onUpdateShot={updateShot} />
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        )}
      </div>

      {/* Inline Camera, Lens, Timing & Angle Sliders right on the Storyboard card! */}
      {showSliders && (
        <div className="glass-soft mt-3 space-y-2.5 p-2.5">
          {/* Row 1: 1-Tap Shot Size Pills + Camera Move Dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex gap-1">
              {CAMERA_SHOT_TYPES.map((t) => (
                <button
                  key={t.code}
                  onClick={() => changeCamPreset('shotType', t.code)}
                  title={t.name}
                  className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold transition ${
                    shot.shotType === t.code ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  {t.code}
                </button>
              ))}
            </div>
            <select
              value={shot.cameraMove}
              onChange={(e) => changeCamPreset('cameraMove', e.target.value)}
              className="sf-input w-auto py-1 pl-2 pr-6 text-[11px] font-semibold"
            >
              {CAMERA_MOVES.map((mv) => (
                <option key={mv} value={mv}>
                  {mv}
                </option>
              ))}
            </select>
          </div>

          {/* Row 2: Lens (mm) Slider */}
          <div className="flex items-center gap-2">
            <span className="w-16 font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>
              Lens <strong className="text-accent">{shot.focalLength}mm</strong>
            </span>
            <input
              type="range"
              min="14"
              max="135"
              step="1"
              value={shot.focalLength}
              onChange={(e) => updateShot(shot.id, { focalLength: Number(e.target.value) })}
              className="h-1.5 flex-1"
            />
          </div>

          {/* Row 3: Duration (Seconds) Slider */}
          <div className="flex items-center gap-2">
            <span className="w-16 font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>
              Hold <strong className="text-accent">{Number(shot.duration).toFixed(1)}s</strong>
            </span>
            <input
              type="range"
              min="0.5"
              max="8.0"
              step="0.1"
              value={shot.duration}
              onChange={(e) => updateShot(shot.id, { duration: Number(e.target.value) })}
              className="h-1.5 flex-1"
            />
          </div>

          {/* Row 4: Angle / Pitch Slider + Dutch Roll Slider */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>
                Angle <strong className="text-accent">{pitchDeg}°</strong>
              </span>
              <input
                type="range"
                min="-35"
                max="40"
                step="1"
                value={pitchDeg}
                onChange={(e) => {
                  const nextPitch = Number(e.target.value);
                  const zHeight = Number(Math.max(0.25, Math.min(5.5, 1.45 + nextPitch * 0.055)).toFixed(2));
                  const cStart = [...(shot.camStart || [0, -3.5, 1.45])];
                  const cEnd = [...(shot.camEnd || cStart)];
                  cStart[2] = zHeight;
                  cEnd[2] = zHeight;
                  updateShot(shot.id, {
                    pitchDeg: nextPitch,
                    cameraAngle: pitchToAngleLabel(nextPitch, dutchDeg),
                    camStart: cStart,
                    camEnd: cEnd
                  });
                }}
                className="h-1.5 flex-1"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>
                Dutch <strong className="text-accent">{dutchDeg}°</strong>
              </span>
              <input
                type="range"
                min="-25"
                max="25"
                step="1"
                value={dutchDeg}
                onChange={(e) => {
                  const nextDutch = Number(e.target.value);
                  updateShot(shot.id, {
                    dutchDeg: nextDutch,
                    cameraAngle: pitchToAngleLabel(pitchDeg, nextDutch)
                  });
                }}
                className="h-1.5 flex-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mode selector */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
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
          <label className="flex cursor-pointer items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-3)' }}>
            <input
              type="checkbox"
              checked={shot.refAutoFrame !== false}
              onChange={(e) => updateShot(shot.id, { refAutoFrame: e.target.checked })}
            />
            <Maximize2 className="h-3 w-3" /> Auto-frame
          </label>
        )}
      </div>

      {/* Reference strip */}
      {refs.length > 0 && (
        <div className="mt-2.5">
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
            <button
              onClick={() => updateShot(shot.id, { refId: null, refMode: 'procedural', referenceImageUrl: '' })}
              className={`flex h-9 w-12 shrink-0 items-center justify-center rounded-lg ring-1 ${
                !shot.refId ? 'ring-2 ring-[color:var(--accent)]' : 'ring-white/10'
              } bg-black/30`}
              title="No reference"
            >
              <ImageOff className="h-3.5 w-3.5 text-white/40" />
            </button>
            {refs.map((r) => (
              <button
                key={r.id}
                onClick={() =>
                  updateShot(shot.id, {
                    refId: r.id,
                    refMode: shot.refMode && shot.refMode !== 'procedural' && shot.refMode !== 'ai' ? shot.refMode : 'photo'
                  })
                }
                className={`h-9 w-12 shrink-0 overflow-hidden rounded-lg ring-1 transition ${
                  shot.refId === r.id ? 'ring-2 ring-[color:var(--accent)]' : 'ring-white/10 opacity-70 hover:opacity-100'
                }`}
                title={r.title}
              >
                <img src={r.src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Direct Inline Editable Action & Dialogue */}
      <textarea
        rows={2}
        value={shot.action}
        onChange={(e) => updateShot(shot.id, { action: e.target.value })}
        placeholder="Action & staging..."
        className="mt-2.5 w-full resize-none rounded-lg bg-transparent px-1.5 py-1 text-[12.5px] leading-relaxed outline-none focus:ring-1 focus:ring-[color:var(--accent)]"
        style={{ color: 'var(--text-2)' }}
      />
      <input
        value={shot.dialogue || ''}
        onChange={(e) => updateShot(shot.id, { dialogue: e.target.value })}
        placeholder='Dialogue / V.O. (optional)...'
        className="mt-0.5 w-full rounded-lg bg-transparent px-1.5 py-1 font-mono text-[11px] italic outline-none focus:ring-1 focus:ring-[color:var(--accent)]"
        style={{ color: 'var(--accent)' }}
      />

      <div className="mt-auto flex items-center justify-between pt-2.5">
        <button
          className="btn btn-ghost btn-sm"
          disabled={busy}
          onClick={() => generateAiBoard(shot)}
          title={
            geminiApiKey
              ? 'Generate a sketch panel with Gemini from your reference + this shot'
              : 'Add a Gemini key (top bar) to enable'
          }
        >
          <Wand2 className="h-3 w-3 text-accent" /> {shot.aiImage ? 'Regenerate AI board' : 'AI board'}
        </button>
        {shot.sketchDataUrl && (
          <button
            className="text-[11px] hover:text-rose-400"
            style={{ color: 'var(--text-3)' }}
            onClick={() => updateShot(shot.id, { sketchDataUrl: null })}
          >
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
          <a
            className="btn btn-ghost btn-sm"
            target="_blank"
            rel="noreferrer"
            href="https://livlily.blogspot.com/"
            title="Living Lines Library — Model Sheets, Storyboards & Layouts"
          >
            <ExternalLink className="h-3 w-3" /> Living Lines
          </a>
          <a
            className="btn btn-ghost btn-sm"
            target="_blank"
            rel="noreferrer"
            href="https://design.tutsplus.com/tutorials/storyboarding-part-2-lingo-camera-shots-techniques--cms-31171"
            title="Tuts+ Storyboarding Lingo & Camera Shots"
          >
            <ExternalLink className="h-3 w-3" /> Tuts+ Camera Lingo
          </a>
          <a
            className="btn btn-ghost btn-sm"
            target="_blank"
            rel="noreferrer"
            href={`https://film-grab.com/?s=${encodeURIComponent(q)}`}
          >
            <ExternalLink className="h-3 w-3" /> Film-Grab
          </a>
          <a
            className="btn btn-ghost btn-sm"
            target="_blank"
            rel="noreferrer"
            href={`https://www.pexels.com/search/${encodeURIComponent(project.title)}/`}
          >
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
