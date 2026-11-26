import React from 'react';
import { Play, Pause, Music, SkipBack, Minus, Plus } from 'lucide-react';
import { useStudio, Panel } from '../studio';
import StoryboardCanvas from '../components/StoryboardCanvas';

export default function AnimaticStage() {
  const {
    project, fps, setFps, updateShot, setActiveShotIndex, isPlayingAnimatic, setIsPlayingAnimatic, playheadSec, setPlayheadSec,
    currentFrame, totalDurationSec, syncMusicInAnimatic, setSyncMusicInAnimatic, music, customAudio, selectedTrack, go
  } = useStudio();
  const cur = currentFrame;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="glass overflow-hidden p-0">
            <div className="sprockets h-3 bg-black/60" />
            <div className="relative bg-black">
              <StoryboardCanvas shot={cur.shot} project={project} animProgress={isPlayingAnimatic ? cur.localProgress : 0} className="rounded-none ring-0" showGuides={false} />
              <div className="pointer-events-none absolute inset-x-[8%] bottom-[9%] rounded-2xl bg-black/70 px-4 py-2.5 text-center ring-1 ring-white/10 backdrop-blur-md">
                <div className="text-[13px] text-white">{cur.shot?.action}</div>
                {cur.shot?.dialogue && <div className="mt-0.5 font-mono text-xs font-bold text-amber-200">{cur.shot.dialogue}</div>}
                {cur.shot?.soundCue && <div className="mt-0.5 font-mono text-[10px] text-sky-300">🔊 {cur.shot.soundCue}</div>}
              </div>
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[11px] ring-1 ring-white/10">
                {isPlayingAnimatic && <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />}
                <span className="text-white/80">{playheadSec.toFixed(2)}s</span>
                <span className="text-white/30">/ {totalDurationSec.toFixed(1)}s</span>
                <span className="text-white/30">· F{Math.max(1, Math.round(playheadSec * fps))}</span>
              </div>
            </div>
            <div className="sprockets h-3 bg-black/60" />
            <div className="flex flex-wrap items-center gap-3 p-4">
              <button onClick={() => { setIsPlayingAnimatic(false); setPlayheadSec(0); }} className="btn btn-ghost h-10 w-10 p-0">
                <SkipBack className="h-4 w-4" />
              </button>
              <button onClick={() => setIsPlayingAnimatic(!isPlayingAnimatic)} className="btn btn-primary h-12 w-12 p-0">
                {isPlayingAnimatic ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
              </button>
              <input
                type="range"
                min="0"
                max={totalDurationSec}
                step="0.02"
                value={playheadSec}
                onChange={(e) => { setIsPlayingAnimatic(false); setPlayheadSec(Number(e.target.value)); }}
                className="flex-1"
              />
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-white/60">
                <input type="checkbox" checked={syncMusicInAnimatic} onChange={(e) => setSyncMusicInAnimatic(e.target.checked)} /> Temp music
              </label>
              <div className="seg">
                {[12, 24, 30].map((f) => (
                  <button key={f} data-on={fps === f} onClick={() => setFps(f)}>{f}fps</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Panel className="lg:col-span-4">
          <div className="eyebrow">Feel the rhythm before keyframing</div>
          <h3 className="h-display mb-4 text-lg">Beat timing</h3>
          <div className="max-h-[470px] space-y-2 overflow-y-auto pr-1">
            {project.shots.map((s, i) => (
              <div key={s.id} className={`glass-soft flex items-center gap-3 p-2.5 transition ${i === cur.shotIndex ? 'ring-accent' : ''}`}>
                <div className="w-16 shrink-0"><StoryboardCanvas shot={s} project={project} showBadges={false} showGuides={false} showCameraArrows={false} className="rounded-lg" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{s.title}</div>
                  <div className="font-mono text-[10px] text-white/40">{Math.round(s.duration * fps)}f · {s.cameraMove}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="btn btn-ghost h-6 w-6 p-0" onClick={() => updateShot(s.id, { duration: Math.max(0.5, +(s.duration - 0.25).toFixed(2)) })}><Minus className="h-3 w-3" /></button>
                  <span className="w-11 text-center font-mono text-xs font-bold text-accent">{Number(s.duration).toFixed(2)}</span>
                  <button className="btn btn-ghost h-6 w-6 p-0" onClick={() => updateShot(s.id, { duration: +(s.duration + 0.25).toFixed(2) })}><Plus className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Timeline */}
      <Panel className="p-4">
        <div className="mb-2 flex justify-between font-mono text-[10.5px] text-white/40">
          <span>V1 · STORYBOARD</span>
          <span>{totalDurationSec.toFixed(2)}s · {Math.round(totalDurationSec * fps)} frames</span>
        </div>
        <div className="relative">
          <div className="flex h-24 overflow-hidden rounded-2xl ring-1 ring-white/10">
            {project.shots.map((s, i) => {
              let start = 0;
              for (let k = 0; k < i; k++) start += Number(project.shots[k].duration);
              return (
                <div
                  key={s.id}
                  onClick={() => { setPlayheadSec(start + 0.01); setActiveShotIndex(i); }}
                  style={{ width: `${(s.duration / totalDurationSec) * 100}%` }}
                  className={`relative cursor-pointer overflow-hidden border-r border-black/60 transition ${i === cur.shotIndex ? '' : 'opacity-60 hover:opacity-90'}`}
                >
                  <div className="absolute inset-0">
                    <StoryboardCanvas shot={s} project={project} showBadges={false} showGuides={false} showCameraArrows={false} className="h-full rounded-none ring-0 [&>svg]:h-full" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-1.5 left-2 right-2 truncate font-mono text-[10px] text-white"><b className="text-accent">SH{s.number}</b> {s.title}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex h-9 items-center justify-between rounded-xl bg-emerald-500/10 px-3 font-mono text-[11px] text-emerald-300 ring-1 ring-emerald-400/20">
            <span className="flex items-center gap-2 truncate"><Music className="h-3.5 w-3.5" /> A1 · {customAudio.name || selectedTrack.title} · {music.trimStart.toFixed(1)}→{music.trimEnd.toFixed(1)}s</span>
            <button className="text-amber-200 hover:underline" onClick={() => go('music')}>Edit cut →</button>
          </div>
          <div className="pointer-events-none absolute -top-1 bottom-0 w-0.5 bg-rose-500 shadow-[0_0_10px_#f43f5e]" style={{ left: `${Math.min(100, (playheadSec / totalDurationSec) * 100)}%` }}>
            <div className="-ml-1.5 h-3 w-3.5 rounded-sm bg-rose-500" />
          </div>
        </div>
      </Panel>
    </div>
  );
}
