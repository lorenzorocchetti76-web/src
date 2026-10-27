import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Move, ArrowUpRight } from "lucide-react";
import { MODELS, SCENES } from "@/lib/content";
import { track } from "@/lib/api";
import { audio } from "@/lib/audio";
import { hasWebGL } from "@/lib/store";
import { Header } from "@/components/ett/Header";
import { ErrorBoundary } from "@/components/ett/Fallback";

const ModelViewer = lazy(() => import("@/components/gallery/ModelViewer"));

const ctl = "glass flex h-11 w-11 items-center justify-center rounded-full text-[#F4F7FA] transition-colors hover:text-[#66D9EF]";

const NoViewer = () => (
  <div data-testid="gallery-fallback" className="flex h-full items-center justify-center p-8 text-center text-sm text-[#F4F7FA]/85">
    Il tuo dispositivo non può mostrare i modelli 3D. Le descrizioni restano disponibili nell'elenco.
  </div>
);

const Loading = () => (
  <div data-testid="gallery-loading" className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-[0.3em] text-[#66D9EF]">
    Caricamento modello…
  </div>
);

export default function Gallery() {
  const [active, setActive] = useState(MODELS[0].id);
  const controls = useRef();
  const [webgl] = useState(() => hasWebGL());
  const model = MODELS.find((m) => m.id === active);
  const scene = SCENES.find((s) => s.id === model.scene);

  useEffect(() => { track("model_view", { meta: { model: active }, scene: model.scene }); }, [active, model.scene]);

  const select = (id) => { setActive(id); audio.blip(620, 0.14); };
  const c = () => controls.current;
  const rotate = (a) => { const o = c(); if (!o) return; o.setAzimuthalAngle(o.getAzimuthalAngle() + a); o.update(); audio.blip(420, 0.06); };
  const zoom = (f) => { const o = c(); if (!o) return; o.object.position.sub(o.target).multiplyScalar(f).add(o.target); o.update(); };
  const pan = () => { const o = c(); if (!o) return; o.target.x = o.target.x > 0.5 ? 0 : o.target.x + 0.6; o.update(); };
  const reset = () => { const o = c(); if (!o) return; o.reset(); };
  const onKey = (e) => {
    const m = { ArrowLeft: () => rotate(-0.3), ArrowRight: () => rotate(0.3), "+": () => zoom(0.85), "=": () => zoom(0.85), "-": () => zoom(1.15) };
    if (m[e.key]) { e.preventDefault(); m[e.key](); }
  };

  return (
    <div data-testid="gallery-page" className="min-h-screen overflow-x-hidden bg-[#080B10] text-[#F4F7FA]">
      <Header scene={0} showScene={false} />
      <main className="grid gap-6 px-4 pb-10 pt-24 sm:px-8 lg:grid-cols-[340px_1fr] lg:gap-10 lg:px-16 lg:pt-28">
        <section aria-labelledby="g-title" className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#66D9EF]">Galleria 3D</p>
          <h1 id="g-title" className="font-display mt-3 text-4xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl">Modelli<br />del viaggio</h1>
          <ul role="listbox" aria-label="Modelli" className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {MODELS.map((m) => {
              const s = SCENES.find((x) => x.id === m.scene);
              const on = m.id === active;
              return (
                <li key={m.id} className="shrink-0">
                  <button role="option" aria-selected={on} data-testid={`model-select-${m.id}`} onClick={() => select(m.id)}
                    className={`w-full whitespace-nowrap rounded-sm border px-4 py-3 text-left transition-colors duration-300 lg:whitespace-normal ${on ? "border-[#66D9EF]/60 bg-[#101D30]" : "border-white/10 hover:border-white/30"}`}>
                    <span className="font-mono text-xs" style={{ color: s.accent }}>{s.n}</span>
                    <span className="ml-3 text-sm font-semibold">{m.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
        <section aria-label={`Visualizzatore: ${model.name}`} className="relative min-w-0">
          <div tabIndex={0} onKeyDown={onKey} data-testid="gallery-viewer"
            aria-label="Visualizzatore 3D. Frecce per ruotare, più e meno per lo zoom"
            className="relative h-[58svh] overflow-hidden rounded-sm border border-white/10 lg:h-[calc(100svh-10rem)]">
            {webgl ? (
              <ErrorBoundary name="gallery" fallback={<NoViewer />}>
                <Suspense fallback={<Loading />}><ModelViewer modelId={active} controlsRef={controls} /></Suspense>
              </ErrorBoundary>
            ) : <NoViewer />}
            {webgl && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                <button data-testid="viewer-rotate-left" aria-label="Ruota a sinistra" className={ctl} onClick={() => rotate(-0.4)}><RotateCcw className="h-4 w-4" /></button>
                <button data-testid="viewer-zoom-in" aria-label="Avvicina" className={ctl} onClick={() => zoom(0.8)}><ZoomIn className="h-4 w-4" /></button>
                <button data-testid="viewer-pan" aria-label="Sposta lateralmente" className={ctl} onClick={pan}><Move className="h-4 w-4" /></button>
                <button data-testid="viewer-zoom-out" aria-label="Allontana" className={ctl} onClick={() => zoom(1.25)}><ZoomOut className="h-4 w-4" /></button>
                <button data-testid="viewer-rotate-right" aria-label="Ruota a destra" className={ctl} onClick={() => rotate(0.4)}><RotateCw className="h-4 w-4" /></button>
                <button data-testid="viewer-reset" aria-label="Ripristina vista" className={`${ctl} hidden sm:flex`} onClick={reset}><span className="font-mono text-[10px]">RST</span></button>
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 data-testid="gallery-model-name" className="font-display text-2xl font-black uppercase tracking-tight">{model.name}</h2>
              <p className="mt-1 max-w-lg text-sm text-[#F4F7FA]/80">{model.desc} Modello illustrativo low-poly.</p>
            </div>
            <Link to={`/#${scene.id}`} data-testid="gallery-go-scene" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#66D9EF] hover:underline">
              Scena {scene.n} · {scene.short}<ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-[#F4F7FA]/65">Trascina per ruotare · rotella o pizzico per lo zoom · tasto destro o due dita per spostare</p>
        </section>
      </main>
    </div>
  );
}
