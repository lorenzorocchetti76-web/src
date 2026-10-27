import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { SCENES } from "@/lib/content";
import { store, useSceneIndex, resetView, hasWebGL } from "@/lib/store";
import { useScrollStory } from "@/lib/scroll";
import { audio } from "@/lib/audio";
import { track } from "@/lib/api";
import { Header } from "@/components/ett/Header";
import { Hero, Marquee } from "@/components/ett/Hero";
import { Preloader } from "@/components/ett/Preloader";
import { SceneSection } from "@/components/ett/SceneSection";
import { FinalSection, SourcesFooter } from "@/components/ett/Closing";
import { TimelineSheet } from "@/components/ett/TimelineSheet";
import { StorySheet } from "@/components/ett/StorySheet";
import { ExploreLayer } from "@/components/ett/ExploreLayer";
import { SceneRail } from "@/components/ett/SceneRail";
import { ErrorBoundary, FallbackBackdrop, FallbackNotice } from "@/components/ett/Fallback";

const World = lazy(() => import("@/components/three/World"));

export default function Experience() {
  const storyRef = useRef(null);
  const { hash } = useLocation();
  const scene = useSceneIndex();
  const [webgl] = useState(() => hasWebGL());
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(!webgl);
  const [minTime, setMinTime] = useState(false);
  const [timeline, setTimeline] = useState(false);
  const [story, setStory] = useState(null);
  const [exploring, setExploring] = useState(false);
  const { jumpTo, pause } = useScrollStory(storyRef);
  const can3d = webgl && !failed;
  const loaded = ready && minTime;

  useEffect(() => {
    const a = setTimeout(() => setMinTime(true), 1500);
    const b = setTimeout(() => setReady(true), 8000);
    track("session_start", { mode: webgl ? "3d" : "fallback" });
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [webgl]);

  useEffect(() => {
    audio.setScene(scene);
    const t = setTimeout(() => track("scene_view", { scene: SCENES[scene].id, mode: can3d ? "3d" : "fallback" }), 700);
    return () => clearTimeout(t);
  }, [scene, can3d]);

  useEffect(() => {
    if (!loaded || !hash) return;
    const i = SCENES.findIndex((s) => `#${s.id}` === hash);
    if (i >= 0) { const t = setTimeout(() => jumpTo(i, true), 100); return () => clearTimeout(t); }
    return undefined;
  }, [loaded, hash, jumpTo]);

  const onJump = useCallback((i) => { setTimeline(false); audio.blip(520); track("timeline_jump", { scene: SCENES[i].id }); jumpTo(i); }, [jumpTo]);
  const onStory = useCallback((i) => { audio.blip(740); track("story_open", { scene: SCENES[i].id }); setStory(SCENES[i]); }, []);
  const onExplore = () => { setExploring(true); store.exploring = true; pause(true); track("explore_mode", { scene: SCENES[scene].id }); };
  const onExitExplore = useCallback(() => { setExploring(false); store.exploring = false; resetView(); pause(false); }, [pause]);
  const onReset = () => { resetView(); audio.blip(400); };

  return (
    <div className="grain relative bg-[#080B10] text-[#F4F7FA]" data-testid="experience-page">
      <a href="#nascita" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-[#F4F7FA] focus:px-4 focus:py-2 focus:text-[#080B10]">Salta al contenuto</a>
      <Preloader done={loaded} />
      <div className="fixed inset-0 z-0" aria-hidden="true">
        {can3d ? (
          <ErrorBoundary name="world" fallback={<FallbackBackdrop scene={scene} />}>
            <Suspense fallback={null}>
              <World onReady={() => setReady(true)} onFail={() => setFailed(true)} />
            </Suspense>
          </ErrorBoundary>
        ) : <FallbackBackdrop scene={scene} />}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(8,11,16,0.7)_100%)]" />
      </div>
      <Header scene={scene} can3d={can3d} onTimeline={() => setTimeline(true)} onReset={onReset} onExplore={onExplore} />
      <SceneRail current={scene} onJump={onJump} />
      <main className="relative z-10">
        <Hero ready={loaded} onStart={() => jumpTo(0)} />
        <Marquee />
        <div ref={storyRef} data-testid="story-container">
          {SCENES.slice(0, 7).map((s, i) => <SceneSection key={s.id} scene={s} index={i} onStory={onStory} />)}
          <FinalSection onStory={onStory} />
        </div>
        <SourcesFooter />
      </main>
      {!can3d && <FallbackNotice />}
      {exploring && <ExploreLayer onExit={onExitExplore} />}
      <TimelineSheet open={timeline} onOpenChange={setTimeline} current={scene} onJump={onJump} />
      <StorySheet scene={story} onOpenChange={(o) => !o && setStory(null)} />
    </div>
  );
}
