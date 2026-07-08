"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, Button, GoldDivider } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { GoalCategory, Visibility } from "@/lib/types";

const CATS: GoalCategory[] = [
  "Business",
  "Wealth",
  "Health",
  "Relationships",
  "Mindset",
  "Legacy",
  "Impact",
  "Personal Mastery",
];

const VIS: { key: Visibility; label: string; desc: string }[] = [
  { key: "private", label: "Private", desc: "Only you" },
  { key: "allies", label: "Allies", desc: "Your inner connections" },
  { key: "club", label: "Club", desc: "All members" },
];

export default function NewGoalPage() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [cat, setCat] = React.useState<GoalCategory | null>(null);
  const [target, setTarget] = React.useState(4);
  const [vis, setVis] = React.useState<Visibility>("allies");

  const valid = title.trim().length > 3 && cat;

  return (
    <>
      <AppHeader title="New Path" back />
      <div className="app-scroll no-scrollbar flex-1 px-5 pb-32 pt-6">
        <span className="text-[11px] uppercase tracking-luxe text-gold/90">Set your next milestone</span>
        <h1 className="mt-2 font-display text-3xl leading-tight text-chalk">Name the mountain.</h1>

        <div className="mt-7 space-y-6">
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-luxe text-faint">The goal</span>
            <textarea
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Reach $10M personal net worth"
              className="w-full rounded-2xl border border-line bg-ink/70 px-4 py-3.5 text-[15px] text-chalk placeholder:text-faint outline-none focus:border-gold/50 focus:shadow-goldsoft"
            />
          </label>

          <div>
            <span className="mb-2.5 block text-[11px] uppercase tracking-luxe text-faint">Arena</span>
            <div className="flex flex-wrap gap-2">
              {CATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-[13px] transition active:scale-95",
                    cat === c ? "border-gold/50 bg-gold/10 text-gold" : "border-line text-mist hover:border-gold/25"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2.5 block text-[11px] uppercase tracking-luxe text-faint">Target level</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setTarget(n)}
                  className={cn(
                    "h-12 flex-1 rounded-xl border font-display text-lg transition active:scale-95",
                    target >= n ? "border-gold/50 bg-gold/10 text-gold" : "border-line text-faint"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <GoldDivider label="Visibility" />

          <div className="space-y-2.5">
            {VIS.map((v) => (
              <button
                key={v.key}
                onClick={() => setVis(v.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition active:scale-[0.99]",
                  vis === v.key ? "border-gold/50 bg-gold/[0.07]" : "border-line hover:border-gold/25"
                )}
              >
                <div className="flex-1">
                  <div className="text-sm text-chalk">{v.label}</div>
                  <div className="text-[12px] text-faint">{v.desc}</div>
                </div>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border",
                    vis === v.key ? "border-gold bg-gold-fill text-obsidian" : "border-line text-transparent"
                  )}
                >
                  <Icon name="check" size={14} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-line/70 bg-ink/85 px-5 pb-9 pt-4 backdrop-blur-xl">
        <Button variant="gold" size="lg" full disabled={!valid} onClick={() => router.push("/road")}>
          Forge This Path
        </Button>
      </div>
    </>
  );
}
