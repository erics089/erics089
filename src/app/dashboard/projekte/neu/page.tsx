import { db } from "@/lib/db";
import { getAgencyContext } from "@/lib/agency-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createProject } from "../actions";

const TYPES = [
  { value: "WEBSITE", label: "Website" },
  { value: "APP", label: "App" },
  { value: "CAMPAIGN", label: "Kampagne" },
  { value: "OTHER", label: "Sonstiges" },
];

export default async function NeuesProjektPage() {
  const ctx = await getAgencyContext();

  const [customers, statuses] = ctx
    ? await Promise.all([
        db.customer.findMany({ where: { agencyId: ctx.agencyId }, orderBy: { name: "asc" } }),
        db.projectStatusDefinition.findMany({
          where: { agencyId: ctx.agencyId },
          orderBy: { order: "asc" },
        }),
      ])
    : [[], []];

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Neues Projekt</CardTitle>
        <CardDescription>Projekt einem Kunden zuordnen und Status-Workflow starten.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createProject} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Projektname *</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="customerId">Kunde *</Label>
              <select
                id="customerId"
                name="customerId"
                required
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option value="">— auswählen —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Typ</Label>
              <select
                id="type"
                name="type"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="statusId">Start-Status *</Label>
              <select
                id="statusId"
                name="statusId"
                required
                defaultValue={statuses.find((s) => s.isDefault)?.id ?? statuses[0]?.id}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="budgetHours">Budget (Stunden)</Label>
              <Input id="budgetHours" name="budgetHours" type="number" min="0" step="0.5" />
            </div>
          </div>
          <Button type="submit" className="mt-2 self-start">
            Projekt anlegen
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
