import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SicherheitPage() {
  const session = await auth();
  const agencyId = session?.user.memberships?.[0]?.agencyId;

  const auditLogs = agencyId
    ? await db.auditLog.findMany({
        where: { agencyId },
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Sicherheit & Compliance</CardTitle>
            <Badge variant="secondary">Phase 0 / 5</Badge>
          </div>
          <CardDescription>
            In Phase 0 bereits umgesetzt: Passwort-Hashing (bcrypt), TOTP-2FA-Scaffold,
            granulares RBAC pro Modul, mandantengetrennte Datenisolation (agency_id +
            Query-Scoping) und ein vollständiges Audit-Log. Rate-Limiting, CSRF-Härtung
            und der DSGVO-Datenexport folgen in Phase 5.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit-Log (letzte 20 Einträge)</CardTitle>
          <CardDescription>
            Nur für deine Agentur sichtbar — Mandantentrennung wird auf DB-Ebene erzwungen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Einträge vorhanden.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Aktion</th>
                    <th className="py-2 pr-4 font-medium">Benutzer</th>
                    <th className="py-2 font-medium">Zeitpunkt</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-mono text-xs">{log.action}</td>
                      <td className="py-2 pr-4">{log.user?.name ?? "System"}</td>
                      <td className="py-2 text-muted-foreground">
                        {log.createdAt.toLocaleString("de-DE")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
