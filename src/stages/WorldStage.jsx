import React from 'react';
import { Plus, Trash2, Dices, Box } from 'lucide-react';
import { useStudio, Panel, Field, SectionTitle } from '../studio';
import {
  CHAR_SHAPES,
  CHAR_BODY_TYPES,
  PROP_SHAPES,
  CharacterShapeSvg
} from '../utils/charShapes';

const ARCHETYPES = [
  {
    name: 'Rory',
    archetype: 'Distracted Barista',
    shape: 'circle',
    bodyType: 'round',
    silhouette: 'Circle shape language · Round build — soft apron dome + friendly curves',
    motivation: 'Keep the espresso machine from overflowing',
    quirk: 'Checks wrist even when not wearing a watch',
    colorHex: '#10B981'
  },
  {
    name: 'Officer Vance',
    archetype: 'Relentless Patrol Pursuer',
    shape: 'square',
    bodyType: 'boxy',
    silhouette: 'Square shape language · Boxy build — heavy tactical block + broad shoulders',
    motivation: 'Close the alley perimeter',
    quirk: 'Adjusts radio mic before sprinting',
    colorHex: '#F43F5E'
  },
  {
    name: 'Pip',
    archetype: 'Nimble Rooftop Runner',
    shape: 'triangle',
    bodyType: 'thin',
    silhouette: 'Triangle shape language · Thin build — sharp angular lean + fast limbs',
    motivation: 'Dart through the narrow gap before the gate drops',
    quirk: 'Freezes with one foot raised before bolting',
    colorHex: '#38BDF8'
  },
  {
    name: 'Bram',
    archetype: 'Immovable Doorman',
    shape: 'square',
    bodyType: 'wide',
    silhouette: 'Square shape language · Wide build — low center of gravity, fills the doorway',
    motivation: 'Guard the velvet rope at all costs',
    quirk: 'Crosses arms like folding boulders',
    colorHex: '#F59E0B'
  },
  {
    name: 'Milo',
    archetype: 'Curious Kid Sidekick',
    shape: 'circle',
    bodyType: 'short',
    silhouette: 'Circle shape language · Short build — oversized round head, compact bounce',
    motivation: 'See what is on top of the high counter',
    quirk: 'Bounces on tiptoes twice before jumping',
    colorHex: '#A78BFA'
  }
];

const ENVS = [
  {
    name: 'Sunlit Hallway & Front Stoop',
    settingType: 'Interior/Exterior Threshold',
    timeOfDay: '08:00 AM Crisp Morning',
    props: ['Entryway Coat Bench', 'Pair of Sneakers', 'Front Door Frame', 'Bus Stop Sign'],
    propShapes: ['wide', 'box', 'tall', 'tall']
  },
  {
    name: 'Rain-Slicked Cyber Service Alley',
    settingType: 'Exterior · Urban Dead-End',
    timeOfDay: '01:20 AM Neon & Siren Strobe',
    props: ['Rolling Metal Dumpster', 'Counterweight Fire Escape', 'Police Cruiser Barricade', 'Steam Vent'],
    propShapes: ['wide', 'tall', 'wide', 'circle']
  },
  {
    name: 'Subway Platform Turnstile',
    settingType: 'Interior · Underground Station',
    timeOfDay: '11:55 PM Last Train',
    props: ['Steel Turnstile Gate', 'Departure Countdown Sign', 'Sliding Train Doors', 'Tiled Pillar'],
    propShapes: ['box', 'wide', 'tall', 'tall']
  },
  {
    name: 'Rooftop Garden at Dusk',
    settingType: 'Exterior · Rooftop',
    timeOfDay: '07:40 PM Magenta Dusk',
    props: ['Water Tank Sphere', 'Planter Boxes', 'A-Frame Skylight', 'Folding Chair'],
    propShapes: ['circle', 'wide', 'triangle', 'box']
  }
];

