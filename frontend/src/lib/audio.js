// Audio ambientale sintetizzato via Web Audio API: nessun file da scaricare, spento di default.
const PRESETS = [
  { tones: [[41, "sawtooth", 0.05], [55, "sine", 0.18], [82, "sine", 0.06]], noise: 260, noiseGain: 0.22, lfo: 0.07 },
  { tones: [[110, "sine", 0.09], [165, "sine", 0.06], [220, "triangle", 0.025]], noise: 900, noiseGain: 0.08, lfo: 0.12 },
  { tones: [[196, "sine", 0.04], [294, "sine", 0.035], [392, "sine", 0.02]], noise: 2600, noiseGain: 0.1, lfo: 0.05 },
  { tones: [[98, "triangle", 0.06], [147, "sine", 0.05], [196, "sine", 0.03]], noise: 1400, noiseGain: 0.05, lfo: 0.09 },
  { tones: [[49, "square", 0.025], [73, "sawtooth", 0.03], [98, "sine", 0.06]], noise: 600, noiseGain: 0.16, lfo: 1.6 },
  { tones: [[220, "sine", 0.05], [330, "sine", 0.035], [440, "triangle", 0.015]], noise: 3000, noiseGain: 0.025, lfo: 0.3 },
  { tones: [[65, "sawtooth", 0.035], [98, "sine", 0.08], [131, "sine", 0.04]], noise: 1100, noiseGain: 0.12, lfo: 0.2 },
  { tones: [[87, "sine", 0.1], [131, "sine", 0.06], [174, "sine", 0.03]], noise: 500, noiseGain: 0.04, lfo: 0.04 },
];

class AudioEngine {
  ctx = null;
  master = null;
  layer = null;
  enabled = false;
  volume = 0.6;
  scene = 0;
  subs = new Set();

  emit() { this.subs.forEach((fn) => fn({ enabled: this.enabled, volume: this.volume })); }
  subscribe(fn) { this.subs.add(fn); return () => this.subs.delete(fn); }

  init() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 2;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  }

  async toggle(force) {
    const next = typeof force === "boolean" ? force : !this.enabled;
    if (next) {
      this.init();
      if (!this.ctx) return;
      await this.ctx.resume();
      this.enabled = true;
      this.master.gain.setTargetAtTime(this.volume * 0.5, this.ctx.currentTime, 0.4);
      if (!this.layer) this.setScene(this.scene, true);
    } else if (this.ctx) {
      this.enabled = false;
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    }
    this.emit();
  }

  setVolume(v) {
    this.volume = v;
    if (this.ctx && this.enabled) this.master.gain.setTargetAtTime(v * 0.5, this.ctx.currentTime, 0.1);
    this.emit();
  }

  buildLayer(i) {
    const ctx = this.ctx;
    const p = PRESETS[i] || PRESETS[0];
    const out = ctx.createGain();
    out.gain.value = 0;
    out.connect(this.master);
    const nodes = [];
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = p.lfo;
    lfoGain.gain.value = 0.35;
    lfo.connect(lfoGain);
    const trem = ctx.createGain();
    trem.gain.value = 0.7;
    lfoGain.connect(trem.gain);
    trem.connect(out);
    p.tones.forEach(([f, type, g]) => {
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = type; o.frequency.value = f; o.detune.value = Math.random() * 8 - 4;
      og.gain.value = g;
      o.connect(og).connect(trem);
      nodes.push(o);
    });
    const n = ctx.createBufferSource();
    n.buffer = this.noiseBuf; n.loop = true;
    const filt = ctx.createBiquadFilter();
    filt.type = "lowpass"; filt.frequency.value = p.noise;
    const ng = ctx.createGain(); ng.gain.value = p.noiseGain;
    n.connect(filt).connect(ng).connect(out);
    nodes.push(n, lfo);
    nodes.forEach((x) => x.start());
    return { out, nodes };
  }

  setScene(i, immediate = false) {
    if (i === this.scene && this.layer && !immediate) return;
    this.scene = i;
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const old = this.layer;
    if (old) {
      old.out.gain.setTargetAtTime(0, t, 0.6);
      setTimeout(() => { old.nodes.forEach((x) => { try { x.stop(); } catch (e) { /* noop */ } }); old.out.disconnect(); }, 3500);
    }
    this.layer = this.buildLayer(i);
    this.layer.out.gain.setTargetAtTime(1, t, 0.8);
    if (!immediate) this.whoosh();
  }

  blip(freq = 660, dur = 0.12, type = "sine", gain = 0.18) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 1.5, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  whoosh() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const n = this.ctx.createBufferSource();
    n.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = "bandpass"; f.Q.value = 1.2;
    f.frequency.setValueAtTime(200, t);
    f.frequency.exponentialRampToValueAtTime(2400, t + 0.9);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    n.connect(f).connect(g).connect(this.master);
    n.start(t); n.stop(t + 1.2);
  }
}

export const audio = new AudioEngine();
