"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ConnectionNeeded } from "@/components/ui/empty-state";
import { AD_STATUSES } from "@/lib/constants";
import type { MetaAdSpec, GoogleAdSpec } from "@/lib/ads-types";
import type { AdSpec } from "@prisma/client";

export function AdSpecDetail({ spec }: { spec: AdSpec }) {
  const router = useRouter();
  const [status, setStatus] = React.useState(spec.status);
  const [busy, setBusy] = React.useState(false);
  const parsed = JSON.parse(spec.specJson) as MetaAdSpec | GoogleAdSpec;

  const currentIndex = AD_STATUSES.indexOf(status as (typeof AD_STATUSES)[number]);
  const nextStatus = AD_STATUSES[currentIndex + 1];

  async function updateStatus(next: string) {
    setBusy(true);
    const res = await fetch(`/api/ad-specs/${spec.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) setStatus(next);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/ads" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Zurück zum Ads Center
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl text-ink">{spec.name}</h1>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center gap-2">
          <a href={`/api/ad-specs/${spec.id}/export`} className="inline-flex">
            <Button size="sm" variant="outline">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </a>
          {nextStatus && (
            <Button size="sm" variant="gold" onClick={() => updateStatus(nextStatus)} disabled={busy}>
              Freigeben für „{nextStatus}”
            </Button>
          )}
        </div>
      </div>

      {spec.platform === "META" ? (
        <MetaView spec={parsed as MetaAdSpec} />
      ) : (
        <GoogleView spec={parsed as GoogleAdSpec} />
      )}

      {status === "Freigegeben" && (
        <ConnectionNeeded
          title="Direkte Erstellung via Marketing API"
          description="Sobald Meta-/Google-Ads-API-Keys in .env.local hinterlegt sind, kann diese Struktur direkt live geschaltet werden. Bis dahin: Export nutzen und manuell im jeweiligen Werbeanzeigenmanager anlegen."
        />
      )}
    </div>
  );
}

function MetaView({ spec }: { spec: MetaAdSpec }) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Ziel: {spec.objective}</CardTitle>
        </CardHeader>
      </Card>
      {spec.adSets.map((set, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>{set.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2 rounded-lg bg-sage/5 p-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-muted">Geo</p>
                <p className="text-ink">{set.targeting.geoRadius}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted">Interessen</p>
                <p className="text-ink">{set.targeting.interests.join(", ")}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted">Lookalike</p>
                <p className="text-ink">{set.targeting.lookalike}</p>
              </div>
            </div>
            <p className="text-sm text-muted">Tagesbudget: {set.dailyBudget} €</p>
            <div className="space-y-2">
              {set.ads.map((ad, j) => (
                <div key={j} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium text-ink">{ad.headline}</p>
                  <p className="text-sm text-ink/70">{ad.primaryText}</p>
                  <p className="mt-1 text-xs italic text-muted">Creative: {ad.creativeConcept}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <BudgetAndReasoning budget={spec.budgetSuggestion} reasoning={spec.reasoning} />
    </>
  );
}

function GoogleView({ spec }: { spec: GoogleAdSpec }) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Geo-Targeting</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink/80">{spec.geoTargeting}</p>
        </CardContent>
      </Card>
      {spec.adGroups.map((group, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>{group.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {group.keywords.map((k, j) => (
                <span key={j} className="rounded-full bg-sage/15 px-2 py-0.5 text-xs text-ink/80">
                  {k.keyword} <span className="text-muted">[{k.matchType}]</span>
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted">Headlines ({group.headlines.length})</p>
                <ul className="space-y-0.5 text-sm text-ink/90">
                  {group.headlines.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted">Descriptions ({group.descriptions.length})</p>
                <ul className="space-y-0.5 text-sm text-ink/90">
                  {group.descriptions.map((d, j) => (
                    <li key={j}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardHeader>
          <CardTitle>Erweiterungen</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ExtList label="Sitelinks" items={spec.extensions.sitelinks} />
          <ExtList label="Callouts" items={spec.extensions.callouts} />
          <ExtList label="Structured Snippets" items={spec.extensions.structuredSnippets} />
        </CardContent>
      </Card>
      <BudgetAndReasoning budget={spec.budgetSuggestion} reasoning={spec.reasoning} />
    </>
  );
}

function ExtList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase text-muted">{label}</p>
      <ul className="space-y-0.5 text-sm text-ink/90">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function BudgetAndReasoning({
  budget,
  reasoning,
}: {
  budget: { dailyTotal: number; monthlyTotal: number; reasoning: string };
  reasoning: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Budgetvorschlag</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-ink">
            {budget.dailyTotal} €/Tag · {budget.monthlyTotal} €/Monat
          </p>
          <p className="mt-1 text-sm text-muted">{budget.reasoning}</p>
        </CardContent>
      </Card>
      <Card className="border-gold/40 bg-gold/5">
        <CardHeader>
          <CardTitle>Warum das konvertiert</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink/80">{reasoning}</p>
        </CardContent>
      </Card>
    </div>
  );
}
