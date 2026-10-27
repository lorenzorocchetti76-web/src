import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { setProgress, prefersReducedMotion } from "./store";

gsap.registerPlugin(ScrollTrigger);

// Sincronizza scroll -> progresso temporale (0..7) in modo deterministico: la scena i è centrata sul proprio pannello pinnato.
export function useScrollStory(storyRef) {
  const lenisRef = useRef(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    let tick;
    if (!reduced) {
      const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      tick = (t) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    const st = ScrollTrigger.create({
      trigger: storyRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const H = storyRef.current.offsetHeight / 8;
        const vh = window.innerHeight;
        const s = self.scroll() - self.start;
        setProgress(Math.max(0, Math.min(7, (s - (H - vh) / 2) / H)));
      },
      onLeaveBack: () => setProgress(0),
      onLeave: () => setProgress(7),
    });
    return () => {
      st.kill();
      if (tick) gsap.ticker.remove(tick);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      setProgress(0);
    };
  }, [storyRef]);

  const jumpTo = useCallback((i, immediate = false) => {
    const el = storyRef.current;
    if (!el) return;
    const H = el.offsetHeight / 8;
    const y = el.getBoundingClientRect().top + window.scrollY + i * H + (H - window.innerHeight) / 2;
    if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: immediate ? 0 : 2.4, immediate });
    else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
  }, [storyRef]);

  const pause = useCallback((on) => {
    if (lenisRef.current) { on ? lenisRef.current.stop() : lenisRef.current.start(); }
    document.documentElement.style.overflow = on ? "hidden" : "";
  }, []);

  return { jumpTo, pause };
}
