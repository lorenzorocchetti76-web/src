import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getSprite } from "./Particles";
import { store } from "@/lib/store";
import { smooth } from "./worldMath";
import { VC, rigMaterial, placeInstances } from "./Kit";
import { personGeo, quadGeo, truckGeo, roadGeo } from "./Life";

const seedOf = () => Math.random() * 6.28;

// Persona realistica in 1 draw call: braccia e gambe animate nel vertex shader; cammina in cerchio se radius > 0.
export function Person({ shirt = "#6b4f3a", skin = "#e0b48a", pants, hair, hat, tie, coat, radius = 0, speed = 0.5, ...props }) {
  const root = useRef();
  const seed = useMemo(seedOf, []);
  const mat = useMemo(() => rigMaterial(radius ? { arm: 0.55, leg: 0.5, freq: 7, phase: seed } : { arm: 0.1, leg: 0, freq: 2, phase: seed }), [radius, seed]);
  useFrame((s) => {
    if (!radius || !root.current) return;
    const a = s.clock.elapsedTime * speed + seed;
    root.current.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    root.current.rotation.y = speed > 0 ? -a : Math.PI - a;
  });
  return (
    <group {...props}>
      <mesh ref={root} scale={0.85} geometry={personGeo({ shirt, skin, pants, hair, hat, tie, coat })} material={mat} castShadow />
    </group>
  );
}

// Quadrupedi realistici (cavallo, mucca, cane) che brucano: testa e coda animate in GPU.
function Quad({ kind, ...props }) {
  const mat = useMemo(() => rigMaterial({ arm: 0, leg: 0, freq: 1, phase: seedOf() }), []);
  return <mesh geometry={quadGeo(kind)} material={mat} castShadow {...props} />;
}
export const Horse = (p) => <Quad kind="horse" {...p} />;
export const Cow = (p) => <Quad kind="cow" {...p} />;
export const Dog = (p) => <Quad kind="dog" {...p} />;
export const Mammoth = (p) => <Quad kind="mammoth" {...p} />;
export const Sheep = (p) => <Quad kind="sheep" {...p} />;

export function Lake({ radius = 1.1, ...props }) {
  const fish = useRef();
  useFrame((s) => {
    if (!fish.current) return;
    const t = s.clock.elapsedTime;
    fish.current.children.forEach((f, i) => {
      const a = t * (0.5 + i * 0.07) + i * 1.3;
      const r = radius * (0.3 + (i % 3) * 0.2);
      f.position.set(Math.cos(a) * r, -0.04 + Math.sin(t * 2 + i) * 0.015, Math.sin(a) * r);
      f.rotation.y = -a;
    });
  });
  return (
    <group {...props}>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.08}><circleGeometry args={[radius * 1.08, 40]} /><meshStandardMaterial color="#3a3028" /></mesh>
      <group ref={fish}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} scale={[0.06, 0.035, 0.14]}><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color={i % 2 ? "#ff9f43" : "#ffd27a"} emissive="#ff7138" emissiveIntensity={0.4} /></mesh>
        ))}
      </group>
      <mesh rotation-x={-Math.PI / 2}><circleGeometry args={[radius, 40]} /><meshStandardMaterial color="#2a7f9e" transparent opacity={0.55} roughness={0.15} depthWrite={false} /></mesh>
    </group>
  );
}

export const Truck = ({ cargo = "#141414", color = "#c0392b", ...props }) => (
  <mesh geometry={truckGeo(color, cargo)} material={VC} castShadow {...props} />
);

// Strada/viadotto con veicoli che scorrono in entrambe le direzioni.
export function Highway({ length = 14, y = 1.8, z = 0, lanes = 2, vehicles = 6, pillars = true, cargo = null, ...props }) {
  const g = useRef();
  const offs = useMemo(() => Array.from({ length: vehicles }, (_, i) => i / vehicles), [vehicles]);
  useFrame((s) => {
    if (!g.current) return;
    const t = s.clock.elapsedTime * 0.07;
    g.current.children.forEach((v, i) => {
      const dir = i % lanes === 0 ? 1 : -1;
      const u = ((t * (1 + (i % 3) * 0.15) * dir + offs[i]) % 1 + 1) % 1;
      v.position.set((u - 0.5) * length, y, z + (dir > 0 ? 0.17 : -0.17));
      v.rotation.y = dir > 0 ? 0 : Math.PI;
    });
  });
  const colors = ["#c0392b", "#f4f7fa", "#2e86de", "#f6b93b", "#576574", "#10ac84"];
  return (
    <group {...props}>
      <mesh geometry={roadGeo(length, y, z, pillars)} material={VC} receiveShadow castShadow />
      <group ref={g}>
        {offs.map((_, i) => <Truck key={i} color={colors[i % colors.length]} cargo={cargo} scale={0.9} />)}
      </group>
    </group>
  );
}

