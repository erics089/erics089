import * as React from "react";
import Link from "next/link";
import type { RtgEvent } from "@/lib/types";
import { Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { eventGradient, formatDate } from "@/lib/utils";

export function EventCard({ event }: { event: RtgEvent }) {
  const spotsLeft = event.capacity - event.rsvpCount;
  return (
    <Link href={`/events/${event.id}`} className="block">
      <div className="vignette group relative overflow-hidden rounded-xl2 border border-line shadow-card transition-colors hover:border-gold/30">
        <div className="relative h-44" style={{ background: eventGradient(event.image) }}>
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge variant="gold" glyph="✦">{event.accessTier}</Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
            <span className="text-[10px] uppercase tracking-luxe text-gold/90">{event.category}</span>
            <h3 className="mt-1 font-display text-2xl leading-tight text-chalk">{event.title}</h3>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-line bg-surface/80 px-4 py-3">
          <div className="flex items-center gap-4 text-[12px] text-mist">
            <span className="flex items-center gap-1.5">
              <Icon name="calendar" size={14} className="text-faint" />
              {formatDate(event.startAt, { day: "numeric", month: "short" })}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="pin" size={14} className="text-faint" />
              {event.city}
            </span>
          </div>
          <span className="text-[11px] text-gold/80">
            {spotsLeft <= 0 ? "Waitlist" : `${spotsLeft} seats`}
          </span>
        </div>
      </div>
    </Link>
  );
}
