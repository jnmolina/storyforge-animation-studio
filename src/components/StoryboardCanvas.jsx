import React from 'react';
import { resolveMood } from '../data/storyEngine';

// Framing crop applied to a user's reference image per shot type ("auto-frame").
export const REF_FRAME_SCALE = { EWS: 1, WS: 1.05, OTS: 1.2, MS: 1.35, CU: 1.8, ECU: 2.6 };

export const REF_MODES = [
  { id: 'procedural', label: 'Procedural', hint: 'Auto-drawn staging board' },
  { id: 'photo', label: 'Ref Photo', hint: 'Your image, auto-framed per shot type' },
  { id: 'sketch', label: 'Ref Sketch', hint: 'Your image converted to pencil line-art' },
  { id: 'ai', label: 'AI Board', hint: 'Gemini draws the panel from your ref + script' }
];

// Works out which image (if any) a panel should be drawn from.
export function getShotImage(shot, project) {
  const ref = shot.refId ? (project?.references || []).find((r) => r.id === shot.refId) : null;
  const refSrc = ref?.src || shot.referenceImageUrl || null;
  let mode = shot.refMode || (refSrc ? 'photo' : 'procedural');
  if (mode === 'ai') {
    if (shot.aiImage) return { mode: 'ai', src: shot.aiImage, ref };
    mode = refSrc ? 'photo' : 'procedural';
  }
  if ((mode === 'photo' || mode === 'sketch') && !refSrc) mode = 'procedural';
  return { mode, src: mode === 'procedural' ? null : refSrc, ref };
}

/**
 * Pure SVG storyboard frame (640x360). Exported separately so the Export Center
 * can rasterize identical panels to PNG offline.
 */
