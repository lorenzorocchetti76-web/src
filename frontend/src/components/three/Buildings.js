import * as THREE from "three";
import { part, merge, cached, box, cyl, cone, ball, prism } from "./Kit";

const PI = Math.PI;

// Casa in muratura con travi, tetto a due falde, comignolo, porta e cornici delle finestre.
export const houseGeo = (roof = "#e9eef2", wall = "#8a6b52") => cached(`house${roof}${wall}`, () => {
  const wood = "#3b2a1f", stone = "#6d665e";
  const p = [
    part(box(0.66, 0.07, 0.5), stone, { p: [0, 0.035, 0], j: 0.18 }),
    part(box(0.6, 0.42, 0.45), wall, { p: [0, 0.28, 0], j: 0.1 }),
    part(prism(0.45, 0.2, 0.6), wall, { p: [0, 0.49, 0], r: [0, PI / 2, 0], j: 0.1 }),
    part(box(0.63, 0.035, 0.475), wood, { p: [0, 0.49, 0] }),
    part(box(0.7, 0.035, 0.34), roof, { p: [0, 0.585, 0.135], r: [0.72, 0, 0], j: 0.12 }),
    part(box(0.7, 0.035, 0.34), roof, { p: [0, 0.585, -0.135], r: [-0.72, 0, 0], j: 0.12 }),
    part(box(0.72, 0.03, 0.03), wood, { p: [0, 0.71, 0] }),
    part(box(0.085, 0.3, 0.085), stone, { p: [0.17, 0.68, -0.1], j: 0.2 }),
    part(box(0.105, 0.025, 0.105), "#4a4540", { p: [0.17, 0.835, -0.1] }),
    part(box(0.11, 0.2, 0.015), "#5a3b26", { p: [-0.14, 0.17, 0.228] }),
    part(box(0.13, 0.02, 0.03), wood, { p: [-0.14, 0.275, 0.235] }),
  ];
  [[-0.3, -0.225], [0.3, -0.225], [-0.3, 0.225], [0.3, 0.225]].forEach(([x, z]) =>
    p.push(part(box(0.035, 0.43, 0.035), wood, { p: [x, 0.28, z] })));
  // cornici e montanti
  [[0.11, 0.229, 0], [0.11, -0.229, PI]].forEach(([x, z, ry]) => {
    p.push(part(box(0.14, 0.13, 0.008), wood, { p: [x, 0.3, z], r: [0, ry, 0] }));
    p.push(part(box(0.15, 0.02, 0.03), wood, { p: [x, 0.23, z * 1.03] }));
  });
  p.push(part(box(0.008, 0.13, 0.12), wood, { p: [0.302, 0.3, 0] }));
  return merge(p);
});

export const houseWinGeo = () => cached("houseWin", () => merge([
  part(new THREE.PlaneGeometry(0.11, 0.1), "#fff", { p: [0.11, 0.3, 0.234] }),
  part(new THREE.PlaneGeometry(0.11, 0.1), "#fff", { p: [0.11, 0.3, -0.234], r: [0, PI, 0] }),
  part(new THREE.PlaneGeometry(0.09, 0.1), "#fff", { p: [0.307, 0.3, 0], r: [0, PI / 2, 0] }),
  part(new THREE.PlaneGeometry(0.035, 0.05), "#fff", { p: [-0.14, 0.235, 0.237] }),
]));

// Conifera a più palchi, con tronco rastremato e (opzionale) neve sui rami.
export const pineGeo = (snow = 1) => cached(`pine${snow}`, () => {
  const g = ["#253f2c", "#2d4c34", "#36583d", "#3f6446"];
  const p = [part(cyl(0.035, 0.06, 0.38, 7), "#3b2a1d", { p: [0, 0.19, 0], j: 0.15 })];
  [[0.34, 0.42, 0.42], [0.27, 0.38, 0.62], [0.2, 0.32, 0.8], [0.12, 0.26, 0.96]].forEach(([r, h, y], i) => {
    p.push(part(cone(r, h, 9), g[i], { p: [0, y, 0], r: [0, i * 0.6, 0], j: 0.12 }));
    if (snow) p.push(part(cone(r * 0.72, h * 0.42, 9), "#eef3f7", { p: [0, y + h * 0.3, 0], r: [0, i * 0.6 + 0.3, 0], j: 0.05 }));
  });
  return merge(p);
});

