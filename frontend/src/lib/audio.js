// Audio ambientale sintetizzato via Web Audio API: solo toni puri (nessun rumore/fruscio), spento di default.
const PRESETS = [
  { tones: [[55, "sine", 0.16], [82.4, "sine", 0.07], [110, "sine", 0.03]], lfo: 0.06 },
  { tones: [[110, "sine", 0.08], [164.8, "sine", 0.05], [220, "sine", 0.025]], lfo: 0.1 },
  { tones: [[196, "sine", 0.04], [293.7, "sine", 0.03], [392, "sine", 0.018]], lfo: 0.05 },
  { tones: [[98, "sine", 0.06], [146.8, "sine", 0.045], [196, "triangle", 0.02]], lfo: 0.08 },
  { tones: [[73.4, "sine", 0.09], [110, "sine", 0.05], [146.8, "triangle", 0.02]], lfo: 0.12 },
  { tones: [[220, "sine", 0.045], [329.6, "sine", 0.03], [440, "sine", 0.015]], lfo: 0.2 },
  { tones: [[65.4, "sine", 0.1], [98, "sine", 0.06], [130.8, "triangle", 0.025]], lfo: 0.15 },
  { tones: [[87.3, "sine", 0.1], [130.8, "sine", 0.06], [174.6, "sine", 0.03]], lfo: 0.04 },
];

// Scene con pioggia (indice -> intensità): Ossigeno, Industria, Oggi.
const RAIN = { 1: 0.8, 4: 1, 6: 0.9 };

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
    // Catena pulita: filtro anti-sibilo + limitatore morbido, evita clipping e fruscio.
    const tone = this.ctx.createBiquadFilter(); tone.type = "lowpass"; tone.frequency.value = 5200; tone.Q.value = 0.5;
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.3;
    this.master.connect(tone).connect(comp).connect(this.ctx.destination);
  }

  // Pioggia morbida: rumore marrone molto filtrato (niente sibilo) con giunzione del loop sfumata.
  ensureRain() {
    if (this.rain || !this.ctx) return;
    const ctx = this.ctx;
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.2;
    }
    const fade = Math.floor(ctx.sampleRate * 0.5);
    for (let i = 0; i < fade; i++) {
      const k = i / fade;
      d[i] = d[i] * k + d[len - fade + i] * (1 - k);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loopStart = 0; src.loopEnd = (len - fade) / ctx.sampleRate; src.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 180;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1100; lp.Q.value = 0.4;
    const gain = ctx.createGain(); gain.gain.value = 0;
    src.connect(hp).connect(lp).connect(gain).connect(this.master);
    src.start();
    this.rain = { gain, amt: 0 };
    this.dropTimer = setInterval(() => {
      if (!this.enabled || !this.rain.amt) return;
      if (Math.random() < 0.45) this.drop();
    }, 180);
  }

  drop() {
    const t = this.ctx.currentTime + 0.02 + Math.random() * 0.12;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "sine";
    const f = 900 + Math.random() * 900;
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.7, t + 0.07);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.006 * this.rain.amt, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + 0.1);
  }

  updateRain(i) {
    const amt = RAIN[i] || 0;
    if (!amt && !this.rain) return;
    this.ensureRain();
    this.rain.amt = amt;
    this.rain.gain.gain.setTargetAtTime(amt * 0.11, this.ctx.currentTime, 1.2);
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
    lfoGain.gain.value = 0.2;
    lfo.connect(lfoGain);
    const trem = ctx.createGain();
    trem.gain.value = 0.8;
    lfoGain.connect(trem.gain);
    trem.connect(out);
    p.tones.forEach(([f, , g]) => {
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = "sine"; o.frequency.value = f; o.detune.value = Math.random() * 4 - 2;
      og.gain.value = g;
      o.connect(og).connect(trem);
      nodes.push(o);
    });
    nodes.push(lfo);
    nodes.forEach((x) => x.start());
    return { out, nodes };
  }

  setScene(i, immediate = false) {
    if (i === this.scene && this.layer && !immediate) return;
    this.scene = i;
    if (!this.ctx || !this.enabled) return;
    this.updateRain(i);
    const t = this.ctx.currentTime;
    const old = this.layer;
    if (old) {
      old.out.gain.setTargetAtTime(0, t, 0.4);
      setTimeout(() => { old.nodes.forEach((x) => { try { x.stop(); } catch (e) { /* noop */ } }); old.out.disconnect(); }, 4000);
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

  // Transizione morbida tra scene: glissando sinusoidale, senza rumore.
  whoosh() {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(330, t);
    o.frequency.exponentialRampToValueAtTime(495, t + 1.2);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + 1.5);
  }
}

export const audio = new AudioEngine();
