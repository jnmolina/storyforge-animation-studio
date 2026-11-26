import React, { useState } from 'react';
import {
  Dices,
  Wand2,
  Sparkles,
  Zap,
  Coffee,
  Siren,
  Lock,
  Unlock,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Clapperboard,
  HeartPulse,
  Compass
} from 'lucide-react';
import {
  COMPLEXITY_TIERS,
  STARTER_PRESETS,
  ANIMATION_EXERCISES,
  PLOT_SLOT_POOLS,
  REFERENCE_SOURCES,
  rollPlotSlots,
  buildStoryFromSlots,
  resolveMood
} from '../data/storyEngine';
import { useStudio, Panel, Field, SectionTitle } from '../studio';
import StoryboardCanvas from '../components/StoryboardCanvas';

const TIER_ART = {
  mundane: { icon: Coffee, tag: 'Weight & Micro-Acting' },
  slice: { icon: Sparkles, tag: 'Subtext & Emotion Shift' },
  kinetic: { icon: Siren, tag: 'Momentum & Camera Cuts' }
};

const SLOT_DEFS = [
  {
    key: 'protagonist',
    poolKey: 'protagonists',
    label: '01 · Protagonist & Stake',
    source: 'Plot Generator',
    hint: 'Who is acting and what immediate pressure are they under?'
  },
  {
    key: 'activity',
    poolKey: 'activities',
    label: '02 · Core Action & Exercise Drill',
    source: '51 Animation Exercises',
    hint: 'Tactile physical mechanic to animate (weight, tension, balance, vault).'
  },
  {
    key: 'complication',
    poolKey: 'complications',
    label: '03 · Midpoint Friction / Twist',
    source: 'Plot Generator',
    hint: 'The exact micro-obstacle that disrupts their rhythm.'
  },
  {
    key: 'emotionArc',
    poolKey: 'emotionArcs',
    label: '04 · 3-Beat Emotional Arc',
    source: 'Perchance Emotion',
    hint: 'Surface emotion → internal shift → release.'
  },
  {
    key: 'actingCue',
    poolKey: 'actingCues',
    label: '05 · Line of Action & Acting Subtext',
    source: 'Living Lines Library',
    hint: 'Eye darts, spine curve, anticipation holds & breakdown pose timing.'
  },
  {
    key: 'cinemaStyle',
    poolKey: 'cinemaStyles',
    label: '06 · Camera Grammar & Lighting',
    source: 'Tuts+ Lingo & Film-Grab',
    hint: 'Shot sizes (WS/ECU/CU), lens focal length, dolly/whip-pan & contrast.'
  },
  {
    key: 'payoff',
    poolKey: 'payoffs',
    label: '07 · Payoff & Exit Silhouette',
    source: 'r/animation Guide',
    hint: 'How the character resolves the friction in one decisive physical beat.'
  }
];

