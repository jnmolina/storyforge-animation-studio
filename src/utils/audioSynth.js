// WebAudio Procedural Temp Music & Sound Cue Synthesizer
// Allows instant in-browser playback of royalty-free procedural temp tracks
// synchronized with the Animatic & Temp Music cutter (plus support for custom audio files).

class StudioAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.gainNode = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  playNote(freq, duration = 0.25, type = 'triangle', volume = 0.14, delaySec = 0) {
    this.init();
    const now = this.ctx.currentTime + delaySec;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  playTrackLoop(track, { volume = 0.5, onStep } = {}) {
    this.stop();
    this.init();
    this.isPlaying = true;

    const preset = track?.synthPreset || {
      style: 'lofi',
      rootFreq: 220,
      scale: [0, 4, 7, 11, 14],
      tempo: 96
    };

    const stepMs = (60 / preset.tempo / 2) * 1000; // eighth-note steps
    let step = 0;

    const triggerStep = () => {
      if (!this.isPlaying) return;

      const scaleLen = preset.scale.length;
      const semitone = preset.scale[step % scaleLen];
      const octaveShift = step % 8 === 0 ? 0 : step % 4 === 0 ? 12 : 0;
      const freq = preset.rootFreq * Math.pow(2, (semitone + octaveShift) / 12);

      const waveType =
        preset.style === 'chase'
          ? 'sawtooth'
          : preset.style === 'quirky'
          ? 'square'
          : 'triangle';

      const noteDur = preset.style === 'chase' ? 0.16 : 0.34;
      this.playNote(freq, noteDur, waveType, 0.12 * volume);

      // Bass pulse on downbeats
      if (step % 4 === 0) {
        this.playNote(preset.rootFreq * 0.5, 0.28, 'sine', 0.18 * volume);
      }

      if (onStep) onStep(step);
      step++;
    };

    triggerStep();
    this.intervalId = setInterval(triggerStep, stepMs);
  }
}

export const studioAudio = new StudioAudioEngine();

// ---------------------------------------------------------------------------
// Offline rendering so temp music can be exported as real WAV files.
// ---------------------------------------------------------------------------
const SR = 44100;

function scheduleNote(ctx, t, freq, dur, type, vol) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0008, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

// Render one of the built-in studio synth tracks to an AudioBuffer.
export async function renderSynthTrack(track, seconds, volume = 0.75, leadSilence = 0) {
  const total = Math.max(1, seconds + leadSilence);
  const ctx = new OfflineAudioContext(2, Math.ceil(SR * total), SR);
  const p = track?.synthPreset || { style: 'lofi', rootFreq: 220, scale: [0, 4, 7, 11, 14], tempo: 96 };
  const step = 60 / p.tempo / 2;
  const wave = p.style === 'chase' ? 'sawtooth' : p.style === 'quirky' ? 'square' : 'triangle';
  const noteDur = p.style === 'chase' ? 0.16 : 0.34;
  for (let i = 0, t = leadSilence; t < total - 0.05; i++, t += step) {
    const semi = p.scale[i % p.scale.length];
    const oct = i % 8 === 0 ? 0 : i % 4 === 0 ? 12 : 0;
    scheduleNote(ctx, t, p.rootFreq * Math.pow(2, (semi + oct) / 12), noteDur, wave, 0.12 * volume);
    if (i % 4 === 0) scheduleNote(ctx, t, p.rootFreq * 0.5, 0.28, 'sine', 0.18 * volume);
  }
  return ctx.startRendering();
}

// Cut [start,end] out of an imported audio file, apply gain + lead-in offset.
export async function renderAudioFileCut(file, start, end, volume = 0.75, leadSilence = 0) {
  const buf = await file.arrayBuffer();
  const tmp = new OfflineAudioContext(2, SR, SR);
  const decoded = await tmp.decodeAudioData(buf);
  const s = Math.max(0, Math.min(start, decoded.duration));
  const e = Math.max(s + 0.1, Math.min(end, decoded.duration));
  const ctx = new OfflineAudioContext(2, Math.ceil(SR * (e - s + leadSilence)), SR);
  const src = ctx.createBufferSource();
  src.buffer = decoded;
  const g = ctx.createGain();
  g.gain.value = volume;
  src.connect(g);
  g.connect(ctx.destination);
  src.start(leadSilence, s, e - s);
  return ctx.startRendering();
}

export function audioBufferToWav(ab) {
  const ch = ab.numberOfChannels, len = ab.length, rate = ab.sampleRate;
  const out = new DataView(new ArrayBuffer(44 + len * ch * 2));
  const w = (o, s) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); out.setUint32(4, 36 + len * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true);
  out.setUint32(24, rate, true); out.setUint32(28, rate * ch * 2, true); out.setUint16(32, ch * 2, true);
  out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, len * ch * 2, true);
  const chans = Array.from({ length: ch }, (_, i) => ab.getChannelData(i));
  let o = 44;
  for (let i = 0; i < len; i++)
    for (let c = 0; c < ch; c++) {
      const v = Math.max(-1, Math.min(1, chans[c][i]));
      out.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true);
      o += 2;
    }
  return new Blob([out], { type: 'audio/wav' });
}
