import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Sparkles, Users, Clapperboard, LayoutGrid, Palette as PaletteIcon, Film, Box, Music, Images, Package,
  Wand2, CheckCircle2, AlertCircle, X, Download, Loader2, KeyRound, Menu
} from 'lucide-react';
import { STARTER_PRESETS, CAMERA_SHOT_TYPES, ROYALTY_FREE_TRACKS, generateProceduralStory, resolveMood } from './data/storyEngine';
import { generateBlenderPrevizScript } from './utils/blenderGenerator';
import { studioAudio } from './utils/audioSynth';
import { ingestFile, ingestUrl, extractUrls, autoMatchShots, moodsFromReferences } from './utils/references';
import { exportAllZip, exportStepZip, downloadStepFile, exportProjectJson, EXPORT_STEPS } from './utils/exporters';
import { StudioContext, StageHeader, StageNav, Palette } from './studio';
import SketchPadModal from './components/SketchPadModal';
import IdeaStage from './stages/IdeaStage';
import WorldStage from './stages/WorldStage';
import ScriptStage from './stages/ScriptStage';
import ReferenceStage from './stages/ReferenceStage';
import StoryboardStage from './stages/StoryboardStage';
import MoodStage from './stages/MoodStage';
import AnimaticStage from './stages/AnimaticStage';
import PrevizStage from './stages/PrevizStage';
import MusicStage from './stages/MusicStage';
import ExportStage from './stages/ExportStage';

const STEPS = [
  { id: 'idea', num: '01', label: 'Idea Lab', sub: 'Mundane → action', icon: Sparkles, accent: '#FBBF24', accent2: '#FB7185', title: 'Find the story first.', desc: 'Pick a scale — a tiny everyday moment or a full-blown chase — and roll ideas until one sparks. Everything downstream regenerates from this spine.', C: IdeaStage },
  { id: 'world', num: '02', label: 'Cast & Set', sub: 'Characters & props', icon: Users, accent: '#34D399', accent2: '#22D3EE', title: 'Who, where, and with what.', desc: 'Readable silhouettes, one clear goal, one acting quirk. Every prop becomes a proxy block in Blender.', C: WorldStage },
  { id: 'script', num: '03', label: 'Script & Cameras', sub: 'Blender-ready shots', icon: Clapperboard, accent: '#38BDF8', accent2: '#818CF8', title: 'Write it like a director.', desc: 'Each beat carries framing, lens, angle, movement and real 3D camera coordinates for previz.', C: ScriptStage },
  { id: 'refs', num: '04', label: 'Reference Library', sub: 'Your images & links', icon: Images, accent: '#E879F9', accent2: '#818CF8', title: 'Bring your own references.', desc: 'Upload images or paste links. We pull palettes, auto-tag warm / cold / dark / light, and feed them into storyboards and mood boards.', C: ReferenceStage },
  { id: 'storyboard', num: '05', label: 'Storyboards', sub: 'Generated from refs', icon: LayoutGrid, accent: '#A78BFA', accent2: '#F472B6', title: 'See every beat.', desc: 'Panels auto-frame your references per shot type, convert them to pencil line-art, or let Gemini draw them. Draw over anything.', C: StoryboardStage },
  { id: 'mood', num: '06', label: 'Mood Board', sub: 'Warm · cold · dark · light', icon: PaletteIcon, accent: '#FB7185', accent2: '#FBBF24', title: 'Decide how it feels.', desc: 'Variations built from your own images and from studio presets. The active mood drives boards, animatic and Blender lighting.', C: MoodStage },
  { id: 'animatic', num: '07', label: 'Animatic', sub: 'Timing & edit', icon: Film, accent: '#F43F5E', accent2: '#FB923C', title: 'Feel the rhythm.', desc: 'Play the boards with camera motion, dialogue and temp music. Nudge holds until the cut breathes.', C: AnimaticStage },
  { id: 'previz', num: '08', label: 'Blender Previz', sub: 'Live 3D bridge', icon: Box, accent: '#22D3EE', accent2: '#34D399', title: 'Block it in 3D.', desc: 'Cameras, proxies, mood lighting and timeline markers — pushed straight into Blender.', C: PrevizStage },
  { id: 'music', num: '09', label: 'Temp Music', sub: 'Find, import, cut', icon: Music, accent: '#A3E635', accent2: '#34D399', title: 'Score the beat.', desc: 'Grab royalty-free tracks, import them, and trim the cut so the hit lands on your key moment.', C: MusicStage },
  { id: 'export', num: '10', label: 'Export', sub: 'Offline files', icon: Package, accent: '#F5F5F4', accent2: '#C4B5FD', title: 'Take it anywhere.', desc: 'Every stage as plain, reusable files — or the whole project in one zip.', C: ExportStage }
];

