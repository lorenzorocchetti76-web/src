import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VC, VC_GLASS, windMaterial, placeInstances } from "./Kit";
import { houseGeo, houseWinGeo, pineGeo, factoryGeo, factoryWinGeo, cityGeo, cityWinGeo } from "./Buildings";

// Materiali condivisi delle finestre: l'intensità cresce di notte (aggiornata dal ciclo giorno/notte).
const win = (color, emissive, k, extra = {}) => {
  const m = new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: 1.2 * k, ...extra });
  m.userData.k = k;
  return m;
};
export const HOUSE_WIN = win("#ffcf7a", "#ffb347", 1);
export const FACTORY_WIN = win("#ffb070", "#ff7138", 0.8);
export const CITY_WIN = win("#ffe2a8", "#ffcc66", 0.6, { transparent: true, opacity: 0.85 });
export const WINDOW_MATS = [HOUSE_WIN, FACTORY_WIN, CITY_WIN];

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

const WIND = windMaterial();

// Singola conifera (galleria). Nell'esperienza si usa <Forest>, instanziato.
export const Pine = ({ snow = 1, ...props }) => <mesh geometry={pineGeo(snow)} material={WIND} castShadow {...props} />;

// Bosco instanziato: N alberi = 1 draw call, vento calcolato in GPU.
export function Forest({ items, snow = 1, shadows = true }) {
  return (
    <instancedMesh key={items.length} args={[pineGeo(snow), WIND, items.length]} castShadow={shadows}
      ref={(m) => placeInstances(m, items, true)} />
  );
}

export function House({ roof = "#e9eef2", wall = "#8a6b52", ...props }) {
  return (
    <group {...props}>
      <mesh geometry={houseGeo(roof, wall)} material={VC} castShadow receiveShadow />
      <mesh geometry={houseWinGeo()} material={HOUSE_WIN} />
    </group>
  );
}

// Villaggio instanziato: case e finestre in 2 draw call totali.
export function Village({ items, roof, wall, shadows = true }) {
  return (
    <>
      <instancedMesh args={[houseGeo(roof, wall), VC, items.length]} castShadow={shadows} receiveShadow ref={(m) => placeInstances(m, items, true)} />
      <instancedMesh args={[houseWinGeo(), HOUSE_WIN, items.length]} ref={(m) => placeInstances(m, items)} />
    </>
  );
}

export function Factory(props) {
  return (
    <group {...props}>
      <mesh geometry={factoryGeo()} material={VC} castShadow receiveShadow />
      <mesh geometry={factoryWinGeo()} material={FACTORY_WIN} />
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

export function CityBlock(props) {
  return (
    <group {...props}>
      <mesh geometry={cityGeo()} material={VC_GLASS} castShadow receiveShadow />
      <mesh geometry={cityWinGeo()} material={CITY_WIN} />
    </group>
  );
}
