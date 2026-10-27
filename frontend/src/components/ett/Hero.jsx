import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE } from "@/lib/content";

const reveal = {
  hidden: { y: "110%", rotate: 2 },
  show: (i) => ({ y: "0%", rotate: 0, transition: { duration: 1.3, delay: 0.25 + i * 0.12, ease: [0.16, 1, 0.3, 1] } }),
};

export const Hero = ({ onStart, ready }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, -140]);
  const op = useTransform(scrollY, [0, 600], [1, 0]);
  return (
    <section data-testid="hero-section" className="relative flex h-[100svh] flex-col justify-end px-5 pb-10 sm:px-10 lg:px-16">
      <motion.div style={{ y, opacity: op }} initial="hidden" animate={ready ? "show" : "hidden"} className="relative">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#66D9EF]">{SITE.credit} presenta</p>
        <h1 className="font-display mt-4 text-[17vw] font-black uppercase leading-[0.8] tracking-[-0.02em] text-[#F4F7FA] sm:text-[13vw] lg:text-[11.5vw]">
          {["Earth", "Through", "Time"].map((w, i) => (
            <span key={w} className="block overflow-hidden">
              <motion.span className={`block ${i === 1 ? "pl-[12vw] text-transparent [-webkit-text-stroke:1.5px_#F4F7FA]" : ""} ${i === 2 ? "text-[#FF7138]" : ""}`} variants={reveal} custom={i}>
                {w}
              </motion.span>
            </span>
          ))}
        </h1>
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <motion.p variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { delay: 0.9, duration: 1 } } }}
            className="max-w-md text-base leading-relaxed text-[#F4F7FA]/85 md:text-lg">
            {SITE.tagline}.
          </motion.p>
          <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 1.1 } } }} className="flex flex-wrap items-center gap-3">
            <button data-testid="hero-start-btn" onClick={onStart}
              className="group inline-flex items-center gap-3 rounded-full bg-[#F4F7FA] px-6 py-3 text-sm font-semibold text-[#080B10] transition-colors duration-300 hover:bg-[#FF7138]">
              Inizia il viaggio
              <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </button>
            <Link to="/testo" data-testid="hero-text-route-btn"
              className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-[#F4F7FA] transition-colors duration-300 hover:border-[#66D9EF] hover:text-[#66D9EF]">
              Percorso testuale
            </Link>
          </motion.div>
        </div>
      </motion.div>
      <div className="pointer-events-none absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 xl:flex" aria-hidden="true">
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#F4F7FA]/70 [writing-mode:vertical-rl]">Scorri</span>
        <span className="scroll-cue block h-16 w-px bg-[#F4F7FA]/70" />
      </div>
    </section>
  );
};

export const Marquee = () => (
  <div data-testid="editorial-marquee" className="relative z-10 overflow-hidden border-y border-white/10 bg-[#080B10]/70 py-5 backdrop-blur-sm" aria-hidden="true">
    <div className="marquee-track">
      {[0, 1].map((k) => (
        <div key={k} className="flex shrink-0 items-center">
          {SITE.marquee.map((m) => (
            <span key={m + k} className="font-display flex items-center px-6 text-3xl font-black uppercase tracking-tight text-[#F4F7FA]/90 sm:text-5xl">
              {m}<span className="ml-12 inline-block h-2 w-2 rounded-full bg-[#FF7138]" />
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);
