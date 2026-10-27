import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { store } from "@/lib/store";
import { sceneWeight, groundY } from "./worldMath";
import { Person } from "./Details2";

// Capitolo 06: infografica 3D premium. CO2 (Mauna Loa, ppm) e anomalia di temperatura globale (°C, rispetto al 1951-1980, indicativa).
const DATA = [
  { y: "1960", co2: 317, t: -0.03 }, { y: "1970", co2: 326, t: 0.03 }, { y: "1980", co2: 339, t: 0.26 }, { y: "1990", co2: 354, t: 0.45 },
  { y: "2000", co2: 370, t: 0.42 }, { y: "2010", co2: 390, t: 0.72 }, { y: "2020", co2: 414, t: 1.02 }, { y: "2024", co2: 425, t: 1.29 },
];
const COLS = ["#66D9EF", "#4FC3F7", "#7C83FD", "#B388FF", "#FFD27A", "#FF9F43", "#FF7138", "#FF4B45"];
const FONT = "/fonts/inter-700.woff", MONO = "/fonts/mono-500.woff";
const X = -1.6, Z0 = 4.2, DZ = -1.2;
const FLOOR = groundY(5, 0, 0) + 0.12;
const barH = (v) => (v - 280) / 44;
const tempY = (t) => 3.9 + t * 1.2;
const zOf = (i) => Z0 + i * DZ;
const face = (x, z) => Math.atan2(X - x, 0 - z);

const GLASS = new THREE.MeshPhysicalMaterial({ color: "#bfe9ff", roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.22, clearcoat: 1, depthWrite: false });
const LINE = new THREE.MeshBasicMaterial({ color: "#ff4b45", toneMapped: false });
const DOT = new THREE.MeshBasicMaterial({ color: "#ffd2c8", toneMapped: false });
const SCREEN = new THREE.MeshStandardMaterial({ color: "#0b2a3a", emissive: "#3fb6e0", emissiveIntensity: 0.9 });
const DARK = new THREE.MeshStandardMaterial({ color: "#121a26", roughness: 0.35, metalness: 0.6 });
const STEEL = new THREE.MeshStandardMaterial({ color: "#9aa6b2", roughness: 0.3, metalness: 0.85 });

function Bar({ d, i, grow }) {
  const g = useRef(); const label = useRef();
  const h = barH(d.co2);
  useFrame(() => {
    const k = THREE.MathUtils.smootherstep(grow.current - i * 0.35, 0, 1.3);
    if (g.current) g.current.scale.y = Math.max(0.001, k);
    if (label.current) { label.current.position.y = FLOOR + h * k + 0.32; label.current.fillOpacity = k; }
  });
  return (
    <group position={[X, 0, zOf(i)]}>
      <group ref={g} position-y={FLOOR}>
        <mesh position-y={h / 2} castShadow><boxGeometry args={[0.46, h, 0.46]} /><meshStandardMaterial color={COLS[i]} emissive={COLS[i]} emissiveIntensity={0.85} roughness={0.25} metalness={0.2} /></mesh>
        <mesh position-y={h / 2} material={GLASS}><boxGeometry args={[0.66, h + 0.04, 0.66]} /></mesh>
        <mesh position-y={h + 0.035}><boxGeometry args={[0.7, 0.05, 0.7]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      </group>
      <Text ref={label} font={FONT} fontSize={0.26} color="#ffffff" anchorX="center" anchorY="bottom" rotation-y={Math.PI / 2} outlineWidth={0.008} outlineColor="#000">{`${d.co2}`}</Text>
      <Text font={MONO} fontSize={0.19} color="#cfe6f5" position={[0.42, FLOOR + 0.16, 0]} rotation-y={Math.PI / 2} anchorX="center" anchorY="bottom" outlineWidth={0.006} outlineColor="#000">{d.y}</Text>
    </group>
  );
}

// Curva della temperatura disegnata progressivamente (drawRange) con punti luminosi.
function TempCurve({ grow }) {
  const tube = useRef(); const dots = useRef();
  const geo = useMemo(() => {
    const pts = DATA.map((d, i) => new THREE.Vector3(X - 0.55, tempY(d.t), zOf(i)));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.045, 8, false);
  }, []);
  useFrame(() => {
    const k = THREE.MathUtils.clamp((grow.current - 1.2) / 3, 0, 1);
    geo.setDrawRange(0, Math.floor(geo.index.count * k / 6) * 6);
    dots.current?.children.forEach((m, i) => { m.visible = k >= i / (DATA.length - 1) - 0.01; });
  });
  return (
    <group>
      <mesh ref={tube} geometry={geo} material={LINE} />
      <group ref={dots}>
        {DATA.map((d, i) => <mesh key={i} position={[X - 0.55, tempY(d.t), zOf(i)]} material={DOT}><sphereGeometry args={[0.09, 14, 10]} /></mesh>)}
      </group>
    </group>
  );
}

