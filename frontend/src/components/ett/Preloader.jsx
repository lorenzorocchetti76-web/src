import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Preloader: copre il caricamento asincrono del motore 3D (chunk separato).
export const Preloader = ({ done }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((v) => Math.min(done ? 100 : 92, v + (done ? 9 : Math.random() * 7))), 60);
    return () => clearInterval(id);
  }, [done]);
  const show = !(done && n >= 100);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          data-testid="preloader"
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[70] flex flex-col justify-between bg-[#080B10] p-5 sm:p-10"
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }}
          style={{ clipPath: "inset(0 0 0% 0)" }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#66D9EF]">Caricamento dell'ambiente 3D</p>
          <div>
            {["4,5 miliardi", "di anni in", "un solo viaggio"].map((t, i) => (
              <span key={t} className="block overflow-hidden">
                <motion.span className="font-display block text-5xl font-black uppercase leading-[0.9] text-[#F4F7FA] sm:text-7xl"
                  initial={{ y: "100%" }} animate={{ y: "0%" }} transition={{ delay: 0.1 + i * 0.12, duration: 1, ease: [0.16, 1, 0.3, 1] }}>
                  {t}
                </motion.span>
              </span>
            ))}
          </div>
          <div className="flex items-end justify-between">
            <div className="h-px w-1/2 bg-white/10">
              <div className="h-px bg-[#FF7138] transition-[width] duration-100" style={{ width: `${n}%` }} />
            </div>
            <span data-testid="preloader-counter" className="font-display text-6xl font-black tabular-nums text-[#F4F7FA] sm:text-8xl">{Math.floor(n)}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
