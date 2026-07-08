"use client";

import * as React from "react";
import type { Milestone, User, MilestoneType } from "@/lib/types";
import { Card, Avatar, Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { timeAgo, cn } from "@/lib/utils";

const typeMeta: Record<MilestoneType, { label: string; glyph: string }> = {
  accomplishment: { label: "Accomplishment", glyph: "◆" },
  milestone: { label: "Milestone", glyph: "◈" },
  event: { label: "Event", glyph: "✦" },
  challenge: { label: "Challenge", glyph: "▲" },
  rank: { label: "Rank", glyph: "◉" },
  goal: { label: "New Path", glyph: "◇" },
  lesson: { label: "Lesson", glyph: "❖" },
};

const reactionSet = [
  { key: "trophy", label: "Trophy", glyph: "🏆" },
  { key: "respect", label: "Respect", glyph: "◆" },
  { key: "salute", label: "Salute", glyph: "✦" },
  { key: "powerMove", label: "Power", glyph: "▲" },
] as const;

export function FeedCard({ item, author }: { item: Milestone; author: User }) {
  const [reactions, setReactions] = React.useState(item.reactions);
  const [picked, setPicked] = React.useState<string | null>(null);
  const meta = typeMeta[item.type];

  function react(key: keyof typeof reactions) {
    setReactions((prev) => {
      const next = { ...prev };
      if (picked === key) {
        next[key] -= 1;
        setPicked(null);
      } else {
        if (picked) next[picked as keyof typeof reactions] -= 1;
        next[key] += 1;
        setPicked(key);
      }
      return next;
    });
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-3">
        <Avatar seed={author.profileImage} name={author.fullName} size={42} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium text-chalk">{author.fullName}</span>
            {author.verified && <Icon name="verified" size={13} className="shrink-0 text-gold" />}
          </div>
          <span className="text-[11px] text-faint">
            {author.archetype} · {timeAgo(item.achievedAt)}
          </span>
        </div>
        <Badge variant="gold" glyph={meta.glyph}>{meta.label}</Badge>
      </div>

      <h3 className="font-display text-xl leading-snug text-chalk">{item.title}</h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-mist">{item.description}</p>

      {item.verified && (
        <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-gold/90">
          <Icon name="verified" size={13} />
          Verified accomplishment
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-line/70 pt-4">
        {reactionSet.map((r) => (
          <button
            key={r.key}
            onClick={() => react(r.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-all active:scale-95",
              picked === r.key
                ? "border-gold/50 bg-gold/10 text-gold"
                : "border-line text-mist hover:border-gold/25"
            )}
          >
            <span className="text-[11px]">{r.glyph}</span>
            {reactions[r.key]}
          </button>
        ))}
      </div>
    </Card>
  );
}
