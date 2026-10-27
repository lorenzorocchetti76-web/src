import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE, SOURCES } from "@/lib/content";

export const FinalSection = ({ onStory }) => (
  <section id="finale" data-testid="scene-section-finale" aria-labelledby="title-finale" className="relative h-[170vh]">
    <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-end px-5 pb-20 text-center sm:justify-center sm:pb-0">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
        <h2 id="title-finale" className="font-display text-[1.7rem] leading-[1] text-white sm:text-5xl lg:text-6xl">
          {SITE.finalTitle.map((l, i) => (
            <span key={l} className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block"
                variants={{ hidden: { y: "105%" }, show: { y: "0%", transition: { duration: 1.1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] } } }}>
                {l}
              </motion.span>
            </span>
          ))}
        </h2>
        <motion.p variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.6, duration: 1 } } }}
          className="mx-auto mt-6 max-w-md text-base text-white md:text-lg">{SITE.finalSub}</motion.p>
        <button data-testid="story-open-finale" onClick={() => onStory(7)}
          className="mt-8 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-[#F4F7FA] transition-colors hover:border-[#66D9EF] hover:text-[#66D9EF]">
          Approfondisci
        </button>
      </motion.div>
    </div>
  </section>
);

export const SourcesList = () => (
  <ol className="space-y-3">
    {SOURCES.map((s, i) => (
      <li key={s.url} className="flex gap-4 border-b border-white/10 pb-3">
        <span className="font-mono text-xs text-[#FF7138]">{String(i + 1).padStart(2, "0")}</span>
        <a href={s.url} target="_blank" rel="noopener noreferrer" data-testid={`source-link-${i}`}
          className="group flex flex-1 items-start justify-between gap-4 text-sm leading-relaxed text-[#F4F7FA]/90 hover:text-[#66D9EF]">
          {s.label}<ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </li>
    ))}
  </ol>
);

export const SourcesFooter = () => (
  <div className="relative z-10 bg-gradient-to-b from-transparent via-[#080B10]/90 to-[#080B10] pt-40">
    <footer data-testid="site-footer" className="border-t border-white/10 bg-[#080B10] px-5 py-14 sm:px-10 lg:px-16">
      <p className="font-display text-[13vw] leading-[0.9] text-white sm:text-[8.5vw]">Punto di<br />non ritorno</p>
      <div className="mt-10 flex flex-col gap-4 font-mono text-xs uppercase tracking-widest text-white sm:flex-row sm:items-center sm:justify-between">
        <span>Un progetto di {SITE.credit}</span>
        <Link to="/galleria" data-testid="footer-gallery-link" className="text-[#F4F7FA] hover:text-[#66D9EF]">Galleria 3D</Link>
        <a href={`mailto:${SITE.email}`} data-testid="footer-email-link" className="text-[#F4F7FA] hover:text-[#66D9EF]">Scrivici — {SITE.email}</a>
        <span>© 2026 SRC</span>
      </div>
    </footer>
  </div>
);
