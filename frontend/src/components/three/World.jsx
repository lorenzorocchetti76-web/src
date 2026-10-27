import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping, DepthOfField } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { store, lowPower, prefersReducedMotion } from "@/lib/store";
import { CAMERA_KEYS, ATMOS, ease, clamp01, lerp, dioramaWeight } from "./worldMath";
import Globe from "./Globe";
import Diorama from "./Diorama";
import EraProps from "./EraProps";
import Particles from "./Particles";
import { Meteors, Ufo, NightSky } from "./Details2";
import { WINDOW_MATS } from "./Models";
import { TIME } from "./Kit";
import { smooth } from "./worldMath";

const D2R = Math.PI / 180;
// Punto di messa a fuoco della camera (seguito dalla profondità di campo).
const FOCUS = new THREE.Vector3();

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
    const phone = mobileK > 1.3;
    const mk = phone ? lerp(A.m ?? 1, B.m ?? 1, t) : 1;
    const want = {
      az: lerp(A.az, B.az, t) + idle + store.dragAz,
      el: Math.min(85, Math.max(4, lerp(A.el, B.el, t) + store.dragEl)),
      d: lerp(A.d, B.d, t) * mobileK * mk * (1 - store.zoom) * (1 - (reduced ? 0 : 0.32) * store.beat),
      tx: lerp(A.t[0], B.t[0], t), ty: lerp(A.t[1], B.t[1], t) - (phone ? lerp(A.my ?? 0, B.my ?? 0, t) : 0), tz: lerp(A.t[2], B.t[2], t) * (phone ? 0.15 : 1),
    };
    if (!cur.current) cur.current = { ...want };
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * (reduced ? 12 : 2.6));
    Object.keys(want).forEach((key) => { cur.current[key] += (want[key] - cur.current[key]) * k; });
    const c = cur.current;
    TIME.value = state.clock.elapsedTime;
    FOCUS.set(c.tx, c.ty, c.tz);
    // Camera cinematografica in prospettiva con leggero movimento "a mano".
    const tt = state.clock.elapsedTime;
    const hx = reduced ? 0 : Math.sin(tt * 0.31) * 0.12, hy = reduced ? 0 : Math.sin(tt * 0.23) * 0.08;
    const r = c.d * Math.cos(c.el * D2R);
    camera.position.set(c.tx + r * Math.sin(c.az * D2R) + hx, c.ty + c.d * Math.sin(c.el * D2R) + hy, c.tz + r * Math.cos(c.az * D2R));
    camera.lookAt(c.tx, c.ty, c.tz);
  });
  return null;
}

// Cielo con gradiente orizzonte/zenit e alone solare; trasparente nello spazio (globo).
export const SKY_U = {
  uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) },
  uSunCol: { value: new THREE.Color("#ffd9a0") }, uAlpha: { value: 0 }, uNight: { value: 0 },
};
const SKY_V = `varying vec3 vD; void main(){ vD=normalize(position); vec4 w=modelMatrix*vec4(position,1.0); gl_Position=projectionMatrix*viewMatrix*w; }`;
const SKY_F = `uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uSunDir; uniform vec3 uSunCol; uniform float uAlpha; uniform float uNight; varying vec3 vD;
float hs(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
void main(){ vec3 d=normalize(vD); float h=d.y;
 vec3 col=mix(uHor,uTop,smoothstep(-0.02,0.5,h));
 col=mix(col,uHor,smoothstep(0.0,-0.25,h));
 float s=max(dot(d,normalize(uSunDir)),0.0);
 col+=uSunCol*(pow(s,600.0)*2.0+pow(s,12.0)*0.35);
 float st=step(0.9975,hs(floor(d*420.0)))*smoothstep(0.02,0.25,h);
 col+=vec3(0.9,0.95,1.0)*st*uNight*1.4;
 gl_FragColor=vec4(col,uAlpha); }`;
function Sky() {
  const ref = useRef();
  useFrame(({ camera }) => { ref.current.position.copy(camera.position); ref.current.visible = SKY_U.uAlpha.value > 0.01; });
  return (
    <mesh ref={ref} renderOrder={-1}>
      <sphereGeometry args={[170, 32, 16]} />
      <shaderMaterial vertexShader={SKY_V} fragmentShader={SKY_F} uniforms={SKY_U} side={THREE.BackSide} transparent depthWrite={false} fog={false} />
    </mesh>
  );
}