export default function IdeaStage() {
  const {
    project,
    setProject,
    loadPreset,
    handleGeminiGenerate,
    aiLoading,
    customSeedInput,
    setCustomSeedInput,
    notify
  } = useStudio();

  const [lockedSlots, setLockedSlots] = useState({});
  const [showExercises, setShowExercises] = useState(true);

  const mood = resolveMood(project);
  const set = (k) => (e) => setProject({ ...project, [k]: e.target.value });

  // Ensure project always has plotSlots populated
  const activeSlots = project.plotSlots || ANIMATION_EXERCISES[0].defaultSlots;

  const toggleLock = (key) => {
    setLockedSlots((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Reroll all unlocked slots and synthesize tailored multi-camera shots
  const handleRollUnlockedSlots = (tierOverride) => {
    const targetTier = tierOverride || project.tier || 'mundane';
    const nextSlots = rollPlotSlots(targetTier, activeSlots, lockedSlots);
    if (customSeedInput && customSeedInput.trim() && !lockedSlots.activity) {
      nextSlots.activity = customSeedInput.trim();
    }
    const built = buildStoryFromSlots(targetTier, nextSlots);
    setProject((prev) => ({
      ...built,
      references: prev.references || [],
      customMoods: prev.customMoods,
      music: prev.music
    }));
    const lockedCount = Object.values(lockedSlots).filter(Boolean).length;
    notify(
      `Generated ${targetTier.toUpperCase()} story & ${built.shots.length} camera shots${
        lockedCount ? ` (${lockedCount} locked slot${lockedCount > 1 ? 's' : ''} kept)` : ''
      }`
    );
  };

  // Reroll a single slot and immediately update the story spine & shots
  const handleRerollSingleSlot = (slotDef) => {
    const pool = PLOT_SLOT_POOLS[project.tier || 'mundane'] || PLOT_SLOT_POOLS.mundane;
    const options = pool[slotDef.poolKey] || [];
    if (!options.length) return;
    const currentVal = activeSlots[slotDef.key];
    const filtered = options.filter((x) => x !== currentVal);
    const nextVal = filtered[Math.floor(Math.random() * filtered.length)] || options[0];
    const nextSlots = { ...activeSlots, [slotDef.key]: nextVal };
    const built = buildStoryFromSlots(project.tier || 'mundane', nextSlots, project.title);
    setProject((prev) => ({
      ...built,
      references: prev.references || [],
      customMoods: prev.customMoods,
      music: prev.music
    }));
    notify(`Rerolled ${slotDef.label.split('·')[1]?.trim() || slotDef.key}`);
  };

  // Edit a single slot inline and sync spine
  const handleEditSlot = (key, value) => {
    const nextSlots = { ...activeSlots, [key]: value };
    const built = buildStoryFromSlots(project.tier || 'mundane', nextSlots, project.title);
    setProject((prev) => ({
      ...prev,
      plotSlots: nextSlots,
      logline: built.logline,
      theme: built.theme,
      hook: built.hook,
      conflict: built.conflict,
      resolution: built.resolution
    }));
  };

  // Load one of the 51 Animation Exercises drills directly into the pipeline
  const handleLoadExercise = (ex) => {
    const built = buildStoryFromSlots(ex.tier, { ...ex.defaultSlots }, ex.title);
    setProject((prev) => ({
      ...built,
      exerciseId: ex.id,
      references: prev.references || [],
      customMoods: prev.customMoods,
      music: prev.music
    }));
    notify(`Loaded Exercise #${ex.num}: "${ex.title}" (${built.shots.length} shots)`);
  };

  return (
    <div className="space-y-6 stagger">
      {/* Top Seed Bar */}
      <div className="glass p-2">
        <div className="flex flex-wrap items-center gap-2 rounded-lg p-1.5" style={{ background: 'var(--panel-soft)' }}>
          <Zap className="ml-2 h-4 w-4 text-accent" />
          <input
            value={customSeedInput}
            onChange={(e) => setCustomSeedInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRollUnlockedSlots(project.tier)}
            placeholder='Custom action seed… e.g. "carrying an overflowing soup bowl up stairs" or "dodging patrol drones on a rooftop"'
            className="min-w-[220px] flex-1 bg-transparent px-2 py-2 text-sm outline-none"
            style={{ color: 'var(--text)' }}
          />
          <button onClick={() => handleRollUnlockedSlots(project.tier)} className="btn btn-primary">
            <Dices className="h-4 w-4" /> Roll Unlocked Slots & Shots
          </button>
          <button onClick={handleGeminiGenerate} disabled={aiLoading} className="btn btn-ghost">
            <Wand2 className="h-3.5 w-3.5" /> {aiLoading ? 'Thinking…' : 'AI expand'}
          </button>
        </div>
      </div>

      {/* 3 Complexity Tiers (Reddit Beginner Guide Progression Ladder) */}
      <div className="grid gap-4 md:grid-cols-3">
        {COMPLEXITY_TIERS.map((tier) => {
          const art = TIER_ART[tier.id];
          const Icon = art.icon;
          const on = project.tier === tier.id;
          return (
            <div
              key={tier.id}
              onClick={() => setProject((p) => ({ ...p, tier: tier.id }))}
              className={`glass glass-hover group cursor-pointer p-5 ${on ? 'ring-accent' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{
                    background: on ? 'var(--accent-soft)' : 'var(--panel-soft)',
                    color: on ? 'var(--accent)' : 'var(--text-2)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`chip ${on ? 'chip-accent' : ''}`}>{tier.badge}</span>
              </div>
              <h3 className="h-display mt-3.5 text-base">{tier.label.split('·')[1]?.trim() || tier.label}</h3>
              <div className="eyebrow mt-0.5">
                {tier.label.split('·')[0]} · {art.tag}
              </div>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
                {tier.description}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRollUnlockedSlots(tier.id);
                }}
                className={`btn btn-sm mt-4 w-full ${on ? 'btn-accent-soft' : 'btn-ghost'}`}
              >
                <Dices className="h-3.5 w-3.5" /> Roll {tier.id} story
              </button>
            </div>
          );
        })}
      </div>

      {/* Starter Studies + 51 Animation Exercises Toggle Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1">Starter studies:</span>
          {STARTER_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p)}
              className={`btn btn-sm ${project.id === p.id ? 'btn-accent-soft' : 'btn-ghost'}`}
            >
              {p.title.split('(')[0].trim()}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowExercises(!showExercises)}
          className={`btn btn-sm ${showExercises ? 'btn-accent-soft' : 'btn-ghost'}`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          {showExercises ? 'Hide 51 Animation Exercises Ladder' : 'Browse 51 Animation Exercises Ladder'}
        </button>
      </div>

      {/* 51 Great Animation Exercises & Reddit Beginner Skill Drills Browser */}
      {showExercises && (
        <Panel className="space-y-4">
          <SectionTitle
            eyebrow="Animator Island 51 Exercises × r/animation Beginner Ladder"
            title="Animation Exercise Story Drills (Mechanics Inside a Story)"
            right={
              <span className="chip">Click any drill to load its story spine, acting cues & camera shots</span>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ANIMATION_EXERCISES.map((ex) => {
              const active = project.exerciseId === ex.id || project.title === ex.title;
              return (
                <div
                  key={ex.id}
                  onClick={() => handleLoadExercise(ex)}
                  className={`glass-soft glass-hover flex cursor-pointer flex-col justify-between p-3.5 transition ${
                    active ? 'ring-accent' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="chip chip-accent font-bold">Drill #{ex.num}</span>
                      <span className="eyebrow">{ex.tier}</span>
                    </div>
                    <h4 className="h-display mt-2 text-sm leading-snug">{ex.title}</h4>
                    <p className="mt-1.5 text-[11.5px] leading-relaxed" style={{ color: 'var(--text-2)' }}>
                      <strong style={{ color: 'var(--text)' }}>Skill:</strong> {ex.skillFocus}
                    </p>
                    <p className="mt-1 text-[11px] italic" style={{ color: 'var(--text-3)' }}>
                      “{ex.livingLinesNote}”
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-2 text-[11px] font-semibold text-accent" style={{ borderColor: 'var(--border)' }}>
                    <span>{active ? '✓ Active Drill' : 'Load Drill & Shots'}</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {/* Lockable 7-Slot Plot, Emotion Subtext & Camera Grammar Synthesizer */}
      <Panel className="space-y-4">
        <SectionTitle
          eyebrow="Plot Generator × Perchance Emotion × Living Lines × Tuts+ Camera Lingo"
          title="Lockable Story, Acting & Camera Slot Matrix"
          right={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLockedSlots({})}
                className="btn btn-ghost btn-sm"
                disabled={!Object.values(lockedSlots).some(Boolean)}
              >
                Unlock all
              </button>
              <button onClick={() => handleRollUnlockedSlots(project.tier)} className="btn btn-primary btn-sm">
                <Dices className="h-3.5 w-3.5" /> Reroll unlocked slots
              </button>
            </div>
          }
        />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {SLOT_DEFS.map((slot) => {
            const isLocked = !!lockedSlots[slot.key];
            return (
              <div
                key={slot.key}
                className={`glass-soft flex flex-col justify-between p-3.5 transition ${
                  isLocked ? 'ring-accent' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-accent">{slot.label}</span>
                    <div className="flex items-center gap-1">
                      <span className="chip text-[9.5px]">{slot.source}</span>
                      <button
                        onClick={() => handleRerollSingleSlot(slot)}
                        className="btn btn-ghost h-6 w-6 p-0"
                        title={`Reroll ${slot.label}`}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => toggleLock(slot.key)}
                        className={`btn h-6 w-6 p-0 ${isLocked ? 'btn-accent-soft' : 'btn-ghost'}`}
                        title={isLocked ? 'Slot locked (click to unlock)' : 'Lock this slot while rolling others'}
                      >
                        {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={activeSlots[slot.key] || ''}
                    onChange={(e) => handleEditSlot(slot.key, e.target.value)}
                    className="mt-2 w-full resize-none bg-transparent text-xs leading-relaxed outline-none"
                    style={{ color: 'var(--text)' }}
                  />
                </div>
                <div className="mt-1.5 border-t pt-1.5 text-[10.5px]" style={{ borderColor: 'var(--border)', color: 'var(--text-3)' }}>
                  {slot.hint}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Editable 3-Beat Story Spine + Live Shot 01 Keyframe */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="space-y-4 lg:col-span-7">
          <SectionTitle eyebrow="Synthesized from your active slots — edit any beat" title="3-Beat Story Spine" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title">
              <input className="sf-input font-semibold" value={project.title} onChange={set('title')} />
            </Field>
            <Field label="Emotional Arc & Drill Theme">
              <input className="sf-input" value={project.theme} onChange={set('theme')} />
            </Field>
          </div>
          <Field label="Logline (One-Sentence Pitch)">
            <textarea rows={2} className="sf-input resize-none" value={project.logline} onChange={set('logline')} />
          </Field>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ['hook', '01 · Sensory Hook & Framing'],
              ['conflict', '02 · Midpoint Friction & Acting Cue'],
              ['resolution', '03 · Payoff & Exit Silhouette']
            ].map(([k, label]) => (
              <div key={k} className="glass-soft p-3.5">
                <div className="font-mono text-[11px] font-bold text-accent">{label}</div>
                <textarea
                  rows={4}
                  value={project[k]}
                  onChange={set(k)}
                  className="mt-1.5 w-full resize-none bg-transparent text-[12.5px] leading-relaxed outline-none"
                  style={{ color: 'var(--text-2)' }}
                />
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="flex flex-col justify-between lg:col-span-5">
          <div>
            <SectionTitle
              eyebrow="Live keyframe · shot 01"
              title="First frame preview"
              right={<span className="chip chip-accent">{mood.name}</span>}
            />
            <StoryboardCanvas shot={project.shots?.[0]} project={project} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              ['Shots', project.shots?.length || 0],
              ['Seconds', (project.shots || []).reduce((a, s) => a + Number(s.duration), 0).toFixed(1)],
              ['Locked Slots', Object.values(lockedSlots).filter(Boolean).length]
            ].map(([l, v]) => (
              <div key={l} className="glass-soft py-2.5">
                <div className="h-display text-xl">{v}</div>
                <div className="eyebrow">{l}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Curated Animation & Storytelling Reference Shelf */}
      <Panel className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="eyebrow">Built-In Storytelling & Animation Reference Shelf</div>
            <p className="text-xs" style={{ color: 'var(--text-2)' }}>
              Our procedural generator combines mechanics, camera lingo, pencil line-of-action, and emotional subtext from these 7 resources:
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {REFERENCE_SOURCES.map((ref) => (
              <a
                key={ref.id}
                href={ref.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-sm"
                title={`${ref.name} — ${ref.tag}`}
              >
                <span>{ref.name}</span>
                <span className="font-mono text-[9.5px] opacity-60">({ref.tag})</span>
                <ExternalLink className="h-3 w-3 text-accent" />
              </a>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}
