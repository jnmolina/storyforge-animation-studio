import React from 'react';

export const CHAR_SHAPES = [
  {
    id: 'circle',
    label: 'Circle',
    icon: '●',
    trait: 'Friendly · Soft · Organic',
    desc: 'Rounded head and curved torso — approachable, bouncy, squash-and-stretch.'
  },
  {
    id: 'square',
    label: 'Square',
    icon: '■',
    trait: 'Sturdy · Grounded · Stubborn',
    desc: 'Block head and rectangular torso — heavy, reliable, immovable mass.'
  },
  {
    id: 'triangle',
    label: 'Triangle',
    icon: '▲',
    trait: 'Agile · Sharp · Dynamic',
    desc: 'Angular head and tapered A-frame/V-frame torso — fast, clever, high-tension.'
  }
];

export const CHAR_BODY_TYPES = [
  {
    id: 'tall',
    label: 'Tall',
    heightM: 2.05,
    wMult: 0.82,
    hMult: 1.26,
    headMult: 0.92,
    legMult: 1.38,
    scale: [0.82, 0.82, 2.05]
  },
  {
    id: 'short',
    label: 'Short',
    heightM: 1.15,
    wMult: 0.95,
    hMult: 0.68,
    headMult: 1.18,
    legMult: 0.62,
    scale: [0.95, 0.95, 1.15]
  },
  {
    id: 'thin',
    label: 'Thin',
    heightM: 1.85,
    wMult: 0.54,
    hMult: 1.14,
    headMult: 0.88,
    legMult: 1.25,
    scale: [0.54, 0.54, 1.85]
  },
  {
    id: 'wide',
    label: 'Wide',
    heightM: 1.65,
    wMult: 1.55,
    hMult: 0.96,
    headMult: 1.05,
    legMult: 0.85,
    scale: [1.55, 1.15, 1.65]
  },
  {
    id: 'round',
    label: 'Round',
    heightM: 1.45,
    wMult: 1.42,
    hMult: 0.86,
    headMult: 1.12,
    legMult: 0.72,
    scale: [1.42, 1.42, 1.45]
  },
  {
    id: 'boxy',
    label: 'Boxy',
    heightM: 1.72,
    wMult: 1.35,
    hMult: 1.02,
    headMult: 1.06,
    legMult: 0.88,
    scale: [1.35, 1.05, 1.72]
  }
];

export const PROP_SHAPES = [
  { id: 'box', label: 'Square / Box', icon: '■', w: 1.0, h: 0.9 },
  { id: 'circle', label: 'Circle / Sphere', icon: '●', w: 1.0, h: 1.0 },
  { id: 'triangle', label: 'Triangle / Cone', icon: '▲', w: 1.0, h: 1.15 },
  { id: 'tall', label: 'Tall Pillar / Door', icon: '▯', w: 0.85, h: 1.95 },
  { id: 'wide', label: 'Wide Bench / Car', icon: '▬', w: 1.85, h: 0.75 }
];

export function getCharSpec(char = {}) {
  const shape = CHAR_SHAPES.find((s) => s.id === char.shape) || CHAR_SHAPES[0];
  const body = CHAR_BODY_TYPES.find((b) => b.id === char.bodyType) || CHAR_BODY_TYPES[0];
  return { shape, body };
}

/**
 * Renders a character SVG group with feet planted at (0, 42) so height/width
 * differences (tall, short, thin, wide, round, boxy) and shape language
 * (circle, square, triangle) read unmistakably in Storyboards & Lineup charts.
 */
