import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { setProgress, prefersReducedMotion, store } from "./store";

gsap.registerPlugin(ScrollTrigger);

// Fasi 02–07 (indici 1..6) durano il doppio: transizione nel primo/ultimo 22%, pausa al centro con zoom avanti-indietro.
const HOLD = new Set([1, 2, 3, 4, 5, 6]);
const IN = 0.22;
function mapScroll(el, s) {
  const secs = el.children;
  const c = s + window.innerHeight / 2;
  for (let i = 0; i < secs.length; i++) {
    const top = secs[i].offsetTop - secs[0].offsetTop, len = secs[i].offsetHeight;
    if (c < top + len || i === secs.length - 1) {
      const u = Math.max(0, Math.min(1, (c - top) / len));
      if (!HOLD.has(i)) return { p: i - 0.5 + u, beat: 0 };
      if (u < IN) return { p: i - 0.5 + (u / IN) * 0.5, beat: 0 };
      if (u > 1 - IN) return { p: i + ((u - 1 + IN) / IN) * 0.5, beat: 0 };
      return { p: i, beat: Math.sin(Math.PI * (u - IN) / (1 - 2 * IN)) };
    }
  }
  return { p: 0, beat: 0 };
}

// Sincronizza scroll -> progresso temporale (0..7): la scena i è centrata sul proprio pannello pinnato.
export function useScrollStory(storyRef) {
  const lenisRef = useRef(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    let tick;
    if (!reduced) {
      const lenis = new Lenis({ duration: 1.35, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true, wheelMultiplier: 0.8, touchMultiplier: 1.1 });
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
        const { p, beat } = mapScroll(storyRef.current, self.scroll() - self.start);
        store.beat = beat;
        setProgress(Math.max(0, Math.min(7, p)));
      },
      onLeaveBack: () => { store.beat = 0; setProgress(0); },
      onLeave: () => { store.beat = 0; setProgress(7); },
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
    const sec = el.children[i];
    if (!sec) return;
    // centro della sezione = inizio della pausa per le fasi lunghe
    const off = HOLD.has(i) ? sec.offsetHeight * (IN + 0.02) : sec.offsetHeight / 2;
    const y = el.getBoundingClientRect().top + window.scrollY + sec.offsetTop - el.children[0].offsetTop + off - window.innerHeight / 2;
    if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: immediate ? 0 : 2.2, immediate });
    else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
  }, [storyRef]);

  const pause = useCallback((on) => {
    if (lenisRef.current) { on ? lenisRef.current.stop() : lenisRef.current.start(); }
    document.documentElement.style.overflow = on ? "hidden" : "";
  }, []);

  return { jumpTo, pause };
}
