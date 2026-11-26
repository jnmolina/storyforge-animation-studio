import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Camera,
  Clock,
  Compass,
  Move,
  Sliders
} from 'lucide-react';
import { CAMERA_SHOT_TYPES, CAMERA_ANGLES, CAMERA_MOVES } from '../data/storyEngine';
import { useStudio, Panel, Field } from '../studio';
import StoryboardCanvas, { pitchToAngleLabel } from '../components/StoryboardCanvas';

const PRIME_LENSES = [18, 24, 28, 35, 50, 85, 135];
const BEAT_DURATIONS = [1.0, 1.5, 2.0, 2.5, 3.5, 5.0];

/**
 * Interactive Draggable Top-Down Blender Camera & Subject Floorplan
 * Drag Subject (Amber), Camera Start (Sky Blue), or Camera End (Emerald) directly!
 */
function InteractiveFloorplan({ shot, onUpdate }) {
  const svgRef = useRef(null);
  const [draggingNode, setDraggingNode] = useState(null); // 'subject' | 'camStart' | 'camEnd'

  const subj = shot.subjectPos || [0, 0, 0];
  const cStart = shot.camStart || [0, -3.5, 1.45];
  const cEnd = shot.camEnd || cStart;
  const focal = Number(shot.focalLength) || 35;

  // Convert pointer event to Blender X (-4.5..4.5), Y (-5.5..2.5) world meters
  const eventToWorld = (e) => {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const normX = (clientX - rect.left) / rect.width; // 0..1
    const normY = (clientY - rect.top) / rect.height; // 0..1
    const worldX = -5 + normX * 10; // viewBox X: -5 to +5
    const svgY = -6 + normY * 8; // viewBox Y: -6 to +2
    const worldY = -svgY; // Blender +Y is up on floorplan
    return [
      Number(Math.max(-4.5, Math.min(4.5, worldX)).toFixed(2)),
      Number(Math.max(-5.5, Math.min(1.8, worldY)).toFixed(2))
    ];
  };

  const handlePointerMove = (e) => {
    if (!draggingNode) return;
    e.preventDefault();
    const [wx, wy] = eventToWorld(e);
    if (draggingNode === 'subject') {
      onUpdate({ subjectPos: [wx, wy, subj[2] || 0] });
    } else if (draggingNode === 'camStart') {
      // If static locked, move camEnd with camStart
      const isStatic = shot.cameraMove === 'Static Locked';
      onUpdate({
        camStart: [wx, wy, cStart[2] ?? 1.45],
        ...(isStatic ? { camEnd: [wx, wy, cEnd[2] ?? 1.45] } : {})
      });
    } else if (draggingNode === 'camEnd') {
      onUpdate({
        camEnd: [wx, wy, cEnd[2] ?? 1.45],
        ...(shot.cameraMove === 'Static Locked' ? { cameraMove: 'Tracking Dolly' } : {})
      });
    }
  };

  const stopDrag = () => setDraggingNode(null);

  // Compute FOV cone rays from Camera Start toward Subject
  const sx = subj[0], sy = -subj[1];
  const cx = cStart[0], cy = -cStart[1];
  const ex = cEnd[0], ey = -cEnd[1];
  const dx = sx - cx, dy = sy - cy;
  const dist = Math.max(0.4, Math.hypot(dx, dy));
  const baseAng = Math.atan2(dy, dx);
  // Approximate horizontal half-FOV angle from 36mm sensor width
  const halfFov = Math.atan(18 / Math.max(14, focal));
  const coneLen = Math.min(4.5, dist * 1.05);
  const ray1X = cx + Math.cos(baseAng - halfFov) * coneLen;
  const ray1Y = cy + Math.sin(baseAng - halfFov) * coneLen;
  const ray2X = cx + Math.cos(baseAng + halfFov) * coneLen;
  const ray2Y = cy + Math.sin(baseAng + halfFov) * coneLen;

  return (
    <div className="flex h-full flex-col justify-between rounded-xl p-3" style={{ background: 'var(--panel-soft)', border: '1px solid var(--border)' }}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="eyebrow">Interactive 2D Stage Map (Drag Nodes)</span>
        <span className="font-mono text-[11px] font-bold text-accent">
          {dist.toFixed(1)}m · {focal}mm
        </span>
      </div>

      <svg
        ref={svgRef}
        viewBox="-5 -6 10 8"
        onMouseMove={handlePointerMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchMove={handlePointerMove}
        onTouchEnd={stopDrag}
        className="my-1 w-full flex-1 rounded-lg bg-[#0b0c10] ring-1 ring-white/10 select-none touch-none"
        style={{ minHeight: '175px' }}
      >
        {/* 1-meter Grid */}
        {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((g) => (
          <g key={g}>
            <line x1={g} y1="-6" x2={g} y2="2" stroke={g === 0 ? '#ffffff22' : '#ffffff0c'} strokeWidth={g === 0 ? '0.06' : '0.04'} />
            <line x1="-5" y1={g - 2} x2="5" y2={g - 2} stroke={g - 2 === 0 ? '#ffffff22' : '#ffffff0c'} strokeWidth={g - 2 === 0 ? '0.06' : '0.04'} />
          </g>
        ))}

        {/* Camera Lens FOV Cone */}
        <polygon
          points={`${cx},${cy} ${ray1X},${ray1Y} ${ray2X},${ray2Y}`}
          fill="#38BDF8"
          fillOpacity="0.14"
          stroke="#38BDF8"
          strokeOpacity="0.45"
          strokeWidth="0.05"
          strokeDasharray="0.15 0.12"
        />

        {/* Line of sight from Cam Start to Subject */}
        <line x1={cx} y1={cy} x2={sx} y2={sy} stroke="#ffffff50" strokeWidth="0.05" strokeDasharray="0.18 0.18" />

        {/* Camera Motion Path Vector (Cam Start -> Cam End) */}
        <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="#34D399" strokeWidth="0.14" strokeLinecap="round" />

        {/* Draggable Subject Target Node */}
        <g
          onMouseDown={() => setDraggingNode('subject')}
          onTouchStart={() => setDraggingNode('subject')}
          className="cursor-grab active:cursor-grabbing"
        >
          <circle cx={sx} cy={sy} r="0.6" fill="#F59E0B" fillOpacity="0.22" />
          <circle cx={sx} cy={sy} r="0.36" fill="#F59E0B" stroke="#000" strokeWidth="0.08" />
          <text x={sx} y={sy - 0.55} textAnchor="middle" fill="#FDE68A" fontSize="0.42" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
            SUBJ
          </text>
        </g>

        {/* Draggable Camera End Node */}
        <g
          onMouseDown={() => setDraggingNode('camEnd')}
          onTouchStart={() => setDraggingNode('camEnd')}
          className="cursor-grab active:cursor-grabbing"
        >
          <circle cx={ex} cy={ey} r="0.5" fill="#34D399" fillOpacity="0.2" />
          <circle cx={ex} cy={ey} r="0.28" fill="#34D399" stroke="#000" strokeWidth="0.08" />
          <text x={ex} y={ey + 0.65} textAnchor="middle" fill="#6EE7B7" fontSize="0.38" fontFamily="JetBrains Mono, monospace">
            END
          </text>
        </g>

        {/* Draggable Camera Start Node */}
        <g
          onMouseDown={() => setDraggingNode('camStart')}
          onTouchStart={() => setDraggingNode('camStart')}
          className="cursor-grab active:cursor-grabbing"
        >
          <circle cx={cx} cy={cy} r="0.55" fill="#38BDF8" fillOpacity="0.22" />
          <circle cx={cx} cy={cy} r="0.34" fill="#38BDF8" stroke="#fff" strokeWidth="0.08" />
          <text x={cx} y={cy + 0.72} textAnchor="middle" fill="#7DD3FC" fontSize="0.4" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
            CAM
          </text>
        </g>
      </svg>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>
        <span>🟡 Drag SUBJ</span>
        <span className="text-sky-400">🔵 Drag CAM Start</span>
        <span className="text-emerald-400">🟢 Drag CAM End</span>
      </div>
    </div>
  );
}

export default function ScriptStage() {
  const {
    project,
    setProject,
    activeShotIndex,
    setActiveShotIndex,
    updateShot,
    addShot,
    deleteShot,
    applySmartBlenderCoords,
    fps,
    notify
  } = useStudio();

  const [motionPreview, setMotionPreview] = useState(0);
  const [showRawCoords, setShowRawCoords] = useState(false);

  const s = project.shots?.[activeShotIndex] || project.shots?.[0];
  if (!s) return null;

  const defaultPitch =
    /worm/i.test(s.cameraAngle) ? -30 : /low/i.test(s.cameraAngle) ? -16 : /bird/i.test(s.cameraAngle) ? 32 : /high/i.test(s.cameraAngle) ? 16 : 0;
  const pitchDeg = s.pitchDeg !== undefined ? Number(s.pitchDeg) : defaultPitch;
  const dutchDeg = s.dutchDeg !== undefined ? Number(s.dutchDeg) : (/dutch/i.test(s.cameraAngle) ? -9 : 0);

  // Compute current camera distance in meters
  const subj = s.subjectPos || [0, 0, 0];
  const cStart = s.camStart || [0, -3.5, 1.45];
  const camDist = Number(Math.max(0.8, Math.hypot(subj[0] - cStart[0], subj[1] - cStart[1])).toFixed(2));
  const camHeightZ = Number((cStart[2] ?? 1.45).toFixed(2));

  const changeCamPreset = (field, value) => {
    const next = {
      shotType: s.shotType,
      cameraAngle: s.cameraAngle,
      cameraMove: s.cameraMove,
      [field]: value
    };
    const coordsPatch = applySmartBlenderCoords(s, next.shotType, next.cameraAngle, next.cameraMove);
    const nextPitch =
      /worm/i.test(next.cameraAngle) ? -30 : /low/i.test(next.cameraAngle) ? -16 : /bird/i.test(next.cameraAngle) ? 32 : /high/i.test(next.cameraAngle) ? 16 : 0;
    const nextDutch = /dutch/i.test(next.cameraAngle) ? -9 : 0;
    updateShot(s.id, {
      ...coordsPatch,
      pitchDeg: nextPitch,
      dutchDeg: nextDutch
    });
  };

  // Adjust camera distance slider smoothly (moves camStart along its ray from subject)
  const handleDistanceSlide = (newDist) => {
    const dx = cStart[0] - subj[0];
    const dy = cStart[1] - subj[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = Number((subj[0] + (dx / len) * newDist).toFixed(2));
    const ny = Number((subj[1] + (dy / len) * newDist).toFixed(2));
    const shotCode =
      newDist <= 1.3 ? 'ECU' : newDist <= 2.0 ? 'CU' : newDist <= 3.3 ? 'MS' : newDist <= 4.9 ? 'WS' : 'EWS';
    const typeSpec = CAMERA_SHOT_TYPES.find((t) => t.code === shotCode) || CAMERA_SHOT_TYPES[2];
    updateShot(s.id, {
      shotType: shotCode,
      shotTypeName: typeSpec.name,
      camStart: [nx, ny, cStart[2] ?? 1.45],
      ...(s.cameraMove === 'Static Locked' ? { camEnd: [nx, ny, cStart[2] ?? 1.45] } : {})
    });
  };

  // Adjust Pitch / Elevation angle slider (-35° to +40°) and sync Blender Z height
  const handlePitchSlide = (nextPitch) => {
    const zHeight = Number(Math.max(0.25, Math.min(5.5, 1.45 + nextPitch * 0.055)).toFixed(2));
    const nextStart = [...cStart];
    const nextEnd = [...(s.camEnd || cStart)];
    nextStart[2] = zHeight;
    nextEnd[2] = zHeight;
    updateShot(s.id, {
      pitchDeg: nextPitch,
      cameraAngle: pitchToAngleLabel(nextPitch, dutchDeg),
      camStart: nextStart,
      camEnd: nextEnd
    });
  };

  // Adjust Dutch Roll angle slider (-25° to +25°)
  const handleDutchSlide = (nextDutch) => {
    updateShot(s.id, {
      dutchDeg: nextDutch,
      cameraAngle: pitchToAngleLabel(pitchDeg, nextDutch)
    });
  };

  // Reorder or Duplicate shots
  const moveShotOrder = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= project.shots.length) return;
    const copy = [...project.shots];
    const [item] = copy.splice(idx, 1);
    copy.splice(target, 0, item);
    const renumbered = copy.map((sh, i) => ({ ...sh, number: i + 1 }));
    setProject((p) => ({ ...p, shots: renumbered }));
    setActiveShotIndex(target);
  };

  const duplicateShot = (idx) => {
    const orig = project.shots[idx];
    const clone = {
      ...JSON.parse(JSON.stringify(orig)),
      id: `shot-${Date.now()}`,
      title: `${orig.title} (Copy)`
    };
    const copy = [...project.shots];
    copy.splice(idx + 1, 0, clone);
    const renumbered = copy.map((sh, i) => ({ ...sh, number: i + 1 }));
    setProject((p) => ({ ...p, shots: renumbered }));
    setActiveShotIndex(idx + 1);
    notify(`Duplicated SH${String(orig.number).padStart(2, '0')}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left Column: Shot List with Quick Reorder, Duplicate & Duration Nudge */}
      <div className="lg:col-span-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="eyebrow">{project.shots.length} shots · {(project.shots || []).reduce((a, x) => a + Number(x.duration), 0).toFixed(1)}s</div>
            <h3 className="h-display text-lg">Shot Breakdown</h3>
          </div>
          <button onClick={addShot} className="btn btn-primary btn-sm">
            <Plus className="h-3.5 w-3.5" /> Add Shot
          </button>
        </div>

        <div className="max-h-[820px] space-y-2 overflow-y-auto pr-1 stagger">
          {project.shots.map((shot, idx) => {
            const on = idx === activeShotIndex;
            return (
              <div
                key={shot.id}
                onClick={() => setActiveShotIndex(idx)}
                className={`glass glass-hover group flex cursor-pointer gap-3 rounded-xl p-3 ${on ? 'ring-accent' : ''}`}
              >
                <div className="w-28 shrink-0">
                  <StoryboardCanvas
                    shot={shot}
                    project={project}
                    showGuides={false}
                    showCameraArrows={false}
                    showBadges={false}
                    className="rounded-lg"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[11px] font-bold text-accent">
                      SH{String(shot.number).padStart(2, '0')}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-70 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveShotOrder(idx, -1);
                        }}
                        disabled={idx === 0}
                        className="rounded p-1 hover:bg-white/10 disabled:opacity-20"
                        title="Move shot up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveShotOrder(idx, 1);
                        }}
                        disabled={idx === project.shots.length - 1}
                        className="rounded p-1 hover:bg-white/10 disabled:opacity-20"
                        title="Move shot down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateShot(idx);
                        }}
                        className="rounded p-1 hover:bg-white/10"
                        title="Duplicate shot"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteShot(shot.id);
                        }}
                        className="rounded p-1 hover:text-rose-400"
                        title="Delete shot"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="truncate text-sm font-semibold">{shot.title}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <span className="chip">{shot.shotType}</span>
                    <span className="chip">{shot.focalLength}mm</span>
                    <span className="chip">{Number(shot.duration).toFixed(1)}s</span>
                    <span className="chip">{shot.cameraMove}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Interactive Director Viewfinder + Sliders + Draggable 2D Stage */}
      <div className="space-y-4 lg:col-span-8 animate-rise" key={s.id}>
        {/* Top Viewfinder + Interactive 2D Floorplan */}
        <Panel className="p-4">
          <div className="grid gap-4 md:grid-cols-12">
            <div className="space-y-2 md:col-span-7">
              <div className="flex items-center justify-between">
                <span className="eyebrow">
                  Interactive Director Viewfinder (Drag to Tilt/Pan · Wheel to Zoom)
                </span>
                {(s.frameOffsetX || s.pitchDeg !== undefined || s.dutchDeg) && (
                  <button
                    onClick={() =>
                      updateShot(s.id, {
                        frameOffsetX: 0,
                        frameOffsetY: 0,
                        pitchDeg: 0,
                        dutchDeg: 0,
                        cameraAngle: 'Eye-Level'
                      })
                    }
                    className="flex items-center gap-1 font-mono text-[10px] text-accent hover:underline"
                  >
                    <RotateCcw className="h-2.5 w-2.5" /> Reset View
                  </button>
                )}
              </div>

              <StoryboardCanvas
                shot={s}
                project={project}
                animProgress={motionPreview}
                onUpdateShot={updateShot}
              />

              {/* Motion Preview Scrubber right under viewfinder */}
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-1.5" style={{ background: 'var(--panel-soft)', border: '1px solid var(--border)' }}>
                <span className="font-mono text-[10.5px] font-semibold text-accent">
                  Test Camera Move ({s.cameraMove})
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={motionPreview}
                  onChange={(e) => setMotionPreview(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-9 text-right font-mono text-[10.5px]" style={{ color: 'var(--text-3)' }}>
                  {Math.round(motionPreview * 100)}%
                </span>
              </div>
            </div>

            <div className="md:col-span-5">
              <InteractiveFloorplan
                shot={s}
                onUpdate={(patch) => updateShot(s.id, patch)}
              />
            </div>
          </div>
        </Panel>

        {/* Tactile Camera & Timing Sliders Panel */}
        <Panel className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-1 items-center gap-2">
              <span className="chip chip-accent font-bold">SH{String(s.number).padStart(2, '0')}</span>
              <input
                value={s.title}
                onChange={(e) => updateShot(s.id, { title: e.target.value })}
                placeholder="Shot title..."
                className="h-display flex-1 bg-transparent text-lg outline-none"
              />
            </div>
            <span className="chip">
              Blender: SF_Cam_SH{String(s.number).padStart(2, '0')}_{s.shotType}
            </span>
          </div>

          {/* 1. Framing / Shot Size Pills + Distance Slider */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass-soft p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="sf-label mb-0 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-accent" /> Framing & Camera Distance
                </span>
                <span className="font-mono text-xs font-bold text-accent">
                  {s.shotType} · {camDist}m
                </span>
              </div>
              <div className="mb-2.5 flex flex-wrap gap-1">
                {CAMERA_SHOT_TYPES.map((t) => (
                  <button
                    key={t.code}
                    onClick={() => changeCamPreset('shotType', t.code)}
                    title={t.name}
                    className={`btn btn-sm flex-1 py-1 font-mono ${
                      s.shotType === t.code ? 'btn-primary' : 'btn-ghost'
                    }`}
                  >
                    {t.code}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>ECU 0.9m</span>
                <input
                  type="range"
                  min="0.9"
                  max="6.5"
                  step="0.1"
                  value={camDist}
                  onChange={(e) => handleDistanceSlide(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>EWS 6.5m</span>
              </div>
            </div>

            {/* 2. Lens Focal Length Slider + Prime Lens Buttons */}
            <div className="glass-soft p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="sf-label mb-0 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-accent" /> Lens Focal Length (Zoom)
                </span>
                <span className="font-mono text-xs font-bold text-accent">
                  {s.focalLength}mm {s.focalLength <= 24 ? '(Wide)' : s.focalLength >= 75 ? '(Tele/Macro)' : '(Standard)'}
                </span>
              </div>
              <input
                type="range"
                min="14"
                max="135"
                step="1"
                value={s.focalLength}
                onChange={(e) => updateShot(s.id, { focalLength: Number(e.target.value) })}
                className="w-full"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
                <span className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>Primes:</span>
                {PRIME_LENSES.map((mm) => (
                  <button
                    key={mm}
                    onClick={() => updateShot(s.id, { focalLength: mm })}
                    className={`rounded px-2 py-0.5 font-mono text-[10.5px] transition ${
                      Number(s.focalLength) === mm ? 'btn-accent-soft font-bold' : 'btn-ghost'
                    }`}
                  >
                    {mm}mm
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Shot Duration Slider (Seconds & Frames) */}
            <div className="glass-soft p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="sf-label mb-0 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-accent" /> Hold Duration (Seconds & Frames)
                </span>
                <span className="font-mono text-xs font-bold text-accent">
                  {Number(s.duration).toFixed(1)}s · {Math.round(Number(s.duration) * fps)}f @{fps}fps
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.1"
                value={s.duration}
                onChange={(e) => updateShot(s.id, { duration: Number(e.target.value) })}
                className="w-full"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
                <span className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>Beats:</span>
                {BEAT_DURATIONS.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => updateShot(s.id, { duration: sec })}
                    className={`rounded px-2 py-0.5 font-mono text-[10.5px] transition ${
                      Number(s.duration) === sec ? 'btn-accent-soft font-bold' : 'btn-ghost'
                    }`}
                  >
                    {sec.toFixed(1)}s
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Camera Angle (Elevation Pitch Slider + Dutch Roll Slider) */}
            <div className="glass-soft p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="sf-label mb-0 flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-accent" /> Angle, Pitch & Dutch Tilt
                </span>
                <span className="font-mono text-xs font-bold text-accent">
                  {s.cameraAngle} ({pitchDeg > 0 ? `+${pitchDeg}` : pitchDeg}° · Z {camHeightZ}m)
                </span>
              </div>

              {/* Pitch Slider */}
              <div className="flex items-center gap-2">
                <span className="w-14 font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>Pitch {pitchDeg}°</span>
                <input
                  type="range"
                  min="-35"
                  max="40"
                  step="1"
                  value={pitchDeg}
                  onChange={(e) => handlePitchSlide(Number(e.target.value))}
                  className="flex-1"
                />
              </div>

              {/* Dutch Tilt Slider */}
              <div className="mt-1.5 flex items-center gap-2">
                <span className="w-14 font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>Dutch {dutchDeg}°</span>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  step="1"
                  value={dutchDeg}
                  onChange={(e) => handleDutchSlide(Number(e.target.value))}
                  className="flex-1"
                />
                {dutchDeg !== 0 && (
                  <button
                    onClick={() => handleDutchSlide(0)}
                    className="font-mono text-[10px] text-accent hover:underline"
                  >
                    Level
                  </button>
                )}
              </div>

              {/* Quick Angle Preset Buttons */}
              <div className="mt-2 flex flex-wrap gap-1">
                {CAMERA_ANGLES.map((ang) => (
                  <button
                    key={ang}
                    onClick={() => changeCamPreset('cameraAngle', ang)}
                    className={`rounded px-2 py-0.5 font-mono text-[10px] transition ${
                      s.cameraAngle === ang ? 'btn-accent-soft font-bold' : 'btn-ghost'
                    }`}
                  >
                    {ang.replace('Low ', '').replace('High ', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. 1-Tap Camera Movement Pills */}
          <div className="glass-soft p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="sf-label mb-0 flex items-center gap-1.5">
                <Move className="h-3.5 w-3.5 text-accent" /> Camera Movement (Auto-sets Start → End Keyframes)
              </span>
              <span className="font-mono text-xs font-bold text-accent">{s.cameraMove}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CAMERA_MOVES.map((mv) => (
                <button
                  key={mv}
                  onClick={() => changeCamPreset('cameraMove', mv)}
                  className={`btn btn-sm ${s.cameraMove === mv ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {mv}
                </button>
              ))}
            </div>
          </div>

          {/* Screenplay Action, Dialogue, Sound & Animation Notes */}
          <div className="space-y-3">
            <Field label="Action & Staging Direction">
              <textarea
                rows={2}
                className="sf-input resize-none"
                value={s.action}
                onChange={(e) => updateShot(s.id, { action: e.target.value })}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Dialogue / Monologue / V.O.">
                <input
                  className="sf-input"
                  value={s.dialogue}
                  onChange={(e) => updateShot(s.id, { dialogue: e.target.value })}
                />
              </Field>
              <Field label="Foley / Sound Cue">
                <input
                  className="sf-input"
                  value={s.soundCue}
                  onChange={(e) => updateShot(s.id, { soundCue: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Animator Breakdown & Camera Note (Line of Action, Holds, Overshoot)">
              <input
                className="sf-input"
                value={s.notes || ''}
                onChange={(e) => updateShot(s.id, { notes: e.target.value })}
              />
            </Field>
          </div>

          {/* Optional Advanced Raw Blender XYZ Coordinates Toggle */}
          <div>
            <button
              onClick={() => setShowRawCoords(!showRawCoords)}
              className="font-mono text-[11px] text-accent hover:underline"
            >
              {showRawCoords ? '▾ Hide raw Blender XYZ coordinates' : '▸ Fine-tune raw Blender 3D coordinates [X, Y, Z]'}
            </button>
            {showRawCoords && (
              <div className="glass-soft mt-2 grid gap-3 p-3.5 sm:grid-cols-3">
                {[
                  ['Cam Start [X, Y, Z] (m)', 'camStart', s.camStart || [0, -3.5, 1.45]],
                  ['Cam End [X, Y, Z] (m)', 'camEnd', s.camEnd || [0, -3.0, 1.45]],
                  ['Subject Mark [X, Y, Z] (m)', 'subjectPos', s.subjectPos || [0, 0, 0]]
                ].map(([lbl, key, vec]) => (
                  <div key={key}>
                    <span className="sf-label">{lbl}</span>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((a) => (
                        <input
                          key={a}
                          type="number"
                          step="0.2"
                          value={vec[a] ?? 0}
                          onChange={(e) => {
                            const n = [...vec];
                            n[a] = Number(e.target.value);
                            updateShot(s.id, { [key]: n });
                          }}
                          className="sf-input px-1.5 py-1 text-center font-mono text-xs"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
