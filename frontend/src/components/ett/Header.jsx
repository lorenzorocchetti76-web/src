import { Link } from "react-router-dom";
import { Clock3, RotateCcw, Move3d, BookOpen, Boxes } from "lucide-react";
import { Logo } from "./Logo";
import { SoundControl } from "./SoundControl";
import { SCENES } from "@/lib/content";

const iconBtn = "flex h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-xs font-mono uppercase tracking-widest text-[#F4F7FA] transition-colors duration-300 hover:border-[#66D9EF]/60 hover:text-[#66D9EF]";

export const Header = ({ scene, onTimeline, onReset, onExplore, showScene = true, can3d = true }) => {
  const s = SCENES[scene] || SCENES[0];
  return (
    <header data-testid="site-header" className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-5">
      <div className="flex min-w-0 items-center gap-3">
        <Link to="/" aria-label="Punto di non ritorno, home" data-testid="header-logo-link" className="flex items-center gap-3">
          <Logo className="h-8 w-8 shrink-0" />
          <span className="font-display hidden text-base md:inline">Punto di non ritorno</span>
        </Link>
        {showScene && (
          <div data-testid="current-scene-indicator" aria-live="polite"
            className="hidden items-center gap-2 border-l border-white/15 pl-3 font-mono text-xs uppercase tracking-widest text-[#F4F7FA]/80 sm:flex">
            <span style={{ color: s.accent }}>{s.n}</span>
            <span className="text-white/40">/ 08</span>
            <span className="max-w-[10rem] truncate">{s.short}</span>
          </div>
        )}
      </div>
      <nav aria-label="Controlli esperienza" className="glass flex items-center gap-1 rounded-full p-1">
        {onTimeline && (
          <button data-testid="timeline-open-btn" onClick={onTimeline} className={iconBtn} aria-label="Apri timeline">
            <Clock3 className="h-4 w-4" /><span className="hidden lg:inline">Timeline</span>
          </button>
        )}
        {onExplore && can3d && (
          <button data-testid="explore-mode-btn" onClick={onExplore} className={iconBtn} aria-label="Esplora la scena liberamente">
            <Move3d className="h-4 w-4" /><span className="hidden lg:inline">Esplora</span>
          </button>
        )}
        {onReset && can3d && (
          <button data-testid="reset-view-btn" onClick={onReset} className={`${iconBtn} hidden sm:flex`} aria-label="Ripristina la vista">
            <RotateCcw className="h-4 w-4" /><span className="hidden xl:inline">Reset</span>
          </button>
        )}
        <Link to="/testo" data-testid="text-route-link" className={iconBtn} aria-label="Percorso testuale">
          <BookOpen className="h-4 w-4" /><span className="hidden lg:inline">Testo</span>
        </Link>
        <Link to="/galleria" data-testid="gallery-link" className={iconBtn} aria-label="Galleria modelli 3D">
          <Boxes className="h-4 w-4" /><span className="hidden lg:inline">Galleria</span>
        </Link>
        <SoundControl />
      </nav>
    </header>
  );
};
