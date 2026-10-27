import { useEffect, useState } from "react";

// Stato mutabile condiviso tra scroll (GSAP) e render loop (R3F), senza re-render React.
export const store = {
  progress: 0,
  scene: 0,
  exploring: false,
  dragAz: 0,
  dragEl: 0,
  zoom: 0,
  beat: 0,
  resetAt: 0,
};

const listeners = new Set();

export function setProgress(p) {
  store.progress = p;
  const s = Math.max(0, Math.min(7, Math.round(p)));
  if (s !== store.scene) {
    store.scene = s;
    listeners.forEach((fn) => fn(s));
  }
}

export function useSceneIndex() {
  const [s, setS] = useState(store.scene);
  useEffect(() => {
    listeners.add(setS);
    return () => { listeners.delete(setS); };
  }, []);
  return s;
}

export function resetView() {
  store.dragAz = 0;
  store.dragEl = 0;
  store.zoom = 0;
  store.resetAt = performance.now();
}

export const isMobile = () =>
  typeof window !== "undefined" && (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);

export const lowPower = () =>
  isMobile() || (navigator.hardwareConcurrency || 8) <= 4;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function hasWebGL() {
  if (new URLSearchParams(window.location.search).has("fallback")) return false;
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    return false;
  }
}
