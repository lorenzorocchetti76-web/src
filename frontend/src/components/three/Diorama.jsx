import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { store } from "@/lib/store";
import { PROFILES, WATER, dioramaWeight, ease, clamp01 } from "./worldMath";
import { useTerrainMaterial, useTerrainGeometry } from "./Terrain";

// Mappa ingrandita: l'intero diorama è scalato per riempire di più l'inquadratura.
const MAP = 1.15;

export default function Diorama({ n = 18, shadows = false, children }) {
  const group = useRef();
  const water = useRef();
  const last = useRef(-1);
  const { mat, uniforms: U } = useTerrainMaterial();
  const geo = useTerrainGeometry(n > 14 ? 220 : 130);
  const waveTime = useMemo(() => ({ value: 0 }), []);
  const onWaterCompile = useMemo(() => (s) => {
    s.uniforms.uTime = waveTime;
    s.vertexShader = `uniform float uTime;\n${s.vertexShader}`
      .replace("#include <beginnormal_vertex>", `
        float ph1 = position.x * 1.3 + uTime * 1.6;
        float ph2 = position.y * 1.7 - uTime * 1.2;
        float ph3 = (position.x + position.y) * 2.4 + uTime * 2.2;
        float wdx = cos(ph1) * 0.078 + cos(ph3) * 0.06;
        float wdy = cos(ph2) * 0.085 + cos(ph3) * 0.06;
        vec3 objectNormal = normalize(vec3(-wdx, -wdy, 1.0));
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3(tangent.xyz);
        #endif`)
      .replace("#include <begin_vertex>", `
        vec3 transformed = vec3(position);
        transformed.z += sin(ph1) * 0.06 + sin(ph2) * 0.05 + sin(ph3) * 0.025;`);
  }, [waveTime]);

  useFrame((state) => {
    const p = store.progress;
    const dw = dioramaWeight(p);
    group.current.visible = dw > 0.01;
    if (!group.current.visible) return;
    waveTime.value = state.clock.elapsedTime;
    group.current.position.y = (1 - dw) * -9;
    group.current.scale.setScalar(MAP * (0.7 + 0.3 * dw));
    if (Math.abs(p - last.current) < 0.0008) return;
    last.current = p;
    const a = Math.floor(p);
    const b = Math.min(7, a + 1);
    const t = ease(clamp01((p - a - 0.1) / 0.8));
    const A = PROFILES[a], B = PROFILES[b];
    U.uBase.value = A.base + (B.base - A.base) * t;
    U.uAmp.value = A.amp + (B.amp - A.amp) * t;
    U.uRd.value = A.rd + (B.rd - A.rd) * t;
    U.uLow.value.copy(A.low).lerp(B.low, t);
    U.uHigh.value.copy(A.high).lerp(B.high, t);
    U.uRiver.value.copy(A.river).lerp(B.river, t);
    U.uLava.value = a === 0 ? 1 - t : 0;
    const WA = WATER[a], WB = WATER[b];
    const wy = WA.y + (WB.y - WA.y) * t;
    const wa = WA.a + (WB.a - WA.a) * t;
    water.current.visible = wa > 0.02;
    water.current.position.y = Math.max(wy, 0.05);
    water.current.material.opacity = wa;
    water.current.material.color.copy(WA.col).lerp(WB.col, t);
  });

  return (
    <group ref={group}>
      <mesh geometry={geo} material={mat} receiveShadow={shadows} />
      <mesh ref={water} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[120, 120, 110, 110]} />
        <meshPhysicalMaterial transparent opacity={0} roughness={0.22} metalness={0} envMapIntensity={0} color="#0e4f63" depthWrite={false} onBeforeCompile={onWaterCompile} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.56}>
        <circleGeometry args={[140, 48]} />
        <meshStandardMaterial color="#0b0d10" roughness={1} />
      </mesh>
      {children}
    </group>
  );
}
