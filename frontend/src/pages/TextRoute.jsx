import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SCENES, SITE } from "@/lib/content";
import { track } from "@/lib/api";
import { Header } from "@/components/ett/Header";
import { KindTags, Milestones } from "@/components/ett/StorySheet";
import { SourcesList } from "@/components/ett/Closing";

export default function TextRoute() {
  useEffect(() => {
    track("session_start", { mode: "text" });
    track("text_route_view");
    window.scrollTo(0, 0);
  }, []);
  return (
    <div data-testid="text-route-page" className="min-h-screen bg-[#080B10] text-[#F4F7FA]">
      <Header scene={0} showScene={false} />
      <main className="mx-auto grid max-w-6xl gap-16 px-5 pb-24 pt-28 sm:px-10 md:grid-cols-[220px_1fr]">
        <nav aria-label="Indice delle storie" className="md:sticky md:top-28 md:self-start">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#66D9EF]">Indice</p>
          <ol className="mt-4 space-y-1">
            {SCENES.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} data-testid={`toc-link-${s.id}`} className="flex gap-3 rounded-sm px-2 py-1.5 text-sm text-[#F4F7FA]/85 transition-colors hover:bg-white/5 hover:text-[#F4F7FA]">
                  <span className="font-mono text-xs" style={{ color: s.accent }}>{s.n}</span>{s.short}
                </a>
              </li>
            ))}
            <li><a href="#fonti" data-testid="toc-link-fonti" className="block px-2 py-1.5 text-sm text-[#F4F7FA]/85 hover:text-[#F4F7FA]">Fonti</a></li>
          </ol>
        </nav>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#66D9EF]">Percorso testuale</p>
          <h1 className="font-display mt-3 text-4xl font-black uppercase leading-[0.9] tracking-tight sm:text-5xl lg:text-6xl">{SITE.title}</h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#F4F7FA]/85 md:text-lg">
            Gli stessi contenuti dell'esperienza 3D, in forma di lettura. Ideale per screen reader, connessioni lente o dispositivi che non mostrano la scena.
          </p>
          {SCENES.map((s) => (
            <article key={s.id} id={s.id} data-testid={`text-story-${s.id}`} aria-labelledby={`t-${s.id}`} className="scroll-mt-28 border-t border-white/10 pt-10 mt-14">
              <p className="font-mono text-xs uppercase tracking-[0.25em]"><span style={{ color: s.accent }}>{s.n}</span> — {s.era}</p>
              <h2 id={`t-${s.id}`} className="font-display mt-3 text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-4xl">{s.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-[#F4F7FA]/90 md:text-lg">{s.body}</p>
              <div className="mt-5"><KindTags kinds={s.kinds} /></div>
              {s.milestones && <div className="mt-6"><Milestones items={s.milestones} /></div>}
              <div className="mt-6 space-y-4">
                {s.story.map((p, i) => <p key={i} className="leading-relaxed text-[#F4F7FA]/80">{p}</p>)}
              </div>
              <Link to={`/#${s.id}`} data-testid={`view-3d-${s.id}`} className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#66D9EF] underline-offset-4 hover:underline">
                Vedi nella scena 3D <ArrowUpRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
          <section id="fonti" aria-labelledby="t-fonti" className="mt-16 scroll-mt-28 border-t border-white/10 pt-10">
            <h2 id="t-fonti" className="font-display text-3xl font-black uppercase tracking-tight">Fonti</h2>
            <p className="mb-6 mt-2 font-mono text-xs uppercase tracking-widest text-[#F4F7FA]/70">Consultate il {SITE.consulted}</p>
            <SourcesList />
          </section>
          <p className="mt-16 font-mono text-xs uppercase tracking-widest text-[#F4F7FA]/70">Un progetto di {SITE.credit} · <a className="hover:text-[#66D9EF]" href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
        </div>
      </main>
    </div>
  );
}
