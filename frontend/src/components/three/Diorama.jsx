import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { store } from "@/lib/store";
import { CELL, PROFILES, WATER, dioramaWeight, field, riverMask, ease, clamp01 } from "./worldMath";

const tmpM = new THREE.Matrix4();
const tmpC = new THREE.Color();
const tmpC2 = new THREE.Color();

export default function Diorama({ n = 18, shadows = false, children }) {
  const group = useRef();
  const inst = useRef();
  const water = useRef();
  const last = useRef(-1);

  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x = (i - (n - 1) / 2) * CELL;
      const z = (j - (n - 1) / 2) * CELL;
      arr.push({ x, z, f: field(x, z), r: riverMask(x, z) });
    }
    return arr;
  }, [n]);

  const geo = useMemo(() => { const g = new RoundedBoxGeometry(CELL * 0.96, 1, CELL * 0.96, 2, 0.05); g.translate(0, 0.5, 0); return g; }, []);

  useFrame(() => {
    const p = store.progress;
    const dw = dioramaWeight(p);
    group.current.visible = dw > 0.01;
    if (!group.current.visible) return;
    group.current.position.y = (1 - dw) * -9;
    group.current.scale.setScalar(0.55 + 0.45 * dw);
    if (Math.abs(p - last.current) < 0.0008) return;
    last.current = p;
    const a = Math.floor(p);
    const b = Math.min(7, a + 1);
    const t = ease(clamp01((p - a - 0.1) / 0.8));
    const A = PROFILES[a], B = PROFILES[b];
    const base = A.base + (B.base - A.base) * t;
    const amp = A.amp + (B.amp - A.amp) * t;
    const rd = A.rd + (B.rd - A.rd) * t;
    cells.forEach((c, k) => {
      const h = Math.max(0.05, base + amp * c.f + (c.r ? rd : 0));
      tmpM.makeScale(1, h, 1).setPosition(c.x, 0, c.z);
      inst.current.setMatrixAt(k, tmpM);
      if (c.r) tmpC.copy(A.river).lerp(B.river, t);
      else {
        tmpC.copy(A.low).lerp(A.high, c.f);
        tmpC2.copy(B.low).lerp(B.high, c.f);
        tmpC.lerp(tmpC2, t);
      }
      inst.current.setColorAt(k, tmpC);
    });
    inst.current.instanceMatrix.needsUpdate = true;
    if (inst.current.instanceColor) inst.current.instanceColor.needsUpdate = true;
    const WA = WATER[a], WB = WATER[b];
    const wy = WA.y + (WB.y - WA.y) * t;
    const wa = WA.a + (WB.a - WA.a) * t;
    water.current.visible = wa > 0.02;
    water.current.position.y = Math.max(wy, 0.05);
    water.current.material.opacity = wa;
    water.current.material.color.copy(WA.col).lerp(WB.col, t);
  });

  const size = n * CELL;
  return (
    <group ref={group}>
      <instancedMesh ref={inst} args={[geo, null, cells.length]} castShadow={shadows} receiveShadow={shadows}>
        <meshStandardMaterial roughness={0.72} metalness={0.04} envMapIntensity={0.6} />
      </instancedMesh>
      <mesh ref={water} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial transparent opacity={0} roughness={0.55} metalness={0} envMapIntensity={0.12} color="#0e4f63" depthWrite={false} />
      </mesh>
      <mesh position-y={-0.6}>
        <boxGeometry args={[size + 0.4, 1.2, size + 0.4]} />
        <meshStandardMaterial color="#05070b" roughness={1} />
      </mesh>
      {children}
    </group>
  );
}
