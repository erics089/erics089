import Link from "next/link";
import { db } from "@/lib/db";
import { getAgencyContext } from "@/lib/agency-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StageSelect } from "@/components/stage-select";
import { updateCustomerStage } from "../actions";

const STAGES = [
  { value: "LEAD", label: "Lead" },
  { value: "PROPOSAL", label: "Angebot" },
  { value: "WON", label: "Gewonnen" },
  { value: "ACTIVE", label: "Aktiv" },
  { value: "ARCHIVED", label: "Archiv" },
] as const;

export default async function PipelinePage() {
  const ctx = await getAgencyContext();
  const customers = ctx
    ? await db.customer.findMany({
        where: { agencyId: ctx.agencyId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const byStage = Object.fromEntries(
    STAGES.map((s) => [s.value, customers.filter((c) => c.pipelineStage === s.value)])
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/crm" className="text-sm text-muted-foreground hover:underline">
          ← Kundenverwaltung
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Lead-Pipeline</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STAGES.map((stage) => (
          <div key={stage.value} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {stage.label} ({byStage[stage.value].length})
            </h2>
            <div className="flex flex-col gap-3">
              {byStage[stage.value].map((customer) => (
                <Card key={customer.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      <Link href={`/dashboard/crm/${customer.id}`} className="hover:underline">
                        {customer.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 text-xs text-muted-foreground">
                    {customer.industry ?? "—"}
                    <StageSelect
                      action={updateCustomerStage.bind(null, customer.id)}
                      defaultValue={customer.pipelineStage}
                      stages={STAGES}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
