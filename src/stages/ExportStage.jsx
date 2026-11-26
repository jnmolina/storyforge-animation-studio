import React, { useRef } from 'react';
import { Package, Download, FileDown, Upload, Save, Loader2, FileText, FolderArchive } from 'lucide-react';
import { EXPORT_STEPS } from '../utils/exporters';
import { useStudio, Panel } from '../studio';

const ICONS = {
  md: '📝', json: '🧩', csv: '📊', fountain: '🎬', html: '🌐', png: '🖼', gpl: '🎨', css: '🎨', edl: '✂️', srt: '💬', py: '🐍', wav: '🎵'
};
const ext = (f) => f.split('.').pop().replace('*', '');

export default function ExportStage() {
  const { project, exportBusy, exportProgress, runExportAll, runExportStep, runExportFile, saveProjectFile, importProject } = useStudio();
  const fileRef = useRef(null);
  const refCount = (project.references || []).length;

  return (
    <div className="space-y-6">
      <div className="glass relative overflow-hidden p-7">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-40 blur-3xl" style={{ background: 'var(--accent)' }} />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="eyebrow mb-2">One click · fully offline</div>
            <h3 className="h-display text-2xl">Export the whole pipeline</h3>
            <p className="mt-2 text-sm text-white/55">
              A single .zip with 9 numbered folders — Markdown, CSV, JSON, Fountain screenplay, PNG storyboards, printable HTML sheets, GIMP/Krita palettes, an EDL +
              SRT + offline animatic player, the Blender .py and a rendered WAV of your temp-music cut. Plus a project file you can re-import.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="chip">{project.shots.length} panels</span>
              <span className="chip">{refCount} references</span>
              <span className="chip">{Object.keys(project.customMoods || {}).length + 4} mood variations</span>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-2">
            <button className="btn btn-primary px-6 py-3 text-sm" onClick={runExportAll} disabled={!!exportBusy}>
              {exportBusy === 'all' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />} Export everything (.zip)
            </button>
            {exportBusy === 'all' && <div className="text-center font-mono text-[11px] text-white/50">{exportProgress}</div>}
            <div className="flex gap-2">
              <button className="btn btn-ghost flex-1" onClick={saveProjectFile}>
                <Save className="h-3.5 w-3.5" /> Save project
              </button>
              <button className="btn btn-ghost flex-1" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" /> Import
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importProject(f);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 stagger">
        {EXPORT_STEPS.map((s) => (
          <Panel key={s.id} className="flex flex-col p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderArchive className="h-4 w-4 text-accent" />
                <span className="font-mono text-[11px] text-white/40">{s.folder}/</span>
              </div>
              <button className="btn btn-accent-soft btn-sm" onClick={() => runExportStep(s.id)} disabled={!!exportBusy}>
                {exportBusy === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} .zip
              </button>
            </div>
            <h4 className="h-display mb-2 text-base">{s.label}</h4>
            <div className="space-y-1">
              {s.files.map((f) => {
                const single = !f.includes('*') && !f.includes('#');
                return (
                  <div key={f} className="flex items-center justify-between rounded-lg px-2 py-1 text-xs hover:bg-white/[0.04]">
                    <span className="flex items-center gap-2 font-mono text-white/65">
                      <span>{ICONS[ext(f)] || <FileText className="h-3 w-3" />}</span>
                      {f}
                    </span>
                    {single && (
                      <button className="text-white/30 hover:text-accent" title={`Download ${f}`} onClick={() => runExportFile(s.id, f)} disabled={!!exportBusy}>
                        <FileDown className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