export function StoryboardSvg({
  shot,
  project,
  moodOverride,
  showGuides = true,
  showCameraArrows = true,
  animProgress = 0
}) {
  const moodKey = moodOverride || project?.moodKey || 'warm';
  const mood = resolveMood(project, moodKey);
  const palette = mood.palette;
  const hero = project?.characters?.[0] || { name: 'Hero', colorHex: '#F59E0B' };
  const secondChar = project?.characters?.[1] || null;
  const text = `${shot.action || ''} ${project?.title || ''}`;
  const isChase = project?.tier === 'kinetic' || /cop|siren|alley|chase|cruiser/i.test(text);
  const isShoe = /shoe|lace|knot|boot|foot/i.test(`${shot.action} ${shot.title}`);
  const uid = `${String(shot.id).replace(/[^a-zA-Z0-9_-]/g, '')}-${moodKey}`;
  const { mode, src, ref } = getShotImage(shot, project);

  const scaleMap = { EWS: 0.48, WS: 0.75, OTS: 1.05, MS: 1.25, CU: 1.95, ECU: 2.75 };
  const baseScale = scaleMap[shot.shotType] || 1.15;

  let panX = 0, panY = 0, zoomMult = 1;
  if (animProgress > 0) {
    if (/push/i.test(shot.cameraMove)) zoomMult = 1 + animProgress * 0.18;
    if (/pull/i.test(shot.cameraMove)) zoomMult = 1.18 - animProgress * 0.18;
    if (/pan|dolly|follow|orbit/i.test(shot.cameraMove)) panX = (animProgress - 0.5) * 36;
    if (/crane/i.test(shot.cameraMove)) panY = (0.5 - animProgress) * 28;
  }
  const finalScale = baseScale * zoomMult;
  const horizonY = /low|worm/i.test(shot.cameraAngle) ? 235 : /high|bird/i.test(shot.cameraAngle) ? 110 : 175;
  const dutchAngle = /dutch/i.test(shot.cameraAngle) ? -7 : 0;

  // Reference image framing
  const focus = ref?.focus || { x: 50, y: 45 };
  const refScale =
    mode === 'ai' || shot.refAutoFrame === false ? zoomMult : (REF_FRAME_SCALE[shot.shotType] || 1.2) * zoomMult;
  const cx = (focus.x / 100) * 640;
  const cy = (focus.y / 100) * 360;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360" className="block h-full w-full">
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette[4]} />
          <stop offset="60%" stopColor={palette[3]} />
          <stop offset="100%" stopColor={palette[2]} stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id={`ground-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette[3]} />
          <stop offset="100%" stopColor={palette[4]} />
        </linearGradient>
        <radialGradient id={`key-${uid}`} cx="75%" cy="22%" r="60%">
          <stop offset="0%" stopColor={palette[0]} stopOpacity="0.48" />
          <stop offset="50%" stopColor={palette[1]} stopOpacity="0.14" />
          <stop offset="100%" stopColor={palette[4]} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`vig-${uid}`} cx="50%" cy="50%" r="75%">
          <stop offset="60%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
        {/* Pencil line-art filter: grayscale -> edge detect -> invert to paper */}
        <filter id={`sketch-${uid}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" result="g" />
          <feGaussianBlur in="g" stdDeviation="0.7" result="b" />
          <feConvolveMatrix in="b" order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" result="e" />
          <feComponentTransfer in="e">
            <feFuncR type="linear" slope="-3.2" intercept="1" />
            <feFuncG type="linear" slope="-3.2" intercept="1" />
            <feFuncB type="linear" slope="-3.2" intercept="1" />
          </feComponentTransfer>
        </filter>
      </defs>

      <g transform={`rotate(${dutchAngle} 320 180)`}>
        {mode !== 'procedural' && src ? (
          <g>
            <rect x="-40" y="-40" width="720" height="440" fill={mode === 'sketch' ? '#F4EFE4' : '#000'} />
            <g transform={`translate(${cx + panX} ${cy + panY}) scale(${refScale}) translate(${-cx} ${-cy})`}>
              <image
                href={src}
                x={dutchAngle ? -40 : 0}
                y={dutchAngle ? -40 : 0}
                width={dutchAngle ? 720 : 640}
                height={dutchAngle ? 440 : 360}
                preserveAspectRatio="xMidYMid slice"
                filter={mode === 'sketch' ? `url(#sketch-${uid})` : undefined}
              />
            </g>
            {mode === 'sketch' && (
              <rect x="-40" y="-40" width="720" height="440" fill={palette[1]} opacity="0.12" style={{ mixBlendMode: 'multiply' }} />
            )}
          </g>
        ) : (
          <g>
            <rect x="-40" y="-40" width="720" height="440" fill={`url(#sky-${uid})`} />
            <polygon points={`-40,${horizonY} 680,${horizonY} 720,400 -80,400`} fill={`url(#ground-${uid})`} />
            {[80, 180, 280, 360, 460, 560].map((x, idx) => (
              <line key={idx} x1="320" y1={horizonY} x2={(x - 320) * 2.4 + 320} y2="390" stroke={palette[1]} strokeOpacity="0.16" strokeWidth="1.5" />
            ))}
            <line x1="-40" y1={horizonY} x2="680" y2={horizonY} stroke={palette[1]} strokeOpacity="0.35" strokeWidth="1.5" />
            <rect x="-40" y="-40" width="720" height="440" fill={`url(#key-${uid})`} />

            {isChase ? (
              <g opacity="0.65">
                <polygon points="-20,0 180,0 130,360 -20,360" fill={palette[4]} opacity="0.7" />
                <polygon points="490,0 660,0 660,360 520,360" fill={palette[4]} opacity="0.7" />
                <circle cx="190" cy={horizonY - 10} r="65" fill="#EF4444" opacity="0.28" />
                <circle cx="430" cy={horizonY - 10} r="65" fill="#3B82F6" opacity="0.28" />
                <g stroke={palette[1]} strokeOpacity="0.4" strokeWidth="2.5">
                  <line x1="505" y1="20" x2="505" y2="270" />
                  <line x1="535" y1="20" x2="535" y2="270" />
                  {[50, 85, 120, 155, 190, 225, 260].map((ry) => (
                    <line key={ry} x1="505" y1={ry} x2="535" y2={ry} />
                  ))}
                </g>
              </g>
            ) : (
              <g opacity="0.55">
                <polygon points={`440,35 555,35 555,${horizonY + 45} 440,${horizonY + 45}`} fill={palette[0]} opacity="0.24" stroke={palette[1]} strokeWidth="2" />
                <polygon points={`440,${horizonY + 45} 555,${horizonY + 45} 640,360 360,360`} fill={palette[0]} opacity="0.15" />
                <rect x="110" y={horizonY + 15} width="175" height="32" rx="4" fill={palette[3]} stroke={palette[1]} strokeOpacity="0.4" />
              </g>
            )}

            <g transform={`translate(${320 + panX}, ${(shot.shotType === 'ECU' ? 210 : shot.shotType === 'CU' ? 245 : 235) + panY}) scale(${finalScale})`}>
              {secondChar && (
                <g transform="translate(-115, -35) scale(0.72)" opacity="0.85">
                  <rect x="-38" y="-45" width="76" height="45" rx="8" fill={secondChar.colorHex || '#F43F5E'} stroke={palette[0]} strokeWidth="2" />
                  <circle cx="-22" cy="-20" r="7" fill="#FEF08A" />
                  <circle cx="22" cy="-20" r="7" fill="#FEF08A" />
                  <rect x="-26" y="-53" width="24" height="7" rx="3" fill="#EF4444" />
                  <rect x="2" y="-53" width="24" height="7" rx="3" fill="#3B82F6" />
                </g>
              )}
              {shot.shotType === 'ECU' && isShoe ? (
                <g transform="translate(0, -15)">
                  <path d="M -75,20 Q -70,-22 -20,-24 L 35,-8 Q 75,-4 82,20 L 82,36 L -75,36 Z" fill={palette[3]} stroke={palette[0]} strokeWidth="2.5" />
                  <rect x="-75" y="28" width="157" height="10" rx="4" fill={palette[0]} opacity="0.9" />
                  <path d="M -45,-38 L -5,-12 M 5,-14 L 48,-40" stroke={palette[0]} strokeWidth="3.5" strokeLinecap="round" />
                  <g stroke="#F59E0B" strokeWidth="2">
                    <line x1="0" y1="-22" x2="0" y2="-36" />
                    <line x1="-10" y1="-20" x2="-20" y2="-30" />
                    <line x1="10" y1="-20" x2="20" y2="-30" />
                    <circle cx="0" cy="-14" r="5" fill="#FEF08A" />
                  </g>
                </g>
              ) : (
                <g>
                  <ellipse cx="0" cy="42" rx="42" ry="11" fill="#000000" opacity="0.45" />
                  <path
                    d={isChase ? 'M -24,-42 L 28,-48 L 36,16 L -18,22 Z' : 'M -28,-44 C -28,-54 28,-54 28,-44 L 32,20 L -32,20 Z'}
                    fill={hero.colorHex || '#F59E0B'}
                    stroke={palette[0]}
                    strokeWidth="2.2"
                  />
                  <path
                    d={isChase ? 'M -10,18 L -32,44 M 18,16 L 44,38 M 22,-36 L 56,-22' : 'M -14,20 L -18,44 M 14,20 L 18,44 M 22,-32 L 42,-8'}
                    stroke={palette[0]}
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <g transform={isChase ? 'translate(14, -74) rotate(12)' : 'translate(4, -74)'}>
                    <circle cx="0" cy="0" r="23" fill={palette[1]} stroke={palette[4]} strokeWidth="2.5" />
                    <path d="M -22,-3 Q 6,-9 22,-2 M 5,-22 Q 11,0 5,22" fill="none" stroke={palette[4]} strokeWidth="1.6" strokeOpacity="0.65" />
                    <circle cx="3" cy="-4" r="2.6" fill={palette[4]} />
                    <circle cx="13" cy="-4" r="2.6" fill={palette[4]} />
                  </g>
                </g>
              )}
            </g>

            {shot.shotType === 'OTS' && (
              <path d="M -40,380 Q -20,175 95,165 Q 145,160 175,380 Z" fill={palette[4]} opacity="0.92" stroke={palette[2]} strokeWidth="2" />
            )}
          </g>
        )}

        {showCameraArrows && shot.cameraMove && shot.cameraMove !== 'Static Locked' && (
          <g opacity="0.9">
            {/push/i.test(shot.cameraMove) && (
              <g stroke="#FBBF24" strokeWidth="3" fill="none">
                <path d="M 75,295 L 155,240" />
                <polygon points="155,240 140,242 149,254" fill="#FBBF24" />
                <path d="M 565,295 L 485,240" />
                <polygon points="485,240 491,254 500,242" fill="#FBBF24" />
              </g>
            )}
            {/pull/i.test(shot.cameraMove) && (
              <g stroke="#38BDF8" strokeWidth="3" fill="none">
                <path d="M 155,240 L 75,295" />
                <polygon points="75,295 90,293 81,281" fill="#38BDF8" />
                <path d="M 485,240 L 565,295" />
                <polygon points="565,295 559,281 550,293" fill="#38BDF8" />
              </g>
            )}
            {/pan|dolly|follow|orbit/i.test(shot.cameraMove) && (
              <g stroke="#FB7185" strokeWidth="3.5" fill="none">
                <path d="M 45,180 Q 110,165 160,180" />
                <polygon points="165,180 150,172 150,188" fill="#FB7185" />
              </g>
            )}
            {/crane/i.test(shot.cameraMove) && (
              <g stroke="#A78BFA" strokeWidth="3.5" fill="none">
                <path d="M 580,275 L 580,155" />
                <polygon points="580,150 572,165 588,165" fill="#A78BFA" />
              </g>
            )}
          </g>
        )}
      </g>

      <rect x="0" y="0" width="640" height="360" fill={`url(#vig-${uid})`} pointerEvents="none" />

      {showGuides && (
        <g stroke="#FFFFFF" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="4 4">
          <line x1="213.3" y1="0" x2="213.3" y2="360" />
          <line x1="426.6" y1="0" x2="426.6" y2="360" />
          <line x1="0" y1="120" x2="640" y2="120" />
          <line x1="0" y1="240" x2="640" y2="240" />
          <line x1="312" y1="180" x2="328" y2="180" strokeOpacity="0.3" strokeDasharray="none" />
          <line x1="320" y1="172" x2="320" y2="188" strokeOpacity="0.3" strokeDasharray="none" />
        </g>
      )}
    </svg>
  );
}

