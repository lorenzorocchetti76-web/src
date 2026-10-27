import { SCENES } from "@/lib/content";

// Linee di avanzamento: tutte bianche.
const RAIL = Array(8).fill("#F4F7FA");

// Indicatore di avanzamento laterale (desktop) e barra inferiore (mobile), entrambi navigabili.
export const SceneRail = ({ current, onJump }) => (
  <>
    <nav aria-label="Scene" className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex">
      {SCENES.map((s, i) => (
        <button key={s.id} data-testid={`rail-jump-${s.id}`} onClick={() => onJump(i)} aria-label={`Vai a ${s.n} ${s.short}`}
          aria-current={i === current ? "step" : undefined} className="group flex items-center gap-3 py-0.5">
          <span className={`font-mono text-[11px] uppercase tracking-widest transition-opacity duration-300 ${i === current ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`}>{s.short}</span>
          <span className="block h-px transition-all duration-500" style={{ width: i === current ? 28 : 12, background: i === current ? RAIL[i] : "rgba(244,247,250,0.4)" }} />
        </button>
      ))}
    </nav>
    <div className="fixed inset-x-0 bottom-0 z-30 flex gap-1 px-4 pb-3 lg:hidden" aria-hidden="true">
      {SCENES.map((s, i) => (
        <span key={s.id} data-testid={`rail-line-${s.id}`} className="h-[3px] flex-1 rounded-full transition-colors duration-500" style={{ background: i <= current ? RAIL[i] : "rgba(244,247,250,0.15)" }} />
      ))}
    </div>
  </>
);
