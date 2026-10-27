import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { store, lowPower, prefersReducedMotion } from "@/lib/store";
import { CAMERA_KEYS, ATMOS, ease, clamp01, lerp } from "./worldMath";
import Globe from "./Globe";
import Diorama from "./Diorama";
import EraProps from "./EraProps";
import Particles from "./Particles";

const D2R = Math.PI / 180;

function CameraRig() {
  const { camera, size } = useThree();
  const cur = useRef(null);
  const reduced = prefersReducedMotion();
  useFrame((state, dt) => {
    const p = store.progress;
    const a = Math.floor(p);
    const b = Math.min(7, a + 1);
    const t = ease(clamp01((p - a - 0.12) / 0.76));
    const A = CAMERA_KEYS[a], B = CAMERA_KEYS[b];
    const idle = reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.12) * 4;
    const mobileK = size.width / size.height < 0.8 ? 1.55 : size.width / size.height < 1.2 ? 1.25 : 1;
    const want = {
      az: lerp(A.az, B.az, t) + idle + store.dragAz,
      el: Math.min(85, Math.max(4, lerp(A.el, B.el, t) + store.dragEl)),
      d: lerp(A.d, B.d, t) * mobileK * (1 - store.zoom),
      tx: lerp(A.t[0], B.t[0], t), ty: lerp(A.t[1], B.t[1], t), tz: lerp(A.t[2], B.t[2], t),
    };
    if (!cur.current) cur.current = { ...want };
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * (reduced ? 12 : 3.2));
    Object.keys(want).forEach((key) => { cur.current[key] += (want[key] - cur.current[key]) * k; });
    const c = cur.current;
    const r = c.d * Math.cos(c.el * D2R);
    camera.position.set(c.tx + r * Math.sin(c.az * D2R), c.ty + c.d * Math.sin(c.el * D2R), c.tz + r * Math.cos(c.az * D2R));
    camera.lookAt(c.tx, c.ty, c.tz);
  });
  return null;
}

const tmp = new THREE.Color();
function Atmosphere({ shadows }) {
  const { scene } = useThree();
  const dir = useRef();
  const amb = useRef();
  useFrame(() => {
    const p = store.progress;
    const a = Math.floor(p), b = Math.min(7, a + 1);
    const t = clamp01(p - a);
    const A = ATMOS[a], B = ATMOS[b];
    if (!scene.background) scene.background = new THREE.Color();
    scene.background.copy(A.bg).lerp(B.bg, t);
    if (scene.fog) scene.fog.color.copy(scene.background);
    dir.current.color.copy(tmp.copy(A.light).lerp(B.light, t));
    dir.current.intensity = lerp(A.li, B.li, t);
    amb.current.intensity = lerp(A.amb, B.amb, t);
  });
  return (
    <>
      <fog attach="fog" args={["#080B10", 30, 75]} />
      <hemisphereLight ref={amb} args={["#cfe9ff", "#1a1410", 0.5]} />
      <directionalLight ref={dir} position={[8, 14, 6]} castShadow={shadows}
        shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={10}
        shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-0.0005} />
    </>
  );
}

function Stars({ q }) {
  return <Particles count={Math.round(500 * q)} area={[160, 90, 160]} origin={[0, -30, 0]} speed={0.02} color="#dbe7f5" size={0.25} opacity={0.6} swirl={0} />;
}

export default function World({ onReady }) {
  const low = lowPower();
  const q = low ? 0.45 : 1;
  const shadows = !low;
  return (
    <Canvas
      data-testid="world-canvas"
      shadows={shadows}
      dpr={low ? [1, 1.25] : [1, 1.75]}
      gl={{ antialias: !low, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: 30, near: 0.1, far: 300, position: [0, 3, 14] }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; onReady?.(); }}
    >
      <Atmosphere shadows={shadows} />
      <CameraRig />
      <Stars q={q} />
      <Globe segments={low ? 64 : 112} />
      <Diorama n={low ? 14 : 18} shadows={shadows}>
        <EraProps q={q} shadows={shadows} />
      </Diorama>
    </Canvas>
  );
}
