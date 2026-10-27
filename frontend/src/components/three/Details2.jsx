import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getSprite } from "./Particles";

const seedOf = () => Math.random() * 6.28;
const Std = (p) => <meshStandardMaterial roughness={0.8} flatShading {...p} />;

// Persona low-poly con braccia, gambe e testa; cammina in cerchio se radius > 0.
export function Person({ shirt = "#6b4f3a", skin = "#e0b48a", hat, radius = 0, speed = 0.5, ...props }) {
  const root = useRef(); const la = useRef(); const ra = useRef(); const ll = useRef(); const rl = useRef();
  const seed = useMemo(seedOf, []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const sw = Math.sin(t * (radius ? 7 : 2) + seed) * (radius ? 0.55 : 0.12);
    if (la.current) { la.current.rotation.x = sw; ra.current.rotation.x = -sw; ll.current.rotation.x = radius ? -sw : 0; rl.current.rotation.x = radius ? sw : 0; }
    if (radius && root.current) {
      const a = t * speed + seed;
      root.current.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
      root.current.rotation.y = -a;
    }
  });
  return (
    <group {...props}>
      <group ref={root} scale={0.85}>
        <mesh castShadow position-y={0.36}><boxGeometry args={[0.15, 0.22, 0.09]} />{Std({ color: shirt })}</mesh>
        <mesh castShadow position-y={0.53}><sphereGeometry args={[0.065, 10, 8]} />{Std({ color: skin })}</mesh>
        {hat && <mesh position-y={0.59}><cylinderGeometry args={[0.07, 0.08, 0.05, 10]} />{Std({ color: hat })}</mesh>}
        <group ref={la} position={[-0.1, 0.45, 0]}><mesh position-y={-0.09}><boxGeometry args={[0.04, 0.18, 0.04]} />{Std({ color: shirt })}</mesh></group>
        <group ref={ra} position={[0.1, 0.45, 0]}><mesh position-y={-0.09}><boxGeometry args={[0.04, 0.18, 0.04]} />{Std({ color: shirt })}</mesh></group>
        <group ref={ll} position={[-0.04, 0.25, 0]}><mesh position-y={-0.11}><boxGeometry args={[0.05, 0.22, 0.05]} />{Std({ color: "#2e2a26" })}</mesh></group>
        <group ref={rl} position={[0.04, 0.25, 0]}><mesh position-y={-0.11}><boxGeometry args={[0.05, 0.22, 0.05]} />{Std({ color: "#2e2a26" })}</mesh></group>
      </group>
    </group>
  );
}

// Quadrupede generico (cavallo, mucca, cane) con testa che bruca.
function Quad({ body, legH, legW, neck, color, spots, tail, ...props }) {
  const head = useRef();
  const seed = useMemo(seedOf, []);
  useFrame((s) => { if (head.current) head.current.rotation.x = 0.35 + Math.sin(s.clock.elapsedTime * 0.8 + seed) * 0.35; });
  const [bx, by, bz] = body;
  return (
    <group {...props}>
      <mesh castShadow position-y={legH + by / 2}><boxGeometry args={[bx, by, bz]} />{Std({ color })}</mesh>
      {spots && <mesh position={[0.05, legH + by / 2 + 0.01, 0]}><boxGeometry args={[bx * 0.4, by * 1.02, bz * 1.02]} />{Std({ color: spots })}</mesh>}
      {[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sz], i) => (
        <mesh key={i} castShadow position={[sx * (bx / 2 - legW), legH / 2, sz * (bz / 2 - legW)]}><boxGeometry args={[legW, legH, legW]} />{Std({ color })}</mesh>
      ))}
      <group ref={head} position={[bx / 2, legH + by * 0.8, 0]}>
        <mesh castShadow position={[neck * 0.4, neck * 0.3, 0]} rotation-z={-0.7}><boxGeometry args={[neck, by * 0.45, bz * 0.6]} />{Std({ color })}</mesh>
        <mesh castShadow position={[neck * 0.85, neck * 0.55, 0]}><boxGeometry args={[neck * 0.55, by * 0.45, bz * 0.55]} />{Std({ color: spots || color })}</mesh>
      </group>
      {tail && <mesh position={[-bx / 2 - 0.02, legH + by * 0.6, 0]} rotation-z={0.5}><boxGeometry args={[0.03, by * 0.9, 0.03]} />{Std({ color: tail })}</mesh>}
    </group>
  );
}
export const Horse = (p) => <Quad body={[0.46, 0.18, 0.15]} legH={0.26} legW={0.045} neck={0.24} color="#6b4226" tail="#2a1a10" {...p} />;
export const Cow = (p) => <Quad body={[0.44, 0.22, 0.2]} legH={0.17} legW={0.05} neck={0.16} color="#f1ece4" spots="#2a2522" tail="#2a2522" {...p} />;
export const Dog = (p) => <Quad body={[0.2, 0.08, 0.07]} legH={0.09} legW={0.025} neck={0.1} color="#a8743f" tail="#a8743f" {...p} />;

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

