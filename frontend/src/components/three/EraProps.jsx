import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { store } from "@/lib/store";
import { sceneWeight, groundY } from "./worldMath";
import Particles from "./Particles";
import { Volcano, Stromatolites, Glacier, Forest, Village, Factory, CityBlock } from "./Models";
import { Cloud, Windmill, Turbine, Train, Iceberg, Birds, Rocks, Aurora, LavaGlow, Rain } from "./Details";
import { Person, Horse, Cow, Dog, Sheep, Mammoth, Lake, Highway, Rails, Fire, Sun, Ozone, Plane } from "./Details2";
import { Church, Haystacks, BandedRocks, AlgaeMats, CoalHeaps, SolarFarm, Observatory, Dish, WeatherBalloon } from "./EraExtras";

const lakeY = (s, x, z, r) => {
  let m = -Infinity;
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) m = Math.max(m, groundY(s, x + i * r * 0.7, z + j * r * 0.7));
  return m + 0.06;
};
const INFO = ["#66D9EF", "#4FC3F7", "#7C83FD", "#B388FF", "#FFD27A", "#FF9F43", "#FF7138", "#FF4B45"];
const peaks = (s, n, gap = 2.6) => {
  const c = [];
  for (let x = -5; x <= 5; x += 0.85) for (let z = -5; z <= 5; z += 0.85) c.push([x, groundY(s, x, z), z]);
  c.sort((a, b) => b[1] - a[1]);
  const out = [];
  for (const p of c) { if (out.every((o) => Math.hypot(o[0] - p[0], o[2] - p[2]) > gap)) out.push(p); if (out.length === n) break; }
  return out;
};
const FIRES = peaks(1, 3);
const MILE = ["#FFD27A", "#7CFFB2", "#B388FF", "#FF7138"];

// Gruppo che compare/scompare in base alla vicinanza del progresso alla scena indicata.
function Era({ index, spread = 1.25, children }) {
  const g = useRef();
  const vis = useRef(false);
  useFrame(() => {
    const w = sceneWeight(store.progress, index, spread);
    vis.current = w > 0.01;
    g.current.visible = vis.current;
    if (!vis.current) return;
    g.current.scale.setScalar(Math.max(0.001, w));
    g.current.position.y = (1 - w) * -0.8;
  });
  return <group ref={g}>{typeof children === "function" ? children(vis) : children}</group>;
}

const on = (s, x, z) => [x, groundY(s, x, z) - 0.05, z];
// Elenchi per gli oggetti instanziati: [x, y, z, rotY, scala].
const inst = (s, pts, rot = 0, sc = 1) => pts.map(([x, z, k], i) => [...on(s, x, z), i * 1.37 + rot, (k ?? sc) * (0.9 + ((i * 7) % 5) * 0.05)]);
const PINES3 = inst(3, [[-4, 0.5, 1.2], [-3.4, 1.6, 1.2], [3.6, -1.2, 1.2], [4.2, -2.6, 1.2], [2.8, -3.6, 1.2], [-4.4, 3.4, 1.2], [1, -4.2, 1.2], [-2, 4.2, 1.2],
  [-4.6, -0.6, 0.9], [4.5, 4.3, 1.2], [-0.6, 4.6, 0.9], [3.4, -4.6, 1.2], [-4.8, -4.4, 0.9], [-3.9, 2.5, 1], [4.8, 1.8, 1.1], [-2.8, -4.6, 1]]);
const HOUSES3 = [[-3, -2.6], [-1.8, -3.1], [-0.6, -2.4], [1.4, 2.8], [2.6, 2.3], [0.2, 3.3]].map(([x, z], i) => [...on(3, x, z), i * 0.7, 1]);
const HOUSES4 = [[-3.5, -2.5], [-2.4, -3.4], [0, 3.6], [-3.6, 3.2]].map(([x, z], i) => [...on(4, x, z), i * 0.9, 1]);
const PINES6 = inst(6, [[-3.8, 2.2, 1.2], [-3, 3.4, 1.2], [-4.2, 3.6, 1.2], [-4.6, 1.2, 1], [-2.4, 4.4, 1.1]]);

