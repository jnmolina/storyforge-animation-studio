import React from 'react';
import { Plus, Trash2, Dices, Box } from 'lucide-react';
import { useStudio, Panel, Field, SectionTitle } from '../studio';

const ARCHETYPES = [
  { name: 'Rory', archetype: 'Distracted Barista', silhouette: 'Apron rectangle + tall beanie + rolled sleeves', motivation: 'Keep the espresso machine from overflowing', quirk: 'Checks wrist even when not wearing a watch', colorHex: '#10B981' },
  { name: 'Officer Vance', archetype: 'Relentless Patrol Pursuer', silhouette: 'Heavy utility belt + flashlight cone + broad shoulders', motivation: 'Close the alley perimeter', quirk: 'Adjusts radio mic before sprinting', colorHex: '#F43F5E' },
  { name: 'Pip', archetype: 'Opportunistic Alley Cat', silhouette: 'Low sleek capsule + upright tail antenna', motivation: 'Snatch the dropped snack mid-chaos', quirk: 'Freezes with one paw raised', colorHex: '#38BDF8' },
  { name: 'Grandma Ines', archetype: 'Unflappable Neighbor', silhouette: 'Round shawl dome + cane diagonal', motivation: 'Water every plant before noon', quirk: 'Hums louder when ignored', colorHex: '#A78BFA' }
];
const ENVS = [
  { name: 'Sunlit Hallway & Front Stoop', settingType: 'Interior/Exterior Threshold', timeOfDay: '08:00 AM Crisp Morning', props: ['Entryway Coat Bench', 'Pair of Sneakers', 'Front Door Frame', 'Bus Stop Sign'] },
  { name: 'Rain-Slicked Cyber Service Alley', settingType: 'Exterior · Urban Dead-End', timeOfDay: '01:20 AM Neon & Siren Strobe', props: ['Rolling Metal Dumpster', 'Counterweight Fire Escape', 'Police Cruiser Barricade', 'Steam Vent'] },
  { name: 'Subway Platform Turnstile', settingType: 'Interior · Underground Station', timeOfDay: '11:55 PM Last Train', props: ['Steel Turnstile Gate', 'Departure Countdown Sign', 'Sliding Train Doors', 'Tiled Pillar'] },
  { name: 'Rooftop Garden at Dusk', settingType: 'Exterior · Rooftop', timeOfDay: '07:40 PM Magenta Dusk', props: ['Water Tank', 'Planter Boxes', 'String Lights', 'Folding Chair'] }
];

function Silhouette({ color }) {
  return (
    <svg viewBox="0 0 60 90" className="h-full w-full">
      <ellipse cx="30" cy="84" rx="18" ry="4" fill="#000" opacity="0.5" />
      <path d="M16 36 C16 28 44 28 44 36 L46 72 L14 72 Z" fill={color} />
      <path d="M22 72 L20 84 M38 72 L40 84" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <circle cx="30" cy="20" r="11" fill={color} />
      <circle cx="34" cy="19" r="1.6" fill="#000" />
      <circle cx="39" cy="19" r="1.6" fill="#000" />
    </svg>
  );
}

export default function WorldStage() {
  const { project, setProject, notify } = useStudio();
  const env = project.environment || {};
  const setChar = (idx, patch) => {
    const next = [...project.characters];
    next[idx] = { ...next[idx], ...patch };
    setProject({ ...project, characters: next });
  };
  const setEnv = (patch) => setProject({ ...project, environment: { ...env, ...patch } });

  return (
    <div className="grid gap-6 lg:grid-cols-12 stagger">
      <div className="space-y-4 lg:col-span-7">
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow">Silhouette first, details later</div>
            <h3 className="h-display text-lg">Cast</h3>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              const pick = ARCHETYPES[project.characters.length % ARCHETYPES.length];
              setProject((p) => ({ ...p, characters: [...p.characters, { id: `char-${Date.now()}`, ...pick, scale: [0.85, 0.85, 1.75] }] }));
              notify(`Added ${pick.name} — ${pick.archetype}`);
            }}
          >
            <Plus className="h-4 w-4" /> Add character
          </button>
        </div>

        {(project.characters || []).map((c, idx) => (
          <div key={c.id} className="glass glass-hover flex gap-4 p-4">
            <div className="relative w-24 shrink-0 overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10" style={{ background: `radial-gradient(circle at 50% 30%, ${c.colorHex}33, transparent 70%)` }}>
              <div className="h-32 p-2">
                <Silhouette color={c.colorHex || '#F59E0B'} />
              </div>
              <input type="color" value={c.colorHex || '#F59E0B'} onChange={(e) => setChar(idx, { colorHex: e.target.value })} className="absolute bottom-1.5 right-1.5 h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent" title="Character color" />
            </div>
            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="flex items-center gap-2">
                <input value={c.name} onChange={(e) => setChar(idx, { name: e.target.value })} className="h-display w-full bg-transparent text-xl outline-none" />
                <span className="chip hidden shrink-0 sm:inline-flex">
                  <Box className="h-3 w-3" /> SF_Char_{String(c.name).replace(/\s+/g, '_')}
                </span>
                {project.characters.length > 1 && (
                  <button onClick={() => setProject({ ...project, characters: project.characters.filter((_, i) => i !== idx) })} className="text-white/30 hover:text-rose-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Field label="Archetype"><input className="sf-input" value={c.archetype} onChange={(e) => setChar(idx, { archetype: e.target.value })} /></Field>
                <Field label="Silhouette"><input className="sf-input" value={c.silhouette} onChange={(e) => setChar(idx, { silhouette: e.target.value })} /></Field>
                <Field label="Scene goal"><input className="sf-input" value={c.motivation} onChange={(e) => setChar(idx, { motivation: e.target.value })} /></Field>
                <Field label="Acting quirk"><input className="sf-input text-amber-200" value={c.quirk} onChange={(e) => setChar(idx, { quirk: e.target.value })} /></Field>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Panel className="space-y-4 lg:col-span-5">
        <SectionTitle
          eyebrow="Every prop becomes a Blender proxy block"
          title="Set & props"
          right={
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                const e = ENVS[Math.floor(Math.random() * ENVS.length)];
                setEnv(e);
                notify(`New set: ${e.name}`);
              }}
            >
              <Dices className="h-3.5 w-3.5 text-accent" /> Roll set
            </button>
          }
        />
        <Field label="Location"><input className="sf-input text-base font-semibold" value={env.name || ''} onChange={(e) => setEnv({ name: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Setting"><input className="sf-input" value={env.settingType || ''} onChange={(e) => setEnv({ settingType: e.target.value })} /></Field>
          <Field label="Time / atmosphere"><input className="sf-input" value={env.timeOfDay || ''} onChange={(e) => setEnv({ timeOfDay: e.target.value })} /></Field>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="sf-label mb-0">Props</span>
            <button className="text-xs font-semibold text-accent hover:underline" onClick={() => setEnv({ props: [...(env.props || []), 'New prop'] })}>
              + Add prop
            </button>
          </div>
          <div className="space-y-2">
            {(env.props || []).map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="chip chip-accent w-14 justify-center">P{String(i + 1).padStart(2, '0')}</span>
                <input
                  className="sf-input py-1.5"
                  value={p}
                  onChange={(e) => {
                    const props = [...env.props];
                    props[i] = e.target.value;
                    setEnv({ props });
                  }}
                />
                <button className="text-white/30 hover:text-rose-400" onClick={() => setEnv({ props: env.props.filter((_, k) => k !== i) })}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}
