import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBrandConfig } from "@/lib/settings";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { AdSpecGenerator } from "@/components/ads/ad-spec-generator";
import { buttonVariants } from "@/components/ui/button";
import { Plus, Target, AlertTriangle } from "lucide-react";
import { formatDateShortDE } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdsCenterPage() {
  const [metaSpecs, googleSpecs, brand, budgetAgg] = await Promise.all([
    prisma.adSpec.findMany({ where: { platform: "META" }, orderBy: { createdAt: "desc" } }),
    prisma.adSpec.findMany({ where: { platform: "GOOGLE" }, orderBy: { createdAt: "desc" } }),
    getBrandConfig(),
    prisma.adSpec.aggregate({ _sum: { budget: true }, where: { status: { in: ["Freigegeben"] } } }),
  ]);

  const committedSpend = budgetAgg._sum.budget ?? 0;
  const overBudget = committedSpend > brand.monthlyAdBudget;
  const budgetPct = brand.monthlyAdBudget > 0 ? Math.round((committedSpend / brand.monthlyAdBudget) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ads Center"
        description="Meta Ads und Google Ads — Kampagnenstruktur, Targeting und Ad-Copy als exportierbare Spezifikation."
      />

      <Card className={overBudget ? "border-red-300 bg-red-50" : "border-border"}>
        <CardContent className="flex items-center gap-4 p-5">
          {overBudget && <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />}
          <div className="flex-1">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-ink">Budget-Wächter (freigegebene Anzeigen)</span>
              <span className={overBudget ? "font-semibold text-red-700" : "text-muted"}>
                {committedSpend.toLocaleString("de-DE")} € / {brand.monthlyAdBudget.toLocaleString("de-DE")} €
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-sage/15">
              <div
                className={`h-full rounded-full ${overBudget ? "bg-red-500" : budgetPct >= 80 ? "bg-amber-500" : "bg-gold"}`}
                style={{ width: `${Math.min(100, budgetPct)}%` }}
              />
            </div>
            {overBudget && (
              <p className="mt-1.5 text-xs text-red-700">
                Das Monatsbudget ist überschritten. Prüfe freigegebene Spezifikationen, bevor weitere live gehen.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <PlatformSection
        title="Meta Ads (Instagram + Facebook)"
        specs={metaSpecs}
        trigger={
          <AdSpecGenerator
            platform="META"
            trigger={
              <span className={buttonVariants({ variant: "gold", size: "sm" })}>
                <Plus className="h-3.5 w-3.5" /> Meta-Ads-Struktur generieren
              </span>
            }
          />
        }
      />

      <PlatformSection
        title="Google Ads"
        specs={googleSpecs}
        trigger={
          <AdSpecGenerator
            platform="GOOGLE"
            trigger={
              <span className={buttonVariants({ variant: "gold", size: "sm" })}>
                <Plus className="h-3.5 w-3.5" /> Google-Ads-Struktur generieren
              </span>
            }
          />
        }
      />
    </div>
  );
}

function PlatformSection({
  title,
  specs,
  trigger,
}: {
  title: string;
  specs: { id: string; name: string; status: string; budget: number | null; createdAt: Date }[];
  trigger: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl text-ink">{title}</h2>
        {trigger}
      </div>
      {specs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
            <Target className="h-5 w-5 text-ink/40" />
            <p className="text-sm text-muted">Noch keine Struktur generiert.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {specs.map((spec) => (
            <Link key={spec.id} href={`/ads/${spec.id}`}>
              <Card className="h-full transition-shadow hover:shadow-soft">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <StatusBadge status={spec.status} />
                    <span className="text-xs text-muted">{formatDateShortDE(spec.createdAt)}</span>
                  </div>
                  <p className="font-heading text-lg leading-snug text-ink">{spec.name}</p>
                  {spec.budget && <p className="text-xs text-muted">{spec.budget.toLocaleString("de-DE")} €/Monat</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
