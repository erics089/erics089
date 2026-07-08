"use client";

import * as React from "react";
import Link from "next/link";
import type { Goal, GoalCategory } from "@/lib/types";
import { Chip, Card, Button } from "@/components/ui/primitives";
import { GoalCard } from "@/components/shared/GoalCard";
import { Icon } from "@/components/ui/Icon";

const CATS: (GoalCategory | "All")[] = ["All", "Business", "Wealth", "Health", "Legacy", "Personal Mastery"];

export function RoadView({ goals }: { goals: Goal[] }) {
  const [cat, setCat] = React.useState<GoalCategory | "All">("All");
  const filtered = cat === "All" ? goals : goals.filter((g) => g.category === cat);
  const avg = Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length);

  return (
    <div className="pb-10">
      {/* Summary band */}
      <div className="px-5 pt-5">
        <Card glow className="p-5">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-luxe text-gold/90">Your ascent</span>
              <p className="mt-1 font-display text-4xl text-gold-gradient">{avg}%</p>
              <p className="mt-1 text-[12px] text-faint">across {goals.length} active paths</p>
            </div>
            <span className="font-display text-5xl text-line">↗</span>
          </div>
        </Card>
      </div>

      {/* Category filter */}
      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto px-5">
        {CATS.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {c}
          </Chip>
        ))}
      </div>

      {/* Goals */}
      <div className="mt-5 space-y-3 px-5">
        {filtered.map((g) => (
          <GoalCard key={g.id} goal={g} />
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-[13px] text-faint">No paths in this arena yet.</p>
        )}
      </div>

      {/* Add path */}
      <div className="mt-5 px-5">
        <Link href="/road/new">
          <Button variant="dark" size="lg" full icon={<Icon name="plus" size={18} />}>
            Set your next milestone
          </Button>
        </Link>
      </div>
    </div>
  );
}
