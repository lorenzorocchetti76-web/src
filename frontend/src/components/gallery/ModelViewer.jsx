import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { Volcano, Stromatolites, Glacier, House, Pine, Factory, Molecule, CityBlock } from "@/components/three/Models";
import { audio } from "@/lib/audio";
import { lowPower } from "@/lib/store";

const MAP = {
  vulcano: () => <Volcano scale={1.2} position-y={-1} />,
  stromatolite: () => <Stromatolites scale={1.8} position-y={-1} />,
  ghiacciaio: () => <Glacier scale={1.2} position-y={-1} />,
  casa: () => (<group position-y={-1} scale={2.4}><House /><Pine position={[0.6, 0, 0.3]} /></group>),
  fabbrica: () => <Factory scale={1.3} position-y={-1} />,
  molecola: () => <Molecule scale={1.4} />,
  citta: () => <CityBlock scale={1.1} position-y={-1.2} />,
};

// Visualizzatore isolato: ruota (drag), zoom (rotella/pinch), pan (tasto destro / due dita).
export default function ModelViewer({ modelId, controlsRef }) {
  const last = useRef(0);
  const Model = MAP[modelId] || MAP.vulcano;
  const low = lowPower();
  return (
    <Canvas
      data-testid="gallery-canvas"
      dpr={low ? [1, 1.25] : [1, 2]}
      camera={{ position: [4.5, 3, 5.5], fov: 38 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; }}
    >
      <color attach="background" args={["#0b121d"]} />
      <hemisphereLight args={["#dff3ff", "#1a1410", 0.7]} />
      <directionalLight position={[5, 8, 4]} intensity={2.2} />
      <pointLight position={[-4, 2, -3]} intensity={30} color="#66d9ef" />
      <group key={modelId}><Model /></group>
      <ContactShadows position={[0, -1.01, 0]} opacity={0.6} scale={10} blur={2.4} far={4} frames={low ? 1 : Infinity} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        enablePan
        minDistance={2.5}
        maxDistance={14}
        onStart={() => {
          const t = performance.now();
          if (t - last.current > 400) { audio.blip(330, 0.09, "triangle", 0.1); last.current = t; }
        }}
      />
    </Canvas>
  );
}