// Pannello olografico di sfondo con griglia, cornice luminosa e titoli.
function Panel() {
  const grid = useMemo(() => {
    const v = [];
    for (let y = 0; y <= 5.6; y += 0.8) v.push(0, y, -5, 0, y, 5);
    for (let z = -5; z <= 5; z += 1.2) v.push(0, 0, z, 0, 5.6, z);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3)); return g;
  }, []);
  return (
    <group position={[X - 1.0, FLOOR, 0]}>
      <mesh position-y={2.8} rotation-y={Math.PI / 2}><planeGeometry args={[10.4, 5.6]} /><meshBasicMaterial color="#0c1e33" transparent opacity={0.55} depthWrite={false} /></mesh>
      <lineSegments geometry={grid} position-x={0.02}><lineBasicMaterial color="#3a6f95" transparent opacity={0.35} /></lineSegments>
      {[[0, 5.6, 0, 10.4, 0.04], [0, 0, 0, 10.4, 0.04]].map(([x, y, z, w, h], i) => (
        <mesh key={i} position={[x + 0.03, y, z]}><boxGeometry args={[0.02, h, w]} /><meshBasicMaterial color="#66D9EF" toneMapped={false} /></mesh>
      ))}
      <Suspense fallback={null}>
        <Text font={FONT} fontSize={0.42} color="#ffffff" position={[0.05, 5.25, 4.9]} rotation-y={Math.PI / 2} anchorX="left">CO2 IN ATMOSFERA · 1960–2024</Text>
        <Text font={MONO} fontSize={0.2} color="#66D9EF" position={[0.05, 4.92, 4.9]} rotation-y={Math.PI / 2} anchorX="left">BARRE: PARTI PER MILIONE (MAUNA LOA)</Text>
        <Text font={MONO} fontSize={0.2} color="#ff8a80" position={[0.05, 4.68, 4.9]} rotation-y={Math.PI / 2} anchorX="left">LINEA: ANOMALIA DI TEMPERATURA GLOBALE (°C)</Text>
        <Text font={FONT} fontSize={0.34} color="#ff4b45" position={[0.05, tempY(1.29) - FLOOR + 0.35, -4.2]} rotation-y={Math.PI / 2} anchorX="center">+1,3 °C</Text>
      </Suspense>
    </group>
  );
}

// Postazione scientifica: scrivania, monitor luminosi, sedia.
const Console = (props) => (
  <group {...props}>
    <mesh position-y={0.32} material={DARK} castShadow><boxGeometry args={[0.9, 0.04, 0.4]} /></mesh>
    {[-0.4, 0.4].map((x) => <mesh key={x} position={[x, 0.16, 0]} material={STEEL}><boxGeometry args={[0.03, 0.32, 0.36]} /></mesh>)}
    {[-0.22, 0.22].map((x, i) => (
      <group key={x} position={[x, 0.5, -0.08]} rotation={[-0.15, i ? -0.25 : 0.25, 0]}>
        <mesh material={DARK}><boxGeometry args={[0.36, 0.22, 0.02]} /></mesh>
        <mesh position-z={0.012} material={SCREEN}><planeGeometry args={[0.33, 0.19]} /></mesh>
      </group>
    ))}
  </group>
);

// Leggio istituzionale con microfono, bandiere e telecamera della stampa.
const Lectern = (props) => (
  <group {...props}>
    <mesh position-y={0.28} material={DARK} castShadow><boxGeometry args={[0.32, 0.56, 0.24]} /></mesh>
    <mesh position={[0, 0.57, 0.02]} rotation-x={-0.35} material={STEEL}><boxGeometry args={[0.34, 0.02, 0.26]} /></mesh>
    <mesh position={[0, 0.66, 0.1]} rotation-x={0.5} material={STEEL}><cylinderGeometry args={[0.006, 0.006, 0.18, 4]} /></mesh>
    {[[-0.6, "#1f4fa0"], [0.6, "#e8ecef"]].map(([x, c]) => (
      <group key={x} position={[x, 0, -0.2]}>
        <mesh position-y={0.55} material={STEEL}><cylinderGeometry args={[0.012, 0.012, 1.1, 6]} /></mesh>
        <mesh position={[0.15, 0.9, 0]}><boxGeometry args={[0.3, 0.2, 0.01]} /><meshStandardMaterial color={c} roughness={0.8} side={THREE.DoubleSide} /></mesh>
      </group>
    ))}
  </group>
);
const PressCam = (props) => (
  <group {...props}>
    {[0, 2.1, 4.2].map((a) => <mesh key={a} position={[Math.sin(a) * 0.08, 0.22, Math.cos(a) * 0.08]} rotation={[Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3]} material={STEEL}><cylinderGeometry args={[0.008, 0.008, 0.46, 4]} /></mesh>)}
    <mesh position-y={0.5} material={DARK}><boxGeometry args={[0.1, 0.1, 0.2]} /></mesh>
    <mesh position={[0, 0.5, 0.12]} rotation-x={Math.PI / 2} material={DARK}><cylinderGeometry args={[0.04, 0.045, 0.08, 10]} /></mesh>
  </group>
);

