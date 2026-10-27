import { Component } from "react";
import { Link } from "react-router-dom";
import { SCENES } from "@/lib/content";
import { logError } from "@/lib/api";

export class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) { logError(`[${this.props.name || "boundary"}] ${error?.message}`, `${error?.stack}\n${info?.componentStack || ""}`); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

// Sfondo statico per dispositivi senza WebGL: colori e numeri della scena corrente.
export const FallbackBackdrop = ({ scene }) => {
  const s = SCENES[scene] || SCENES[0];
  return (
    <div data-testid="webgl-fallback" className="fixed inset-0 -z-0 transition-colors duration-1000" style={{ background: `radial-gradient(ellipse at 70% 40%, ${s.accent}33 0%, #101D30 35%, #080B10 75%)` }}>
      <span aria-hidden="true" className="font-display absolute right-4 top-1/2 -translate-y-1/2 text-[40vw] font-black leading-none text-white/[0.04] sm:right-10">{s.n}</span>
    </div>
  );
};

export const FallbackNotice = () => (
  <div role="note" data-testid="webgl-fallback-notice" className="glass fixed bottom-4 left-4 right-4 z-40 rounded-sm p-4 text-sm text-[#F4F7FA] sm:left-auto sm:max-w-sm">
    Questo dispositivo non può mostrare la scena 3D: stai vedendo una versione semplificata. Tutti i contenuti sono disponibili anche nel{" "}
    <Link to="/testo" className="text-[#66D9EF] underline underline-offset-4">percorso testuale</Link>.
  </div>
);