export function Truck({ cargo = "#141414", color = "#c0392b", ...props }) {
  return (
    <group {...props}>
      <mesh castShadow position={[0.22, 0.17, 0]}><boxGeometry args={[0.18, 0.2, 0.2]} /><meshStandardMaterial color={color} roughness={0.5} /></mesh>
      <mesh position={[0.315, 0.2, 0]}><boxGeometry args={[0.01, 0.08, 0.16]} /><meshStandardMaterial color="#9fe8ff" emissive="#66d9ef" emissiveIntensity={0.3} /></mesh>
      <mesh castShadow position={[-0.08, 0.14, 0]}><boxGeometry args={[0.4, 0.13, 0.2]} /><meshStandardMaterial color="#555b61" roughness={0.6} /></mesh>
      {cargo && <mesh position={[-0.08, 0.23, 0]} scale={[0.18, 0.07, 0.09]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color={cargo} roughness={1} flatShading /></mesh>}
      {[[0.22, 1], [0.22, -1], [-0.18, 1], [-0.18, -1]].map(([x, s], i) => (
        <mesh key={i} position={[x, 0.05, s * 0.1]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.05, 0.05, 0.03, 10]} /><meshStandardMaterial color="#111" /></mesh>
      ))}
    </group>
  );
}

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
      <mesh receiveShadow position={[0, y - 0.03, z]}><boxGeometry args={[length, 0.06, 0.7]} /><meshStandardMaterial color="#2b2f36" roughness={0.9} /></mesh>
      {Array.from({ length: Math.floor(length / 0.6) }).map((_, i) => (
        <mesh key={i} position={[-length / 2 + 0.3 + i * 0.6, y + 0.001, z]}><boxGeometry args={[0.28, 0.005, 0.03]} /><meshStandardMaterial color="#f4f7fa" emissive="#f4f7fa" emissiveIntensity={0.2} /></mesh>
      ))}
      {pillars && Array.from({ length: Math.floor(length / 2.4) + 1 }).map((_, i) => (
        <mesh key={`p${i}`} castShadow position={[-length / 2 + i * 2.4, y / 2, z]}><boxGeometry args={[0.18, y, 0.3]} /><meshStandardMaterial color="#8a939c" /></mesh>
      ))}
      <group ref={g}>
        {offs.map((_, i) => <Truck key={i} color={colors[i % colors.length]} cargo={cargo} scale={0.9} />)}
      </group>
    </group>
  );
}

// Binari ad anello con traversine.
export function Rails({ radius = 6.4, y = 0.92 }) {
  const ties = useMemo(() => Array.from({ length: 96 }, (_, i) => (i / 96) * Math.PI * 2), []);
  return (
    <group position-y={y}>
      {[radius - 0.09, radius + 0.09].map((r) => (
        <mesh key={r} rotation-x={-Math.PI / 2}><ringGeometry args={[r - 0.018, r + 0.018, 128]} /><meshStandardMaterial color="#b9c0c7" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} /></mesh>
      ))}
      {ties.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * radius, -0.02, Math.sin(a) * radius]} rotation-y={-a}><boxGeometry args={[0.07, 0.03, 0.32]} /><meshStandardMaterial color="#4a3426" /></mesh>
      ))}
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

export function Sun(props) {
  return (
    <group {...props}>
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
