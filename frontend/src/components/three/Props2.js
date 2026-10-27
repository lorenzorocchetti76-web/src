import * as THREE from "three";
import { part, merge, cached, box, cyl, cone, ball, prism } from "./Kit";

const PI = Math.PI;

// Chiesa romanica con campanile, guglia e tetto innevato.
export const churchGeo = () => cached("church", () => {
  const st = "#a59a8a", roof = "#e9eef2", wood = "#3b2a1f";
  return merge([
    part(box(1.0, 0.08, 0.6), "#6d665e", { p: [0, 0.04, 0], j: 0.15 }),
    part(box(0.9, 0.55, 0.5), st, { p: [-0.05, 0.355, 0], j: 0.12 }),
    part(prism(0.5, 0.26, 0.9), st, { p: [-0.05, 0.63, 0], r: [0, PI / 2, 0], j: 0.12 }),
    part(box(0.96, 0.035, 0.36), roof, { p: [-0.05, 0.75, 0.14], r: [0.8, 0, 0], j: 0.08 }),
    part(box(0.96, 0.035, 0.36), roof, { p: [-0.05, 0.75, -0.14], r: [-0.8, 0, 0], j: 0.08 }),
    part(cyl(0.25, 0.25, 0.55, 14), st, { p: [-0.5, 0.355, 0], j: 0.12 }),
    part(cone(0.27, 0.22, 14), "#e9eef2", { p: [-0.5, 0.74, 0] }),
    part(box(0.3, 1.45, 0.3), st, { p: [0.5, 0.8, 0], j: 0.12 }),
    part(box(0.33, 0.05, 0.33), "#8a8072", { p: [0.5, 1.2, 0] }),
    part(cone(0.24, 0.6, 4), "#4a3f38", { p: [0.5, 1.82, 0], r: [0, PI / 4, 0] }),
    part(box(0.02, 0.18, 0.02), "#c9a54a", { p: [0.5, 2.2, 0] }),
    part(box(0.1, 0.02, 0.02), "#c9a54a", { p: [0.5, 2.25, 0] }),
    part(box(0.13, 0.24, 0.02), wood, { p: [0.5, 0.2, 0.152] }),
    part(box(0.12, 0.16, 0.02), "#1a1714", { p: [0.5, 1.3, 0.152] }),
    part(box(0.12, 0.16, 0.02), "#1a1714", { p: [0.652, 1.3, 0], r: [0, PI / 2, 0] }),
  ]);
});
export const churchWinGeo = () => cached("churchWin", () => merge(
  [-0.35, -0.05, 0.25].map((x) => part(new THREE.PlaneGeometry(0.07, 0.18), "#fff", { p: [x, 0.4, 0.252] })),
));

// Covone di fieno.
export const hayGeo = () => cached("hay", () => merge([
  part(cyl(0.16, 0.18, 0.2, 12), "#c9a24a", { p: [0, 0.1, 0], j: 0.2 }),
  part(cone(0.17, 0.2, 12), "#b8913c", { p: [0, 0.3, 0], j: 0.2 }),
]));

// Formazione di ferro a bande (rocce rosse e grigie stratificate, firma dell'ossigeno).
export const bandedGeo = () => cached("banded", () => {
  const p = [];
  for (let i = 0; i < 7; i++) {
    p.push(part(box(0.9 - i * 0.07, 0.085, 0.6 - i * 0.04), i % 2 ? "#5d5b5f" : "#8a3a24", { p: [(i % 3) * 0.02, 0.045 + i * 0.085, 0], r: [0, i * 0.08, 0.04 * (i % 2 ? 1 : -1)], j: 0.22 }));
  }
  return merge(p);
});

// Tappeti di cianobatteri sull'acqua bassa.
export const matGeo = () => cached("mat", () => merge([
  part(ball(1, 12, 6), "#3f7a4a", { s: [0.5, 0.03, 0.4], j: 0.25 }),
  part(ball(1, 10, 6), "#5b8f3e", { p: [0.25, 0.01, 0.15], s: [0.28, 0.025, 0.22], j: 0.25 }),
]));

// Cumulo di carbone.
export const coalGeo = () => cached("coal", () => merge([
  part(cone(0.42, 0.34, 9), "#17161a", { p: [0, 0.17, 0], j: 0.35 }),
  part(cone(0.26, 0.22, 8), "#222126", { p: [0.32, 0.11, 0.12], j: 0.35 }),
]));

// Osservatorio con cupola e stazione meteo.
export const observatoryGeo = () => cached("obs", () => merge([
  part(cyl(0.32, 0.34, 0.4, 18), "#e8ecef", { p: [0, 0.2, 0], j: 0.04 }),
  part(ball(0.33, 18, 10), "#c9d0d6", { p: [0, 0.4, 0], s: [1, 0.9, 1], j: 0.03 }),
  part(box(0.1, 0.32, 0.3), "#1d2a33", { p: [0, 0.55, 0.12], r: [0.5, 0, 0] }),
  part(box(0.12, 0.2, 0.02), "#3a4650", { p: [0, 0.1, 0.33] }),
  part(box(0.12, 0.12, 0.12), "#f4f7fa", { p: [0.6, 0.36, 0.2] }),
  ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => part(cyl(0.008, 0.008, 0.3, 4), "#8a939c", { p: [0.6 + a * 0.05, 0.15, 0.2 + b * 0.05] })),
]));

// Radiotelescopio a parabola.
export const dishGeo = () => cached("dish", () => {
  const prof = Array.from({ length: 9 }, (_, i) => new THREE.Vector2(i * 0.06, (i * 0.06) ** 2 * 0.9));
  return merge([
    part(cyl(0.05, 0.09, 0.6, 8), "#d0d6db", { p: [0, 0.3, 0] }),
    part(box(0.2, 0.08, 0.2), "#aab3ba", { p: [0, 0.62, 0] }),
    part(new THREE.LatheGeometry(prof, 18), "#e8ecef", { p: [0, 0.68, 0], r: [-0.7, 0, 0], j: 0.03 }),
    part(cyl(0.008, 0.008, 0.42, 4), "#8a939c", { p: [0, 0.82, 0.16], r: [-0.7, 0, 0] }),
  ]);
});

// Pannello solare inclinato su palo.
export const solarGeo = () => cached("solar", () => merge([
  part(cyl(0.015, 0.015, 0.18, 5), "#8a939c", { p: [0, 0.09, 0] }),
  part(box(0.5, 0.02, 0.3), "#1d3b5a", { p: [0, 0.2, 0], r: [-0.55, 0, 0], j: 0.05 }),
  part(box(0.52, 0.012, 0.32), "#c9d0d6", { p: [0, 0.188, -0.006], r: [-0.55, 0, 0] }),
]));
