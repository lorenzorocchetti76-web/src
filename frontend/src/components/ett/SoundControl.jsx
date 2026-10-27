import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { audio } from "@/lib/audio";
import { track } from "@/lib/api";

export function useAudioState() {
  const [s, setS] = useState({ enabled: audio.enabled, volume: audio.volume });
  useEffect(() => audio.subscribe(setS), []);
  return s;
}

export const SoundControl = () => {
  const { enabled, volume } = useAudioState();
  const toggle = async () => {
    await audio.toggle();
    if (audio.enabled) { audio.blip(880, 0.15); track("sound_on"); }
  };
  return (
    <div className="flex items-center gap-1">
      <button
        data-testid="sound-toggle-btn"
        onClick={toggle}
        aria-pressed={enabled}
        aria-label={enabled ? "Disattiva audio" : "Attiva audio"}
        className="flex h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-xs font-mono uppercase tracking-widest text-[#F4F7FA] transition-colors duration-300 hover:border-[#66D9EF]/60"
      >
        {enabled ? <Volume2 className="h-4 w-4 text-[#66D9EF]" /> : <VolumeX className="h-4 w-4" />}
        <span className="hidden lg:inline">{enabled ? "Audio on" : "Audio off"}</span>
        <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-[2px] bg-current transition-all duration-500"
              style={{ height: enabled ? `${[60, 100, 40][i]}%` : "20%", opacity: enabled ? 1 : 0.5 }} />
          ))}
        </span>
      </button>
      <Popover>
        <PopoverTrigger asChild>
          <button data-testid="volume-popover-btn" aria-label="Regola volume"
            className="hidden h-10 rounded-full border border-white/15 px-3 font-mono text-xs text-[#F4F7FA]/80 transition-colors hover:border-[#66D9EF]/60 sm:block">
            {Math.round(volume * 100)}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-60 border-white/10 bg-[#101D30] text-[#F4F7FA]">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[#66D9EF]">Volume</p>
          <Slider data-testid="volume-slider" aria-label="Volume" value={[volume * 100]} max={100} step={1}
            onValueChange={([v]) => audio.setVolume(v / 100)} />
          <button data-testid="sound-playpause-btn" onClick={toggle}
            className="mt-4 w-full rounded-full border border-white/15 py-2 text-sm hover:border-[#66D9EF]/60">
            {enabled ? "Pausa" : "Riproduci"}
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
};