// Anello esterno della mappa ingrandita: punti pseudo-casuali tra r0 e r1 (deterministici).
const ring = (n, r0, r1, k = 1) => Array.from({ length: n }, (_, i) => {
  const a = i * 2.39996 + k, r = r0 + (((i * 0.618 + k * 0.37) % 1) * (r1 - r0));
  return [Math.cos(a) * r, Math.sin(a) * r];
});
const pick = (s, n, test, k) => ring(n * 4, 2, 9, k).filter(([x, z]) => test(groundY(s, x, z))).slice(0, n);
// 02 Ossigeno: tappeti di cianobatteri sull'acqua bassa, rocce di ferro a bande sulle alture.
const MATS1 = pick(1, 10, (h) => h < 0.92, 1).map(([x, z], i) => [x, 0.98, z, i, 0.8 + (i % 3) * 0.25]);
const BIF1 = pick(1, 5, (h) => h > 1.25, 2).map(([x, z], i) => [...on(1, x, z), i * 1.1, 0.9 + (i % 2) * 0.4]);
// 03 Glaciazioni: anello di ghiacciai esterni.
const GLAC2 = ring(5, 6.8, 8.6, 3).map(([x, z]) => on(2, x, z));
// 04 Medioevo: bosco esterno, case sparse, covoni.
const PINES3_OUT = inst(3, ring(18, 6, 9, 4), 0, 1.1);
const HOUSES3_OUT = [[6.4, -1.2], [-6.2, 3.8], [3.6, 6.2], [-2.6, 6.4], [5.6, 4.4]].map(([x, z], i) => [...on(3, x, z), i * 1.9, 1]);
const HAY3 = [[-5.6, -1.8], [-5.9, -1.1], [-5.2, -2.5], [5.8, 2.4], [6.3, 1.7]].map(([x, z], i) => [...on(3, x, z), i, 1]);
// 05 Industria: case operaie a schiera oltre i binari, cumuli di carbone.
const ROWS4 = Array.from({ length: 10 }, (_, i) => { const a = -2.2 + i * 0.32; return [...on(4, Math.cos(a) * 7.6, Math.sin(a) * 7.6), -a + Math.PI / 2, 1]; });
const COAL4 = [[0, -2.4], [4.2, -0.4], [-3, -0.2]].map(([x, z], i) => [...on(4, x, z), i * 2, 1 + (i % 2) * 0.3]);
// 07 Oggi: parco solare e bosco esterno.
const SOLAR6 = [];
for (let x = -7.4; x <= -5.2; x += 0.62) for (let z = -1.6; z <= 1.8; z += 0.45) SOLAR6.push([...on(6, x, z), Math.PI / 2, 1]);
const PINES6_OUT = inst(6, ring(12, 6.5, 9, 6), 0, 1.1);

const CO2 = [317, 326, 339, 354, 370, 390, 414, 425];