// Binari ad anello con traversine instanziate (1 draw call per 96 traversine).
const TIE_GEO = new THREE.BoxGeometry(0.32, 0.03, 0.07);
const TIE_MAT = new THREE.MeshStandardMaterial({ color: "#4a3426", roughness: 0.95 });
export function Rails({ radius = 6.4, y = 0.92 }) {
  const ties = useMemo(() => Array.from({ length: 96 }, (_, i) => {
    const a = (i / 96) * Math.PI * 2;
    return [Math.cos(a) * radius, -0.02, Math.sin(a) * radius, -a];
  }), [radius]);
  return (
    <group position-y={y}>
      {[radius - 0.09, radius + 0.09].map((r) => (
        <mesh key={r} rotation-x={-Math.PI / 2}><ringGeometry args={[r - 0.018, r + 0.018, 128]} /><meshStandardMaterial color="#b9c0c7" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} /></mesh>
      ))}
      <instancedMesh args={[TIE_GEO, TIE_MAT, ties.length]} receiveShadow ref={(m) => placeInstances(m, ties)} />
    </group>
  );
}

export function Fire({ scale = 1, ...props }) {
  const g = useRef(); const light = useRef();
  const seed = useMemo(seedOf, []);
  useFrame((s) => {
    const t = s.clock.elapsedTime * 9 + seed;
    if (g.current) g.current.children.forEach((m, i) => { m.scale.y = 1 + Math.sin(t + i * 2.1) * 0.25; m.rotation.y = t * 0.2 + i; });
    if (light.current) light.current.material.opacity = 0.55 + Math.sin(t * 1.3) * 0.15;
  });
  return (
    <group {...props} scale={scale}>
      <group ref={g}>
        <mesh position-y={0.25}><coneGeometry args={[0.22, 0.55, 7]} /><meshBasicMaterial color="#ff4b1f" transparent opacity={0.85} /></mesh>
        <mesh position-y={0.22}><coneGeometry args={[0.14, 0.42, 7]} /><meshBasicMaterial color="#ff9f43" /></mesh>
        <mesh position-y={0.18}><coneGeometry args={[0.07, 0.26, 6]} /><meshBasicMaterial color="#fff0b3" /></mesh>
      </group>
      <sprite ref={light} position-y={0.35} scale={1.5}><spriteMaterial map={getSprite()} color="#ff7a2a" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>
    </group>
  );
}

