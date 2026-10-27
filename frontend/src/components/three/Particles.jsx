import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Sistema di particelle generico: moto verticale (cenere, bolle, fumo, neve, CO₂) a costo minimo.
export default function Particles({
  count = 200, area = [10, 4, 10], origin = [0, 0, 0], speed = 0.5, color = "#ff7138",
  size = 0.08, opacity = 0.9, additive = true, swirl = 0.2, visibleRef,
}) {
  const ref = useRef();
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
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={opacity}
        depthWrite={false} blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending} />
    </points>
  );
}
