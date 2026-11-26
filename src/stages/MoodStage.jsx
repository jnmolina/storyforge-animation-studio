import React, { useState } from 'react';
import { Check, Sparkles, RefreshCw } from 'lucide-react';
import { MOOD_VARIATIONS, resolveMood } from '../data/storyEngine';
import { PHOTO_GRADES } from '../utils/color';
import { useStudio, Panel, Palette, SectionTitle, UI_THEMES } from '../studio';
import StoryboardCanvas from '../components/StoryboardCanvas';
import { RefDropzone } from './ReferenceStage';

function MoodCard({ mood, shot, big = false }) {
  const { project, setProject, notify } = useStudio();
  const on = project.moodKey === mood.id;
  return (
    <div
      onClick={() => {
        setProject({ ...project, moodKey: mood.id });
        notify(`Applied “${mood.name}” to boards, animatic & Blender lighting`);
      }}
      className={`glass glass-hover group cursor-pointer p-3.5 ${on ? 'ring-accent' : ''}`}
    >
      <div className="relative">
        <StoryboardCanvas shot={shot} project={project} moodOverride={mood.id} showGuides={false} showBadges={false} />
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          {on && (
            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-black" style={{ background: 'var(--accent)' }}>
              <Check className="h-3 w-3" /> ACTIVE
            </span>
          )}
          {mood.custom && <span className="rounded-full bg-fuchsia-500/80 px-2 py-0.5 text-[10px] font-bold text-white">FROM REFS</span>}
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-2 px-0.5">
        <div>
          <h4 className={`h-display ${big ? 'text-lg' : 'text-base'}`}>{mood.name}</h4>
          <p className="text-xs text-white/45">{mood.subtitle}</p>
        </div>
        <div className="text-right font-mono text-[10px] text-white/35">
          <div>key {mood.keyEnergy}×</div>
          <div>fill {mood.fillEnergy}×</div>
        </div>
      </div>
      <div className="mt-3">
        <Palette colors={mood.palette} labels />
      </div>
      {big && <p className="mt-3 text-xs leading-relaxed text-white/50">{mood.lightingNotes}</p>}
    </div>
  );
}

export default function MoodStage() {
  const { project, activeShotIndex, setActiveShotIndex, generateRefMoods, uiTheme, setUiTheme } = useStudio();
  const shot = project.shots[activeShotIndex] || project.shots[0];
  const moodRefs = (project.references || []).filter((r) => r.src && r.use !== 'storyboard');
  const custom = project.customMoods ? Object.values(project.customMoods) : [];
  const [grade, setGrade] = useState('all');
  const active = resolveMood(project);

  return (
    <div className="space-y-8">
      <Panel className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="eyebrow">Test on</span>
          <select className="sf-input w-auto py-1.5" value={activeShotIndex} onChange={(e) => setActiveShotIndex(Number(e.target.value))}>
            {project.shots.map((s, i) => (
              <option key={s.id} value={i}>SH{String(s.number).padStart(2, '0')} · {s.title}</option>
            ))}
          </select>
          <span className="eyebrow ml-2">UI Workspace Theme:</span>
          <div className="seg">
            {UI_THEMES.map((t) => (
              <button key={t.id} data-on={uiTheme === t.id} onClick={() => setUiTheme(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden w-40 sm:block"><Palette colors={active.palette} size="sm" /></div>
          <button className="btn btn-primary" onClick={generateRefMoods} disabled={!moodRefs.length}>
            {custom.length ? <RefreshCw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            {custom.length ? 'Regenerate from refs' : 'Generate from my refs'}
          </button>
        </div>
      </Panel>

      {moodRefs.length === 0 && <RefDropzone compact />}

      {custom.length > 0 && (
        <section>
          <SectionTitle eyebrow={`Palette pulled from ${moodRefs.length} of your images`} title="Generated from your references" />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 stagger">
            {custom.map((m) => (
              <MoodCard key={m.id} mood={m} shot={shot} big={m.id === 'ref'} />
            ))}
          </div>
        </section>
      )}

      {moodRefs.length > 0 && (
        <section>
          <SectionTitle
            eyebrow="Your own images, color-graded"
            title="Reference mood wall"
            right={
              <div className="seg">
                {[['all', 'All 5'], ...Object.entries(PHOTO_GRADES).map(([k, g]) => [k, g.label])].map(([k, l]) => (
                  <button key={k} data-on={grade === k} onClick={() => setGrade(k)}>
                    {l}
                  </button>
                ))}
              </div>
            }
          />
          {grade === 'all' ? (
            <div className="space-y-4">
              {moodRefs.map((r) => (
                <div key={r.id} className="glass p-3">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="truncate text-sm font-semibold">{r.title}</span>
                    {r.palette && <div className="w-32"><Palette colors={r.palette} size="sm" /></div>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {Object.entries(PHOTO_GRADES).map(([k, g]) => (
                      <figure key={k}>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-white/10">
                          <img src={r.src} alt="" className="h-full w-full object-cover" style={{ filter: g.filter }} />
                          {g.tint && <div className="absolute inset-0 opacity-50 mix-blend-soft-light" style={{ background: g.tint }} />}
                        </div>
                        <figcaption className="mt-1 text-center font-mono text-[10px] uppercase text-white/40">{g.label}</figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="columns-2 gap-3 md:columns-3 xl:columns-4">
              {moodRefs.map((r) => (
                <div key={r.id} className="relative mb-3 break-inside-avoid overflow-hidden rounded-2xl ring-1 ring-white/10">
                  <img src={r.src} alt="" className="block w-full" style={{ filter: PHOTO_GRADES[grade].filter }} />
                  {PHOTO_GRADES[grade].tint && <div className="absolute inset-0 opacity-50 mix-blend-soft-light" style={{ background: PHOTO_GRADES[grade].tint }} />}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <SectionTitle eyebrow="Built-in color scripts" title="Studio presets · Warm · Cold · Dark · Light" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 stagger">
          {Object.values(MOOD_VARIATIONS).map((m) => (
            <MoodCard key={m.id} mood={m} shot={shot} />
          ))}
        </div>
      </section>
    </div>
  );
}
