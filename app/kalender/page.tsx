import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { MonthCalendar } from "@/components/calendar/month-grid";
import { AddEventDialog } from "@/components/calendar/add-event-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string; event?: string };
}) {
  const now = new Date();
  const year = searchParams.year ? Number(searchParams.year) : now.getFullYear();
  const month = searchParams.month ? Number(searchParams.month) : now.getMonth();

  const rangeStart = new Date(year, month, 1);
  const rangeEnd = new Date(year, month + 1, 1);

  const [events, posts] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: { date: { gte: rangeStart, lt: rangeEnd } },
      include: { ideas: true },
      orderBy: { date: "asc" },
    }),
    prisma.post.findMany({
      where: { scheduledAt: { gte: rangeStart, lt: rangeEnd } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content-Kalender"
        description="Aktionstage, Saisonfenster und geplante Posts — mit proaktiven Hinweisen 21 und 7 Tage vorab."
        action={
          <AddEventDialog
            trigger={
              <span className={buttonVariants({ variant: "outline" })}>
                <Plus className="h-4 w-4" /> Aktionstag hinzufügen
              </span>
            }
          />
        }
      />
      <MonthCalendar
        year={year}
        month={month}
        events={JSON.parse(JSON.stringify(events))}
        posts={JSON.parse(JSON.stringify(posts))}
        openEventId={searchParams.event}
      />
    </div>
  );
}
