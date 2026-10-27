import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, X } from "lucide-react";
import { store } from "@/lib/store";

const btn = "glass flex h-11 w-11 items-center justify-center rounded-full text-[#F4F7FA] transition-colors hover:text-[#66D9EF]";

// Modalità esplorazione libera: drag/touch/pinch/rotella/tastiera muovono la camera; la pagina non scorre.
export const ExploreLayer = ({ onExit }) => {
  const ref = useRef();
  const pts = useRef(new Map());
  const pinch = useRef(0);

  useEffect(() => {
    ref.current?.focus();
    const key = (e) => {
      const map = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, 4], ArrowDown: [0, -4] };
      if (map[e.key]) { e.preventDefault(); store.dragAz += map[e.key][0]; store.dragEl += map[e.key][1]; }
      if (e.key === "+" || e.key === "=") store.zoom = Math.min(0.6, store.zoom + 0.08);
      if (e.key === "-") store.zoom = Math.max(-0.6, store.zoom - 0.08);
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("keydown", key); };
  }, [onExit]);

  const down = (e) => { e.currentTarget.setPointerCapture(e.pointerId); pts.current.set(e.pointerId, [e.clientX, e.clientY]); };
  const move = (e) => {
    const prev = pts.current.get(e.pointerId);
    if (!prev) return;
    pts.current.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.current.size === 2) {
      const [a, b] = [...pts.current.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch.current) store.zoom = Math.max(-0.6, Math.min(0.6, store.zoom + (d - pinch.current) * 0.002));
      pinch.current = d;
      return;
    }
    store.dragAz -= (e.clientX - prev[0]) * 0.3;
    store.dragEl = Math.max(-40, Math.min(45, store.dragEl + (e.clientY - prev[1]) * 0.2));
  };
  const up = (e) => { pts.current.delete(e.pointerId); pinch.current = 0; };
  const wheel = (e) => { store.zoom = Math.max(-0.6, Math.min(0.6, store.zoom - e.deltaY * 0.0008)); };

  return (
    <div
      ref={ref}
      tabIndex={-1}
      data-testid="explore-layer"
      role="application"
      aria-label="Esplorazione libera: trascina per ruotare, pizzica o usa la rotella per lo zoom, frecce per ruotare, Esc per uscire"
      className="fixed inset-0 z-30 cursor-grab touch-none select-none active:cursor-grabbing"
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={wheel}
    >
      <div className="pointer-events-none absolute inset-x-0 top-24 text-center font-mono text-xs uppercase tracking-[0.25em] text-[#F4F7FA]/85">
        Esplorazione libera · trascina, pizzica, frecce
      </div>
      <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
        <button data-testid="explore-rotate-left" aria-label="Ruota a sinistra" className={btn} onClick={() => { store.dragAz -= 30; }}><ArrowLeft className="h-4 w-4" /></button>
        <button data-testid="explore-zoom-in" aria-label="Avvicina" className={btn} onClick={() => { store.zoom = Math.min(0.6, store.zoom + 0.15); }}><ZoomIn className="h-4 w-4" /></button>
        <button data-testid="explore-exit-btn" onClick={onExit}
          className="flex h-11 items-center gap-2 rounded-full bg-[#F4F7FA] px-5 text-sm font-semibold text-[#080B10] hover:bg-[#66D9EF]">
          <X className="h-4 w-4" /> Torna alla narrazione
        </button>
        <button data-testid="explore-zoom-out" aria-label="Allontana" className={btn} onClick={() => { store.zoom = Math.max(-0.6, store.zoom - 0.15); }}><ZoomOut className="h-4 w-4" /></button>
        <button data-testid="explore-rotate-right" aria-label="Ruota a destra" className={btn} onClick={() => { store.dragAz += 30; }}><ArrowRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
};
