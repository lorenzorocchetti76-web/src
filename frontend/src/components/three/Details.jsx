import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Pioggia leggera: gocce come brevi segmenti inclinati dal vento.
export function Rain({ count = 400, area = [14, 8, 14], speed = 9, wind = 0.12, color = "#a9cfe0", opacity = 0.35, visibleRef }) {
  const ref = useRef();
  const pos = useMemo(() => {
    const p = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * area[0], y = Math.random() * area[1], z = (Math.random() - 0.5) * area[2];
      p.set([x, y, z, x + wind * 0.35, y - 0.35, z], i * 6);
    }
    return p;
  }, [count, area, wind]);
  useFrame((_, dt) => {
    if ((visibleRef && !visibleRef.current) || !ref.current) return;
    const a = ref.current.geometry.attributes.position.array;
    const d = Math.min(dt, 0.05) * speed;
    for (let i = 0; i < count; i++) {
      const k = i * 6;
      a[k + 1] -= d; a[k + 4] -= d; a[k] += d * wind; a[k + 3] += d * wind;
      if (a[k + 4] < 0) {
        const x = (Math.random() - 0.5) * area[0];
        a[k] = x; a[k + 1] = area[1]; a[k + 3] = x + wind * 0.35; a[k + 4] = area[1] - 0.35;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <lineSegments ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
}


// Dettagli ambientali procedurali: nuvole, mulino, treno, pale eoliche, iceberg, uccelli, rocce, aurora.
export function Cloud({ speed = 0.25, range = 7, ...props }) {
  const g = useRef();
  const seed = useMemo(() => Math.random() * 10, []);
  useFrame((s) => { if (g.current) g.current.position.x = ((s.clock.elapsedTime * speed + seed) % (range * 2)) - range; });
  return (
    <group {...props}>
      <group ref={g}>
        {[[0, 0, 0, 0.6], [0.55, 0.1, 0.1, 0.45], [-0.5, -0.05, 0, 0.4], [0.15, 0.25, -0.2, 0.42]].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} castShadow>
            <icosahedronGeometry args={[r, 1]} />
            <meshStandardMaterial color="#f4f7fa" roughness={0.9} flatShading transparent opacity={0.92} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function Windmill(props) {
  const blades = useRef();
  useFrame((_, dt) => { if (blades.current) blades.current.rotation.z += dt * 0.9; });
  return (
    <group {...props}>
      <mesh castShadow position-y={0.55}><cylinderGeometry args={[0.16, 0.24, 1.1, 8]} /><meshStandardMaterial color="#cdb89a" roughness={0.8} /></mesh>
      <mesh castShadow position-y={1.2}><coneGeometry args={[0.22, 0.3, 8]} /><meshStandardMaterial color="#e9eef2" /></mesh>
      <group ref={blades} position={[0, 1.0, 0.22]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation-z={(i * Math.PI) / 2} position={[0, 0, 0]}>
            <boxGeometry args={[0.07, 1.1, 0.02]} />
            <meshStandardMaterial color="#5a4632" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function Turbine(props) {
  const rot = useRef();
  useFrame((_, dt) => { if (rot.current) rot.current.rotation.z += dt * 1.6; });
  return (
    <group {...props}>
      <mesh castShadow position-y={1.1}><cylinderGeometry args={[0.035, 0.06, 2.2, 8]} /><meshStandardMaterial color="#f4f7fa" roughness={0.4} /></mesh>
      <group ref={rot} position={[0, 2.2, 0.08]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation-z={(i * Math.PI * 2) / 3}>
            <boxGeometry args={[0.05, 0.85, 0.015]} />
            <meshStandardMaterial color="#f4f7fa" roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function Train({ path = 4.6, y = 0.6, ...props }) {
  const g = useRef();
  useFrame((s) => {
    if (!g.current) return;
    const t = s.clock.elapsedTime * 0.18;
    g.current.position.set(Math.cos(t) * path, y, Math.sin(t) * path);
    g.current.rotation.y = -t;
  });
  return (
    <group {...props}>
      <mesh rotation-x={-Math.PI / 2} position-y={y - 0.02}><ringGeometry args={[path - 0.08, path + 0.08, 64]} /><meshStandardMaterial color="#2a2522" /></mesh>
      <group ref={g}>
        {[0, -0.55, -1.05].map((z, i) => (
          <mesh key={i} castShadow position={[0, 0.16, z]}>
            <boxGeometry args={[0.32, 0.3, 0.45]} />
            <meshStandardMaterial color={i ? "#3d2d26" : "#1b1b1d"} metalness={0.4} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 0.42, 0.08]}><cylinderGeometry args={[0.05, 0.06, 0.22, 8]} /><meshStandardMaterial color="#111" /></mesh>
      </group>
    </group>
  );
}

export function Iceberg({ drift = 0.4, ...props }) {
  const g = useRef();
  const seed = useMemo(() => Math.random() * 6, []);
  useFrame((s) => { if (g.current) g.current.position.y = Math.sin(s.clock.elapsedTime * drift + seed) * 0.05; });
  return (
    <group {...props}>
      <group ref={g}>
        <mesh castShadow><dodecahedronGeometry args={[0.45, 0]} /><meshPhysicalMaterial color="#e6f6ff" roughness={0.15} transmission={0.2} thickness={0.5} flatShading /></mesh>
      </group>
    </group>
  );
}

export function Birds({ radius = 4, y = 4, count = 6, speed = 0.35 }) {
  const g = useRef();
  useFrame((s) => {
    if (!g.current) return;
    const t = s.clock.elapsedTime;
    g.current.rotation.y = t * speed;
    g.current.children.forEach((b, i) => { b.rotation.z = Math.sin(t * 8 + i) * 0.5; });
  });
  return (
    <group ref={g} position-y={y}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[radius + (i % 3) * 0.4, (i % 2) * 0.3, (i - count / 2) * 0.35]} rotation-y={Math.PI / 2}>
          <coneGeometry args={[0.06, 0.28, 3]} />
          <meshStandardMaterial color="#1a1d22" />
        </mesh>
      ))}
    </group>
  );
}

export function Rocks({ count = 26, spread = 6.5, color = "#6b6058", groundY }) {
  const ref = useRef();
  const m = useMemo(() => {
    const mat = new THREE.Matrix4();
    const arr = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * spread * 2, z = (Math.random() - 0.5) * spread * 2;
      const s = 0.08 + Math.random() * 0.16;
      arr.push(mat.clone().compose(new THREE.Vector3(x, groundY(x, z), z), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random(), Math.random() * 6, 0)), new THREE.Vector3(s, s * 0.7, s)));
    }
    return arr;
  }, [count, spread, groundY]);
  return (
    <instancedMesh ref={(r) => { ref.current = r; if (r) { m.forEach((x, i) => r.setMatrixAt(i, x)); r.instanceMatrix.needsUpdate = true; } }} args={[null, null, count]} castShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} roughness={0.95} flatShading />
    </instancedMesh>
  );
}

const AURORA_V = `varying vec2 vUv; uniform float uTime; void main(){ vUv=uv; vec3 p=position; p.z+=sin(p.x*0.6+uTime*0.6)*0.6; p.y+=sin(p.x*0.3+uTime*0.4)*0.3; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`;
const AURORA_F = `varying vec2 vUv; uniform float uTime; void main(){ float a=smoothstep(0.0,0.4,vUv.y)*smoothstep(1.0,0.5,vUv.y); float band=0.5+0.5*sin(vUv.x*24.0+uTime*1.5); vec3 c=mix(vec3(0.2,1.0,0.6),vec3(0.4,0.85,1.0),vUv.y); gl_FragColor=vec4(c,a*(0.25+0.35*band)); }`;

export function Aurora(props) {
  const u = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((s) => { u.uTime.value = s.clock.elapsedTime; });
  return (
    <mesh {...props}>
      <planeGeometry args={[16, 3, 64, 4]} />
      <shaderMaterial vertexShader={AURORA_V} fragmentShader={AURORA_F} uniforms={u} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

export function LavaGlow({ positions = [] }) {
  const refs = useRef([]);
  useFrame((s) => { refs.current.forEach((l, i) => { if (l) l.intensity = 7 + Math.sin(s.clock.elapsedTime * 2.2 + i * 1.7) * 2.5; }); });
  return positions.map((p, i) => (
    <pointLight key={i} ref={(r) => { refs.current[i] = r; }} position={p} color="#ff6a2a" distance={6} decay={1.6} intensity={7} />
  ));
}