const SCIENTISTS = [
  { p: [1.4, -3.4], shirt: "#eef1f4", pants: "#2b3440", hair: "#4a3424", coat: 1 },
  { p: [2.1, -2.7], shirt: "#eef1f4", pants: "#3a3a40", hair: "#9a9590", coat: 1, skin: "#c99a74" },
  { p: [0.9, -4.3], shirt: "#eef1f4", pants: "#2b2622", hair: "#1e1a16", coat: 1, skin: "#8a5a3a" },
];
const POLITICIANS = [
  { p: [1.2, 3.0], shirt: "#1c2230", pants: "#1c2230", hair: "#7a7570", tie: "#b02a2a" },
  { p: [1.9, 3.6], shirt: "#2a2f3a", pants: "#2a2f3a", hair: "#2a2018", tie: "#1f4fa0" },
  { p: [0.7, 3.9], shirt: "#3a2f3a", pants: "#23202a", hair: "#5a3a22", tie: "#d8d4cc", skin: "#d8a882" },
  { p: [2.6, 2.6], shirt: "#1c2230", pants: "#1c2230", hair: "#c8c4bc", tie: "#3a7a4a", skin: "#b8845a" },
];

export default function ScienceStage({ shadows }) {
  const grow = useRef(0); const t0 = useRef(-1);
  useFrame((s) => {
    const w = sceneWeight(store.progress, 5);
    if (w < 0.3) { t0.current = -1; grow.current = 0; return; }
    if (t0.current < 0) t0.current = s.clock.elapsedTime;
    grow.current = s.clock.elapsedTime - t0.current;
  });
  return (
    <group>
      <mesh position-y={FLOOR - 0.06} receiveShadow><cylinderGeometry args={[6.4, 6.6, 0.12, 64]} /><meshStandardMaterial color="#0b1422" roughness={0.22} metalness={0.7} /></mesh>
      <mesh position-y={FLOOR + 0.002} rotation-x={-Math.PI / 2}><ringGeometry args={[6.25, 6.35, 96]} /><meshBasicMaterial color="#2a8fb0" /></mesh>
      <mesh position={[X + 0.5, FLOOR + 0.002, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[1.6, 10]} /><meshBasicMaterial color="#123049" transparent opacity={0.6} /></mesh>
      <Panel />
      <Suspense fallback={null}>
        {DATA.map((d, i) => <Bar key={d.y} d={d} i={i} grow={grow} />)}
      </Suspense>
      <TempCurve grow={grow} />
      <Console position={[1.6, FLOOR, -3.9]} rotation-y={face(1.6, -3.9) + Math.PI} scale={1.35} />
      {SCIENTISTS.map(({ p: [x, z], ...s }, i) => <Person key={`s${i}`} position={[x, FLOOR, z]} rotation-y={face(x, z)} scale={1.35} {...s} />)}
      <Person position={[2.6, FLOOR, -1.2]} shirt="#eef1f4" pants="#2b3440" coat={1} radius={0.35} speed={0.25} scale={1.35} />
      <Lectern position={[3.0, FLOOR, 4.2]} rotation-y={face(3.0, 4.2)} scale={1.35} />
      {POLITICIANS.map(({ p: [x, z], ...s }, i) => <Person key={`p${i}`} position={[x, FLOOR, z]} rotation-y={face(x, z)} scale={1.35} {...s} />)}
      <PressCam position={[3.4, FLOOR, 1.4]} rotation-y={face(3.4, 1.4)} scale={1.35} />
      <Person position={[3.6, FLOOR, 1.0]} shirt="#4a5a6a" pants="#2b2622" hair="#3a2a1e" rotation-y={face(3.6, 1.0)} scale={1.35} />
    </group>
  );
}
