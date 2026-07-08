import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { IntakeWizard } from "@/components/campaigns/intake-wizard";
import { buttonVariants } from "@/components/ui/button";
import { Plus, Megaphone } from "lucide-react";
import { formatDateShortDE } from "@/lib/utils";
import { TREATMENTS } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function CampaignsPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status;
  const campaigns = await prisma.campaign.findMany({
    where: status ? { status } : {},
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { posts: true } } },
  });

  const filters = ["Entwurf", "In Review", "Freigegeben", "Aktiv", "Beendet"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kampagnen-Manager"
        description="Vom Intake-Wizard zum vollständigen Kampagnenplan — Funnel, Content, Ad-Copy und Budget in einem Schritt."
        action={
          <IntakeWizard
            trigger={
              <span className={buttonVariants({ variant: "gold" })}>
                <Plus className="h-4 w-4" /> Neue Kampagne
              </span>
            }
          />
        }
      />

      <div className="flex flex-wrap gap-2">
        <Link
          href="/kampagnen"
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${!status ? "bg-ink text-cream" : "bg-sage/10 text-ink/80 hover:bg-sage/20"}`}
        >
          Alle
        </Link>
        {filters.map((f) => (
          <Link
            key={f}
            href={`/kampagnen?status=${encodeURIComponent(f)}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              status === f ? "bg-ink text-cream" : "bg-sage/10 text-ink/80 hover:bg-sage/20"
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <Megaphone className="h-6 w-6 text-ink/40" />
            <p className="font-heading text-lg text-ink">Noch keine Kampagnen</p>
            <p className="max-w-sm text-sm text-muted">
              Starte den Intake-Wizard — die KI baut daraus einen vollständigen, freigabebereiten Plan.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((c) => (
          <Link key={c.id} href={`/kampagnen/${c.id}`}>
            <Card className="h-full transition-shadow hover:shadow-soft">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-sage/15 px-2.5 py-0.5 text-xs font-medium text-ink/80">{c.goal}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p className="font-heading text-lg leading-snug text-ink">{c.name}</p>
                <p className="text-xs text-muted">
                  {c.treatments
                    .split(",")
                    .map((k) => TREATMENTS.find((t) => t.key === k)?.name ?? k)
                    .join(", ")}
                </p>
                <div className="mt-auto flex items-center justify-between text-xs text-muted">
                  <span>{c._count.posts} Posts</span>
                  <span>{formatDateShortDE(c.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