// Fabbrica in mattoni con tetto a shed, ciminiere a fasce, serbatoio e tubazioni.
export const factoryGeo = () => cached("factory", () => {
  const brick = "#7a3626", dark = "#3a2a24", steel = "#7d858c", conc = "#8b8580";
  const p = [
    part(box(1.7, 0.08, 1.0), conc, { p: [0, 0.04, 0], j: 0.12 }),
    part(box(1.6, 0.82, 0.9), brick, { p: [0, 0.49, 0], j: 0.16 }),
    part(box(1.64, 0.05, 0.94), "#5e2a1f", { p: [0, 0.9, 0] }),
    part(box(0.3, 0.42, 0.02), "#2c2f33", { p: [0.55, 0.29, 0.455] }),
    part(box(1.66, 0.04, 0.02), "#5e2a1f", { p: [0, 0.6, 0.46] }),
  ];
  [-0.53, 0, 0.53].forEach((x) => {
    p.push(part(box(0.54, 0.04, 0.95), dark, { p: [x - 0.06, 1.06, 0], r: [0, 0, 0.55], j: 0.1 }));
    p.push(part(box(0.02, 0.3, 0.9), "#1c2a33", { p: [x + 0.18, 1.06, 0] }));
  });
  [[-0.55, 2.0], [0.55, 1.7]].forEach(([x, h]) => {
    p.push(part(cyl(0.085, 0.14, h, 12), brick, { p: [x, 0.9 + h / 2, -0.25], j: 0.14 }));
    [0.35, 0.75].forEach((f) => p.push(part(cyl(0.12 - f * 0.04, 0.125 - f * 0.04, 0.06, 12), "#d8d4cc", { p: [x, 0.9 + h * f, -0.25] })));
    p.push(part(cyl(0.1, 0.09, 0.06, 12), "#2a2220", { p: [x, 0.9 + h, -0.25] }));
  });
  p.push(part(cyl(0.22, 0.22, 0.7, 14), steel, { p: [-1.05, 0.43, -0.1], j: 0.05 }));
  p.push(part(ball(0.22, 14, 7), steel, { p: [-1.05, 0.78, -0.1], s: [1, 0.45, 1], j: 0.05 }));
  p.push(part(cyl(0.03, 0.03, 0.5, 6), "#5b6167", { p: [-0.82, 0.62, -0.1], r: [0, 0, PI / 2] }));
  p.push(part(cyl(0.03, 0.03, 0.55, 6), "#5b6167", { p: [-0.6, 0.35, 0.47], r: [0, 0, PI / 2] }));
  return merge(p);
});

export const factoryWinGeo = () => cached("factoryWin", () => {
  const p = [];
  [-0.65, -0.35, -0.05, 0.25].forEach((x) => [0.42, 0.75].forEach((y) =>
    p.push(part(new THREE.PlaneGeometry(0.16, 0.2), "#fff", { p: [x, y, 0.452] }))));
  [-0.53, 0, 0.53].forEach((x) => p.push(part(new THREE.PlaneGeometry(0.85, 0.24), "#fff", { p: [x + 0.195, 1.06, 0], r: [0, PI / 2, 0] })));
  return merge(p);
});

// Isolato di grattacieli con basamento, arretramenti, impianti sul tetto e facciate a nastri vetrati.
const TOWERS = [[0, 0, 1.6], [0.55, 0.1, 1.1], [-0.5, 0.2, 2.1], [0.1, 0.65, 0.9], [-0.45, -0.5, 1.3], [0.6, -0.55, 1.8], [-0.05, -0.15, 2.5]];
const TC = ["#b8c6d1", "#8c9fae", "#cfd8de", "#7d90a0", "#a7b4bd", "#95a6b4", "#c2ccd3"];
export const cityGeo = () => cached("city", () => {
  const p = [part(box(1.7, 0.06, 1.8), "#4b5157", { p: [0, 0.03, 0.05], j: 0.05 })];
  TOWERS.forEach(([x, z, h], i) => {
    p.push(part(box(0.42, 0.14, 0.42), "#6b737a", { p: [x, 0.07, z] }));
    p.push(part(box(0.36, h, 0.36), TC[i], { p: [x, h / 2, z], j: 0.04 }));
    p.push(part(box(0.26, 0.18, 0.26), TC[(i + 3) % 7], { p: [x, h + 0.09, z] }));
    p.push(part(box(0.1, 0.06, 0.08), "#555c62", { p: [x + 0.06, h + 0.21, z - 0.04] }));
    if (h > 1.5) p.push(part(cyl(0.006, 0.012, 0.35, 4), "#d0d4d8", { p: [x - 0.05, h + 0.35, z + 0.05] }));
    for (let y = 0.3; y < h - 0.05; y += 0.22) p.push(part(box(0.37, 0.018, 0.37), "#5f6a74", { p: [x, y, z] }));
  });
  return merge(p);
});

export const cityWinGeo = () => cached("cityWin", () => {
  const p = [];
  TOWERS.forEach(([x, z, h]) => {
    for (let y = 0.4; y < h - 0.1; y += 0.22) {
      p.push(part(new THREE.PlaneGeometry(0.3, 0.13), "#fff", { p: [x, y, z + 0.182] }));
      p.push(part(new THREE.PlaneGeometry(0.3, 0.13), "#fff", { p: [x + 0.182, y, z], r: [0, PI / 2, 0] }));
    }
  });
  return merge(p);
});
