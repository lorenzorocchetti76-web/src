import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { VC, VC_GLASS, placeInstances } from "./Kit";
import { HOUSE_WIN } from "./Models";
import { churchGeo, churchWinGeo, hayGeo, bandedGeo, matGeo, coalGeo, observatoryGeo, dishGeo, solarGeo } from "./Props2";

// Oggetto ripetuto instanziato: N copie = 1 draw call.
export const Inst = ({ geo, mat = VC, items, shadows = true }) => (
  <instancedMesh key={items.length} args={[geo, mat, items.length]} castShadow={shadows} receiveShadow ref={(m) => placeInstances(m, items, true)} />
);

export const Church = (props) => (
  <group {...props}>
    <mesh geometry={churchGeo()} material={VC} castShadow receiveShadow />
    <mesh geometry={churchWinGeo()} material={HOUSE_WIN} />
  </group>
);

export const Haystacks = ({ items, shadows }) => <Inst geo={hayGeo()} items={items} shadows={shadows} />;
export const BandedRocks = ({ items, shadows }) => <Inst geo={bandedGeo()} items={items} shadows={shadows} />;
export const AlgaeMats = ({ items }) => <Inst geo={matGeo()} items={items} shadows={false} />;
export const CoalHeaps = ({ items, shadows }) => <Inst geo={coalGeo()} items={items} shadows={shadows} />;
export const SolarFarm = ({ items, shadows }) => <Inst geo={solarGeo()} mat={VC_GLASS} items={items} shadows={shadows} />;
export const Observatory = (props) => <mesh geometry={observatoryGeo()} material={VC} castShadow receiveShadow {...props} />;
export const Dish = (props) => <mesh geometry={dishGeo()} material={VC} castShadow {...props} />;

// Pallone sonda meteorologico che sale lentamente e ricomincia.
export function WeatherBalloon({ position = [0, 0, 0], height = 6 }) {
  const g = useRef();
  useFrame((s) => {
    if (!g.current) return;
    const t = (s.clock.elapsedTime * 0.06) % 1;
    g.current.position.set(position[0] + Math.sin(t * 9) * 0.3, position[1] + t * height, position[2]);
    g.current.scale.setScalar(0.6 + t * 0.6);
  });
  return (
    <group ref={g}>
      <mesh><sphereGeometry args={[0.18, 16, 12]} /><meshPhysicalMaterial color="#f4f7fa" roughness={0.25} clearcoat={1} /></mesh>
      <mesh position-y={-0.3}><cylinderGeometry args={[0.003, 0.003, 0.4, 3]} /><meshBasicMaterial color="#cfd6dc" /></mesh>
      <mesh position-y={-0.52}><boxGeometry args={[0.06, 0.05, 0.06]} /><meshStandardMaterial color="#ff7138" /></mesh>
    </group>
  );
}
