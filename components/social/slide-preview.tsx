import { Image as ImageIcon } from "lucide-react";
import type { PostContent } from "@/lib/types";

const ROLE_LABELS: Record<string, string> = {
  hook: "Hook",
  pain: "Pain",
  solution: "Lösung",
  proof: "Proof",
  cta: "CTA",
};

export function SlidePreview({ content }: { content: PostContent }) {
  return (
    <div className="space-y-4">
      <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-2">
        {content.slides.map((slide, i) => (
          <div
            key={i}
            className="flex aspect-[4/5] w-56 shrink-0 flex-col justify-between rounded-2xl border border-border bg-gradient-to-br from-cream to-sage/20 p-4 shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink/70">
                {ROLE_LABELS[slide.role] ?? slide.role}
              </span>
              <span className="text-[10px] text-muted">{i + 1}/{content.slides.length}</span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <ImageIcon className="h-6 w-6 text-ink/30" />
              <p className="font-heading text-lg leading-tight text-ink">{slide.headline}</p>
              <p className="text-xs leading-snug text-ink/70">{slide.body}</p>
            </div>
            <p className="line-clamp-2 text-[10px] italic text-muted">Bild: {slide.imageBrief}</p>
          </div>
        ))}
      </div>

      {content.reelScenes && content.reelScenes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-ink">Reel-Skript</p>
          {content.reelScenes.map((scene) => (
            <div key={scene.scene} className="rounded-lg border border-border px-4 py-2.5 text-sm">
              <p className="font-medium text-ink">Szene {scene.scene}</p>
              <p className="text-muted">Regie: {scene.direction}</p>
              <p className="text-ink/80">Voiceover: „{scene.voiceover}”</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(["short", "medium", "storytelling"] as const).map((variant) => (
          <div key={variant} className="rounded-lg border border-border p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{variant}</p>
            <p className="whitespace-pre-line text-xs text-ink/90">{content.captions[variant]}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {content.hashtags.map((h) => (
          <span key={h} className="rounded-full bg-sage/15 px-2 py-0.5 text-xs text-ink/80">
            {h}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted">Bester Zeitpunkt: {content.bestTime}</p>
    </div>
  );
}
