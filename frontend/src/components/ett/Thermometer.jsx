import { useEffect, useRef } from "react";
import { Thermometer as ThermoIcon } from "lucide-react";
import { store } from "@/lib/store";

// Temperatura media superficiale globale stimata per ogni capitolo (valori indicativi, arrotondati).
// 01 oceano di magma; 02 Archeano/Paleoproterozoico (stima incerta); 03 ultimo massimo glaciale;
// 04-05 epoca preindustriale; 06 metà Novecento; 07 oggi (~+1,2 °C); 08 proiezione 2100 con le politiche attuali.
export const TEMPS = [
  { v: 1200, label: "> 1000 °C", note: "oceano di magma" },
  { v: 20, label: "≈ 20 °C", note: "stima molto incerta" },
  { v: 8, label: "≈ 8 °C", note: "ultimo massimo glaciale" },
  { v: 13.6, label: "≈ 13,6 °C", note: "Piccola Era Glaciale" },
  { v: 13.8, label: "≈ 13,8 °C", note: "epoca preindustriale" },
  { v: 14.1, label: "≈ 14,1 °C", note: "metà Novecento" },
  { v: 15.1, label: "≈ 15,1 °C", note: "oggi" },
  { v: 16.6, label: "≈ 16,6 °C", note: "proiezione 2100" },
];

const MIN = 6, MAX = 22;
const fillOf = (v) => Math.min(1, Math.max(0.04, (v - MIN) / (MAX - MIN)));
const colorOf = (f) => `hsl(${Math.round(200 - f * 200)}, 85%, 60%)`;

// Termometro "live": segue lo scroll in continuo, interpolando tra le temperature dei capitoli.
export const LiveThermometer = () => {
  const root = useRef(); const fill = useRef(); const val = useRef(); const note = useRef(); const bar = useRef();
  useEffect(() => {
    let raf;
    let shown = -1;
    const tick = () => {
      const p = store.progress;
      const a = Math.floor(p), b = Math.min(7, a + 1), t = p - a;
      const f = fillOf(TEMPS[a].v) * (1 - t) + fillOf(TEMPS[b].v) * t;
      const col = colorOf(f);
      if (fill.current) { fill.current.style.transform = `scaleY(${f})`; fill.current.style.background = col; }
      if (bar.current) { bar.current.style.transform = `scaleX(${f})`; bar.current.style.background = col; }
      const i = Math.round(p);
      if (i !== shown && val.current) { shown = i; val.current.textContent = TEMPS[i].label; note.current.textContent = TEMPS[i].note; }
      const start = document.getElementById("nascita");
      if (root.current && start) root.current.style.opacity = start.getBoundingClientRect().top < window.innerHeight * 0.5 ? "1" : "0";
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div ref={root} data-testid="live-thermometer" aria-live="polite" style={{ opacity: 0 }}
      className="pointer-events-none fixed left-1/2 top-[4.4rem] z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-[#080B10]/55 px-4 py-2 backdrop-blur-md transition-opacity duration-500 lg:left-auto lg:right-6 lg:top-auto lg:bottom-8 lg:translate-x-0 lg:flex-col lg:rounded-2xl lg:px-3 lg:py-4">
      <div className="relative hidden h-36 w-3 overflow-hidden rounded-full bg-white/10 lg:block">
        <div ref={fill} className="absolute inset-0 origin-bottom rounded-full transition-[transform,background-color] duration-300" />
      </div>
      <ThermoIcon className="h-4 w-4 text-white lg:hidden" aria-hidden="true" />
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10 lg:hidden">
        <div ref={bar} className="h-full w-full origin-left rounded-full transition-[transform,background-color] duration-300" />
      </div>
      <div className="text-left lg:text-center">
        <p ref={val} data-testid="live-thermometer-value" className="whitespace-nowrap font-mono text-sm font-semibold tabular-nums text-white">—</p>
        <p ref={note} data-testid="live-thermometer-note" className="whitespace-nowrap font-mono text-xs uppercase tracking-wider text-white/80 lg:max-w-[6.5rem] lg:whitespace-normal">—</p>
      </div>
    </div>
  );
};
