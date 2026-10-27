import { part, merge, cached, box, cyl, ball, cone } from "./Kit";

const PI = Math.PI;

// Figura umana con proporzioni realistiche; arti marcati per l'animazione di camminata in GPU.
export const personGeo = ({ shirt, pants = "#2e2a26", skin = "#e0b48a", hair = "#3a2a1e", hat }) =>
  cached(`person${shirt}${pants}${skin}${hair}${hat}`, () => {
    const p = [];
    [-1, 1].forEach((s) => {
      const leg = [1.25 * s, s * 0.035, 0.25, 0];
      p.push(part(cyl(0.026, 0.022, 0.22, 7), pants, { p: [s * 0.035, 0.14, 0], rig: leg }));
      p.push(part(box(0.05, 0.03, 0.085), "#1d1a17", { p: [s * 0.035, 0.015, 0.012], rig: leg }));
      const arm = [-s, s * 0.085, 0.455, 0];
      p.push(part(cyl(0.02, 0.017, 0.19, 7), shirt, { p: [s * 0.085, 0.37, 0], r: [0, 0, s * 0.06], rig: arm }));
      p.push(part(ball(0.02, 7, 5), skin, { p: [s * 0.091, 0.265, 0], rig: arm }));
    });
    p.push(part(box(0.11, 0.06, 0.07), pants, { p: [0, 0.27, 0] }));
    p.push(part(cyl(0.064, 0.052, 0.2, 9), shirt, { p: [0, 0.37, 0], s: [1, 1, 0.62] }));
    p.push(part(box(0.112, 0.018, 0.072), "#3b2a1f", { p: [0, 0.29, 0] }));
    p.push(part(cyl(0.02, 0.022, 0.035, 7), skin, { p: [0, 0.485, 0] }));
    p.push(part(ball(0.052, 12, 10), skin, { p: [0, 0.54, 0], s: [0.92, 1.1, 1] }));
    p.push(part(ball(0.055, 12, 6), hair, { p: [0, 0.548, -0.006], s: [0.95, 1.05, 1.02], r: [-0.25, 0, 0] }));
    p.push(part(box(0.012, 0.012, 0.01), "#c89a74", { p: [0, 0.535, 0.05] }));
    if (hat) {
      p.push(part(cyl(0.085, 0.085, 0.01, 12), hat, { p: [0, 0.588, 0] }));
      p.push(part(cyl(0.047, 0.052, 0.05, 12), hat, { p: [0, 0.615, 0] }));
    }
    return merge(p);
  });

// Quadrupedi: corpo morbido, zampe rastremate con zoccoli, collo e testa che bruca (rig 2), coda (rig 3).
export const quadGeo = (kind) => cached(`quad${kind}`, () => {
  const S = {
    horse: { b: [0.46, 0.17, 0.15], lh: 0.27, lw: 0.024, nk: 0.24, col: "#6b4226", dark: "#24160d", hoof: "#1b1410" },
    cow: { b: [0.44, 0.21, 0.19], lh: 0.17, lw: 0.03, nk: 0.15, col: "#f1ece4", dark: "#2a2522", hoof: "#3a3430" },
    dog: { b: [0.2, 0.075, 0.07], lh: 0.09, lw: 0.012, nk: 0.09, col: "#a8743f", dark: "#5a3a1e", hoof: "#5a3a1e" },
  }[kind];
  const [bx, by, bz] = S.b, y0 = S.lh + by / 2;
  const p = [
    part(ball(1, 14, 10), S.col, { p: [0, y0, 0], s: [bx / 2, by / 2, bz / 2], j: 0.05 }),
    part(ball(1, 12, 8), S.col, { p: [bx * 0.3, y0 + by * 0.06, 0], s: [bx * 0.24, by * 0.55, bz * 0.52], j: 0.05 }),
    part(ball(1, 12, 8), S.col, { p: [-bx * 0.3, y0 + by * 0.04, 0], s: [bx * 0.24, by * 0.52, bz * 0.5], j: 0.05 }),
  ];
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
    const x = sx * (bx / 2 - S.lw * 2.2), z = sz * (bz / 2 - S.lw * 1.4);
    p.push(part(cyl(S.lw * 1.25, S.lw * 0.85, S.lh, 7), S.col, { p: [x, S.lh / 2 + 0.01, z] }));
    p.push(part(cyl(S.lw * 0.95, S.lw * 1.05, 0.025, 7), S.hoof, { p: [x, 0.0125, z] }));
  });
  // collo + testa con perno alla base del collo
  const pv = [bx * 0.42, y0 + by * 0.25];
  const rig = [2, pv[0], pv[1], 0];
  const hx = pv[0] + S.nk * 0.55, hy = pv[1] + S.nk * 0.55;
  p.push(part(cyl(by * 0.2, by * 0.3, S.nk, 8), S.col, { p: [pv[0] + S.nk * 0.28, pv[1] + S.nk * 0.28, 0], r: [0, 0, -0.78], rig }));
  p.push(part(cyl(by * 0.13, by * 0.22, S.nk * 0.75, 8), kind === "cow" ? "#e8dcd0" : S.col, { p: [hx + S.nk * 0.2, hy - 0.01, 0], r: [0, 0, -1.9], rig }));
  p.push(part(ball(by * 0.24, 10, 8), S.col, { p: [hx, hy + 0.01, 0], rig }));
  [-1, 1].forEach((s) => p.push(part(ball(by * 0.045, 6, 4), "#0d0d0d", { p: [hx + by * 0.1, hy + by * 0.08, s * by * 0.19], rig })));
  [-1, 1].forEach((s) => p.push(part(cone(by * 0.07, by * 0.22, 5), kind === "dog" ? S.dark : S.col, { p: [hx - by * 0.08, hy + by * 0.26, s * by * 0.13], r: [s * 0.4, 0, kind === "dog" ? 0.9 : 0.2], rig })));
  if (kind === "horse") {
    p.push(part(box(S.nk * 1.05, by * 0.16, 0.022), S.dark, { p: [pv[0] + S.nk * 0.22, pv[1] + S.nk * 0.38, 0], r: [0, 0, -0.78], rig }));
  }
  if (kind === "cow") {
    [-1, 1].forEach((s) => p.push(part(cone(0.012, 0.06, 5), "#e8e0c8", { p: [hx - 0.01, hy + by * 0.24, s * by * 0.2], r: [s * 1.1, 0, 0], rig })));
    [[0.06, 0.05, 1], [-0.1, 0.02, 1], [0.0, -0.01, -1], [-0.14, 0.04, -1], [0.12, 0.0, -1]].forEach(([x, y, s]) =>
      p.push(part(ball(1, 8, 6), S.dark, { p: [x, y0 + y, s * bz * 0.42], s: [0.055, 0.05, 0.03], j: 0.02 })));
    p.push(part(ball(0.04, 8, 6), "#e8a3a0", { p: [-bx * 0.18, S.lh + 0.01, 0] }));
  }
  const tp = [-bx / 2, y0 + by * 0.25, 0];
  p.push(part(cyl(0.008, kind === "horse" ? 0.03 : 0.01, by * 1.1, 6), S.dark, { p: [tp[0] - 0.02, tp[1] - by * 0.5, 0], r: [0, 0, -0.25], rig: [3, ...tp] }));
  return merge(p);
});

