import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

let sprite = null;
export const getSprite = () => {
  if (sprite) return sprite;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.75)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  sprite = new THREE.CanvasTexture(c);
  return sprite;
};

// Sistema di particelle generico: moto verticale (cenere, bolle, fumo, neve, CO₂) a costo minimo.
export default function Particles({
  count = 200, area = [10, 4, 10], origin = [0, 0, 0], speed = 0.5, color = "#ff7138",
  size = 0.08, opacity = 0.9, additive = true, swirl = 0.2, visibleRef,
}) {
  const ref = useRef();
  const camera = useThree((s) => s.camera);
  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = origin[0] + (Math.random() - 0.5) * area[0];
      pos[i * 3 + 1] = origin[1] + Math.random() * area[1];
      pos[i * 3 + 2] = origin[2] + (Math.random() - 0.5) * area[2];
      sd[i] = Math.random() * 6.28;
    }
    return { positions: pos, seeds: sd };
  }, [count, area, origin]);

  useFrame((state, dt) => {
    if (visibleRef && !visibleRef.current) return;
    if (camera.isOrthographicCamera) ref.current.material.size = size * camera.zoom * 0.9;
    const arr = ref.current.geometry.attributes.position.array;
    const t = state.clock.elapsedTime;
    const d = Math.min(dt, 0.05);
    for (let i = 0; i < count; i++) {
      const k = i * 3;
      arr[k + 1] += speed * d * (0.6 + (seeds[i] % 1));
      arr[k] += Math.sin(t + seeds[i]) * swirl * d;
      const top = origin[1] + area[1];
      if (speed > 0 && arr[k + 1] > top) arr[k + 1] = origin[1];
      if (speed < 0 && arr[k + 1] < origin[1]) arr[k + 1] = top;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={opacity} map={getSprite()}
        depthWrite={false} blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending} />
    </points>
  );
}
