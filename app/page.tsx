import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDateDE, daysUntil } from "@/lib/utils";
import {
  CalendarClock,
  Megaphone,
  ClipboardCheck,
  Wallet,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getBrandConfig } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const in30Days = new Date(now);
  in30Days.setDate(now.getDate() + 30);

  const [postsThisWeek, activeCampaigns, upcomingDays, pendingPosts, pendingCampaigns, brand, adSpend, recentPosts] =
    await Promise.all([
      prisma.post.count({ where: { scheduledAt: { gte: weekStart, lt: weekEnd } } }),
      prisma.campaign.findMany({ where: { status: "Aktiv" }, orderBy: { updatedAt: "desc" }, take: 5 }),
      prisma.calendarEvent.findMany({
        where: { date: { gte: now, lte: in30Days } },
        orderBy: { date: "asc" },
        take: 8,
      }),
      prisma.post.count({ where: { status: { in: ["Entwurf", "Review"] } } }),
      prisma.campaign.count({ where: { status: "In Review" } }),
      getBrandConfig(),
      prisma.adSpec.aggregate({ _sum: { budget: true }, where: { status: "Freigegeben" } }),
      prisma.post.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    ]);

  const spend = adSpend._sum.budget ?? 0;
  const budgetPct = brand.monthlyAdBudget > 0 ? Math.min(100, Math.round((spend / brand.monthlyAdBudget) * 100)) : 0;

  const reminders = upcomingDays.filter((d) => {
    const diff = daysUntil(d.date);
    return diff === 21 || diff === 7 || (diff <= 7 && diff >= 0);
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Willkommen zurück"
        description="Ein ruhiger Überblick über alles, was diese Woche Aufmerksamkeit verdient."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Sparkles}
          label="Geplante Posts diese Woche"
          value={postsThisWeek}
          href="/social"
        />
        <KpiCard icon={Megaphone} label="Laufende Kampagnen" value={activeCampaigns.length} href="/kampagnen" />
        <KpiCard
          icon={CalendarClock}
          label="Aktionstage (30 Tage)"
          value={upcomingDays.length}
          href="/kalender"
        />
        <KpiCard
          icon={ClipboardCheck}
          label="Freigaben offen"
          value={pendingPosts + pendingCampaigns}
          href="/social"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Anstehende Aktionstage</CardTitle>
            <CardDescription>Die nächsten 30 Tage im Würmtal-Marketingkalender.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingDays.length === 0 && (
              <p className="rounded-lg border border-dashed border-sage/40 bg-sage/5 px-4 py-8 text-center text-sm text-muted">
                Noch keine Aktionstage geladen. Öffne den Content-Kalender, um ihn zu befüllen.
              </p>
            )}
            {upcomingDays.map((d) => {
              const diff = daysUntil(d.date);
              const highlighted = diff === 21 || diff === 7;
              return (
                <div
                  key={d.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-2.5 ${
                    highlighted ? "border-gold/50 bg-gold/10" : "border-border"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{d.title}</p>
                    <p className="text-xs text-muted">
                      {formatDateDE(d.date)} · {d.category}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-muted">
                    {diff === 0 ? "heute" : diff === 1 ? "morgen" : `in ${diff} Tagen`}
                  </span>
                </div>
              );
            })}
            <Link href="/kalender" className="inline-flex items-center gap-1 pt-2 text-sm font-medium text-ink hover:underline">
              Zum Content-Kalender <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Ads-Budget
            </CardTitle>
            <CardDescription>Monatsbudget: {brand.monthlyAdBudget.toLocaleString("de-DE")} €</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-sage/15">
              <div
                className={`h-full rounded-full ${budgetPct >= 100 ? "bg-red-500" : budgetPct >= 80 ? "bg-amber-500" : "bg-gold"}`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted">
              {spend.toLocaleString("de-DE")} € von {brand.monthlyAdBudget.toLocaleString("de-DE")} € verplant (
              {budgetPct}%)
            </p>
            <Link href="/ads" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ink hover:underline">
              Zum Ads Center <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {reminders.length > 0 && (
        <Card className="border-gold/40 bg-gold/5">
          <CardHeader>
            <CardTitle>Proaktive Hinweise</CardTitle>
            <CardDescription>21 bzw. 7 Tage vor Aktionstagen — jetzt Ideen generieren.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-white/60 px-4 py-2.5">
                <p className="text-sm text-ink">
                  <strong>{r.title}</strong> — {formatDateDE(r.date)}
                </p>
                <Link
                  href={`/kalender?event=${r.id}`}
                  className={buttonVariants({ variant: "gold", size: "sm" })}
                >
                  22 Ideen generieren
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Zuletzt bearbeitet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentPosts.length === 0 && (
            <p className="rounded-lg border border-dashed border-sage/40 bg-sage/5 px-4 py-8 text-center text-sm text-muted">
              Noch keine Posts erstellt. Starte im Social Media Studio.
            </p>
          )}
          {recentPosts.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5">
              <p className="text-sm text-ink">{p.title}</p>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-soft">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage/15 text-ink/80">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-2xl text-ink">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