// Camion fuso in una sola geometria (cabina, cassone, vetri, ruote, fari).
export const truckGeo = (color, cargo) => cached(`truck${color}${cargo}`, () => {
  const p = [
    part(box(0.18, 0.19, 0.2), color, { p: [0.22, 0.175, 0], j: 0.03 }),
    part(box(0.012, 0.085, 0.17), "#1d2a33", { p: [0.312, 0.21, 0] }),
    part(box(0.62, 0.035, 0.2), "#2a2d30", { p: [0.0, 0.07, 0] }),
    part(box(0.4, 0.13, 0.2), "#5a6066", { p: [-0.08, 0.15, 0], j: 0.05 }),
    part(box(0.01, 0.025, 0.04), "#ffe6a8", { p: [0.315, 0.1, 0.07] }),
    part(box(0.01, 0.025, 0.04), "#ffe6a8", { p: [0.315, 0.1, -0.07] }),
  ];
  if (cargo) p.push(part(ball(1, 7, 5), cargo, { p: [-0.08, 0.22, 0], s: [0.18, 0.06, 0.085], j: 0.2 }));
  [[0.22, 1], [0.22, -1], [-0.18, 1], [-0.18, -1], [-0.04, 1], [-0.04, -1]].forEach(([x, s]) =>
    p.push(part(cyl(0.045, 0.045, 0.03, 10), "#121212", { p: [x, 0.045, s * 0.1], r: [PI / 2, 0, 0] })));
  return merge(p);
});

// Strada sopraelevata: carreggiata, segnaletica e piloni in un'unica geometria.
export const roadGeo = (length, y, z, pillars) => cached(`road${length}${y}${z}${pillars}`, () => {
  const p = [
    part(box(length, 0.06, 0.7), "#2b2f36", { p: [0, y - 0.03, z], j: 0.04 }),
    part(box(length, 0.05, 0.03), "#8a939c", { p: [0, y + 0.02, z + 0.36] }),
    part(box(length, 0.05, 0.03), "#8a939c", { p: [0, y + 0.02, z - 0.36] }),
  ];
  for (let i = 0; i < Math.floor(length / 0.6); i++) p.push(part(box(0.28, 0.005, 0.03), "#e8ecef", { p: [-length / 2 + 0.3 + i * 0.6, y + 0.002, z], j: 0 }));
  if (pillars) for (let i = 0; i <= Math.floor(length / 2.4); i++) p.push(part(box(0.18, y, 0.3), "#8a939c", { p: [-length / 2 + i * 2.4, y / 2, z], j: 0.06 }));
  return merge(p);
});
