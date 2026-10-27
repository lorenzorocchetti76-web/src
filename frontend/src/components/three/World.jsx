import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping, SMAA } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { store, lowPower, prefersReducedMotion } from "@/lib/store";
import { CAMERA_KEYS, ATMOS, ease, clamp01, lerp } from "./worldMath";
import Globe from "./Globe";
import Diorama from "./Diorama";
import EraProps from "./EraProps";
import Particles from "./Particles";
import { Meteors, Ufo } from "./Details2";
import { smooth } from "./worldMath";

const D2R = Math.PI / 180;

function CameraRig() {
  const { camera, size } = useThree();
  const cur = useRef(null);
  const reduced = prefersReducedMotion();
  useFrame((state, dt) => {
    const p = store.progress;
    const a = Math.floor(p);
    const b = Math.min(7, a + 1);
    const t = ease(clamp01((p - a - 0.06) / 0.88));
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
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * (reduced ? 12 : 2.6));
    Object.keys(want).forEach((key) => { cur.current[key] += (want[key] - cur.current[key]) * k; });
    const c = cur.current;
    // Proiezione ortografica isometrica: la "distanza" diventa zoom, la camera resta lontana e fissa in raggio.
    const R = 120;
    const r = R * Math.cos(c.el * D2R);
    camera.position.set(c.tx + r * Math.sin(c.az * D2R), c.ty + R * Math.sin(c.el * D2R), c.tz + r * Math.cos(c.az * D2R));
    camera.lookAt(c.tx, c.ty, c.tz);
    const zoom = size.height / (0.536 * c.d);
    if (Math.abs(camera.zoom - zoom) > 0.01) { camera.zoom = zoom; camera.updateProjectionMatrix(); }
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
    dir.current.intensity = lerp(A.li, B.li, t) * 1.15;
    amb.current.intensity = lerp(A.amb, B.amb, t) * 0.6;
  });
  return (
    <>
      <hemisphereLight ref={amb} args={["#cfe9ff", "#1a1410", 0.5]} />
      <directionalLight ref={dir} position={[8, 14, 6]} castShadow={shadows}
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-11} shadow-camera-right={11}
        shadow-camera-top={11} shadow-camera-bottom={-11} shadow-bias={-0.0004} shadow-normalBias={0.02} />
      <directionalLight position={[-10, 6, -8]} intensity={0.35} color="#66d9ef" />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={1.6} position={[0, 6, -8]} scale={[14, 6, 1]} color="#dfefff" />
        <Lightformer intensity={0.8} position={[-8, 2, 4]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} color="#ffb07a" />
        <Lightformer intensity={0.6} position={[8, 3, 2]} rotation-y={-Math.PI / 2} scale={[10, 4, 1]} color="#66d9ef" />
      </Environment>
    </>
  );
}

function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <SMAA />
      <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.62} luminanceSmoothing={0.2} radius={0.7} />
      <Vignette eskil={false} offset={0.22} darkness={0.7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

function Stars({ q }) {
  return (
    <>
      <Particles count={Math.round(1400 * q)} area={[160, 90, 160]} origin={[0, -30, 0]} speed={0.02} color="#dbe7f5" size={0.06} opacity={0.65} swirl={0} />
      <Particles count={Math.round(160 * q)} area={[120, 70, 120]} origin={[0, -25, 0]} speed={0.01} color="#ffffff" size={0.14} opacity={0.9} swirl={0} />
      <Particles count={Math.round(80 * q)} area={[120, 70, 120]} origin={[0, -25, 0]} speed={0.01} color="#9fd8ff" size={0.11} opacity={0.8} swirl={0} />
    </>
  );
}

// Capitolo 1: meteoriti e ufo attorno al pianeta primordiale.
function SpaceExtras() {
  const g = useRef();
  useFrame(() => {
    const w = 1 - smooth(0.5, 1.1, store.progress);
    g.current.visible = w > 0.01;
    g.current.scale.setScalar(Math.max(0.001, w));
  });
  return <group ref={g}><Meteors count={10} /><Ufo /></group>;
}

export default function World({ onReady }) {
  const low = lowPower();
  const q = low ? 0.45 : 1;
  const shadows = !low;
  return (
    <Canvas
      data-testid="world-canvas"
      orthographic
      shadows={shadows ? "soft" : false}
      dpr={low ? [1, 1.25] : [1, 1.75]}
      gl={{ antialias: low, powerPreference: "high-performance", alpha: false, stencil: false }}
      camera={{ zoom: 40, near: 0.1, far: 400, position: [0, 40, 110] }}
      onCreated={({ gl }) => { gl.toneMapping = low ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping; onReady?.(); }}
    >
      <Atmosphere shadows={shadows} />
      <CameraRig />
      <Stars q={q} />
      <SpaceExtras />
      <Globe segments={low ? 64 : 160} low={low} />
      <Diorama n={low ? 14 : 18} shadows={shadows}>
        <EraProps q={q} shadows={shadows} />
      </Diorama>
      {!low && <Effects />}
    </Canvas>
  );
}
