"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { ConnectionNeeded } from "@/components/ui/empty-state";
import { TREATMENTS, PERSONAS } from "@/lib/brand";

export function AdSpecGenerator({ trigger, platform }: { trigger: React.ReactNode; platform: "META" | "GOOGLE" }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [missingKey, setMissingKey] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    treatmentKey: "neck-reset",
    personaKey: "professional",
    occasion: "",
    budget: "",
    objective: "Buchungen",
    seedKeywords: "Massage Planegg, Massage München West, Infrarot Massage München, Hot Stone Gräfelfing, Geschenkgutschein Massage München",
  });

  async function generate() {
    setLoading(true);
    setError(null);
    setMissingKey(false);
    const endpoint = platform === "META" ? "/api/generate/ads-meta" : "/api/generate/ads-google";
    const payload =
      platform === "META"
        ? {
            treatmentKey: form.treatmentKey,
            personaKey: form.personaKey,
            occasion: form.occasion,
            budget: form.budget,
            objective: form.objective,
          }
        : {
            treatmentKey: form.treatmentKey,
            budget: form.budget,
            seedKeywords: form.seedKeywords.split(",").map((s) => s.trim()).filter(Boolean),
          };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setLoading(false);
    if (res.status === 424) {
      setMissingKey(true);
      return;
    }
    if (!res.ok) {
      setError(json.message || "Generierung fehlgeschlagen.");
      return;
    }
    setOpen(false);
    router.push(`/ads/${json.id}`);
    router.refresh();
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={platform === "META" ? "Meta-Ads-Struktur generieren" : "Google-Ads-Struktur generieren"}
        description={
          platform === "META"
            ? "Kampagne → Ad Sets → Ads mit Targeting-Empfehlungen und Creative-Konzepten."
            : "Keyword-Recherche, Anzeigengruppen und RSA-Texte."
        }
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            {platform === "META" && (
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
            )}
            <div>
              <Label>Budget (€/Monat, optional)</Label>
              <Input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="z.B. 300" />
            </div>
            {platform === "META" && (
              <div>
                <Label>Kampagnenziel</Label>
                <Select value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })}>
                  <option value="Buchungen">Buchungen</option>
                  <option value="Markenbekanntheit">Markenbekanntheit</option>
                  <option value="Gutscheinverkauf">Gutscheinverkauf</option>
                </Select>
              </div>
            )}
          </div>

          {platform === "META" && (
            <div>
              <Label>Anlass (optional)</Label>
              <Input value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })} placeholder="z.B. Muttertag" />
            </div>
          )}

          {platform === "GOOGLE" && (
            <div>
              <Label>Seed-Keywords</Label>
              <Textarea value={form.seedKeywords} onChange={(e) => setForm({ ...form, seedKeywords: e.target.value })} />
            </div>
          )}

          {missingKey && (
            <ConnectionNeeded description="Für die KI-Generierung wird ein Anthropic API-Key benötigt. Trage ihn in .env.local ein." />
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button variant="gold" onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generiert…" : "Struktur generieren"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