// Cielo notturno: luna e stelle cadenti che compaiono quando arriva la notte (capitolo 07 e finale).
export function NightSky() {
  const g = useRef();
  const stars = useRef();
  const data = useMemo(() => Array.from({ length: 6 }, () => ({
    start: new THREE.Vector3(-6 + Math.random() * 14, 8 + Math.random() * 4, -6 + Math.random() * 10),
    dir: new THREE.Vector3(-1, -0.45, 0.25 * (Math.random() - 0.5)).normalize(),
    period: 3 + Math.random() * 5, off: Math.random() * 8,
  })), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  useFrame((s) => {
    const p = store.progress;
    const w = smooth(5.4, 6.2, p);
    g.current.visible = w > 0.01;
    if (!g.current.visible) return;
    g.current.children[0].material.opacity = w;
    g.current.children[1].material.opacity = w * 0.5;
    const t = s.clock.elapsedTime;
    stars.current.children.forEach((m, i) => {
      const d = data[i];
      const u = ((t + d.off) % d.period) / 0.9;
      m.visible = u < 1;
      if (!m.visible) return;
      m.position.copy(d.start).addScaledVector(d.dir, u * 9);
      m.quaternion.setFromUnitVectors(up, d.dir.clone().negate());
      m.material.opacity = Math.sin(u * Math.PI) * w;
    });
  });
  return (
    <group ref={g}>
      <mesh position={[5, 8, 6]}><sphereGeometry args={[0.7, 32, 24]} /><meshBasicMaterial color="#eef3ff" transparent /></mesh>
      <sprite position={[5, 8, 6]} scale={5}><spriteMaterial map={getSprite()} color="#a9c2ff" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>
      <group ref={stars}>
        {data.map((_, i) => (
          <mesh key={i}><cylinderGeometry args={[0.015, 0.0, 1.6, 4]} /><meshBasicMaterial color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        ))}
      </group>
    </group>
  );
}

export function Sun(props) {
  const g = useRef();
  useFrame(() => { const k = 1 - smooth(5.3, 5.85, store.progress); g.current.visible = k > 0.01; g.current.scale.setScalar(Math.max(0.001, k)); });
  return (
    <group ref={g} {...props}>
      <mesh><sphereGeometry args={[0.9, 32, 24]} /><meshBasicMaterial color="#fff1c1" /></mesh>
      <sprite scale={6}><spriteMaterial map={getSprite()} color="#ffcf6a" transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>
      <sprite scale={12}><spriteMaterial map={getSprite()} color="#ff9f43" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>
    </group>
  );
}

const OZ_V = `varying vec3 vN; varying vec3 vW; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;
const OZ_F = `uniform float uTime; varying vec3 vN; varying vec3 vW; void main(){ vec3 V=normalize(cameraPosition-vW); float f=pow(1.0-abs(dot(normalize(vN),V)),2.5); float band=0.5+0.5*sin(vW.y*3.0+uTime*0.6); gl_FragColor=vec4(mix(vec3(0.4,0.85,1.0),vec3(0.7,0.6,1.0),band),f*0.32+0.025); }`;
export function Ozone(props) {
  const u = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((s) => { u.uTime.value = s.clock.elapsedTime; });
  return (
    <mesh {...props}>
      <sphereGeometry args={[9.5, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <shaderMaterial vertexShader={OZ_V} fragmentShader={OZ_F} uniforms={u} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

export function Plane({ radius = 6, y = 7, speed = 0.18, phase = 0 }) {
  const g = useRef();
  useFrame((s) => {
    if (!g.current) return;
    const a = s.clock.elapsedTime * speed + phase;
    g.current.position.set(Math.cos(a) * radius, y + Math.sin(a * 2) * 0.3, Math.sin(a) * radius);
    g.current.rotation.set(0, -a, 0.25);
  });
  return (
    <group ref={g}>
      <group rotation-y={Math.PI}>
        <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[0.07, 0.05, 0.75, 10]} /><meshStandardMaterial color="#f4f7fa" metalness={0.3} roughness={0.3} /></mesh>
        <mesh><boxGeometry args={[0.9, 0.02, 0.18]} /><meshStandardMaterial color="#dfe6ec" /></mesh>
        <mesh position={[0, 0.1, -0.32]}><boxGeometry args={[0.02, 0.18, 0.12]} /><meshStandardMaterial color="#2e86de" /></mesh>
        <mesh position={[0, 0, -1.1]}><boxGeometry args={[0.03, 0.03, 1.4]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} /></mesh>
      </group>
    </group>
  );
}

export function Ufo({ radius = 5.4, y = 1.6, speed = 0.35 }) {
  const g = useRef(); const lights = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (g.current) {
      g.current.position.set(Math.cos(t * speed) * radius, y + Math.sin(t * 1.4) * 0.25, Math.sin(t * speed) * radius);
      g.current.rotation.y = t * 1.5;
      g.current.rotation.z = Math.sin(t * 0.9) * 0.12;
    }
    if (lights.current) lights.current.children.forEach((m, i) => { m.material.color.setHSL(((t * 0.3 + i / 8) % 1), 0.9, 0.6); });
  });
  return (
    <group ref={g} scale={0.55}>
      <mesh scale={[1, 0.22, 1]}><sphereGeometry args={[1, 32, 16]} /><meshStandardMaterial color="#b9c3cc" metalness={0.9} roughness={0.2} /></mesh>
      <mesh position-y={0.18} scale={[0.45, 0.4, 0.45]}><sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshPhysicalMaterial color="#9fe8ff" transparent opacity={0.6} roughness={0} emissive="#66d9ef" emissiveIntensity={0.4} /></mesh>
      <group ref={lights}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[Math.cos((i / 8) * Math.PI * 2) * 0.9, -0.02, Math.sin((i / 8) * Math.PI * 2) * 0.9]}><sphereGeometry args={[0.07, 8, 6]} /><meshBasicMaterial color="#66d9ef" /></mesh>
        ))}
      </group>
      <mesh position-y={-1.2}><coneGeometry args={[0.7, 2.2, 24, 1, true]} /><meshBasicMaterial color="#5fb8cc" transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

// Meteoriti con scia incandescente che attraversano lo spazio.
export function Meteors({ count = 9 }) {
  const g = useRef();
  const data = useMemo(() => Array.from({ length: count }, () => ({
    start: new THREE.Vector3(8 + Math.random() * 8, 6 + Math.random() * 7, -6 + Math.random() * 12),
    dir: new THREE.Vector3(-1, -0.65, (Math.random() - 0.5) * 0.4).normalize(),
    speed: 3 + Math.random() * 3, off: Math.random() * 30, s: 0.06 + Math.random() * 0.1,
  })), [count]);
  const q = useMemo(() => new THREE.Quaternion(), []);
  useFrame((st) => {
    if (!g.current) return;
    const t = st.clock.elapsedTime;
    g.current.children.forEach((m, i) => {
      const d = data[i];
      const u = (t * d.speed + d.off) % 32;
      m.position.copy(d.start).addScaledVector(d.dir, u);
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.dir.clone().negate());
      m.quaternion.copy(q);
      m.visible = u < 26;
    });
  });
  return (
    <group ref={g}>
      {data.map((d, i) => (
        <group key={i} scale={d.s * 6}>
          <mesh><dodecahedronGeometry args={[0.12, 0]} /><meshStandardMaterial color="#3a2a22" emissive="#ff7138" emissiveIntensity={1.4} flatShading /></mesh>
          <mesh position-y={0.55}><coneGeometry args={[0.1, 1.0, 8, 1, true]} /><meshBasicMaterial color="#ffb070" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        </group>
      ))}
    </group>
  );
}
