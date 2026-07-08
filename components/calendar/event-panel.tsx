"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Send, CheckSquare, Square } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectionNeeded } from "@/components/ui/empty-state";
import { formatDateDE } from "@/lib/utils";
import type { CalendarEvent, ActionDayIdea } from "@prisma/client";

const FORMAT_COLORS: Record<string, string> = {
  Post: "bg-sky-100 text-sky-800",
  Story: "bg-purple-100 text-purple-800",
  Reel: "bg-rose-100 text-rose-800",
  Aktion: "bg-gold/20 text-ink",
  Kooperation: "bg-emerald-100 text-emerald-800",
};

export function EventPanel({
  event,
  onClose,
}: {
  event: CalendarEvent & { ideas: ActionDayIdea[] };
  onClose: () => void;
}) {
  const router = useRouter();
  const [ideas, setIdeas] = React.useState(event.ideas);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [generating, setGenerating] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [missingKey, setMissingKey] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function generate() {
    setGenerating(true);
    setMissingKey(false);
    const res = await fetch(`/api/calendar-events/${event.id}/ideas`, { method: "POST" });
    if (res.status === 424) {
      setMissingKey(true);
    } else if (res.ok) {
      const json = await res.json();
      setIdeas(json);
    }
    setGenerating(false);
  }

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function sendSelected() {
    setSending(true);
    await fetch(`/api/calendar-events/${event.id}/ideas/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaIds: Array.from(selected) }),
    });
    setSending(false);
    setSent(true);
    setSelected(new Set());
    router.refresh();
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={event.title}
      description={`${formatDateDE(event.date)} · ${event.category}`}
      className="max-w-3xl"
    >
      <div className="space-y-4">
        {event.description && <p className="text-sm text-muted">{event.description}</p>}

        {ideas.length === 0 && !missingKey && (
          <Button variant="gold" onClick={generate} disabled={generating} className="w-full">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generiert 22 Ideen…" : "22 Ideen generieren"}
          </Button>
        )}

        {missingKey && (
          <ConnectionNeeded description="Für die Ideen-Generierung wird ein Anthropic API-Key benötigt. Trage ihn in .env.local ein." />
        )}

        {ideas.length > 0 && (
          <>
            <div className="scrollbar-thin max-h-96 space-y-1.5 overflow-y-auto pr-1">
              {ideas
                .slice()
                .sort((a, b) => b.conversionScore - a.conversionScore)
                .map((idea) => (
                  <button
                    key={idea.id}
                    onClick={() => toggle(idea.id)}
                    className="flex w-full items-start gap-2.5 rounded-lg border border-border px-3 py-2 text-left hover:bg-sage/5"
                  >
                    {selected.has(idea.id) ? (
                      <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    ) : (
                      <Square className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                    )}
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Badge className={FORMAT_COLORS[idea.format] ?? ""}>{idea.format}</Badge>
                        <span className="text-xs text-muted">Conversion {idea.conversionScore}/5</span>
                      </div>
                      <p className="text-sm text-ink">{idea.concept}</p>
                    </div>
                  </button>
                ))}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="gold"
                onClick={sendSelected}
                disabled={selected.size === 0 || sending}
                className="flex-1"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {selected.size > 0 ? `${selected.size} Idee(n) an Social Studio senden` : "Ideen auswählen"}
              </Button>
              <Button variant="outline" size="sm" onClick={generate} disabled={generating}>
                Neu generieren
              </Button>
            </div>
            {sent && <p className="text-sm text-emerald-700">Als Entwurf im Social Media Studio abgelegt.</p>}
          </>
        )}
      </div>
    </Dialog>
  );
}
