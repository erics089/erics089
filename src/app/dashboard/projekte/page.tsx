import Link from "next/link";
import { db } from "@/lib/db";
import { getAgencyContext } from "@/lib/agency-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const TYPE_LABELS: Record<string, string> = {
  WEBSITE: "Website",
  APP: "App",
  CAMPAIGN: "Kampagne",
  OTHER: "Sonstiges",
};

export default async function ProjektePage() {
  const ctx = await getAgencyContext();
  const projects = ctx
    ? await db.project.findMany({
        where: { agencyId: ctx.agencyId },
        include: { customer: true, status: true, tasks: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projekte</h1>
          <p className="text-muted-foreground">
            {projects.length} Projekt{projects.length === 1 ? "" : "e"}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projekte/neu">+ Neues Projekt</Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Noch keine Projekte angelegt.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const done = p.tasks.filter((t) => t.status === "DONE").length;
            return (
              <Link key={p.id} href={`/dashboard/projekte/${p.id}`}>
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardContent className="flex flex-col gap-2 p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{p.name}</span>
                      <Badge variant="secondary">{TYPE_LABELS[p.type] ?? p.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{p.customer.name}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{p.status.name}</span>
                      <span>
                        {done}/{p.tasks.length} Aufgaben erledigt
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