function PropShapeSvg({ shapeId = 'box', label = '', x = 0 }) {
  const spec = PROP_SHAPES.find((s) => s.id === shapeId) || PROP_SHAPES[0];
  const groundY = 142;
  const w = 44 * spec.w;
  const h = 46 * spec.h;

  return (
    <g transform={`translate(${x}, 0)`}>
      <ellipse cx="0" cy={groundY + 2} rx={w * 0.6} ry="5" fill="#000" opacity="0.35" />
      {shapeId === 'circle' ? (
        <circle
          cx="0"
          cy={groundY - h * 0.5}
          r={h * 0.5}
          fill="#334155"
          fillOpacity="0.55"
          stroke="#94A3B8"
          strokeWidth="1.8"
          strokeDasharray="3 2"
        />
      ) : shapeId === 'triangle' ? (
        <polygon
          points={`0,${groundY - h} ${w * 0.6},${groundY} ${-w * 0.6},${groundY}`}
          fill="#334155"
          fillOpacity="0.55"
          stroke="#94A3B8"
          strokeWidth="1.8"
          strokeDasharray="3 2"
        />
      ) : (
        <rect
          x={-w * 0.5}
          y={groundY - h}
          width={w}
          height={h}
          rx="4"
          fill="#334155"
          fillOpacity="0.55"
          stroke="#94A3B8"
          strokeWidth="1.8"
          strokeDasharray="3 2"
        />
      )}
      <text
        x="0"
        y={groundY + 15}
        textAnchor="middle"
        fill="#94A3B8"
        fontSize="9"
        fontFamily="JetBrains Mono, monospace"
      >
        {spec.icon} {label.slice(0, 12)}
      </text>
    </g>
  );
}

