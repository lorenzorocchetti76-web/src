import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

// Modelli procedurali low-poly condivisi tra esperienza e galleria (nessun download: caricamento istantaneo).
export function Volcano({ glow = 1, ...props }) {
  const lava = useRef();
  useFrame((s) => { if (lava.current) lava.current.emissiveIntensity = glow * (1.6 + Math.sin(s.clock.elapsedTime * 3) * 0.5); });
  return (
    <group {...props}>
      <mesh castShadow receiveShadow position-y={1}>
        <coneGeometry args={[1.3, 2, 7, 1, true]} />
        <meshStandardMaterial color="#24140f" roughness={0.95} flatShading side={2} />
      </mesh>
      <mesh position-y={1.9}>
        <cylinderGeometry args={[0.32, 0.36, 0.2, 7]} />
        <meshStandardMaterial ref={lava} color="#ff7138" emissive="#ff4b1f" emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[0.35, 1.05, 0.62]} rotation={[0.55, 0, -0.35]}>
        <boxGeometry args={[0.18, 1.7, 0.08]} />
        <meshStandardMaterial color="#ff7138" emissive="#ff5a1f" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

export function Stromatolites(props) {
  const cols = [[0, 0, 0.35, 0.7], [0.7, 0.3, 0.28, 0.5], [-0.6, 0.4, 0.3, 0.55], [0.2, -0.7, 0.25, 0.4], [-0.3, -0.4, 0.22, 0.35]];
  return (
    <group {...props}>
      {cols.map(([x, z, r, h], i) => (
        <group key={i} position={[x, 0, z]}>
          {[0, 1, 2].map((k) => (
            <mesh key={k} castShadow position-y={h * (k + 0.5) / 3}>
              <cylinderGeometry args={[r * (1 - k * 0.12), r * (1.05 - k * 0.12), h / 3 - 0.02, 9]} />
              <meshStandardMaterial color={k % 2 ? "#3c6e64" : "#6aa596"} roughness={0.8} flatShading />
            </mesh>
          ))}
          <mesh position-y={h + 0.02}>
            <sphereGeometry args={[r * 0.75, 9, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#66d9ef" emissive="#2fb6c9" emissiveIntensity={0.6} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Glacier(props) {
  return (
    <group {...props}>
      <mesh castShadow receiveShadow position-y={0.9}>
        <coneGeometry args={[1.4, 1.9, 5]} />
        <meshStandardMaterial color="#5f6f7c" roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow position-y={1.25} scale={[1.05, 0.62, 1.05]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#f4f7fa" roughness={0.25} metalness={0.05} flatShading />
      </mesh>
      <mesh position={[0.6, 0.35, 0.7]} rotation-y={0.6} scale={[0.5, 0.35, 0.9]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#bfe3f2" transparent opacity={0.85} roughness={0.1} flatShading />
      </mesh>
    </group>
  );
}

export function Pine({ snow = 1, ...props }) {
  return (
    <group {...props}>
      <mesh position-y={0.15}><cylinderGeometry args={[0.05, 0.06, 0.3, 5]} /><meshStandardMaterial color="#3b2a1d" /></mesh>
      <mesh castShadow position-y={0.55}><coneGeometry args={[0.28, 0.75, 6]} /><meshStandardMaterial color={snow ? "#5c7f6d" : "#2f5a3a"} flatShading /></mesh>
      {snow ? <mesh position-y={0.82}><coneGeometry args={[0.13, 0.25, 6]} /><meshStandardMaterial color="#f4f7fa" flatShading /></mesh> : null}
    </group>
  );
}

export function House({ roof = "#e9eef2", wall = "#8a6b52", ...props }) {
  return (
    <group {...props}>
      <mesh castShadow receiveShadow position-y={0.25}><boxGeometry args={[0.6, 0.5, 0.45]} /><meshStandardMaterial color={wall} roughness={0.9} /></mesh>
      <mesh castShadow position-y={0.66} rotation-y={Math.PI / 4}><coneGeometry args={[0.48, 0.4, 4]} /><meshStandardMaterial color={roof} flatShading /></mesh>
      <mesh position={[0.18, 0.75, 0]}><boxGeometry args={[0.09, 0.3, 0.09]} /><meshStandardMaterial color="#4a3a30" /></mesh>
      <mesh position={[0, 0.25, 0.23]}><planeGeometry args={[0.12, 0.12]} /><meshStandardMaterial color="#ffcf7a" emissive="#ffb347" emissiveIntensity={1.2} /></mesh>
    </group>
  );
}

export function Factory(props) {
  return (
    <group {...props}>
      <mesh castShadow receiveShadow position-y={0.45}><boxGeometry args={[1.6, 0.9, 0.9]} /><meshStandardMaterial color="#6b3324" roughness={0.9} /></mesh>
      {[-0.5, 0, 0.5].map((x) => (
        <mesh key={x} castShadow position={[x, 1.0, 0]} rotation-z={Math.PI / 4}><boxGeometry args={[0.38, 0.38, 0.88]} /><meshStandardMaterial color="#3e2a24" flatShading /></mesh>
      ))}
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} castShadow position={[x, 1.4, -0.25]}><cylinderGeometry args={[0.1, 0.14, 1.9, 8]} /><meshStandardMaterial color="#4a2a20" /></mesh>
      ))}
      {[-0.6, -0.2, 0.2, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.45, 0.452]}><planeGeometry args={[0.18, 0.3]} /><meshStandardMaterial color="#ffb070" emissive="#ff7138" emissiveIntensity={0.9} /></mesh>
      ))}
    </group>
  );
}

export function Molecule({ spin = true, ...props }) {
  const g = useRef();
  useFrame((_, dt) => { if (spin && g.current) g.current.rotation.y += dt * 0.5; });
  return (
    <group ref={g} {...props}>
      <mesh><sphereGeometry args={[0.42, 32, 24]} /><meshStandardMaterial color="#2a2f36" roughness={0.35} metalness={0.2} /></mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position-x={s * 1.05}><sphereGeometry args={[0.36, 32, 24]} /><meshStandardMaterial color="#ff4b45" roughness={0.3} /></mesh>
          {[-0.07, 0.07].map((o) => (
            <mesh key={o} position={[s * 0.52, o, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.045, 0.045, 0.7, 10]} /><meshStandardMaterial color="#f4f7fa" /></mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

const TOWERS = [[0, 0, 1.6], [0.55, 0.1, 1.1], [-0.5, 0.2, 2.1], [0.1, 0.65, 0.9], [-0.45, -0.5, 1.3], [0.6, -0.55, 1.8], [-0.05, -0.15, 2.5]];
export function CityBlock(props) {
  return (
    <group {...props}>
      {TOWERS.map(([x, z, h], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow receiveShadow position-y={h / 2}><boxGeometry args={[0.36, h, 0.36]} /><meshStandardMaterial color="#c3d2de" roughness={0.3} metalness={0.25} /></mesh>
          <mesh position={[0, h * 0.55, 0.181]}><planeGeometry args={[0.24, h * 0.8]} /><meshStandardMaterial color="#66d9ef" emissive="#66d9ef" emissiveIntensity={0.35} transparent opacity={0.5} /></mesh>
        </group>
      ))}
    </group>
  );
}
