import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAgencyContext } from "@/lib/agency-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addContact, addNote, updateCustomerStage } from "../actions";

const STAGES = [
  { value: "LEAD", label: "Lead" },
  { value: "PROPOSAL", label: "Angebot" },
  { value: "WON", label: "Gewonnen" },
  { value: "ACTIVE", label: "Aktiv" },
  { value: "ARCHIVED", label: "Archiv" },
];

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getAgencyContext();
  if (!ctx) notFound();

  const customer = await db.customer.findFirst({
    where: { id, agencyId: ctx.agencyId },
    include: {
      contacts: { orderBy: { isPrimary: "desc" } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: true } },
      projects: { include: { status: true } },
    },
  });
  if (!customer) notFound();

  const updateStageWithId = updateCustomerStage.bind(null, customer.id);
  const addContactWithId = addContact.bind(null, customer.id);
  const addNoteWithId = addNote.bind(null, customer.id);

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <Link
          href="/dashboard/crm"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Kundenverwaltung
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{customer.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Stammdaten</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Branche</div>
              <div>{customer.industry ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Standort</div>
              <div>{customer.location ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Hauptansprechpartner</div>
              <div>{customer.contactPerson ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">E-Mail</div>
              <div>{customer.email ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Telefon</div>
              <div>{customer.phone ?? "—"}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline-Status</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateStageWithId} className="flex flex-col gap-3">
              <select
                name="stage"
                defaultValue={customer.pipelineStage}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm" variant="outline">
                Status aktualisieren
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ansprechpartner</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {customer.contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Ansprechpartner.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {customer.contacts.map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <span className="font-medium">{c.name}</span>
                  {c.role && <span className="text-muted-foreground">({c.role})</span>}
                  {c.isPrimary && <Badge variant="secondary">Primär</Badge>}
                  {c.email && (
                    <span className="text-muted-foreground">· {c.email}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          <form action={addContactWithId} className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="contact-name" className="text-xs">
                Name
              </Label>
              <Input id="contact-name" name="name" className="h-8 w-40" required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="contact-role" className="text-xs">
                Rolle
              </Label>
              <Input id="contact-role" name="role" className="h-8 w-32" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="contact-email" className="text-xs">
                E-Mail
              </Label>
              <Input id="contact-email" name="email" type="email" className="h-8 w-48" />
            </div>
            <Button type="submit" size="sm" variant="outline">
              Hinzufügen
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projekte</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Projekte.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {customer.projects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/dashboard/projekte/${p.id}`}
                    className="font-medium hover:underline"
                  >
                    {p.name}
                  </Link>{" "}
                  <span className="text-muted-foreground">— {p.status.name}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notizen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form action={addNoteWithId} className="flex flex-col gap-2">
            <Textarea name="body" placeholder="Neue Notiz…" required />
            <Button type="submit" size="sm" variant="outline" className="self-start">
              Notiz speichern
            </Button>
          </form>
          <ul className="flex flex-col gap-3">
            {customer.notes.map((n) => (
              <li key={n.id} className="rounded-md border p-3 text-sm">
                <p>{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {n.author?.name ?? "System"} · {n.createdAt.toLocaleString("de-DE")}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
