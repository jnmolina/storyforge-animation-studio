import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { CAMERA_SHOT_TYPES, CAMERA_ANGLES, CAMERA_MOVES } from '../data/storyEngine';
import { useStudio, Panel, Field } from '../studio';
import StoryboardCanvas from '../components/StoryboardCanvas';

function Vec({ label, value = [0, 0, 0], color, onChange }) {
  return (
    <div>
      <span className="sf-label">{label}</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((a) => (
          <input
            key={a}
            type="number"
            step="0.2"
            value={value[a] ?? 0}
            onChange={(e) => {
              const n = [...value];
              n[a] = Number(e.target.value);
              onChange(n);
            }}
            className="sf-input px-1.5 py-1.5 text-center font-mono text-xs"
            style={{ color }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ScriptStage() {
  const { project, activeShotIndex, setActiveShotIndex, updateShot, addShot, deleteShot, applySmartBlenderCoords } = useStudio();
  const s = project.shots?.[activeShotIndex] || project.shots?.[0];

  const changeCam = (field, value) => {
    const next = { shotType: s.shotType, cameraAngle: s.cameraAngle, cameraMove: s.cameraMove, [field]: value };
    updateShot(s.id, applySmartBlenderCoords(s, next.shotType, next.cameraAngle, next.cameraMove));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Shot list */}
      <div className="lg:col-span-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="eyebrow">{project.shots.length} shots</div>
            <h3 className="h-display text-lg">Shot list</h3>
          </div>
          <button onClick={addShot} className="btn btn-primary btn-sm">
            <Plus className="h-3.5 w-3.5" /> Shot
          </button>
        </div>
        <div className="max-h-[720px] space-y-2 overflow-y-auto pr-1 stagger">
          {project.shots.map((shot, idx) => {
            const on = idx === activeShotIndex;
            return (
              <div
                key={shot.id}
                onClick={() => setActiveShotIndex(idx)}
                className={`glass glass-hover group flex cursor-pointer gap-3 rounded-2xl p-3 ${on ? 'ring-accent' : ''}`}
              >
                <div className="w-28 shrink-0">
                  <StoryboardCanvas shot={shot} project={project} showGuides={false} showCameraArrows={false} showBadges={false} className="rounded-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-accent">SH{String(shot.number).padStart(2, '0')}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteShot(shot.id);
                      }}
                      className="text-white/0 transition group-hover:text-white/30 hover:!text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="truncate text-sm font-semibold text-white">{shot.title}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="chip">{shot.shotType}</span>
                    <span className="chip">{shot.focalLength}mm</span>
                    <span className="chip">{shot.duration}s</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspector */}
      {s && (
        <div className="space-y-5 lg:col-span-8 animate-rise" key={s.id}>
          <Panel className="p-4">
            <div className="grid gap-4 md:grid-cols-12">
              <div className="md:col-span-8">
                <StoryboardCanvas shot={s} project={project} />
              </div>
              <div className="flex flex-col md:col-span-4">
                <div className="eyebrow mb-2 flex justify-between">
                  <span>Top-down floorplan</span>
                  <span className="text-accent">{s.focalLength}mm</span>
                </div>
                <svg viewBox="-5 -6 10 8" className="w-full flex-1 rounded-2xl bg-black/40 ring-1 ring-white/10">
                  {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((g) => (
                    <g key={g}>
                      <line x1={g} y1="-6" x2={g} y2="2" stroke="#ffffff10" strokeWidth="0.04" />
                      <line x1="-5" y1={g - 2} x2="5" y2={g - 2} stroke="#ffffff10" strokeWidth="0.04" />
                    </g>
                  ))}
                  <circle cx={s.subjectPos?.[0] || 0} cy={-(s.subjectPos?.[1] || 0)} r="0.45" fill="var(--accent)" fillOpacity="0.25" stroke="var(--accent)" strokeWidth="0.1" />
                  <line x1={s.camStart?.[0] || 0} y1={-(s.camStart?.[1] || 0)} x2={s.subjectPos?.[0] || 0} y2={-(s.subjectPos?.[1] || 0)} stroke="#ffffff60" strokeWidth="0.06" strokeDasharray="0.2 0.2" />
                  <line x1={s.camStart?.[0] || 0} y1={-(s.camStart?.[1] || 0)} x2={s.camEnd?.[0] || 0} y2={-(s.camEnd?.[1] || 0)} stroke="#38BDF8" strokeWidth="0.14" />
                  <circle cx={s.camStart?.[0] || 0} cy={-(s.camStart?.[1] || 0)} r="0.3" fill="#38BDF8" />
                  <circle cx={s.camEnd?.[0] || 0} cy={-(s.camEnd?.[1] || 0)} r="0.2" fill="#34D399" />
                </svg>
                <div className="mt-2 flex justify-between font-mono text-[10px] text-white/40">
                  <span>● subject</span>
                  <span className="text-sky-300">● cam start</span>
                  <span className="text-emerald-300">● end</span>
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="space-y-4">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-white/20" />
              <span className="font-mono text-xs font-bold text-accent">SH{String(s.number).padStart(2, '0')}</span>
              <input value={s.title} onChange={(e) => updateShot(s.id, { title: e.target.value })} className="h-display flex-1 bg-transparent text-xl outline-none" />
              <span className="chip hidden md:inline-flex">SF_Cam_SH{String(s.number).padStart(2, '0')}_{s.shotType}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-5">
              <Field label="Framing">
                <select className="sf-input" value={s.shotType} onChange={(e) => changeCam('shotType', e.target.value)}>
                  {CAMERA_SHOT_TYPES.map((t) => (
                    <option key={t.code} value={t.code}>{t.code} — {t.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Angle">
                <select className="sf-input" value={s.cameraAngle} onChange={(e) => changeCam('cameraAngle', e.target.value)}>
                  {CAMERA_ANGLES.map((a) => <option key={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="Move">
                <select className="sf-input" value={s.cameraMove} onChange={(e) => changeCam('cameraMove', e.target.value)}>
                  {CAMERA_MOVES.map((m) => <option key={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Lens mm">
                <input type="number" className="sf-input font-mono" value={s.focalLength} onChange={(e) => updateShot(s.id, { focalLength: Number(e.target.value) })} />
              </Field>
              <Field label="Seconds">
                <input type="number" step="0.1" className="sf-input font-mono" value={s.duration} onChange={(e) => updateShot(s.id, { duration: Number(e.target.value) })} />
              </Field>
            </div>

            <Field label="Action & staging">
              <textarea rows={2} className="sf-input resize-none" value={s.action} onChange={(e) => updateShot(s.id, { action: e.target.value })} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Dialogue / V.O.">
                <input className="sf-input text-amber-100" value={s.dialogue} onChange={(e) => updateShot(s.id, { dialogue: e.target.value })} />
              </Field>
              <Field label="Sound cue">
                <input className="sf-input text-sky-100" value={s.soundCue} onChange={(e) => updateShot(s.id, { soundCue: e.target.value })} />
              </Field>
            </div>
            <Field label="Animation note">
              <input className="sf-input" value={s.notes || ''} onChange={(e) => updateShot(s.id, { notes: e.target.value })} />
            </Field>

            <div className="glass-soft grid gap-3 p-3.5 sm:grid-cols-3">
              <Vec label="Cam start (m, Z-up)" value={s.camStart} color="#7DD3FC" onChange={(v) => updateShot(s.id, { camStart: v })} />
              <Vec label="Cam end" value={s.camEnd} color="#6EE7B7" onChange={(v) => updateShot(s.id, { camEnd: v })} />
              <Vec label="Subject mark" value={s.subjectPos} color="#FCD34D" onChange={(v) => updateShot(s.id, { subjectPos: v })} />
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
