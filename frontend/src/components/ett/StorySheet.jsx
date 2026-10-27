import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { KIND_LABEL } from "@/lib/content";

export const KindTags = ({ kinds }) => (
  <ul className="flex flex-wrap gap-2" aria-label="Tipo di contenuto">
    {kinds.map((k) => (
      <li key={k} className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-[#F4F7FA]/80">
        {KIND_LABEL[k]}
      </li>
    ))}
  </ul>
);

export const Milestones = ({ items }) => (
  <ol className="space-y-4 border-l border-[#66D9EF]/30 pl-5">
    {items.map((m) => (
      <li key={m.year}>
        <p className="font-mono text-sm text-[#FF7138]">{m.year} — {m.name}</p>
        <p className="mt-1 text-sm leading-relaxed text-[#F4F7FA]/85">{m.text}</p>
      </li>
    ))}
  </ol>
);

export const StorySheet = ({ scene, onOpenChange }) => (
  <Sheet open={!!scene} onOpenChange={onOpenChange}>
    <SheetContent side="right" data-testid="story-sheet" className="w-full overflow-y-auto border-white/10 bg-[#080B10]/97 text-[#F4F7FA] sm:max-w-lg">
      {scene && (
        <>
          <SheetHeader className="text-left">
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: scene.accent }}>{scene.n} · {scene.era}</p>
            <SheetTitle className="font-display text-3xl font-black uppercase leading-none tracking-tight text-[#F4F7FA]">{scene.title}</SheetTitle>
            <SheetDescription className="text-[#F4F7FA]/80">{scene.body}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {scene.milestones && <Milestones items={scene.milestones} />}
            {scene.story.map((p, i) => <p key={i} className="leading-relaxed text-[#F4F7FA]/85">{p}</p>)}
          </div>
        </>
      )}
    </SheetContent>
  </Sheet>
);
