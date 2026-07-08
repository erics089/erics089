"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import { EventPanel } from "@/components/calendar/event-panel";
import type { CalendarEvent, ActionDayIdea, Post } from "@prisma/client";

const MONTH_NAMES = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const CATEGORY_DOT: Record<string, string> = {
  Feiertag: "bg-stone-400",
  Saison: "bg-sage",
  Gesundheitstag: "bg-sky-400",
  Aktion: "bg-gold",
  Lokal: "bg-rose-400",
};

type EventWithIdeas = CalendarEvent & { ideas: ActionDayIdea[] };

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function MonthCalendar({
  year,
  month,
  events,
  posts,
  openEventId,
}: {
  year: number;
  month: number;
  events: EventWithIdeas[];
  posts: Post[];
  openEventId?: string;
}) {
  const router = useRouter();
  const [activeEventId, setActiveEventId] = React.useState<string | null>(openEventId ?? null);
  const [dragOverDay, setDragOverDay] = React.useState<string | null>(null);

  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Montag = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function navigate(deltaMonths: number) {
    let m = month + deltaMonths;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    router.push(`/kalender?year=${y}&month=${m}`);
  }

  async function handleDrop(day: Date, postId: string) {
    await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt: day.toISOString() }),
    });
    router.refresh();
  }

  const activeEvent = events.find((e) => e.id === activeEventId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl text-ink">
          {MONTH_NAMES[month]} {year}
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(-1)} className="rounded-md p-1.5 hover:bg-sage/10" aria-label="Vorheriger Monat">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push("/kalender")}
            className="rounded-md px-2.5 py-1 text-xs font-medium hover:bg-sage/10"
          >
            Heute
          </button>
          <button onClick={() => navigate(1)} className="rounded-md p-1.5 hover:bg-sage/10" aria-label="Nächster Monat">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="grid grid-cols-7 border-b border-border bg-sage/5 text-xs font-medium text-muted">
          {WEEKDAYS.map((w) => (
            <div key={w} className="px-2 py-2 text-center">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const dayEvents = day ? events.filter((e) => sameDay(new Date(e.date), day)) : [];
            const dayPosts = day ? posts.filter((p) => p.scheduledAt && sameDay(new Date(p.scheduledAt), day)) : [];
            const isToday = day && sameDay(day, new Date());
            const dropKey = day?.toISOString() ?? `empty-${i}`;
            return (
              <div
                key={i}
                onDragOver={(e) => {
                  if (!day) return;
                  e.preventDefault();
                  setDragOverDay(dropKey);
                }}
                onDragLeave={() => setDragOverDay(null)}
                onDrop={(e) => {
                  if (!day) return;
                  e.preventDefault();
                  const postId = e.dataTransfer.getData("text/plain");
                  if (postId) handleDrop(day, postId);
                  setDragOverDay(null);
                }}
                className={cn(
                  "min-h-[104px] border-b border-r border-border p-1.5",
                  !day && "bg-sage/5",
                  dragOverDay === dropKey && "bg-gold/10"
                )}
              >
                {day && (
                  <>
                    <span
                      className={cn(
                        "mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                        isToday ? "bg-ink text-cream" : "text-ink/70"
                      )}
                    >
                      {day.getDate()}
                    </span>
                    <div className="space-y-1">
                      {dayEvents.map((ev) => (
                        <button
                          key={ev.id}
                          onClick={() => setActiveEventId(ev.id)}
                          className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[10px] hover:bg-sage/10"
                        >
                          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", CATEGORY_DOT[ev.category])} />
                          <span className="truncate text-ink/80">{ev.title}</span>
                        </button>
                      ))}
                      {dayPosts.map((p) => (
                        <div
                          key={p.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("text/plain", p.id)}
                          className={cn(
                            "cursor-grab truncate rounded px-1 py-0.5 text-[10px] font-medium",
                            STATUS_COLORS[p.status] ?? "bg-stone-200"
                          )}
                        >
                          {p.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {activeEvent && <EventPanel event={activeEvent} onClose={() => setActiveEventId(null)} />}
    </div>
  );
}
