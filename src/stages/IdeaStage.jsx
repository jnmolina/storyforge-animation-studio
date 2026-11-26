import React from 'react';
import { Dices, Wand2, Sparkles, Zap, Coffee, Siren } from 'lucide-react';
import { COMPLEXITY_TIERS, STARTER_PRESETS, resolveMood } from '../data/storyEngine';
import { useStudio, Panel, Field, SectionTitle } from '../studio';
import StoryboardCanvas from '../components/StoryboardCanvas';

const TIER_ART = {
  mundane: { icon: Coffee, grad: 'from-emerald-400/25 to-teal-500/5', dot: '#34D399' },
  slice: { icon: Sparkles, grad: 'from-amber-400/25 to-orange-500/5', dot: '#FBBF24' },
  kinetic: { icon: Siren, grad: 'from-rose-500/25 to-fuchsia-500/5', dot: '#FB7185' }
};

export default function IdeaStage() {
  const { project, setProject, loadPreset, handleRollIdea, handleGeminiGenerate, aiLoading, customSeedInput, setCustomSeedInput } = useStudio();
  const mood = resolveMood(project);
  const set = (k) => (e) => setProject({ ...project, [k]: e.target.value });

  return (
    <div className="space-y-6 stagger">
      {/* Prompt bar */}
      <div className="glass overflow-hidden p-1.5">
        <div className="flex flex-wrap items-center gap-2 rounded-[20px] bg-black/30 p-2">
          <Zap className="ml-2 h-5 w-5 text-accent" />
          <input
            value={customSeedInput}
            onChange={(e) => setCustomSeedInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRollIdea(project.tier)}
            placeholder='Any moment… "making toast while late", "escaping police helicopters on a skateboard"'
            className="min-w-[240px] flex-1 bg-transparent px-2 py-2.5 text-[15px] text-white placeholder-white/30 outline-none"
          />
          <button onClick={() => handleRollIdea(project.tier)} className="btn btn-primary">
            <Dices className="h-4 w-4" /> Generate story & shots
          </button>
          <button onClick={handleGeminiGenerate} disabled={aiLoading} className="btn btn-ghost">
            <Wand2 className="h-3.5 w-3.5" /> {aiLoading ? 'Thinking…' : 'AI expand'}
          </button>
        </div>
      </div>

      {/* Tiers */}
      <div className="grid gap-4 md:grid-cols-3">
        {COMPLEXITY_TIERS.map((tier) => {
          const art = TIER_ART[tier.id];
          const Icon = art.icon;
          const on = project.tier === tier.id;
          return (
            <div
              key={tier.id}
              onClick={() => setProject((p) => ({ ...p, tier: tier.id }))}
              className={`glass glass-hover group cursor-pointer overflow-hidden p-5 ${on ? 'ring-accent' : ''}`}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${art.grad} opacity-70`} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/40 ring-1 ring-white/10">
                    <Icon className="h-5 w-5" style={{ color: art.dot }} />
                  </div>
                  <span className="chip">{tier.badge}</span>
                </div>
                <h3 className="h-display mt-4 text-lg">{tier.label.split('·')[1]?.trim() || tier.label}</h3>
                <div className="eyebrow mt-0.5">{tier.label.split('·')[0]}</div>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{tier.description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRollIdea(tier.id);
                  }}
                  className="btn btn-ghost btn-sm mt-4 w-full"
                >
                  <Dices className="h-3.5 w-3.5" style={{ color: art.dot }} /> Roll an idea
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Presets ribbon */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="eyebrow mr-1">Start from an example</span>
        {STARTER_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => loadPreset(p)}
            className={`btn btn-sm ${project.id === p.id ? 'btn-accent-soft' : 'btn-ghost'}`}
          >
            {p.tier === 'mundane' ? '👟' : p.tier === 'slice' ? '🍫' : '🚓'} {p.title.split('(')[0].trim()}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="space-y-4 lg:col-span-7">
          <SectionTitle eyebrow="Iterate freely — everything downstream updates" title="Story spine" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title">
              <input className="sf-input font-semibold" value={project.title} onChange={set('title')} />
            </Field>
            <Field label="Theme / feeling">
              <input className="sf-input" value={project.theme} onChange={set('theme')} />
            </Field>
          </div>
          <Field label="Logline">
            <textarea rows={2} className="sf-input resize-none" value={project.logline} onChange={set('logline')} />
          </Field>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ['hook', '01 · Hook', '#34D399'],
              ['conflict', '02 · Escalation', '#FBBF24'],
              ['resolution', '03 · Payoff', '#38BDF8']
            ].map(([k, label, c]) => (
              <div key={k} className="glass-soft relative overflow-hidden p-3.5">
                <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: c }} />
                <div className="font-mono text-[11px] font-bold" style={{ color: c }}>
                  {label}
                </div>
                <textarea rows={4} value={project[k]} onChange={set(k)} className="mt-1.5 w-full resize-none bg-transparent text-[13px] leading-relaxed text-white/75 outline-none" />
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="flex flex-col lg:col-span-5">
          <SectionTitle eyebrow="Live keyframe · shot 01" title="First frame" right={<span className="chip chip-accent">{mood.name}</span>} />
          <StoryboardCanvas shot={project.shots?.[0]} project={project} />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              ['Shots', project.shots?.length || 0],
              ['Seconds', (project.shots || []).reduce((a, s) => a + Number(s.duration), 0).toFixed(1)],
              ['Cast', project.characters?.length || 0]
            ].map(([l, v]) => (
              <div key={l} className="glass-soft py-3">
                <div className="h-display text-2xl">{v}</div>
                <div className="eyebrow">{l}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