export default function WorldStage() {
  const { project, setProject, notify } = useStudio();
  const env = project.environment || {};
  const propShapes = env.propShapes || (env.props || []).map((_, i) => (i === 0 ? 'wide' : i === 2 ? 'tall' : 'box'));

  const setChar = (idx, patch) => {
    const next = [...project.characters];
    const updated = { ...next[idx], ...patch };
    // Auto-update Blender scale & silhouette summary when shape or bodyType changes
    if (patch.shape || patch.bodyType) {
      const shapeSpec = CHAR_SHAPES.find((s) => s.id === (updated.shape || 'circle')) || CHAR_SHAPES[0];
      const bodySpec = CHAR_BODY_TYPES.find((b) => b.id === (updated.bodyType || 'tall')) || CHAR_BODY_TYPES[0];
      updated.scale = bodySpec.scale;
      updated.silhouette = `${shapeSpec.label} shape (${shapeSpec.trait}) · ${bodySpec.label} build (${bodySpec.heightM}m)`;
    }
    next[idx] = updated;
    setProject({ ...project, characters: next });
  };

  const setEnv = (patch) => setProject({ ...project, environment: { ...env, ...patch } });

  return (
    <div className="space-y-6 stagger">
      {/* Top Interactive Cast & Set Silhouette Lineup & Scale Chart */}
      <Panel className="p-4">
        <SectionTitle
          eyebrow="Visual contrast check · Shape language (● ■ ▲) & Body proportions against set props"
          title="Cast & Scene Silhouette Lineup (Height & Shape Chart)"
          right={
            <span className="chip">
              Changes below update Storyboards, Animatic & Blender 3D Previz geometry
            </span>
          }
        />

        <div className="overflow-hidden rounded-xl bg-[#0b0c10] p-3 ring-1 ring-white/10">
          <svg viewBox="0 0 760 170" className="h-44 w-full select-none">
            {/* Height reference meter lines (0.5m, 1.0m, 1.5m, 2.0m) */}
            {[
              { y: 142, label: '0.0m (Floor)' },
              { y: 112, label: '0.5m' },
              { y: 82, label: '1.0m' },
              { y: 52, label: '1.5m' },
              { y: 22, label: '2.0m' }
            ].map((row) => (
              <g key={row.y}>
                <line
                  x1="48"
                  y1={row.y}
                  x2="745"
                  y2={row.y}
                  stroke={row.y === 142 ? '#ffffff40' : '#ffffff14'}
                  strokeWidth={row.y === 142 ? '1.5' : '1'}
                  strokeDasharray={row.y === 142 ? 'none' : '4 4'}
                />
                <text
                  x="6"
                  y={row.y + 3}
                  fill="#94A3B8"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {row.label}
                </text>
              </g>
            ))}

            {/* Render Characters side-by-side in lineup */}
            {(project.characters || []).map((c, idx) => {
              const cx = 135 + idx * 125;
              const shapeSpec = CHAR_SHAPES.find((s) => s.id === (c.shape || 'circle')) || CHAR_SHAPES[0];
              const bodySpec = CHAR_BODY_TYPES.find((b) => b.id === (c.bodyType || 'tall')) || CHAR_BODY_TYPES[0];
              return (
                <g key={c.id} transform={`translate(${cx}, 109) scale(0.78)`}>
                  <CharacterShapeSvg char={c} showCrosshairs />
                  <text
                    x="0"
                    y="62"
                    textAnchor="middle"
                    fill="#F8FAFC"
                    fontSize="11.5"
                    fontWeight="bold"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {shapeSpec.icon} {c.name} ({bodySpec.label})
                  </text>
                </g>
              );
            })}

            {/* Divider between Cast and Set Props */}
            <line x1="440" y1="12" x2="440" y2="155" stroke="#ffffff20" strokeWidth="1" />
            <text x="452" y="20" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono, monospace">
              SET PROPS LAYOUT BLOCKS
            </text>

            {/* Render Set Props with their primitive shapes */}
            {(env.props || []).slice(0, 4).map((pName, pIdx) => (
              <PropShapeSvg
                key={pIdx}
                shapeId={propShapes[pIdx] || 'box'}
                label={pName}
                x={495 + pIdx * 78}
              />
            ))}
          </svg>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 7 Cols: Character Shape Language & Body Type Builder */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="eyebrow">Pick Simple Shape (● ■ ▲) + Basic Build (Tall, Short, Thin, Wide, Round, Boxy)</div>
              <h3 className="h-display text-lg">Characters</h3>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                const pick = ARCHETYPES[project.characters.length % ARCHETYPES.length];
                const bodySpec = CHAR_BODY_TYPES.find((b) => b.id === pick.bodyType) || CHAR_BODY_TYPES[0];
                setProject((p) => ({
                  ...p,
                  characters: [
                    ...p.characters,
                    { id: `char-${Date.now()}`, ...pick, scale: bodySpec.scale }
                  ]
                }));
                notify(`Added ${pick.name} (${pick.shape.toUpperCase()} · ${pick.bodyType.toUpperCase()})`);
              }}
            >
              <Plus className="h-4 w-4" /> Add Character
            </button>
          </div>

          {(project.characters || []).map((c, idx) => {
            const activeShape = c.shape || 'circle';
            const activeBody = c.bodyType || 'tall';
            return (
              <div key={c.id} className="glass glass-hover flex flex-col gap-4 p-4 sm:flex-row">
                {/* Live Shape & Body Preview Card */}
                <div
                  className="relative flex w-full shrink-0 flex-col items-center justify-between overflow-hidden rounded-xl bg-[#0b0c10] p-3 ring-1 ring-white/10 sm:w-32"
                  style={{
                    background: `radial-gradient(circle at 50% 35%, ${c.colorHex || '#F59E0B'}28, #0b0c10 75%)`
                  }}
                >
                  <svg viewBox="-65 -115 130 170" className="h-36 w-full">
                    <CharacterShapeSvg char={c} showCrosshairs />
                  </svg>
                  <div className="flex w-full items-center justify-between pt-1">
                    <span className="font-mono text-[10px] uppercase text-white/60">
                      {activeShape} · {activeBody}
                    </span>
                    <input
                      type="color"
                      value={c.colorHex || '#F59E0B'}
                      onChange={(e) => setChar(idx, { colorHex: e.target.value })}
                      className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent"
                      title="Character color"
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      value={c.name}
                      onChange={(e) => setChar(idx, { name: e.target.value })}
                      className="h-display w-full bg-transparent text-lg outline-none"
                    />
                    <span className="chip hidden shrink-0 sm:inline-flex">
                      <Box className="h-3 w-3" /> SF_Char_{String(c.name).replace(/\s+/g, '_')}
                    </span>
                    {project.characters.length > 1 && (
                      <button
                        onClick={() =>
                          setProject({
                            ...project,
                            characters: project.characters.filter((_, i) => i !== idx)
                          })
                        }
                        className="hover:text-rose-400"
                        style={{ color: 'var(--text-3)' }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* 1. Primary Shape Language Selector (Circle, Square, Triangle) */}
                  <div>
                    <span className="sf-label">1. Primary Shape Language (Head & Torso Geometry)</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {CHAR_SHAPES.map((sh) => {
                        const on = activeShape === sh.id;
                        return (
                          <button
                            key={sh.id}
                            onClick={() => setChar(idx, { shape: sh.id })}
                            title={sh.desc}
                            className={`flex flex-col items-start rounded-lg p-2 text-left transition ${
                              on ? 'btn-accent-soft ring-1 ring-[color:var(--accent)]' : 'btn-ghost'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              <span className="text-sm">{sh.icon}</span>
                              <span>{sh.label}</span>
                            </div>
                            <span className="mt-0.5 text-[9.5px] opacity-75">{sh.trait}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Basic Body Build / Proportion Selector (Tall, Short, Thin, Wide, Round, Boxy) */}
                  <div>
                    <span className="sf-label">2. Body Type & Proportions (Height & Mass)</span>
                    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                      {CHAR_BODY_TYPES.map((bt) => {
                        const on = activeBody === bt.id;
                        return (
                          <button
                            key={bt.id}
                            onClick={() => setChar(idx, { bodyType: bt.id })}
                            className={`flex flex-col items-center rounded-lg py-1.5 px-2 text-center transition ${
                              on ? 'btn-primary font-bold' : 'btn-ghost'
                            }`}
                          >
                            <span className="text-xs font-semibold">{bt.label}</span>
                            <span className="font-mono text-[9.5px] opacity-75">{bt.heightM}m</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Archetype, Motivation & Quirk */}
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <Field label="Role / Archetype">
                      <input
                        className="sf-input"
                        value={c.archetype}
                        onChange={(e) => setChar(idx, { archetype: e.target.value })}
                      />
                    </Field>
                    <Field label="Auto-Generated Silhouette Notes">
                      <input
                        className="sf-input"
                        value={c.silhouette}
                        onChange={(e) => setChar(idx, { silhouette: e.target.value })}
                      />
                    </Field>
                    <Field label="Scene Goal">
                      <input
                        className="sf-input"
                        value={c.motivation}
                        onChange={(e) => setChar(idx, { motivation: e.target.value })}
                      />
                    </Field>
                    <Field label="Physical Acting Quirk">
                      <input
                        className="sf-input"
                        value={c.quirk}
                        onChange={(e) => setChar(idx, { quirk: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 5 Cols: Set & Props with Primitive Layout Shapes */}
        <Panel className="space-y-4 lg:col-span-5">
          <SectionTitle
            eyebrow="Choose basic shapes for set props to block composition"
            title="Set & Layout Props"
            right={
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  const e = ENVS[Math.floor(Math.random() * ENVS.length)];
                  setEnv(e);
                  notify(`Loaded Set: ${e.name}`);
                }}
              >
                <Dices className="h-3.5 w-3.5 text-accent" /> Roll Set
              </button>
            }
          />
          <Field label="Location">
            <input
              className="sf-input text-base font-semibold"
              value={env.name || ''}
              onChange={(e) => setEnv({ name: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Setting">
              <input
                className="sf-input"
                value={env.settingType || ''}
                onChange={(e) => setEnv({ settingType: e.target.value })}
              />
            </Field>
            <Field label="Time / Atmosphere">
              <input
                className="sf-input"
                value={env.timeOfDay || ''}
                onChange={(e) => setEnv({ timeOfDay: e.target.value })}
              />
            </Field>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="sf-label mb-0">Props & Layout Primitives (■ ● ▲ ▯ ▬)</span>
              <button
                className="text-xs font-semibold text-accent hover:underline"
                onClick={() =>
                  setEnv({
                    props: [...(env.props || []), 'New Hero Prop'],
                    propShapes: [...propShapes, 'box']
                  })
                }
              >
                + Add Prop
              </button>
            </div>
            <div className="space-y-2.5">
              {(env.props || []).map((p, i) => {
                const curShape = propShapes[i] || 'box';
                return (
                  <div key={i} className="glass-soft space-y-2 p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="chip chip-accent w-12 justify-center font-bold">
                        P{String(i + 1).padStart(2, '0')}
                      </span>
                      <input
                        className="sf-input py-1.5"
                        value={p}
                        onChange={(e) => {
                          const props = [...env.props];
                          props[i] = e.target.value;
                          setEnv({ props });
                        }}
                      />
                      <button
                        className="hover:text-rose-400"
                        style={{ color: 'var(--text-3)' }}
                        onClick={() =>
                          setEnv({
                            props: env.props.filter((_, k) => k !== i),
                            propShapes: propShapes.filter((_, k) => k !== i)
                          })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="mr-1 font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>
                        Shape:
                      </span>
                      {PROP_SHAPES.map((ps) => (
                        <button
                          key={ps.id}
                          onClick={() => {
                            const nextShapes = [...propShapes];
                            nextShapes[i] = ps.id;
                            setEnv({ propShapes: nextShapes });
                          }}
                          className={`rounded px-2 py-0.5 font-mono text-[10px] transition ${
                            curShape === ps.id ? 'btn-accent-soft font-bold' : 'btn-ghost'
                          }`}
                        >
                          {ps.icon} {ps.label.split('/')[0].trim()}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
