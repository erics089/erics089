import * as React from "react";
import Link from "next/link";
import type { Goal } from "@/lib/types";
import { Card, Badge } from "@/components/ui/primitives";
import { ProgressBar } from "@/components/ui/Progress";
import { Icon } from "@/components/ui/Icon";
import { categoryGlyph } from "@/lib/utils";

const visibilityLabel: Record<Goal["visibility"], string> = {
  private: "Private",
  allies: "Allies",
  club: "Club",
};

export function GoalCard({ goal }: { goal: Goal }) {
  return (
    <Link href={`/goal/${goal.id}`} className="block">
      <Card className="p-5 transition-colors hover:border-gold/25">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-sm text-gold">{categoryGlyph(goal.category)}</span>
              <span className="text-[10px] uppercase tracking-luxe text-faint">{goal.category}</span>
            </div>
            <h3 className="font-display text-lg leading-tight text-chalk">{goal.title}</h3>
          </div>
          <Icon name="chevron" size={18} className="mt-1 shrink-0 text-faint" />
        </div>

        <div className="mb-3 flex items-center gap-2">
          <ProgressBar value={goal.progress} />
          <span className="w-9 shrink-0 text-right font-display text-sm text-gold-gradient">
            {goal.progress}%
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-faint">
            Level <span className="text-mist">{goal.currentLevel}</span> → {goal.targetLevel}
          </span>
          <Badge variant="line" className="border-line/70">
            {visibilityLabel[goal.visibility]}
          </Badge>
        </div>
      </Card>
    </Link>
  );
}