const DEFAULT_MUSIC = { trackId: ROYALTY_FREE_TRACKS[0].id, trimStart: 1.5, trimEnd: 14, offset: 0, volume: 0.75 };
const normalize = (p) => ({ references: [], ...p, music: { ...DEFAULT_MUSIC, ...(p.music || {}) } });

export default function App() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('storyforge_tab') || 'idea');
  const [project, setProject] = useState(() => {
    try {
      const saved = localStorage.getItem('storyforge_active_project_v1');
      if (saved) return normalize(JSON.parse(saved));
    } catch {
      /* ignore */
    }
    return normalize(JSON.parse(JSON.stringify(STARTER_PRESETS[0])));
  });
  const quotaWarned = useRef(false);

  const [customSeedInput, setCustomSeedInput] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState(() => sessionStorage.getItem('sf_gemini_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiBoardBusy, setAiBoardBusy] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeShotIndex, setActiveShotIndex] = useState(0);
  const [sketchModalShot, setSketchModalShot] = useState(null);
  const [fps, setFps] = useState(24);
  const [isPlayingAnimatic, setIsPlayingAnimatic] = useState(false);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [syncMusicInAnimatic, setSyncMusicInAnimatic] = useState(true);
  const [customAudio, setCustomAudio] = useState({ url: null, name: '', file: null });
  const [isMusicPreviewing, setIsMusicPreviewing] = useState(false);
  const customAudioRef = useRef(null);
  const [blenderStatus, setBlenderStatus] = useState({ connected: false, port: 9876, message: 'Checking Blender bridge…' });
  const [blenderBusy, setBlenderBusy] = useState(false);
  const [refBusy, setRefBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(null);
  const [exportProgress, setExportProgress] = useState('');
  const [navOpen, setNavOpen] = useState(false);

  const stepIdx = Math.max(0, STEPS.findIndex((s) => s.id === activeTab));
  const step = STEPS[stepIdx];
  const go = useCallback((id) => {
    setActiveTab(id);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => localStorage.setItem('storyforge_tab', activeTab), [activeTab]);
  useEffect(() => sessionStorage.setItem('sf_gemini_key', geminiApiKey), [geminiApiKey]);
  useEffect(() => {
    try {
      localStorage.setItem('storyforge_active_project_v1', JSON.stringify(project));
    } catch {
      if (!quotaWarned.current) {
        quotaWarned.current = true;
        notify('Browser storage is full — use Export → Save project to keep your references safe.', 'error');
      }
    }
  }, [project]);

  const notify = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  const music = project.music;
  const setMusic = (patch) => setProject((p) => ({ ...p, music: { ...p.music, ...patch } }));
  const selectedTrack = useMemo(() => ROYALTY_FREE_TRACKS.find((t) => t.id === music.trackId) || ROYALTY_FREE_TRACKS[0], [music.trackId]);
  const totalDurationSec = useMemo(() => Math.max(0.1, project.shots.reduce((a, s) => a + Number(s.duration || 2), 0)), [project.shots]);

  const currentFrame = useMemo(() => {
    let el = 0;
    const shots = project.shots;
    for (let i = 0; i < shots.length; i++) {
      const d = Number(shots[i].duration || 2);
      if (playheadSec <= el + d || i === shots.length - 1) return { shotIndex: i, shot: shots[i], localProgress: Math.min(1, Math.max(0, (playheadSec - el) / d)) };
      el += d;
    }
    return { shotIndex: 0, shot: shots[0], localProgress: 0 };
  }, [project.shots, playheadSec]);

  // ---------- Blender ----------
  const checkBlenderBridge = async () => {
    try {
      const r = await fetch('/api/blender/status');
      setBlenderStatus(await r.json());
    } catch {
      setBlenderStatus({ connected: false, port: 9876, message: 'Backend offline — run `npm run server`.' });
    }
  };
  useEffect(() => {
    checkBlenderBridge();
  }, []);
  const blenderPythonCode = useMemo(() => generateBlenderPrevizScript(project, fps), [project, fps]);
  const postBlender = async (path) => {
    setBlenderBusy(true);
    try {
      const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: blenderPythonCode, port: blenderStatus.port || 9876 }) });
      const d = await r.json();
      notify(d.message || d.error, d.ok ? 'success' : 'error');
      checkBlenderBridge();
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setBlenderBusy(false);
    }
  };
  const handleDownloadBlenderScript = () => downloadStepFile('previz', 'storyforge_previz.py', exportCtx()).then(() => notify('Downloaded Blender script'));

  // ---------- Animatic playback ----------
  useEffect(() => {
    if (!isPlayingAnimatic) {
      if (!isMusicPreviewing) studioAudio.stop();
      customAudioRef.current?.pause();
      return;
    }
    if (syncMusicInAnimatic) {
      if (customAudio.url && customAudioRef.current) {
        customAudioRef.current.currentTime = music.trimStart;
        customAudioRef.current.volume = music.volume;
        customAudioRef.current.play().catch(() => {});
      } else studioAudio.playTrackLoop(selectedTrack, { volume: music.volume });
    }
    const start = performance.now() - playheadSec * 1000;
    const iv = setInterval(() => {
      const t = (performance.now() - start) / 1000;
      if (t >= totalDurationSec) {
        setPlayheadSec(0);
        setIsPlayingAnimatic(false);
      } else setPlayheadSec(t);
    }, 33);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayingAnimatic, totalDurationSec]);

  const toggleMusicPreview = () => {
    if (isMusicPreviewing) {
      studioAudio.stop();
      customAudioRef.current?.pause();
      setIsMusicPreviewing(false);
      return;
    }
    setIsMusicPreviewing(true);
    if (customAudio.url && customAudioRef.current) {
      customAudioRef.current.currentTime = music.trimStart;
      customAudioRef.current.volume = music.volume;
      customAudioRef.current.play();
    } else studioAudio.playTrackLoop(selectedTrack, { volume: music.volume });
  };
  useEffect(() => {
    if (activeTab !== 'music' && isMusicPreviewing) {
      studioAudio.stop();
      customAudioRef.current?.pause();
      setIsMusicPreviewing(false);
    }
    if (activeTab !== 'animatic' && isPlayingAnimatic) setIsPlayingAnimatic(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ---------- Story ----------
  const resetTo = (p, msg) => {
    setProject((prev) => normalize({ ...p, references: prev.references, customMoods: prev.customMoods }));
    setActiveShotIndex(0);
    setPlayheadSec(0);
    if (msg) notify(msg);
  };
  const loadPreset = (preset) => {
    const c = JSON.parse(JSON.stringify(preset));
    const t = ROYALTY_FREE_TRACKS.find((x) => x.mood === c.moodKey);
    resetTo({ ...c, music: { ...DEFAULT_MUSIC, trackId: t?.id || DEFAULT_MUSIC.trackId } }, `Loaded “${c.title.split('(')[0].trim()}” — ${c.shots.length} shots`);
  };
  const handleRollIdea = (tier) => {
    const s = generateProceduralStory(tier || project.tier, customSeedInput);
    resetTo(s, `New ${s.tier} story with ${s.shots.length} shots`);
  };
  const handleGeminiGenerate = async () => {
    if (!geminiApiKey) {
      setShowKey(true);
      return notify('Add a Gemini API key to use AI expand (the procedural engine works without one).', 'error');
    }
    setAiLoading(true);
    try {
      const prompt = `Create an animation short story project JSON with complexity tier "${project.tier}" based on seed: "${customSeedInput || project.logline}".
Return JSON: {"title","logline","theme","hook","conflict","resolution","moodKey":"warm|cold|dark|light","characters":[{"id","name","archetype","silhouette","motivation","quirk","colorHex"}],"environment":{"name","settingType","timeOfDay","props":[4 strings],"groundColor","horizonColor"},"shots":[{"id","number","title","shotType":"EWS|WS|MS|CU|ECU|OTS","shotTypeName","cameraAngle":"Eye-Level|Low Angle|High Angle|Dutch Tilt","cameraMove":"Static Locked|Slow Push-In|Slow Pull-Back|Tracking Dolly|Whip Pan|Arc Orbit|Fast Crane Up","focalLength":35,"duration":2.4,"action","dialogue","soundCue","subjectPos":[x,y,z],"camStart":[x,y,z],"camEnd":[x,y,z],"notes"}]}. Blender coords in meters, Z up, camera in front of subject (negative Y).`;
      const r = await fetch('/api/ai/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, apiKey: geminiApiKey }) });
      const d = await r.json();
      if (!d.ok) return notify(d.error || 'Gemini failed', 'error');
      const shots = (d.data.shots || []).map((s, i) => ({ ...s, id: `shot-ai-${Date.now()}-${i}`, number: i + 1 }));
      resetTo({ ...project, ...d.data, shots: shots.length ? shots : project.shots, id: `ai-${Date.now()}` }, 'AI story, cast and shots generated');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const updateShot = (id, patch) => setProject((p) => ({ ...p, shots: p.shots.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const addShot = () => {
    const n = project.shots.length + 1;
    setProject((p) => ({
      ...p,
      shots: [...p.shots, { id: `shot-${Date.now()}`, number: n, title: `New beat ${n}`, shotType: 'MS', shotTypeName: 'Medium Shot', cameraAngle: 'Eye-Level', cameraMove: 'Slow Push-In', focalLength: 35, duration: 2.2, action: 'Character reacts and shifts weight toward the exit.', dialogue: '', soundCue: '', subjectPos: [0, 0.5, 0], camStart: [-1.2, -3.4, 1.4], camEnd: [-0.6, -2.5, 1.35], notes: '' }]
    }));
    setActiveShotIndex(project.shots.length);
  };
  const deleteShot = (id) => {
    if (project.shots.length <= 1) return notify('Keep at least one shot.', 'error');
    setProject((p) => ({ ...p, shots: p.shots.filter((s) => s.id !== id).map((s, i) => ({ ...s, number: i + 1 })) }));
    setActiveShotIndex((i) => Math.max(0, i - 1));
  };
  const applySmartBlenderCoords = (shot, type, angle, move) => {
    const t = CAMERA_SHOT_TYPES.find((x) => x.code === type) || CAMERA_SHOT_TYPES[2];
    const subj = shot.subjectPos || [0, 0, 0];
    let z = t.zOffset;
    if (/low|worm/i.test(angle)) z = 0.45;
    if (/high|bird/i.test(angle)) z = 3.2;
    const xo = type === 'OTS' ? -0.95 : /dutch/i.test(angle) ? -0.7 : 0.2;
    const y = subj[1] - t.dist;
    let end = [subj[0] + xo, y, z];
    if (/push/i.test(move)) end = [subj[0] + xo * 0.5, y + t.dist * 0.28, z];
    if (/pull/i.test(move)) end = [subj[0] + xo, y - t.dist * 0.35, z + 0.3];
    if (/dolly|pan|follow|orbit/i.test(move)) end = [subj[0] + 1.4, y + 0.4, z];
    if (/crane/i.test(move)) end = [subj[0] + xo, y + 0.4, z + 1.6];
    const r = (v) => Number(v.toFixed(2));
    return { shotType: type, shotTypeName: t.name, cameraAngle: angle, cameraMove: move, focalLength: t.defaultFocal, camStart: [r(subj[0] + xo), r(y), r(z)], camEnd: end.map(r) };
  };

  // ---------- References ----------
  const appendRefs = (refs) => setProject((p) => ({ ...p, references: [...(p.references || []), ...refs] }));
  const addFiles = async (files) => {
    const imgs = files.filter((f) => f.type.startsWith('image/'));
    if (!imgs.length) return;
    setRefBusy(true);
    const out = [];
    for (const f of imgs) {
      try {
        out.push(await ingestFile(f));
      } catch (e) {
        notify(`${f.name}: ${e.message}`, 'error');
      }
    }
    appendRefs(out);
    setRefBusy(false);
    if (out.length) notify(`Added ${out.length} reference${out.length > 1 ? 's' : ''} · palettes extracted`);
  };
  const addUrls = async (text) => {
    const urls = extractUrls(text);
    if (!urls.length) return notify('No http(s) links found in that text.', 'error');
    setRefBusy(true);
    const out = [];
    const errs = [];
    for (const u of urls) {
      try {
        out.push(await ingestUrl(u));
      } catch (e) {
        errs.push(e.message);
      }
    }
    appendRefs(out);
    setRefBusy(false);
    if (out.length) notify(`Added ${out.length} linked reference${out.length > 1 ? 's' : ''}${errs.length ? ` · ${errs.length} failed` : ''}`);
    else notify(errs[0] || 'Could not add link', 'error');
  };
  const updateRef = (id, patch) => setProject((p) => ({ ...p, references: p.references.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  const removeRef = (id) =>
    setProject((p) => ({ ...p, references: p.references.filter((r) => r.id !== id), shots: p.shots.map((s) => (s.refId === id ? { ...s, refId: null, refMode: 'procedural' } : s)) }));
  const runAutoMatch = () => {
    const { shots, matched } = autoMatchShots(project);
    if (!matched) return notify('Add references marked for boards first.', 'error');
    setProject((p) => ({ ...p, shots }));
    notify(`Matched your references to ${matched} panels — auto-framed per shot type`);
  };
  const generateRefMoods = () => {
    const moods = moodsFromReferences(project);
    if (!moods) return notify('Add references marked for mood first.', 'error');
    setProject((p) => ({ ...p, customMoods: moods, moodKey: 'ref' }));
    notify('Built 5 mood variations from your references');
  };
  const generateAiBoard = async (shot) => {
    if (!geminiApiKey) {
      setShowKey(true);
      return notify('AI boards need a Gemini API key (top right). Ref Photo / Ref Sketch modes work offline.', 'error');
    }
    setAiBoardBusy(shot.id);
    const ref = (project.references || []).find((r) => r.id === shot.refId);
    const mood = resolveMood(project);
    const prompt = `Rough black-and-white pencil storyboard panel, 16:9, loose confident animator linework, clear staging, no text or captions.
Shot: ${shot.shotTypeName || shot.shotType}, ${shot.focalLength}mm lens, ${shot.cameraAngle}, camera move: ${shot.cameraMove}.
Action: ${shot.action}
Setting: ${project.environment?.name}, ${project.environment?.timeOfDay}. Characters: ${(project.characters || []).map((c) => `${c.name} (${c.silhouette})`).join('; ')}.
Lighting mood: ${mood.name} — ${mood.lightingNotes}${ref ? '\nUse the attached reference image for composition, environment and lighting cues.' : ''}`;
    try {
      const r = await fetch('/api/ai/storyboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey: geminiApiKey, prompt, imageDataUrl: ref?.src }) });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      updateShot(shot.id, { aiImage: d.dataUrl, refMode: 'ai' });
      notify(`AI board drawn for SH${shot.number}`);
    } catch (e) {
      notify(`AI board failed: ${e.message}`, 'error');
    } finally {
      setAiBoardBusy(null);
    }
  };

  // Global paste: images or links become references
  useEffect(() => {
    const onPaste = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      const files = [...(e.clipboardData?.files || [])].filter((f) => f.type.startsWith('image/'));
      if (files.length) {
        e.preventDefault();
        addFiles(files);
        if (!['refs', 'storyboard', 'mood'].includes(activeTab)) go('refs');
        return;
      }
      if (tag === 'input' || tag === 'textarea') return;
      const text = e.clipboardData?.getData('text') || '';
      if (['refs', 'storyboard', 'mood'].includes(activeTab) && extractUrls(text).length) addUrls(text);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  });

  // ---------- Export ----------
  const exportCtx = () => ({ project, fps, activeShotIndex, customAudioFile: customAudio.file });
  const runExportAll = async () => {
    setExportBusy('all');
    try {
      const n = await exportAllZip(exportCtx(), (label) => setExportProgress(`Building ${label}…`));
      notify(`Exported ${n} files across every stage`);
    } catch (e) {
      notify(`Export failed: ${e.message}`, 'error');
    } finally {
      setExportBusy(null);
      setExportProgress('');
    }
  };
  const runExportStep = async (id) => {
    setExportBusy(id);
    try {
      const n = await exportStepZip(id, exportCtx());
      notify(`Exported ${n} files for ${EXPORT_STEPS.find((s) => s.id === id)?.label}`);
    } catch (e) {
      notify(`Export failed: ${e.message}`, 'error');
    } finally {
      setExportBusy(null);
    }
  };
  const runExportFile = async (id, name) => {
    setExportBusy(id);
    try {
      await downloadStepFile(id, name, exportCtx());
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setExportBusy(null);
    }
  };
  const importProject = async (file) => {
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.shots)) throw new Error('Not a StoryForge project file');
      setProject(normalize(data));
      setActiveShotIndex(0);
      notify(`Imported “${data.title}”`);
    } catch (e) {
      notify(`Import failed: ${e.message}`, 'error');
    }
  };

  const mood = resolveMood(project);
  const ctx = {
    project, setProject, updateShot, addShot, deleteShot, activeShotIndex, setActiveShotIndex, notify, go, fps, setFps,
    geminiApiKey, loadPreset, handleRollIdea, handleGeminiGenerate, aiLoading, customSeedInput, setCustomSeedInput, applySmartBlenderCoords,
    totalDurationSec, currentFrame, isPlayingAnimatic, setIsPlayingAnimatic, playheadSec, setPlayheadSec, syncMusicInAnimatic, setSyncMusicInAnimatic,
    music, setMusic, customAudio, setCustomAudio, customAudioRef, selectedTrack, isMusicPreviewing, toggleMusicPreview,
    blenderStatus, blenderBusy, checkBlenderBridge, handlePushToBlender: () => postBlender('/api/blender/push'), handleLaunchBlenderApp: () => postBlender('/api/blender/launch'),
    handleDownloadBlenderScript, blenderPythonCode, setSketchModalShot,
    addFiles, addUrls, refBusy, updateRef, removeRef, runAutoMatch, generateRefMoods, generateAiBoard, aiBoardBusy,
    exportBusy, exportProgress, runExportAll, runExportStep, runExportFile, saveProjectFile: () => exportProjectJson(project), importProject
  };
  const Stage = step.C;
  const exportable = EXPORT_STEPS.some((s) => s.id === step.id);

  return (
    <StudioContext.Provider value={ctx}>
      <div className="relative min-h-screen" style={{ '--accent': step.accent, '--accent-2': step.accent2 }}>
        <div className="aurora" />
        <div className="grain" />

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-white/[0.06] bg-[#0a0910]/85 backdrop-blur-2xl transition-transform lg:translate-x-0 ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center gap-3 px-5 pb-4 pt-5">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-amber-300 via-rose-400 to-violet-500 shadow-lg shadow-rose-500/20">
              <Clapperboard className="h-5 w-5 text-black" strokeWidth={2.4} />
            </div>
            <div>
              <div className="font-display text-[17px] font-bold leading-none tracking-tight">StoryForge</div>
              <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/40">Story-first studio</div>
            </div>
            <button className="ml-auto text-white/40 lg:hidden" onClick={() => setNavOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Project card */}
          <div className="mx-4 mb-4 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
            <div className="h-1.5 w-full" style={{ background: mood.bgGradient }} />
            <div className="p-3.5">
              <div className="eyebrow mb-1">Now editing</div>
              <div className="line-clamp-2 text-sm font-semibold leading-snug text-white">{project.title}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="chip">{project.shots.length} shots</span>
                <span className="chip">{totalDurationSec.toFixed(1)}s</span>
                <span className="chip">{(project.references || []).length} refs</span>
              </div>
              <div className="mt-2.5"><Palette colors={mood.palette} size="sm" /></div>
            </div>
          </div>

          {/* Pipeline */}
          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            <div className="eyebrow mb-2 px-2">Pipeline</div>
            <div className="relative">
              <div className="absolute bottom-4 left-[22px] top-4 w-px bg-white/[0.07]" />
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const on = s.id === activeTab;
                const done = i < stepIdx;
                return (
                  <button
                    key={s.id}
                    onClick={() => go(s.id)}
                    className={`group relative mb-0.5 flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition ${on ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}`}
                  >
                    <span
                      className={`relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg transition ${on ? 'text-black shadow-lg' : done ? 'bg-white/[0.08] text-white/70' : 'bg-[#121019] text-white/35 ring-1 ring-white/[0.07] group-hover:text-white/70'}`}
                      style={on ? { background: `linear-gradient(135deg, ${s.accent}, ${s.accent2})`, boxShadow: `0 6px 20px -6px ${s.accent}` } : {}}
                    >
                      <Icon className="h-[15px] w-[15px]" strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-[13px] font-semibold ${on ? 'text-white' : 'text-white/60 group-hover:text-white/85'}`}>{s.label}</span>
                      <span className="block truncate text-[10.5px] text-white/30">{s.sub}</span>
                    </span>
                    <span className="ml-auto font-mono text-[9.5px] text-white/20">{s.num}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="space-y-2 border-t border-white/[0.06] p-4">
            <button onClick={() => go('previz')} className="flex w-full items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2 text-left text-[11px] text-white/55 hover:bg-white/[0.06]">
              <span className={`h-2 w-2 rounded-full ${blenderStatus.connected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`} />
              Blender {blenderStatus.connected ? 'connected' : 'offline'}
            </button>
            <button onClick={runExportAll} disabled={!!exportBusy} className="btn btn-ghost w-full">
              {exportBusy === 'all' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Package className="h-3.5 w-3.5" />} Export everything
            </button>
          </div>
        </aside>

        {navOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setNavOpen(false)} />}

        {/* Main */}
        <div className="relative z-10 lg:pl-[272px]">
          <header className="sticky top-0 z-20 border-b border-white/[0.05] bg-[#07060b]/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-5 py-3 md:px-8">
              <button className="text-white/60 lg:hidden" onClick={() => setNavOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <span className="hidden text-white/35 sm:inline">{project.title.split('(')[0].trim()}</span>
                <span className="hidden text-white/20 sm:inline">/</span>
                <span className="font-semibold text-white">{step.label}</span>
              </div>
              {/* progress */}
              <div className="ml-4 hidden flex-1 items-center gap-1 md:flex">
                {STEPS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => go(s.id)}
                    title={s.label}
                    className="h-1 flex-1 rounded-full transition"
                    style={{ background: i <= stepIdx ? `linear-gradient(90deg, ${s.accent}, ${s.accent2})` : 'rgba(255,255,255,0.07)' }}
                  />
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="relative">
                  <button onClick={() => setShowKey(!showKey)} className={`btn btn-sm ${geminiApiKey ? 'btn-accent-soft' : 'btn-ghost'}`}>
                    <KeyRound className="h-3.5 w-3.5" /> {geminiApiKey ? 'AI on' : 'AI key'}
                  </button>
                  {showKey && (
                    <div className="glass animate-rise absolute right-0 top-11 z-50 w-80 p-4">
                      <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                        <Wand2 className="h-4 w-4 text-accent" /> Optional Gemini key
                      </div>
                      <p className="mb-3 text-xs text-white/50">Unlocks AI story expansion and AI storyboard panels. Everything else works offline. Kept only for this browser session.</p>
                      <input type="password" className="sf-input" value={geminiApiKey} onChange={(e) => setGeminiApiKey(e.target.value.trim())} placeholder="AIza…" />
                      <div className="mt-3 flex justify-end">
                        <button className="btn btn-primary btn-sm" onClick={() => setShowKey(false)}>Done</button>
                      </div>
                    </div>
                  )}
                </div>
                {exportable && (
                  <button className="btn btn-ghost btn-sm" onClick={() => runExportStep(step.id)} disabled={!!exportBusy} title="Export this stage as offline files">
                    {exportBusy === step.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Export stage
                  </button>
                )}
                <button className="btn btn-primary btn-sm" onClick={() => go('previz')}>
                  <Box className="h-3.5 w-3.5" /> Send to Blender
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-6 sm:px-5 lg:pb-16 md:px-8" key={step.id}>
            <StageHeader step={step} total={STEPS.length} title={step.title} desc={step.desc} />
            <Stage />
            <StageNav prev={STEPS[stepIdx - 1]} next={STEPS[stepIdx + 1]} onGo={go} />
          </main>
        </div>

        {/* Mobile Bottom Thumb Dock for instant 1-tap switching across all 10 stages */}
        <nav
          aria-label="Mobile pipeline stages"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0a0910]/95 px-2 py-1.5 backdrop-blur-2xl lg:hidden"
        >
          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const on = s.id === activeTab;
              return (
                <button
                  key={s.id}
                  onClick={() => go(s.id)}
                  className={`flex shrink-0 flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[10px] font-medium transition ${
                    on ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-lg"
                    style={
                      on
                        ? { background: `linear-gradient(135deg, ${s.accent}, ${s.accent2})`, color: '#000' }
                        : {}
                    }
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </span>
                  <span className="whitespace-nowrap">{s.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Toast */}
        {toast && (
          <div key={toast.id} className="animate-rise fixed bottom-6 left-1/2 z-50 -translate-x-1/2 lg:left-[calc(50%+136px)]">
            <div className={`glass flex max-w-xl items-center gap-3 rounded-full px-5 py-3 text-sm ${toast.type === 'error' ? 'border-rose-400/40' : ''}`}>
              {toast.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
              <span className="text-white/85">{toast.msg}</span>
              <button onClick={() => setToast(null)} className="text-white/30 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {sketchModalShot && (
          <SketchPadModal
            shot={sketchModalShot}
            project={project}
            onClose={() => setSketchModalShot(null)}
            onSaveSketch={(id, url) => {
              updateShot(id, { sketchDataUrl: url });
              notify('Drawing saved on panel');
            }}
          />
        )}
      </div>
    </StudioContext.Provider>
  );
}
