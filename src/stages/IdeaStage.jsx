import React from 'react';
import { Dices, Wand2, Sparkles, Zap, Coffee, Siren } from 'lucide-react';
import { COMPLEXITY_TIERS, STARTER_PRESETS, resolveMood } from '../data/storyEngine';
import { useStudio, Panel, Field, SectionTitle } from '../studio';
import StoryboardCanvas from '../components/StoryboardCanvas';

const TIER_ART = {
  mundane: { icon: Coffee, tag: 'Everyday Micro-Story' },
  slice: { icon: Sparkles, tag: 'Routine + Friction' },
  kinetic: { icon: Siren, tag: 'Momentum & Staging' }
};

export default function IdeaStage() {
  const { project, setProject, loadPreset, handleRollIdea, handleGeminiGenerate, aiLoading, customSeedInput, setCustomSeedInput } = useStudio();
  const mood = resolveMood(project);
  const set = (k) => (e) => setProject({ ...project, [k]: e.target.value });

  return (
    <div className="space-y-6 stagger">
      {/* Prompt bar */}
      <div className="glass p-2">
        <div className="flex flex-wrap items-center gap-2 rounded-lg p-1.5" style={{ background: 'var(--panel-soft)' }}>
          <Zap className="ml-2 h-4 w-4 text-accent" />
          <input
            value={customSeedInput}
            onChange={(e) => setCustomSeedInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRollIdea(project.tier)}
            placeholder='Describe any moment… "making toast while late" or "escaping police on a skateboard"'
            className="min-w-[220px] flex-1 bg-transparent px-2 py-2 text-sm outline-none"
            style={{ color: 'var(--text)' }}
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
              <div className="eyebrow mt-0.5">{tier.label.split('·')[0]} · {art.tag}</div>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{tier.description}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRollIdea(tier.id);
                }}
                className={`btn btn-sm mt-4 w-full ${on ? 'btn-accent-soft' : 'btn-ghost'}`}
              >
                <Dices className="h-3.5 w-3.5" /> Roll {tier.id} idea
              </button>
            </div>
          );
        })}
      </div>

      {/* Presets ribbon */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="eyebrow mr-1">Starter studies</span>
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

      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="space-y-4 lg:col-span-7">
          <SectionTitle eyebrow="Iterate freely — downstream stages sync automatically" title="Story spine" />
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
              ['hook', '01 · Hook'],
              ['conflict', '02 · Escalation'],
              ['resolution', '03 · Payoff']
            ].map(([k, label]) => (
              <div key={k} className="glass-soft p-3.5">
                <div className="font-mono text-[11px] font-bold text-accent">
                  {label}
                </div>
                <textarea
                  rows={4}
                  value={project[k]}
                  onChange={set(k)}
                  className="mt-1.5 w-full resize-none bg-transparent text-[13px] leading-relaxed outline-none"
                  style={{ color: 'var(--text-2)' }}
                />
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