function Rays() {
  const g = useRef();
  useFrame((st) => { if (g.current) g.current.children.forEach((m, i) => { m.material.opacity = 0.45 + Math.sin(st.clock.elapsedTime * 2 + i) * 0.3; }); });
  const rays = useMemo(() => [
    { from: [-6, 7, -4], to: [-1.5, 0.3, 0], col: "#ffd27a" },
    { from: [-5, 7, -2], to: [0, 0.3, 1], col: "#ffd27a" },
    { from: [-4, 7, -5], to: [1.5, 0.3, -1], col: "#ffd27a" },
    { from: [-1, 0.3, 0.5], to: [3, 5, 3], col: "#ff4b45" },
    { from: [1, 0.3, -0.5], to: [5, 4.5, 1], col: "#ff4b45" },
  ], []);
  return (
    <group ref={g}>
      {rays.map((r, i) => {
        const a = new THREE.Vector3(...r.from), b = new THREE.Vector3(...r.to);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const len = a.distanceTo(b);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
        return (
          <mesh key={i} position={mid} quaternion={q}>
            <cylinderGeometry args={[0.03, 0.03, len, 6]} />
            <meshBasicMaterial color={r.col} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function EraProps({ q = 1, shadows = false }) {
  const c = (n) => Math.round(n * q);
  return (
    <group>
      <Era index={0} spread={1.0}>
        {(vis) => (<>
          <Volcano position={on(0, -2.2, -1.2)} scale={1.1} />
          <Volcano position={on(0, 2.6, 1.6)} scale={0.85} rotation-y={1.2} />
          <Volcano position={on(0, 0.2, 3.4)} scale={0.7} rotation-y={2.4} />
          <Particles visibleRef={vis} count={c(260)} area={[12, 7, 12]} origin={[0, 0.5, 0]} speed={0.9} color="#ff7138" size={0.09} />
          <Rocks count={c(30)} color="#2a1a14" groundY={(x, z) => groundY(0, x, z)} />
          <LavaGlow positions={[[-2.2, 3, -1.2], [2.6, 2.6, 1.6], [0, 1.2, 0]]} />
          <Particles visibleRef={vis} count={c(90)} area={[10, 5, 10]} origin={[0, 3, 0]} speed={0.25} color="#5b4a44" size={0.35} additive={false} opacity={0.35} swirl={0.6} />
        </>)}
      </Era>
      <Era index={1}>
        {(vis) => (<>
          <Stromatolites position={on(1, -2.4, 2.2)} scale={1.2} />
          <Stromatolites position={on(1, 2.8, -1.8)} scale={1} rotation-y={1} />
          <Stromatolites position={on(1, 0.3, -3.6)} scale={0.9} rotation-y={2} />
          <Particles visibleRef={vis} count={c(180)} area={[12, 1.6, 12]} origin={[0, 0.1, 0]} speed={0.45} color="#bff3ff" size={0.04} opacity={0.4} />
          <Stromatolites position={on(1, -4, -0.8)} scale={0.7} rotation-y={3} />
          <Stromatolites position={on(1, 4, 3.6)} scale={0.8} rotation-y={0.4} />
          <Rocks count={c(24)} color="#4a4038" groundY={(x, z) => groundY(1, x, z)} />
          <Cloud position={[0, 5.5, -2]} scale={1.3} speed={0.2} />
          <Cloud position={[0, 4.8, 3]} scale={1} speed={0.15} />
          <Rain visibleRef={vis} count={c(520)} area={[18, 7, 18]} speed={8} wind={0.1} opacity={0.32} />
          <AlgaeMats items={MATS1} />
          <BandedRocks items={BIF1} shadows={shadows} />
          <Stromatolites position={on(1, -6.4, 3.2)} scale={1} rotation-y={1.7} />
          <Stromatolites position={on(1, 6.6, -2.4)} scale={1.1} rotation-y={2.6} />
          <Particles visibleRef={vis} count={c(120)} area={[16, 1.4, 16]} origin={[0, 1.6, 0]} speed={0.3} color="#d8fff0" size={0.05} opacity={0.45} />
          {FIRES.map((p, i) => <Fire key={`f${i}`} position={p} scale={1.1 - i * 0.15} />)}
          <Particles visibleRef={vis} count={c(90)} area={[1.5, 3, 1.5]} origin={[FIRES[0][0], FIRES[0][1] + 0.4, FIRES[0][2]]} speed={1.2} color="#ff9f43" size={0.08} />
        </>)}
      </Era>
      <Era index={2}>
        {(vis) => (<>
          <Glacier position={on(2, -2.5, -2.2)} scale={1.5} />
          <Glacier position={on(2, 3, 2.5)} scale={1.2} rotation-y={0.8} />
          <Glacier position={on(2, 2.6, -3.6)} scale={1} rotation-y={2} />
          <Particles visibleRef={vis} count={c(320)} area={[16, 9, 16]} origin={[0, 0, 0]} speed={-0.8} color="#ffffff" size={0.07} additive={false} swirl={0.6} />
          <Glacier position={on(2, -3.6, 3)} scale={0.9} rotation-y={1.4} />
          <Iceberg position={on(2, 0.6, 0.4)} scale={1.2} />
          <Iceberg position={on(2, -1, 3.8)} scale={0.8} />
          <Aurora position={[0, 7.5, -6]} rotation-x={-0.25} />
          {GLAC2.map((p, i) => <Glacier key={`g${i}`} position={p} scale={1.1 + (i % 3) * 0.3} rotation-y={i * 1.3} />)}
          <Mammoth position={on(2, -1.6, 1.6)} rotation-y={0.5} />
          <Mammoth position={on(2, -0.4, 2.2)} rotation-y={2.0} scale={0.8} />
          <Mammoth position={on(2, 1.8, -0.8)} rotation-y={-0.7} scale={0.9} />
          <Rocks count={c(30)} spread={9} color="#7d8288" groundY={(x, z) => groundY(2, x, z)} />
          {[[-1.2, -0.6], [1.6, 1.4], [-3.2, 1.2], [3.6, -1]].map(([x, z], i) => (
            <Particles key={`v${i}`} visibleRef={vis} count={c(40)} area={[1.2, 3.5, 1.2]} origin={[x, groundY(2, x, z), z]} speed={0.35} color="#e8f2f8" size={0.55} additive={false} opacity={0.28} swirl={0.5} />
          ))}
        </>)}
      </Era>
      <Era index={3}>
        {(vis) => (<>
          <Village items={HOUSES3} shadows={shadows} />
          <Village items={HOUSES3_OUT} shadows={shadows} />
          <Forest items={PINES3} shadows={shadows} />
          <Forest items={PINES3_OUT} shadows={shadows} />
          <Church position={on(3, -1.6, -4.8)} rotation-y={0.3} />
          <Haystacks items={HAY3} shadows={shadows} />
          {[[-6, 0.6], [-6.5, 1.2], [-5.7, 1.7], [-6.8, 0.1], [-5.4, 0.9]].map(([x, z], i) => <Sheep key={`s${i}`} position={on(3, x, z)} rotation-y={i * 1.4} />)}
          <Person position={on(3, -5.4, -1.4)} shirt="#5a4a3a" pants="#3b2f24" hat="#c9a24a" rotation-y={1.1} />
          <Particles visibleRef={vis} count={c(80)} area={[2, 2.5, 2]} origin={[-1.8, 1, -2.7]} speed={0.35} color="#c8ccd2" size={0.12} additive={false} opacity={0.5} />
          <Particles visibleRef={vis} count={c(220)} area={[14, 7, 14]} origin={[0, 0, 0]} speed={-0.5} color="#ffffff" size={0.05} additive={false} swirl={0.4} />
          <Windmill position={on(3, 3.8, 0.6)} scale={1.3} rotation-y={-0.6} />
          <Birds radius={4.5} y={5} count={5} />
          <Cloud position={[0, 6, -3]} scale={1.2} speed={0.18} />
          <Lake position={[1.6, lakeY(3, 1.6, -1.4, 1.1), -1.4]} radius={1.1} />
          <Person position={on(3, -1.2, -1.9)} shirt="#7a3b2a" pants="#4a3b2c" rotation-y={0.6} />
          <Person position={on(3, 0.4, 0.6)} shirt="#3d5a80" pants="#2b2622" hair="#6b4a2a" radius={0.7} speed={0.35} />
          <Person position={on(3, -0.2, 1.2)} shirt="#6b5a2a" pants="#3a3a30" radius={0.5} speed={-0.3} hat="#3b2a1d" />
          <Person position={on(3, 3.0, -0.6)} shirt="#556b2f" pants="#3b2f24" hair="#1e1a16" rotation-y={-1.2} />
          <Dog position={on(3, 0.9, 0.2)} rotation-y={1} />
          <Horse position={on(3, -2.4, 0.2)} rotation-y={0.4} />
          <Horse position={on(3, -1.6, -0.6)} rotation-y={2.2} />
          <Cow position={on(3, 2.0, -3.2)} rotation-y={-0.5} />
          <Cow position={on(3, 0.8, -3.6)} rotation-y={1.4} />
          <Cow position={on(3, 1.4, -4.4)} rotation-y={2.6} />
        </>)}
      </Era>
      <Era index={4}>
        {(vis) => (<>
          <Factory position={on(4, 1.5, -1.2)} scale={1.3} />
          <Factory position={on(4, -1.6, 1.6)} scale={1.1} rotation-y={Math.PI / 2} />
          <Factory position={on(4, 3.2, 2.2)} scale={0.9} rotation-y={-0.4} />
          <Village items={HOUSES4} roof="#5a4038" wall="#7a6656" shadows={shadows} />
          <Village items={ROWS4} roof="#3a3a3e" wall="#6a3a2c" shadows={shadows} />
          <CoalHeaps items={COAL4} shadows={shadows} />
          <Factory position={on(4, -7.2, -3.2)} scale={1.1} rotation-y={0.9} />
          <Factory position={on(4, -5.0, 6.2)} scale={1} rotation-y={-0.5} />
          <Particles visibleRef={vis} count={c(260)} area={[7, 8, 5]} origin={[0.8, 2.5, 0]} speed={0.7} color="#8c8f94" size={0.22} additive={false} opacity={0.45} swirl={0.5} />
          <Particles visibleRef={vis} count={c(140)} area={[16, 4, 16]} origin={[0, 7, 0]} speed={0.12} color="#66d9ef" size={0.06} />
          <Rails radius={6.2} y={0.92} />
          <Train path={6.2} y={0.92} ring={false} />
          <Highway length={11} y={1.0} z={-4.4} vehicles={4} lanes={2} cargo="#141414" />
          {[[2.7, 0.1], [0.3, -0.1], [-0.4, 2.7], [3.6, 3.2]].map(([x, z], i) => (
            <Person key={`w${i}`} position={on(4, x, z)} shirt="#2f4f6f" pants="#1f2a36" hat="#f6b93b" rotation-y={i * 1.3} />
          ))}
          <Person position={on(4, 1.2, 1.4)} shirt="#2f4f6f" pants="#1f2a36" hat="#f6b93b" radius={0.6} speed={0.4} />
          <Rain visibleRef={vis} count={c(380)} area={[13, 8, 13]} speed={9} wind={0.18} color="#9aa3ab" opacity={0.3} />
          <Particles visibleRef={vis} count={c(120)} area={[5, 6, 4]} origin={[-1.6, 2.5, 1.6]} speed={0.6} color="#6f7277" size={0.25} additive={false} opacity={0.4} swirl={0.4} />
        </>)}
      </Era>
      <Era index={5}>
        <group rotation-y={Math.PI / 2}>
        <group position={[-4.2, 0.2, 0.6]}>
          {CO2.map((v, i) => (
            <mesh key={i} position={[i * 1.2, (v - 280) / 56, 0]} castShadow={shadows}>
              <boxGeometry args={[0.7, (v - 280) / 28, 0.7]} />
              <meshStandardMaterial color={INFO[i]} emissive={INFO[i]} emissiveIntensity={0.55} roughness={0.3} />
            </mesh>
          ))}
          {CO2.map((v, i) => (
            <mesh key={`c${i}`} position={[i * 1.2, (v - 280) / 28 + 0.06, 0]}>
              <boxGeometry args={[0.78, 0.08, 0.78]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}
          <mesh position={[4.2, -0.02, 0]}><boxGeometry args={[10.2, 0.04, 1.4]} /><meshStandardMaterial color="#101D30" emissive="#1b3a5c" emissiveIntensity={0.4} /></mesh>
        </group>
        {[[-3, -3], [-1, -3.4], [1, -3.4], [3, -3]].map(([x, z], i) => (
          <group key={i} position={[x, 0.2, z]}>
            <mesh position-y={0.6 + i * 0.35}><cylinderGeometry args={[0.06, 0.06, 1.2 + i * 0.7, 8]} /><meshStandardMaterial color="#f4f7fa" /></mesh>
            <mesh position-y={1.25 + i * 0.7}><sphereGeometry args={[0.2, 16, 12]} /><meshStandardMaterial color={MILE[i]} emissive={MILE[i]} emissiveIntensity={1.2} /></mesh>
          </group>
        ))}
        </group>
        <Rays />
        <Observatory position={on(5, -5.6, 3.8)} scale={1.3} rotation-y={0.6} />
        <Dish position={on(5, 5.8, -4.0)} scale={1.4} rotation-y={-0.6} />
        <Dish position={on(5, 6.8, 2.6)} scale={1.1} rotation-y={-1.8} />
        <WeatherBalloon position={[-4.6, 0.8, 2.6]} height={7} />
        <Person position={on(5, -4.9, 3.0)} shirt="#f4f7fa" pants="#2b3440" rotation-y={0.8} />
        <Person position={on(5, 5.2, -3.2)} shirt="#f4f7fa" pants="#2b3440" radius={0.4} speed={0.3} />
      </Era>
      <Era index={6}>
        {(vis) => (<>
          <CityBlock position={on(6, 3.2, 0.8)} scale={1.3} />
          <CityBlock position={on(6, 1.4, 3.4)} scale={1} rotation-y={1.3} />
          <Glacier position={on(6, -3, -3)} scale={[0.9, 0.6, 0.9]} />
          <Forest items={PINES6} snow={0} shadows={shadows} />
          <Forest items={PINES6_OUT} snow={0} shadows={shadows} />
          <SolarFarm items={SOLAR6} shadows={shadows} />
          {[[-6.4, -5.2], [-4.6, -6.6], [6.8, -5.4], [7.6, -3.6]].map(([x, z], i) => <Turbine key={`t2${i}`} position={on(6, x, z)} rotation-y={0.4} scale={1.2} />)}
          <CityBlock position={on(6, 7.2, 1.8)} scale={0.9} rotation-y={2.2} />
          <Fire position={on(6, -4.4, 3.2)} scale={1.2} />
          <Fire position={on(6, -3.2, 4.0)} scale={0.9} />
          <Particles visibleRef={vis} count={c(120)} area={[3, 3, 3]} origin={[-3.6, 0.8, 3]} speed={1.1} color="#ff7138" size={0.1} />
          <Particles visibleRef={vis} count={c(160)} area={[16, 3, 16]} origin={[0, 1, 0]} speed={0.25} color="#ff4b45" size={0.05} opacity={0.5} />
          {[[-1.5, -4.2], [0.2, -4.6], [1.9, -4.2]].map(([x, z], i) => (
            <Turbine key={i} position={on(6, x, z)} rotation-y={0.4} />
          ))}
          <CityBlock position={on(6, 4.4, -2.4)} scale={0.8} rotation-y={0.6} />
          <Birds radius={3.6} y={4.5} count={4} speed={0.5} />
          <Cloud position={[0, 6.5, 1]} scale={1} speed={0.22} />
          <Rain visibleRef={vis} count={c(300)} area={[13, 7, 13]} speed={10} wind={0.22} opacity={0.28} />
          <Sun position={[-3, 6.5, 6]} />
          <Ozone />
          <Highway length={13} y={1.9} z={-2.2} vehicles={7} />
          <Plane radius={6.5} y={7} phase={0} />
          <Plane radius={5} y={8.5} speed={-0.14} phase={2} />
        </>)}
      </Era>
    </group>
  );
}