export default function StoryboardCanvas({
  shot,
  project,
  moodOverride,
  showGuides = true,
  showCameraArrows = true,
  showBadges = true,
  animProgress = 0,
  className = ''
}) {
  if (!shot) return null;
  const mood = resolveMood(project, moodOverride);
  const { mode } = getShotImage(shot, project);

  return (
    <div
      className={`group/board relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 select-none ${className}`}
      style={{ filter: mood.svgFilter }}
    >
      <StoryboardSvg
        shot={shot}
        project={project}
        moodOverride={moodOverride}
        showGuides={showGuides}
        showCameraArrows={showCameraArrows}
        animProgress={animProgress}
      />

      {shot.sketchDataUrl && (
        <img src={shot.sketchDataUrl} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-contain" />
      )}

      {showBadges && (
        <>
          <div className="pointer-events-none absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10.5px] text-white/90 ring-1 ring-white/15 backdrop-blur-md">
            <span className="font-bold text-amber-300">SH{String(shot.number).padStart(2, '0')}</span>
            <span className="text-white/30">/</span>
            <span className="font-semibold text-sky-300">{shot.shotType}</span>
            <span className="text-white/50">{shot.focalLength}mm</span>
            {mode !== 'procedural' && (
              <span className="ml-0.5 rounded-full bg-fuchsia-500/30 px-1.5 text-[9.5px] uppercase tracking-wider text-fuchsia-200">
                {mode === 'photo' ? 'ref' : mode}
              </span>
            )}
          </div>
          <div className="pointer-events-none absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10.5px] text-white/70 ring-1 ring-white/15 backdrop-blur-md">
            <span>{shot.cameraAngle}</span>
            <span className="text-white/30">→</span>
            <span className="text-amber-200">{shot.cameraMove}</span>
            <span className="ml-1 rounded-full bg-amber-400/25 px-1.5 font-semibold text-amber-200">{Number(shot.duration).toFixed(1)}s</span>
          </div>
        </>
      )}
    </div>
  );
}
