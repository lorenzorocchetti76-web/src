import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SCENES, TIMELINE_POS } from "@/lib/content";

export const TimelineSheet = ({ open, onOpenChange, current, onJump }) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="bottom" data-testid="timeline-sheet" className="border-white/10 bg-[#080B10]/95 px-5 pb-10 text-[#F4F7FA] sm:px-12">
      <SheetHeader className="text-left">
        <SheetTitle className="font-display text-3xl font-black uppercase tracking-tight text-[#F4F7FA]">Timeline</SheetTitle>
        <SheetDescription className="font-mono text-xs uppercase tracking-widest text-[#66D9EF]/90">
          Scala non lineare · le epoche non sono equidistanti nel tempo
        </SheetDescription>
      </SheetHeader>
      <div className="relative mt-10 hidden h-28 md:block" aria-hidden="true">
        <div className="absolute inset-x-0 top-6 h-px bg-gradient-to-r from-[#FF7138] via-[#66D9EF] to-[#FF4B45]" />
        {SCENES.map((s, i) => (
          <div key={s.id} className="absolute top-0 -translate-x-1/2" style={{ left: `${TIMELINE_POS[i]}%` }}>
            <span className="mx-auto block h-3 w-3 translate-y-[18px] rounded-full border-2" style={{ borderColor: s.accent, background: i === current ? s.accent : "#080B10" }} />
          </div>
        ))}
      </div>
      <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 md:-mt-12 md:grid-cols-8">
        {SCENES.map((s, i) => (
          <li key={s.id}>
            <button
              data-testid={`timeline-jump-${s.id}`}
              onClick={() => onJump(i)}
              aria-current={i === current ? "step" : undefined}
              className={`group w-full rounded-sm border p-3 text-left transition-colors duration-300 ${i === current ? "border-[#66D9EF]/60 bg-[#101D30]" : "border-white/10 hover:border-white/30"}`}
            >
              <span className="block font-mono text-xs" style={{ color: s.accent }}>{s.n}</span>
              <span className="mt-1 block text-sm font-semibold">{s.short}</span>
              <span className="mt-1 block font-mono text-[11px] uppercase tracking-wider text-[#F4F7FA]/65">{s.era}</span>
            </button>
          </li>
        ))}
      </ol>
    </SheetContent>
  </Sheet>
);
