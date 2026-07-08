"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { ConnectionNeeded } from "@/components/ui/empty-state";
import { SlidePreview } from "@/components/social/slide-preview";
import { POST_TYPES } from "@/lib/constants";
import { TREATMENTS, PERSONAS } from "@/lib/brand";
import type { PostContent } from "@/lib/types";

export function PostGeneratorDialog({ trigger, campaignId }: { trigger: React.ReactNode; campaignId?: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [missingKey, setMissingKey] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [generated, setGenerated] = React.useState<PostContent | null>(null);

  const [form, setForm] = React.useState({
    postType: "carousel",
    treatmentKey: "neck-reset",
    personaKey: "professional",
    occasion: "",
    language: "DE",
    title: "",
  });

  async function generate() {
    setLoading(true);
    setError(null);
    setMissingKey(false);
    setGenerated(null);
    try {
      const res = await fetch("/api/generate/social-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.status === 424) {
        setMissingKey(true);
      } else if (!res.ok) {
        setError(json.message || "Generierung fehlgeschlagen.");
      } else {
        setGenerated(json.content);
      }
    } catch {
      setError("Netzwerkfehler bei der Generierung.");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!generated) return;
    setSaving(true);
    const title = form.title || generated.slides[0]?.headline || "Neuer Post";
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.postType,
        title,
        treatment: form.treatmentKey,
        persona: form.personaKey,
        language: form.language,
        campaignId,
        contentJson: { activeLanguage: form.language, languages: { [form.language]: generated } },
      }),
    });
    const post = await res.json();
    setSaving(false);
    setOpen(false);
    setGenerated(null);
    router.push(`/social/${post.id}`);
    router.refresh();
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Neuen Post generieren"
        description="Die KI erstellt Slides, Captions, Hashtags und Timing nach der MIRRA-Dramaturgie."
        className="max-w-3xl"
      >
        {!generated && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Format</Label>
                <Select value={form.postType} onChange={(e) => setForm({ ...form, postType: e.target.value })}>
                  {POST_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Sprache</Label>
                <Select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                  <option value="DE">Deutsch</option>
                  <option value="EN">Englisch</option>
                </Select>
              </div>
              <div>
                <Label>Behandlung im Fokus</Label>
                <Select value={form.treatmentKey} onChange={(e) => setForm({ ...form, treatmentKey: e.target.value })}>
                  {TREATMENTS.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Ziel-Persona</Label>
                <Select value={form.personaKey} onChange={(e) => setForm({ ...form, personaKey: e.target.value })}>
                  {PERSONAS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label>Anlass / Kontext (optional)</Label>
              <Textarea
                value={form.occasion}
                onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                placeholder="z.B. Muttertag, Reaktivierung inaktiver Gäste, Neueröffnung Infrarot Lumen Intense…"
              />
            </div>

            {missingKey && (
              <ConnectionNeeded description="Für die KI-Generierung wird ein Anthropic API-Key benötigt. Trage ihn in .env.local ein." />
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button onClick={generate} disabled={loading} variant="gold" className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Generiert…" : "Content generieren"}
            </Button>
          </div>
        )}

        {generated && (
          <div className="space-y-4">
            <div>
              <Label>Titel (intern)</Label>
              <Input
                value={form.title || generated.slides[0]?.headline || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <SlidePreview content={generated} />
            <div className="rounded-lg bg-sage/10 px-4 py-3 text-sm text-ink">
              <p className="font-medium">Warum das konvertiert</p>
              <p className="text-muted">{generated.reasoning}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setGenerated(null)}>
                <Wand2 className="h-4 w-4" /> Neu generieren
              </Button>
              <Button variant="gold" onClick={save} disabled={saving} className="flex-1">
                {saving ? "Speichert…" : "Als Entwurf speichern"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
