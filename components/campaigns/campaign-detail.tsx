"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ConnectionNeeded } from "@/components/ui/empty-state";
import { parseCampaignPlan } from "@/lib/campaign-types";
import { CAMPAIGN_STATUSES } from "@/lib/constants";
import { TREATMENTS, PERSONAS } from "@/lib/brand";
import { formatDateDE } from "@/lib/utils";
import type { Campaign, Post } from "@prisma/client";

export function CampaignDetail({ campaign }: { campaign: Campaign & { posts: Post[] } }) {
  const router = useRouter();
  const [status, setStatus] = React.useState(campaign.status);
  const [plan, setPlan] = React.useState(parseCampaignPlan(campaign.planJson));
  const [generating, setGenerating] = React.useState(false);
  const [missingKey, setMissingKey] = React.useState(false);
  const [addedPieces, setAddedPieces] = React.useState<Set<number>>(new Set());
  const [busyStatus, setBusyStatus] = React.useState(false);

  const treatmentNames = campaign.treatments
    .split(",")
    .map((k) => TREATMENTS.find((t) => t.key === k)?.name ?? k)
    .join(", ");
  const personaName = PERSONAS.find((p) => p.key === campaign.persona)?.name ?? campaign.persona;

  async function generatePlan() {
    setGenerating(true);
    setMissingKey(false);
    const res = await fetch(`/api/campaigns/${campaign.id}/generate-plan`, { method: "POST" });
    if (res.status === 424) {
      setMissingKey(true);
    } else if (res.ok) {
      const updated = await res.json();
      setPlan(parseCampaignPlan(updated.planJson));
      setStatus(updated.status);
    }
    setGenerating(false);
  }

  async function updateStatus(next: string) {
    setBusyStatus(true);
    const res = await fetch(`/api/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) setStatus(next);
    setBusyStatus(false);
    router.refresh();
  }

  async function addToStudio(piece: CampaignPieceWithIndex) {
    await fetch(`/api/campaigns/${campaign.id}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(piece),
    });
    setAddedPieces((s) => new Set(s).add(piece.index));
    router.refresh();
  }

  const currentIndex = CAMPAIGN_STATUSES.indexOf(status as (typeof CAMPAIGN_STATUSES)[number]);
  const nextStatus = CAMPAIGN_STATUSES[currentIndex + 1];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/kampagnen" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Zurück zum Kampagnen-Manager
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl text-ink">{campaign.name}</h1>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center gap-2">
          {nextStatus && (
            <Button size="sm" variant="gold" onClick={() => updateStatus(nextStatus)} disabled={busyStatus}>
              Freigeben für „{nextStatus}”
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Intake-Zusammenfassung</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <Info label="Ziel" value={campaign.goal} />
          <Info label="Behandlungen" value={treatmentNames} />
          <Info label="Persona" value={personaName} />
          <Info
            label="Zeitraum"
            value={`${campaign.timeframeStart ? formatDateDE(campaign.timeframeStart) : "offen"} – ${
              campaign.timeframeEnd ? formatDateDE(campaign.timeframeEnd) : "offen"
            }`}
          />
          <Info label="Budget" value={campaign.budget ? `${campaign.budget.toLocaleString("de-DE")} €` : "nicht festgelegt"} />
          <Info label="Kanäle" value={campaign.channels} />
          {campaign.offer && <Info label="Angebot" value={campaign.offer} />}
        </CardContent>
      </Card>

      {!plan && (
        <Card>
          <CardContent className="p-6">
            {missingKey ? (
              <ConnectionNeeded description="Für die Plan-Generierung wird ein Anthropic API-Key benötigt. Trage ihn in .env.local ein." />
            ) : (
              <Button variant="gold" onClick={generatePlan} disabled={generating} className="w-full">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Kampagnenplan generieren
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {plan && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Funnel-Logik</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {plan.funnel.map((f, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold">{f.stage}</p>
                  <p className="mt-1 text-sm text-ink/80">{f.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content-Stücke pro Kanal</CardTitle>
              <CardDescription>Direkt als Entwurf ins Social Media Studio übernehmen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {plan.contentPieces.map((p, i) => (
                <div key={i} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2 text-xs text-muted">
                      <span className="rounded-full bg-sage/15 px-2 py-0.5 font-medium text-ink/80">{p.channel}</span>
                      <span>{p.format}</span>
                      <span>· {p.timing}</span>
                    </div>
                    <p className="text-sm text-ink">{p.concept}</p>
                  </div>
                  {(p.channel === "IG" || p.channel === "FB") &&
                    (addedPieces.has(i) ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-700">
                        <Check className="h-3.5 w-3.5" /> hinzugefügt
                      </span>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => addToStudio({ ...p, index: i })}>
                        <Plus className="h-3.5 w-3.5" /> Studio
                      </Button>
                    ))}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ad-Copy-Varianten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {plan.adCopyVariants.map((a, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <p className="mb-1 text-xs font-medium text-muted">{a.channel}</p>
                  <p className="text-sm font-medium text-ink">{a.headline}</p>
                  <p className="text-sm text-ink/70">{a.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Budgetverteilung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.budgetSplit.map((b, i) => (
                  <div key={i}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-ink">{b.channel}</span>
                      <span className="text-muted">{b.amountPct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-sage/15">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${b.amountPct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted">{b.reasoning}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>KPI-Ziele</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {plan.kpis.map((k, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-sage/5 px-3 py-2 text-sm">
                    <span className="text-ink">{k.metric}</span>
                    <span className="font-medium text-ink">{k.target}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-gold/40 bg-gold/5">
            <CardHeader>
              <CardTitle>Warum das konvertiert</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink/80">{plan.reasoning}</p>
            </CardContent>
          </Card>
        </>
      )}

      {campaign.posts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Verknüpfte Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {campaign.posts.map((post) => (
              <Link
                key={post.id}
                href={`/social/${post.id}`}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5 hover:bg-sage/5"
              >
                <span className="text-sm text-ink">{post.title}</span>
                <StatusBadge status={post.status} />
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

type CampaignPieceWithIndex = { channel: string; format: string; concept: string; timing: string; index: number };

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="text-ink">{value}</p>
    </div>
  );
}
