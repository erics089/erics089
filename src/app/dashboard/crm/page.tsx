import Link from "next/link";
import { db } from "@/lib/db";
import { getAgencyContext } from "@/lib/agency-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const STAGE_LABELS: Record<string, string> = {
  LEAD: "Lead",
  PROPOSAL: "Angebot",
  WON: "Gewonnen",
  ACTIVE: "Aktiv",
  ARCHIVED: "Archiv",
};

export default async function CrmPage() {
  const ctx = await getAgencyContext();
  const customers = ctx
    ? await db.customer.findMany({
        where: { agencyId: ctx.agencyId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Kundenverwaltung</h1>
          <p className="text-muted-foreground">
            {customers.length} Kunde{customers.length === 1 ? "" : "n"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/crm/pipeline">Pipeline</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/crm/neu">+ Neuer Kunde</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              Noch keine Kunden angelegt.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Branche</th>
                  <th className="px-6 py-3 font-medium">Standort</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-accent/50">
                    <td className="px-6 py-3">
                      <Link
                        href={`/dashboard/crm/${c.id}`}
                        className="font-medium hover:underline"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {c.industry ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {c.location ?? "—"}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant="secondary">
                        {STAGE_LABELS[c.pipelineStage] ?? c.pipelineStage}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
