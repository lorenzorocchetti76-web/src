import * as THREE from "three";

export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const smooth = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);

// Peso di visibilità di un elemento legato alla scena i, in funzione del progresso p.
export const sceneWeight = (p, i, spread = 1.25) => ease(clamp01(1 - Math.abs(p - i) * spread));

// Peso del diorama (assente all'inizio e nel finale, dove domina il globo).
export const dioramaWeight = (p) => smooth(0.25, 0.95, p) * (1 - smooth(6.15, 6.85, p));
export const globeWeight = (p) => 1 - smooth(0.05, 0.85, p) + smooth(6.2, 6.95, p);

export const CELL = 0.85;

export function field(x, z) {
  const v = Math.sin(x * 0.55) + Math.cos(z * 0.47) + Math.sin((x + z) * 0.31) * 0.8 + Math.cos((x - z) * 0.9) * 0.35;
  return clamp01((v + 2.95) / 5.9);
}

export const riverMask = (x, z) => Math.abs(z - Math.sin(x * 0.45) * 1.8 - 0.6) < 0.75;
const riverAmt = (x, z) => 1 - smooth(0.45, 0.85, Math.abs(z - Math.sin(x * 0.45) * 1.8 - 0.6));

const c = (h) => new THREE.Color(h);
export const PROFILES = [
  { base: 0.35, amp: 2.4, low: c("#ff5a1f"), high: c("#17110f"), river: c("#ff7a2a"), rd: -0.2 },
  { base: 0.3, amp: 1.5, low: c("#2a3633"), high: c("#6a5c4c"), river: c("#1b414a"), rd: -0.2 },
  { base: 0.6, amp: 2.5, low: c("#9fb6c4"), high: c("#f6f9fc"), river: c("#d6ecf7"), rd: 0 },
  { base: 0.35, amp: 1.1, low: c("#4b6a35"), high: c("#e9eef2"), river: c("#dceef8"), rd: -0.25 },
  { base: 0.3, amp: 0.55, low: c("#4c4a33"), high: c("#6e6254"), river: c("#2a3036"), rd: -0.15 },
  { base: 0.12, amp: 0.08, low: c("#0d1828"), high: c("#1b3a5c"), river: c("#0d1828"), rd: 0 },
  { base: 0.3, amp: 1.25, low: c("#7a8a44"), high: c("#b99a62"), river: c("#1e5f7f"), rd: -0.3 },
  { base: 0.3, amp: 1.25, low: c("#7a8a44"), high: c("#b99a62"), river: c("#1e5f7f"), rd: -0.3 },
];

export function groundY(scene, x, z) {
  const pr = PROFILES[scene];
  return pr.base + pr.amp * field(x, z) + pr.rd * riverAmt(x, z);
}

export const WATER = [
  { y: 0, a: 0, col: c("#1a6f86") },
  { y: 1.0, a: 0.8, col: c("#0e4f63") },
  { y: 0, a: 0, col: c("#9fc6dc") },
  { y: 0, a: 0, col: c("#9fc6dc") },
  { y: 0, a: 0, col: c("#2b3138") },
  { y: 0, a: 0, col: c("#101d30") },
  { y: 0.82, a: 0.72, col: c("#1d5f80") },
  { y: 0.82, a: 0.72, col: c("#1d5f80") },
];

export const ATMOS = [
  { bg: c("#140604"), light: c("#ff9a6a"), li: 1.6, amb: 0.5 },
  { bg: c("#04121a"), light: c("#bfefff"), li: 1.8, amb: 0.55 },
  { bg: c("#0a1622"), light: c("#e8f4ff"), li: 2.1, amb: 0.7 },
  { bg: c("#0b1119"), light: c("#ffe2c4"), li: 1.7, amb: 0.6 },
  { bg: c("#160e0b"), light: c("#ffd2a8"), li: 2.7, amb: 0.95 },
  { bg: c("#060b14"), light: c("#9fe8ff"), li: 1.3, amb: 0.55 },
  { bg: c("#150a07"), light: c("#ffc08a"), li: 2.0, amb: 0.55 },
  { bg: c("#080B10"), light: c("#ffffff"), li: 1.8, amb: 0.35 },
];

// Keyframe della camera cinematografica (prospettiva): target, azimut, elevazione, distanza reale.
export const CAMERA_KEYS = [
  { t: [0, 0, 0], az: -20, el: 12, d: 14 },
  { t: [0, 0.8, 0], az: 40, el: 21, d: 19 },
  { t: [0, 1.2, 0], az: 130, el: 24, d: 18 },
  { t: [-1, 0.7, 1], az: 220, el: 16, d: 13 },
  { t: [1.5, 1.0, -1], az: 400, el: 20, d: 16 },
  { t: [-0.6, 2.2, 2.8], az: 455, el: 18, d: 19, m: 1.5, my: 1.6 },
  { t: [1, 0.8, 1], az: 520, el: 17, d: 16 },
  { t: [0, 0, 0], az: 700, el: 10, d: 15 },
];
