import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { store } from "@/lib/store";
import { sceneWeight, groundY } from "./worldMath";
import Particles from "./Particles";
import { Volcano, Stromatolites, Glacier, Pine, House, Factory, CityBlock } from "./Models";
import { Cloud, Windmill, Turbine, Train, Iceberg, Birds, Rocks, Aurora, LavaGlow } from "./Details";

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
          <Particles visibleRef={vis} count={c(180)} area={[12, 1.6, 12]} origin={[0, 0.1, 0]} speed={0.45} color="#bff3ff" size={0.07} />
          <Stromatolites position={on(1, -4, -0.8)} scale={0.7} rotation-y={3} />
          <Stromatolites position={on(1, 4, 3.6)} scale={0.8} rotation-y={0.4} />
          <Rocks count={c(24)} color="#4a4038" groundY={(x, z) => groundY(1, x, z)} />
          <Cloud position={[0, 5.5, -2]} scale={1.3} speed={0.2} />
          <Cloud position={[0, 4.8, 3]} scale={1} speed={0.15} />
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
        </>)}
      </Era>
      <Era index={3}>
        {(vis) => (<>
          {[[-3, -2.6], [-1.8, -3.1], [-0.6, -2.4], [1.4, 2.8], [2.6, 2.3], [0.2, 3.3]].map(([x, z], i) => (
            <House key={i} position={on(3, x, z)} rotation-y={i * 0.7} />
          ))}
          {[[-4, 0.5], [-3.4, 1.6], [3.6, -1.2], [4.2, -2.6], [2.8, -3.6], [-4.4, 3.4], [1, -4.2], [-2, 4.2]].map(([x, z], i) => (
            <Pine key={i} position={on(3, x, z)} scale={1.2} />
          ))}
          <Particles visibleRef={vis} count={c(80)} area={[2, 2.5, 2]} origin={[-1.8, 1, -2.7]} speed={0.35} color="#c8ccd2" size={0.12} additive={false} opacity={0.5} />
          <Particles visibleRef={vis} count={c(220)} area={[14, 7, 14]} origin={[0, 0, 0]} speed={-0.5} color="#ffffff" size={0.05} additive={false} swirl={0.4} />
          <Windmill position={on(3, 3.8, 0.6)} scale={1.3} rotation-y={-0.6} />
          {[[-4.6, -0.6], [4.5, 4.3], [-0.6, 4.6], [3.4, -4.6], [-4.8, -4.4]].map(([x, z], i) => (
            <Pine key={`p2${i}`} position={on(3, x, z)} scale={0.9 + (i % 2) * 0.3} />
          ))}
          <Birds radius={4.5} y={5} count={5} />
          <Cloud position={[0, 6, -3]} scale={1.2} speed={0.18} />
        </>)}
      </Era>
      <Era index={4}>
        {(vis) => (<>
          <Factory position={on(4, 1.5, -1.2)} scale={1.3} />
          <Factory position={on(4, -1.6, 1.6)} scale={1.1} rotation-y={Math.PI / 2} />
          <Factory position={on(4, 3.2, 2.2)} scale={0.9} rotation-y={-0.4} />
          {[[-3.5, -2.5], [-2.4, -3.4], [0, 3.6], [-3.6, 3.2]].map(([x, z], i) => (
            <House key={i} position={on(4, x, z)} roof="#5a4038" wall="#7a6656" />
          ))}
          <Particles visibleRef={vis} count={c(260)} area={[7, 8, 5]} origin={[0.8, 2.5, 0]} speed={0.7} color="#8c8f94" size={0.22} additive={false} opacity={0.45} swirl={0.5} />
          <Particles visibleRef={vis} count={c(140)} area={[16, 4, 16]} origin={[0, 7, 0]} speed={0.12} color="#66d9ef" size={0.06} />
          <Train path={5.2} y={0.75} />
          <Particles visibleRef={vis} count={c(120)} area={[5, 6, 4]} origin={[-1.6, 2.5, 1.6]} speed={0.6} color="#6f7277" size={0.25} additive={false} opacity={0.4} swirl={0.4} />
        </>)}
      </Era>
      <Era index={5}>
        <group rotation-y={Math.PI / 2}>
        <group position={[-4.2, 0.2, 0.6]}>
          {CO2.map((v, i) => (
            <mesh key={i} position={[i * 1.2, (v - 280) / 56, 0]} castShadow={shadows}>
              <boxGeometry args={[0.7, (v - 280) / 28, 0.7]} />
              <meshStandardMaterial color={i > 5 ? "#ff4b45" : "#66d9ef"} emissive={i > 5 ? "#ff4b45" : "#66d9ef"} emissiveIntensity={0.45} roughness={0.3} />
            </mesh>
          ))}
        </group>
        {[[-3, -3], [-1, -3.4], [1, -3.4], [3, -3]].map(([x, z], i) => (
          <group key={i} position={[x, 0.2, z]}>
            <mesh position-y={0.6 + i * 0.35}><cylinderGeometry args={[0.06, 0.06, 1.2 + i * 0.7, 8]} /><meshStandardMaterial color="#f4f7fa" /></mesh>
            <mesh position-y={1.25 + i * 0.7}><sphereGeometry args={[0.2, 16, 12]} /><meshStandardMaterial color="#ff7138" emissive="#ff7138" emissiveIntensity={1.2} /></mesh>
          </group>
        ))}
        </group>
        <Rays />
      </Era>
      <Era index={6}>
        {(vis) => (<>
          <CityBlock position={on(6, 3.2, 0.8)} scale={1.3} />
          <CityBlock position={on(6, 1.4, 3.4)} scale={1} rotation-y={1.3} />
          <Glacier position={on(6, -3, -3)} scale={[0.9, 0.6, 0.9]} />
          {[[-3.8, 2.2], [-3, 3.4], [-4.2, 3.6]].map(([x, z], i) => (
            <Pine key={i} position={on(6, x, z)} snow={0} scale={1.2} />
          ))}
          <Particles visibleRef={vis} count={c(120)} area={[3, 3, 3]} origin={[-3.6, 0.8, 3]} speed={1.1} color="#ff7138" size={0.1} />
          <Particles visibleRef={vis} count={c(160)} area={[16, 3, 16]} origin={[0, 1, 0]} speed={0.25} color="#ff4b45" size={0.05} opacity={0.5} />
          {[[-1.5, -4.2], [0.2, -4.6], [1.9, -4.2]].map(([x, z], i) => (
            <Turbine key={i} position={on(6, x, z)} rotation-y={0.4} />
          ))}
          <CityBlock position={on(6, 4.4, -2.4)} scale={0.8} rotation-y={0.6} />
          <Birds radius={3.6} y={4.5} count={4} speed={0.5} />
          <Cloud position={[0, 6.5, 1]} scale={1} speed={0.22} />
        </>)}
      </Era>
    </group>
  );
}
