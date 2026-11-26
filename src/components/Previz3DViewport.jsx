import React, { useState } from 'react';
import { resolveMood } from '../data/storyEngine';

/**
 * Interactive 3D Isometric / Orbit Stage Visualizer for the Blender Previz Connector.
 * Shows the ground grid, back wall, simple proxy geometry props, character capsule mannequins,
 * and every shot's Camera Start -> End path + lens frustum cone in 3D space.
 */
export default function Previz3DViewport({ project, activeShotIndex = 0, onSelectShot }) {
  const [yaw, setYaw] = useState(38); // degrees
  const [pitch, setPitch] = useState(26); // degrees
  const [zoom, setZoom] = useState(42);

  const mood = resolveMood(project);
  const shots = project?.shots || [];
  const activeShot = shots[activeShotIndex] || shots[0];
  const hero = project?.characters?.[0] || { name: 'Hero', colorHex: '#F59E0B' };
  const secondChar = project?.characters?.[1] || null;
  const props = project?.environment?.props || [];

  // Project 3D Blender world coords (X right, Y forward/depth, Z up) to 2D SVG screen coords
  const project3D = (x, y, z) => {
    const radYaw = (yaw * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;

    // Rotate around Z axis (yaw)
    const rx = x * Math.cos(radYaw) - y * Math.sin(radYaw);
    const ry = x * Math.sin(radYaw) + y * Math.cos(radYaw);

    // Tilt by pitch (Z is up in Blender!)
    const sx = 320 + rx * zoom;
    const sy = 205 + (ry * Math.sin(radPitch) - z * Math.cos(radPitch)) * zoom;
    return [sx, sy];
  };

  // Grid lines on ground plane Z=0
  const gridLines = [];
  for (let g = -5; g <= 5; g++) {
    gridLines.push({
      p1: project3D(g, -5, 0),
      p2: project3D(g, 5, 0),
      major: g === 0
    });
    gridLines.push({
      p1: project3D(-5, g, 0),
      p2: project3D(5, g, 0),
      major: g === 0
    });
  }

  const subjPos = activeShot?.subjectPos || [0, 0, 0];
  const heroFoot = project3D(subjPos[0], subjPos[1], subjPos[2]);
  const heroHead = project3D(subjPos[0], subjPos[1], subjPos[2] + 1.55);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#07090E]">
      {/* Viewport Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-900/70 px-3.5 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
          <span className="font-mono font-semibold text-slate-200">
            BLENDER 3D STAGE PREVIEW (Z-UP · METERS)
          </span>
          <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-amber-300">
            Mood: {mood.name}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <label className="flex items-center gap-1.5">
            <span>Orbit</span>
            <input
              type="range"
              min="-120"
              max="120"
              value={yaw}
              onChange={(e) => setYaw(Number(e.target.value))}
              className="h-1.5 w-20 accent-amber-400"
            />
          </label>
          <label className="flex items-center gap-1.5">
            <span>Elevation</span>
            <input
              type="range"
              min="8"
              max="75"
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
              className="h-1.5 w-16 accent-amber-400"
            />
          </label>
          <label className="flex items-center gap-1.5">
            <span>Zoom</span>
            <input
              type="range"
              min="26"
              max="64"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1.5 w-16 accent-amber-400"
            />
          </label>
        </div>
      </div>

      {/* 3D Isometric SVG Canvas */}
      <svg viewBox="0 0 640 360" className="h-[230px] sm:h-[320px] w-full select-none">
        <defs>
          <radialGradient id="stage-glow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor={mood.palette[2]} stopOpacity="0.22" />
            <stop offset="100%" stopColor="#07090E" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="640" height="360" fill="url(#stage-glow)" />

        {/* Ground Grid */}
        {gridLines.map((line, i) => (
          <line
            key={i}
            x1={line.p1[0]}
            y1={line.p1[1]}
            x2={line.p2[0]}
            y2={line.p2[1]}
            stroke={line.major ? '#38BDF8' : '#1E293B'}
            strokeOpacity={line.major ? '0.45' : '0.75'}
            strokeWidth={line.major ? '1.5' : '1'}
          />
        ))}

        {/* Back Reference Wall Plane at Y = 4.2 */}
        {(() => {
          const w1 = project3D(-4, 4.2, 0);
          const w2 = project3D(4, 4.2, 0);
          const w3 = project3D(4, 4.2, 3.2);
          const w4 = project3D(-4, 4.2, 3.2);
          return (
            <polygon
              points={`${w1[0]},${w1[1]} ${w2[0]},${w2[1]} ${w3[0]},${w3[1]} ${w4[0]},${w4[1]}`}
              fill={mood.palette[3]}
              fillOpacity="0.28"
              stroke={mood.palette[1]}
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />
          );
        })()}

        {/* Simple Geometry Environment Props */}
        {props.slice(0, 4).map((propName, idx) => {
          const px = -2.2 + idx * 1.5;
          const py = idx % 2 === 0 ? 1.6 : 0.8;
          const base = project3D(px, py, 0);
          const top = project3D(px, py, 0.85);
          return (
            <g key={idx}>
              <line
                x1={base[0]}
                y1={base[1]}
                x2={top[0]}
                y2={top[1]}
                stroke={mood.palette[1]}
                strokeWidth="18"
                strokeLinecap="round"
                opacity="0.35"
              />
              <rect
                x={top[0] - 11}
                y={top[1] - 8}
                width="22"
                height="16"
                rx="3"
                fill={mood.palette[3]}
                stroke={mood.palette[1]}
                strokeWidth="1.2"
              />
              <text
                x={top[0]}
                y={top[1] - 13}
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
              >
                {propName.slice(0, 14)}
              </text>
            </g>
          );
        })}

        {/* Secondary Character Proxy if present */}
        {secondChar && (() => {
          const pFoot = project3D(subjPos[0] - 1.2, subjPos[1] - 1.8, 0);
          const pHead = project3D(subjPos[0] - 1.2, subjPos[1] - 1.8, 1.5);
          return (
            <g>
              <ellipse cx={pFoot[0]} cy={pFoot[1]} rx="14" ry="7" fill="#000" opacity="0.5" />
              <line
                x1={pFoot[0]}
                y1={pFoot[1]}
                x2={pHead[0]}
                y2={pHead[1]}
                stroke={secondChar.colorHex || '#F43F5E'}
                strokeWidth="14"
                strokeLinecap="round"
              />
              <circle
                cx={pHead[0]}
                cy={pHead[1] - 4}
                r="8"
                fill={secondChar.colorHex || '#F43F5E'}
                stroke="#FFF"
                strokeWidth="1.5"
              />
            </g>
          );
        })()}

        {/* Primary Character Proxy Capsule (`SF_Char_Root`) */}
        <g>
          <ellipse cx={heroFoot[0]} cy={heroFoot[1]} rx="16" ry="8" fill="#F59E0B" opacity="0.28" />
          <line
            x1={heroFoot[0]}
            y1={heroFoot[1]}
            x2={heroHead[0]}
            y2={heroHead[1]}
            stroke={hero.colorHex || '#F59E0B'}
            strokeWidth="16"
            strokeLinecap="round"
          />
          <circle
            cx={heroHead[0]}
            cy={heroHead[1] - 5}
            r="9.5"
            fill="#FDE68A"
            stroke="#0F172A"
            strokeWidth="2"
          />
          <text
            x={heroHead[0]}
            y={heroHead[1] - 20}
            textAnchor="middle"
            fill="#FDE68A"
            fontSize="10"
            fontWeight="bold"
            fontFamily="JetBrains Mono, monospace"
          >
            {hero.name}
          </text>
        </g>

        {/* Render All Shot Cameras & Active Camera Frustum */}
        {shots.map((sh, idx) => {
          const isCurrent = idx === activeShotIndex;
          const cStart = sh.camStart || [0, -3.5, 1.5];
          const cEnd = sh.camEnd || cStart;
          const pStart = project3D(cStart[0], cStart[1], cStart[2]);
          const pEnd = project3D(cEnd[0], cEnd[1], cEnd[2]);

          return (
            <g
              key={sh.id}
              onClick={() => onSelectShot && onSelectShot(idx)}
              className="cursor-pointer"
            >
              {/* Camera frustum rays to subject */}
              {isCurrent && (
                <g>
                  <polygon
                    points={`${pStart[0]},${pStart[1]} ${heroHead[0] - 24},${heroHead[1] - 12} ${
                      heroFoot[0] + 24
                    },${heroFoot[1] + 8}`}
                    fill="#F59E0B"
                    fillOpacity="0.13"
                    stroke="#F59E0B"
                    strokeOpacity="0.55"
                    strokeDasharray="3 3"
                  />
                  {/* Camera Motion Dolly Vector (camStart -> camEnd) */}
                  <line
                    x1={pStart[0]}
                    y1={pStart[1]}
                    x2={pEnd[0]}
                    y2={pEnd[1]}
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                  />
                  <circle cx={pEnd[0]} cy={pEnd[1]} r="4" fill="#38BDF8" />
                </g>
              )}

              {/* Camera Icon Node */}
              <circle
                cx={pStart[0]}
                cy={pStart[1]}
                r={isCurrent ? 9 : 6}
                fill={isCurrent ? '#F59E0B' : '#1E293B'}
                stroke={isCurrent ? '#FEF08A' : '#64748B'}
                strokeWidth="2"
              />
              <text
                x={pStart[0]}
                y={pStart[1] + 18}
                textAnchor="middle"
                fill={isCurrent ? '#FDE68A' : '#94A3B8'}
                fontSize={isCurrent ? '10' : '9'}
                fontWeight="bold"
                fontFamily="JetBrains Mono, monospace"
              >
                CAM {idx + 1} ({sh.shotType})
              </text>
            </g>
          );
        })}
      </svg>

      {/* Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 bg-slate-950/90 px-3.5 py-2 text-[11px] font-mono text-slate-400">
        <div>
          Active Camera:{' '}
          <span className="text-amber-300 font-semibold">
            SF_Cam_SH{String(activeShotIndex + 1).padStart(2, '0')}_{activeShot?.shotType || 'MS'}
          </span>{' '}
          ({activeShot?.focalLength || 35}mm · {activeShot?.cameraMove})
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400"></span> Camera Start
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-400"></span> Camera End Keyframe
          </span>
        </div>
      </div>
    </div>
  );
}