const tmp = new THREE.Color();
const NIGHT_BG = new THREE.Color("#03060d");
const DAWN = new THREE.Color("#ff9a5a");
const MOON = new THREE.Color("#8fa8ff");
const SKY = new THREE.Color("#cfe9ff");
const NIGHT_SKY = new THREE.Color("#3a4c80");
const DAY_TOP = new THREE.Color("#2f5f99");
const NIGHT_TOP = new THREE.Color("#03070f");
const DAY_HOR = new THREE.Color("#cddbe5");
const NIGHT_HOR = new THREE.Color("#0e1626");
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
    // Ciclo giorno/notte guidato dallo scroll: alba -> mezzogiorno -> tramonto -> notte.
    const night = smooth(5.2, 6.4, p) * (1 - smooth(6.6, 7, p) * 0.4);
    const arc = clamp01((p - 0.6) / 5.4);
    const sunEl = Math.sin(arc * Math.PI);
    const ang = Math.PI * (1 - arc);
    dir.current.position.set(Math.cos(ang) * 16, 2 + sunEl * 14, 6 - sunEl * 2);
    scene.background.copy(A.bg).lerp(B.bg, t).lerp(NIGHT_BG, night * 0.6);
    tmp.copy(A.light).lerp(B.light, t).lerp(DAWN, (1 - sunEl) * 0.55).lerp(MOON, night);
    dir.current.color.copy(tmp);
    dir.current.intensity = lerp(A.li, B.li, t) * 1.15 * (0.55 + 0.45 * sunEl) * (1 - night * 0.72);
    amb.current.intensity = lerp(A.amb, B.amb, t) * 0.6 * (1 - night * 0.45);
    amb.current.color.copy(SKY).lerp(NIGHT_SKY, night);
    const glow = 0.15 + Math.max(night, (1 - sunEl) * 0.35) * 3.2;
    WINDOW_MATS.forEach((m) => { m.emissiveIntensity = glow * m.userData.k; });
    const dw = dioramaWeight(p);
    const day = sunEl * (1 - night);
    SKY_U.uTop.value.copy(NIGHT_TOP).lerp(DAY_TOP, day).lerp(A.bg, 0.3);
    SKY_U.uHor.value.copy(NIGHT_HOR).lerp(DAY_HOR, day).lerp(DAWN, (1 - sunEl) * 0.45 * (1 - night)).lerp(tmp, 0.15);
    SKY_U.uSunDir.value.copy(dir.current.position).normalize();
    SKY_U.uSunCol.value.set("#ffd9a0").multiplyScalar(1 - night);
    SKY_U.uAlpha.value = dw;
    SKY_U.uNight.value = night;
    if (!scene.fog) scene.fog = new THREE.FogExp2("#000000", 0);
    scene.fog.color.copy(SKY_U.uHor.value);
    scene.fog.density = 0.03 * dw;
    scene.background.set("#05070b");
  });
  return (
    <>
      <hemisphereLight ref={amb} args={["#cfe9ff", "#1a1410", 0.5]} />
      <directionalLight ref={dir} position={[8, 14, 6]} castShadow={shadows}
        shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={10}
        shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-0.0005} shadow-normalBias={0.03} />
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
  const dof = useRef();
  // Sfocato leggero solo sui paesaggi; nello spazio resta tutto nitido (stelle comprese).
  useFrame(() => {
    if (!dof.current) return;
    dof.current.target.copy(FOCUS);
    dof.current.bokehScale = 2.2 * dioramaWeight(store.progress);
  });
  return (
    <EffectComposer multisampling={0} enableNormalPass={false} resolutionScale={0.75}>
      <DepthOfField ref={dof} target={[0, 0, 0]} worldFocusRange={7} bokehScale={2.2} height={480} />
      <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.62} luminanceSmoothing={0.2} radius={0.65} resolutionScale={0.5} />
      <Vignette eskil={false} offset={0.22} darkness={0.7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

// Precompila tutti i materiali all'avvio: evita i micro-blocchi quando una scena compare per la prima volta.
function Precompile() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const t = setTimeout(() => {
      const hidden = [];
      scene.traverse((o) => { if (!o.visible) { hidden.push(o); o.visible = true; } });
      const done = () => hidden.forEach((o) => { o.visible = false; });
      if (gl.compileAsync) gl.compileAsync(scene, camera).then(done).catch(done);
      else { gl.compile(scene, camera); done(); }
    }, 400);
    return () => clearTimeout(t);
  }, [gl, scene, camera]);
  return null;
}

function Stars({ q }) {
  return (
    <>
      <Particles still count={Math.round(1400 * q)} area={[160, 90, 160]} origin={[0, -30, 0]} speed={0.02} color="#dbe7f5" size={0.06} opacity={0.65} swirl={0} />
      <Particles still count={Math.round(160 * q)} area={[120, 70, 120]} origin={[0, -25, 0]} speed={0.01} color="#ffffff" size={0.14} opacity={0.9} swirl={0} />
      <Particles still count={Math.round(80 * q)} area={[120, 70, 120]} origin={[0, -25, 0]} speed={0.01} color="#9fd8ff" size={0.11} opacity={0.8} swirl={0} />
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
  const [degraded, setDegraded] = useState(false);
  const q = low ? 0.45 : 1;
  const shadows = !low;
  return (
    <Canvas
      data-testid="world-canvas"
      shadows={shadows}
      dpr={low ? [1, 1.25] : degraded ? 1 : [1, 1.5]}
      gl={{ antialias: low, powerPreference: "high-performance", alpha: false, stencil: false }}
      camera={{ fov: 35, near: 0.1, far: 500, position: [0, 4, 16] }}
      onCreated={({ gl }) => { gl.toneMapping = low ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping; onReady?.(); }}
    >
      <PerformanceMonitor onDecline={() => setDegraded(true)} flipflops={2} />
      <Atmosphere shadows={shadows && !degraded} />
      <Precompile />
      <Sky />
      <CameraRig />
      <Stars q={q} />
      <SpaceExtras />
      <NightSky />
      <Globe segments={low ? 64 : 160} low={low} />
      <Diorama n={low ? 14 : 18} shadows={shadows}>
        <EraProps q={q} shadows={shadows} />
      </Diorama>
      {!low && !degraded && <Effects />}
    </Canvas>
  );
}
