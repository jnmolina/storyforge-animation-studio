import React from 'react';
import { RefreshCw, Send, Box, Download, Copy } from 'lucide-react';
import { useStudio, Panel } from '../studio';
import Previz3DViewport from '../components/Previz3DViewport';

export default function PrevizStage() {
  const { project, fps, activeShotIndex, setActiveShotIndex, blenderStatus, blenderBusy, checkBlenderBridge, handlePushToBlender, handleLaunchBlenderApp, handleDownloadBlenderScript, blenderPythonCode, notify } = useStudio();

  let cur = 1;
  const rows = project.shots.map((s, i) => {
    const n = Math.max(12, Math.round(Number(s.duration) * fps));
    const r = { s, i, a: cur, b: cur + n - 1 };
    cur += n;
    return r;
  });

  return (
    <div className="space-y-6">
      <Panel className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <span className={`relative flex h-3 w-3`}>
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${blenderStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className={`relative inline-flex h-3 w-3 rounded-full ${blenderStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </span>
          <div>
            <div className="text-sm font-semibold">{blenderStatus.connected ? 'Live Blender connected' : 'Blender not connected'}</div>
            <div className="max-w-xl text-xs text-white/45">{blenderStatus.message}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-ghost" onClick={checkBlenderBridge}><RefreshCw className="h-3.5 w-3.5" /> Check</button>
          <button className="btn btn-primary" onClick={handlePushToBlender} disabled={blenderBusy}><Send className="h-3.5 w-3.5" /> {blenderBusy ? 'Pushing…' : 'Push to open Blender'}</button>
          <button className="btn btn-accent-soft" onClick={handleLaunchBlenderApp} disabled={blenderBusy}><Box className="h-3.5 w-3.5" /> Launch Blender</button>
          <button className="btn btn-ghost" onClick={handleDownloadBlenderScript}><Download className="h-3.5 w-3.5" /> .py</button>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <div className="glass overflow-hidden p-0">
            <Previz3DViewport project={project} activeShotIndex={activeShotIndex} onSelectShot={setActiveShotIndex} />
          </div>
          <Panel className="p-4">
            <div className="eyebrow mb-3">Camera & timeline-marker manifest · {fps}fps</div>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-white/35">
                    <th className="pb-2">Camera</th><th className="pb-2">Frames</th><th className="pb-2">Lens · move</th><th className="pb-2">Start → end</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ s, i, a, b }) => (
                    <tr key={s.id} onClick={() => setActiveShotIndex(i)} className={`cursor-pointer border-t border-white/5 ${i === activeShotIndex ? 'text-accent' : 'text-white/65 hover:text-white'}`}>
                      <td className="py-2 font-bold">SF_Cam_SH{String(i + 1).padStart(2, '0')}_{s.shotType}</td>
                      <td className="py-2">F{a}–F{b}</td>
                      <td className="py-2">{s.focalLength}mm · {s.cameraMove}</td>
                      <td className="py-2 text-[10.5px] text-white/40">[{(s.camStart || []).join(', ')}] → [{(s.camEnd || []).join(', ')}]</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
        <div className="glass flex flex-col p-4 lg:col-span-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="eyebrow">Generated bpy script</span>
            <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(blenderPythonCode); notify('Copied Blender script'); }}>
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
          <pre className="max-h-[640px] flex-1 overflow-auto rounded-2xl bg-black/50 p-4 font-mono text-[11px] leading-relaxed text-emerald-200/90 ring-1 ring-white/5">{blenderPythonCode}</pre>
        </div>
      </div>
    </div>
  );
}
