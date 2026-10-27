import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const line = {
  hidden: { y: "105%" },
  show: (i) => ({ y: "0%", transition: { duration: 1, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] } }),
};

const MaskLine = ({ children, i, className = "" }) => (
  <span className="block overflow-hidden pb-[0.08em]">
    <motion.span className={`block ${className}`} variants={line} custom={i}>{children}</motion.span>
  </span>
);

// Una "beat" dello scrollytelling: sezione alta con pannello di testo pinnato (sticky).
export const SceneSection = ({ scene, index, onStory }) => {
  const words = scene.title.split(" ");
  const half = Math.ceil(words.length / 2);
  const lines = words.length > 4 ? [words.slice(0, half).join(" "), words.slice(half).join(" ")] : [scene.title];
  return (
    <section id={scene.id} data-testid={`scene-section-${scene.id}`} aria-labelledby={`title-${scene.id}`} className={`relative ${index === 0 ? "h-[170vh]" : "h-[245vh]"}`}>
      <div className="sticky top-0 flex h-[100svh] items-end px-5 pb-24 sm:px-10 md:items-center md:pb-0 lg:px-16">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}
          className="relative max-w-xl rounded-sm p-5 sm:p-0 md:max-w-lg lg:max-w-2xl"
        >
          <div className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-[#080B10]/55 blur-3xl md:bg-[#080B10]/35" />
          <MaskLine i={0} className="font-mono text-xs uppercase tracking-[0.25em] text-white">
            <span>{scene.n}</span>
            <span> — {scene.era}</span>
          </MaskLine>
          <h2 id={`title-${scene.id}`} className="font-display mt-4 text-[1.7rem] uppercase leading-[0.95] text-white [text-wrap:balance] sm:text-[2.6rem] lg:text-[3rem]">
            {lines.map((l, i) => <MaskLine key={i} i={i + 1}>{l}</MaskLine>)}
          </h2>
          <motion.p
            variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { delay: 0.35, duration: 0.9 } } }}
            className="mt-5 text-sm leading-relaxed text-white sm:text-base md:text-lg"
          >
            {scene.body}
          </motion.p>
          <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.55 } } }} className="mt-6 flex flex-wrap items-center gap-4">
            <button
              data-testid={`story-open-${scene.id}`}
              onClick={() => onStory(index)}
              className="group inline-flex items-center gap-2 rounded-full border border-[#F4F7FA]/30 bg-[#F4F7FA] px-5 py-2.5 text-sm font-semibold text-[#080B10] [text-shadow:none] transition-colors duration-300 hover:bg-[#66D9EF]"
            >
              Approfondisci
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
