import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Kit di modellazione: ogni modello è fuso in UNA geometria con colori per vertice
// (1 draw call per oggetto, materiali condivisi) e animazioni delle articolazioni nel vertex shader.
const V = THREE.Vector3, Q = new THREE.Quaternion(), E = new THREE.Euler(), M = new THREE.Matrix4();
const C = new THREE.Color();
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

/**
 * Prepara un pezzo: trasformazione, colore (con leggera variazione per triangolo, effetto "materico") e rig.
 * o: { p: posizione, r: rotazione euler, s: scala (numero o array), j: variazione colore, rig: [modo, px, py, pz] }
 */
export function part(geo, color, o = {}) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  if (g.attributes.uv) g.deleteAttribute("uv");
  if (g.attributes.uv1) g.deleteAttribute("uv1");
  const s = Array.isArray(o.s) ? o.s : [o.s ?? 1, o.s ?? 1, o.s ?? 1];
  E.set(...(o.r || [0, 0, 0]));
  M.compose(new V(...(o.p || [0, 0, 0])), Q.setFromEuler(E), new V(...s));
  g.applyMatrix4(M);
  const n = g.attributes.position.count;
  const col = new Float32Array(n * 3);
  const rig = new Float32Array(n * 4);
  C.set(color);
  const j = o.j ?? 0.07;
  for (let t = 0; t < n; t += 3) {
    const k = 1 + (rnd() - 0.5) * 2 * j;
    for (let v = t; v < t + 3 && v < n; v++) {
      col[v * 3] = C.r * k; col[v * 3 + 1] = C.g * k; col[v * 3 + 2] = C.b * k;
      if (o.rig) rig.set(o.rig, v * 4);
    }
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.setAttribute("aRig", new THREE.BufferAttribute(rig, 4));
  return g;
}

export const merge = (parts) => {
  const g = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());
  g.computeBoundingSphere();
  return g;
};

const cache = new Map();
export const cached = (key, build) => {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
};

// Primitive di comodo.
export const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
export const cyl = (rt, rb, h, seg = 10) => new THREE.CylinderGeometry(rt, rb, h, seg);
export const cone = (r, h, seg = 10) => new THREE.ConeGeometry(r, h, seg);
export const ball = (r, w = 12, h = 9) => new THREE.SphereGeometry(r, w, h);
export const prism = (w, h, len) => {
  const sh = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)]);
  const g = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false });
  g.translate(0, 0, -len / 2);
  return g;
};

// Materiali PBR condivisi (colore dai vertici).
export const VC = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0.02 });
export const VC_GLASS = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.45 });
export const VC_METAL = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.6 });

// Tempo condiviso da tutti gli shader animati (aggiornato una sola volta per frame).
export const TIME = { value: 0 };

/**
 * Materiale "rig": ruota i vertici marcati attorno al loro perno.
 * modo ±1 braccia, ±1.25 gambe (oscillazione su X), 2 testa che bruca (su Z), 3 coda (su X).
 */
const RIG_GLSL = `
  vec3 transformed = vec3(position);
  float rm = aRig.x;
  if (rm != 0.0) {
    vec3 pv = aRig.yzw; vec3 q = transformed - pv; float a;
    if (abs(rm) < 1.5) {
      float amp = abs(rm) > 1.1 ? uRig.y : uRig.x;
      a = sign(rm) * sin(TIME_V * uRig.z + uRig.w) * amp;
      q = vec3(q.x, cos(a) * q.y - sin(a) * q.z, sin(a) * q.y + cos(a) * q.z);
    } else if (rm < 2.5) {
      a = -(0.25 + 0.32 * (0.5 + 0.5 * sin(TIME_V * 0.8 + uRig.w)));
      q = vec3(cos(a) * q.x - sin(a) * q.y, sin(a) * q.x + cos(a) * q.y, q.z);
    } else {
      a = sin(TIME_V * 3.0 + uRig.w) * 0.35;
      q = vec3(cos(a) * q.x - sin(a) * q.z, q.y, sin(a) * q.x + cos(a) * q.z);
    }
    transformed = pv + q;
  }`;

export function rigMaterial({ arm = 0.12, leg = 0, freq = 2, phase = 0 } = {}) {
  const m = VC.clone();
  const uRig = { value: new THREE.Vector4(arm, leg, freq, phase) };
  m.onBeforeCompile = (s) => {
    s.uniforms.uTime = TIME;
    s.uniforms.uRig = uRig;
    s.vertexShader = `attribute vec4 aRig;\nuniform float uTime;\nuniform vec4 uRig;\n${s.vertexShader}`
      .replace("#include <begin_vertex>", RIG_GLSL.replace(/TIME_V/g, "uTime"));
  };
  m.customProgramCacheKey = () => "rig";
  m.userData.rig = uRig;
  return m;
}

// Materiale fogliame instanziato con vento (oscillazione proporzionale all'altezza, sfasata per albero).
export function windMaterial() {
  const m = VC.clone();
  m.onBeforeCompile = (s) => {
    s.uniforms.uTime = TIME;
    s.vertexShader = `uniform float uTime;\n${s.vertexShader}`.replace("#include <begin_vertex>", `
      vec3 transformed = vec3(position);
      #ifdef USE_INSTANCING
        float ph = instanceMatrix[3].x * 1.7 + instanceMatrix[3].z * 1.3;
      #else
        float ph = 0.0;
      #endif
      float hh = max(position.y - 0.25, 0.0);
      transformed.x += (sin(uTime * 1.4 + ph) * 0.05 + sin(uTime * 3.1 + ph) * 0.015) * hh;
      transformed.z += cos(uTime * 1.1 + ph) * 0.03 * hh;`);
  };
  m.customProgramCacheKey = () => "wind";
  return m;
}

// Imposta le matrici di un InstancedMesh da una lista [x, y, z, rotY, scala].
export function placeInstances(mesh, list, tint) {
  if (!mesh) return;
  const o = new THREE.Object3D();
  list.forEach(([x, y, z, ry = 0, sc = 1], i) => {
    o.position.set(x, y, z); o.rotation.set(0, ry, 0); o.scale.setScalar(sc); o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
    if (tint) mesh.setColorAt(i, C.setScalar(0.82 + ((i * 37) % 10) / 33));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
}
