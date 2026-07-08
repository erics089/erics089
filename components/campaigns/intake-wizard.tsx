"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { ConnectionNeeded } from "@/components/ui/empty-state";
import { CAMPAIGN_GOALS, CHANNELS } from "@/lib/constants";
import { TREATMENTS, PERSONAS } from "@/lib/brand";

const STEPS = ["Ziel & Anlass", "Behandlung & Persona", "Zeitraum, Budget & Assets", "Kanäle & Angebot", "Prüfen"];

export function IntakeWizard({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [creating, setCreating] = React.useState(false);
  const [missingKey, setMissingKey] = React.useState(false);

  const [form, setForm] = React.useState({
    name: "",
    goal: CAMPAIGN_GOALS[0] as string,
    occasion: "",
    treatments: [] as string[],
    persona: PERSONAS[0].key as string,
    timeframeStart: "",
    timeframeEnd: "",
    budget: "",
    assetStrategy: "drive" as "drive" | "generate",
    channels: ["IG", "FB"] as string[],
    offer: "",
  });

  function toggleArr(field: "treatments" | "channels", value: string) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value],
    }));
  }

  async function submit() {
    setCreating(true);
    setMissingKey(false);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name || `${form.goal} — ${form.treatments.join(", ")}`,
        goal: form.goal,
        occasion: form.occasion,
        treatments: form.treatments.join(","),
        persona: form.persona,
        timeframeStart: form.timeframeStart || null,
        timeframeEnd: form.timeframeEnd || null,
        budget: form.budget || null,
        assetStrategy: form.assetStrategy,
        channels: form.channels.join(","),
        offer: form.offer,
      }),
    });
    const campaign = await res.json();

    const planRes = await fetch(`/api/campaigns/${campaign.id}/generate-plan`, { method: "POST" });
    if (planRes.status === 424) {
      setMissingKey(true);
      setCreating(false);
      router.push(`/kampagnen/${campaign.id}`);
      return;
    }

    setCreating(false);
    setOpen(false);
    router.push(`/kampagnen/${campaign.id}`);
    router.refresh();
  }

  const canNext = [
    Boolean(form.goal),
    form.treatments.length > 0,
    true,
    form.channels.length > 0,
    true,
  ][step];

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Neue Kampagne"
        description={`Schritt ${step + 1} von ${STEPS.length}: ${STEPS[step]}`}
        className="max-w-2xl"
      >
        <div className="mb-4 flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-gold" : "bg-sage/15"}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label>Kampagnenname (optional)</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="z.B. Muttertag Gutscheine 2026" />
            </div>
            <div>
              <Label>Ziel</Label>
              <Select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
                {CAMPAIGN_GOALS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Anlass (optional)</Label>
              <Input value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })} placeholder="z.B. Muttertag, Neueröffnung…" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Behandlung(en) im Fokus</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {TREATMENTS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => toggleArr("treatments", t.key)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm ${
                      form.treatments.includes(t.key) ? "border-gold bg-gold/10" : "border-border"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Primäre Persona</Label>
              <Select value={form.persona} onChange={(e) => setForm({ ...form, persona: e.target.value })}>
                {PERSONAS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start</Label>
                <Input type="date" value={form.timeframeStart} onChange={(e) => setForm({ ...form, timeframeStart: e.target.value })} />
              </div>
              <div>
                <Label>Ende</Label>
                <Input type="date" value={form.timeframeEnd} onChange={(e) => setForm({ ...form, timeframeEnd: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Budget (€)</Label>
              <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="z.B. 300" />
            </div>
            <div>
              <Label>Assets</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setForm({ ...form, assetStrategy: "drive" })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm ${form.assetStrategy === "drive" ? "border-gold bg-gold/10" : "border-border"}`}
                >
                  Vorhandene Drive-Assets nutzen
                </button>
                <button
                  onClick={() => setForm({ ...form, assetStrategy: "generate" })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm ${form.assetStrategy === "generate" ? "border-gold bg-gold/10" : "border-border"}`}
                >
                  Neue Bilder generieren
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Kanäle</Label>
              <div className="flex flex-wrap gap-2">
                {CHANNELS.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleArr("channels", c)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      form.channels.includes(c) ? "border-gold bg-gold/10" : "border-border"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Angebot / Mehrwert (optional)</Label>
              <Textarea
                value={form.offer}
                onChange={(e) => setForm({ ...form, offer: e.target.value })}
                placeholder="z.B. LumenCard-Bonus, premium verpackt — nie als Rabattschlacht"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3 text-sm">
            <SummaryRow label="Ziel" value={form.goal} />
            <SummaryRow label="Behandlungen" value={form.treatments.map((k) => TREATMENTS.find((t) => t.key === k)?.name).join(", ") || "—"} />
            <SummaryRow label="Persona" value={PERSONAS.find((p) => p.key === form.persona)?.name ?? ""} />
            <SummaryRow label="Zeitraum" value={`${form.timeframeStart || "offen"} – ${form.timeframeEnd || "offen"}`} />
            <SummaryRow label="Budget" value={form.budget ? `${form.budget} €` : "nicht festgelegt"} />
            <SummaryRow label="Kanäle" value={form.channels.join(", ") || "—"} />
            {missingKey && (
              <ConnectionNeeded description="Für die Plan-Generierung wird ein Anthropic API-Key benötigt. Die Kampagne wurde als Entwurf gespeichert." />
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="h-3.5 w-3.5" /> Zurück
          </Button>
          {step < STEPS.length - 1 ? (
            <Button variant="gold" size="sm" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              Weiter <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button variant="gold" size="sm" onClick={submit} disabled={creating}>
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Kampagnenplan generieren
            </Button>
          )}
        </div>
      </Dialog>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-sage/5 px-3 py-2">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