export function CharacterShapeSvg({
  char = {},
  palette = ['#FFFBEB', '#FDE68A', '#F59E0B', '#B45309', '#451A03'],
  isAction = false,
  showCrosshairs = true
}) {
  const color = char.colorHex || '#F59E0B';
  const shapeId = char.shape || (char.bodyType === 'boxy' ? 'square' : char.bodyType === 'round' ? 'circle' : 'circle');
  const bodySpec = CHAR_BODY_TYPES.find((b) => b.id === char.bodyType) || {
    id: 'standard',
    wMult: 1.0,
    hMult: 1.0,
    headMult: 1.0,
    legMult: 1.0
  };

  // Ground plane is at y = 42
  const groundY = 42;
  const legLen = 24 * bodySpec.legMult;
  const hipY = groundY - legLen;
  const torsoH = 58 * bodySpec.hMult;
  const torsoW = 28 * bodySpec.wMult;
  const shoulderY = hipY - torsoH;
  const headR = 20 * bodySpec.headMult;
  const headCenterY = shoulderY - headR * 0.95;

  const strokeCol = palette[0] || '#FFFFFF';
  const darkCol = palette[4] || '#0F172A';
  const headFill = palette[1] || '#FDE68A';

  // Render Torso Path based on Shape Language (circle / square / triangle) + Body Type
  let torsoElement = null;
  if (shapeId === 'square' || bodySpec.id === 'boxy') {
    torsoElement = (
      <rect
        x={-torsoW}
        y={shoulderY}
        width={torsoW * 2}
        height={torsoH}
        rx={bodySpec.id === 'boxy' ? 4 : 8}
        fill={color}
        stroke={strokeCol}
        strokeWidth="2.2"
      />
    );
  } else if (shapeId === 'triangle') {
    // Wide-to-narrow or narrow-to-wide triangle torso
    const topW = bodySpec.id === 'wide' ? torsoW * 1.25 : torsoW * 0.45;
    const botW = bodySpec.id === 'wide' ? torsoW * 0.55 : torsoW * 1.25;
    torsoElement = (
      <polygon
        points={`${-topW},${shoulderY} ${topW},${shoulderY} ${botW},${hipY} ${-botW},${hipY}`}
        fill={color}
        stroke={strokeCol}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    );
  } else {
    // Circle / Round / Organic Capsule Torso
    torsoElement = (
      <ellipse
        cx="0"
        cy={(shoulderY + hipY) / 2}
        rx={torsoW * (bodySpec.id === 'round' ? 1.15 : 1.0)}
        ry={torsoH * 0.54}
        fill={color}
        stroke={strokeCol}
        strokeWidth="2.2"
      />
    );
  }

  // Render Head based on Shape Language (circle / square / triangle)
  let headElement = null;
  if (shapeId === 'square' || bodySpec.id === 'boxy') {
    headElement = (
      <rect
        x={-headR}
        y={-headR}
        width={headR * 2}
        height={headR * 1.9}
        rx="5"
        fill={headFill}
        stroke={darkCol}
        strokeWidth="2.4"
      />
    );
  } else if (shapeId === 'triangle') {
    headElement = (
      <polygon
        points={`0,${-headR * 1.25} ${headR * 1.18},${headR * 0.95} ${-headR * 1.18},${headR * 0.95}`}
        fill={headFill}
        stroke={darkCol}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    );
  } else {
    headElement = (
      <circle
        cx="0"
        cy="0"
        r={headR}
        fill={headFill}
        stroke={darkCol}
        strokeWidth="2.4"
      />
    );
  }

  const legSpread = Math.max(10, torsoW * 0.55);
  const armY = shoulderY + torsoH * 0.22;

  return (
    <g>
      {/* Ground contact shadow scaled to character width */}
      <ellipse cx="0" cy={groundY} rx={Math.max(22, torsoW * 1.3)} ry="9" fill="#000000" opacity="0.45" />

      {/* Legs */}
      <path
        d={
          isAction
            ? `M ${-legSpread * 0.6},${hipY} L ${-legSpread * 1.35},${groundY} M ${legSpread * 0.6},${hipY} L ${legSpread * 1.45},${groundY - 4}`
            : `M ${-legSpread * 0.65},${hipY} L ${-legSpread * 0.75},${groundY} M ${legSpread * 0.65},${hipY} L ${legSpread * 0.75},${groundY}`
        }
        stroke={strokeCol}
        strokeWidth={Math.max(4, Math.min(8, 5 * bodySpec.wMult))}
        strokeLinecap="round"
      />

      {/* Torso */}
      <g transform={isAction ? `rotate(8 0 ${hipY})` : undefined}>{torsoElement}</g>

      {/* Arms */}
      <path
        d={
          isAction
            ? `M ${-torsoW * 0.85},${armY} L ${-torsoW * 1.45},${armY + 22} M ${torsoW * 0.85},${armY} L ${torsoW * 1.65},${armY - 14}`
            : `M ${-torsoW * 0.9},${armY} L ${-torsoW * 1.15},${hipY + 4} M ${torsoW * 0.9},${armY} L ${torsoW * 1.25},${hipY - 4}`
        }
        stroke={strokeCol}
        strokeWidth={Math.max(3.5, Math.min(7, 4.5 * bodySpec.wMult))}
        strokeLinecap="round"
      />

      {/* Head & Animator Construction Crosshairs */}
      <g transform={`translate(${isAction ? 10 : 3}, ${headCenterY}) rotate(${isAction ? 10 : 0})`}>
        {headElement}
        {showCrosshairs && (
          <path
            d={`M ${-headR * 0.9},-2 Q 4,-7 ${headR * 0.9},-2 M 4,${-headR * 0.9} Q 9,0 4,${headR * 0.9}`}
            fill="none"
            stroke={darkCol}
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
        )}
        <circle cx={headR * 0.15} cy="-3" r="2.5" fill={darkCol} />
        <circle cx={headR * 0.55} cy="-3" r="2.5" fill={darkCol} />
      </g>
    </g>
  );
}
