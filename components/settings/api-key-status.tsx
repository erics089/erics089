import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getIntegrationStatuses } from "@/lib/integrations";

export function ApiKeyStatus() {
  const integrations = getIntegrationStatuses();
  return (
    <Card>
      <CardHeader>
        <CardTitle>API-Key-Status</CardTitle>
        <CardDescription>
          Keys werden ausschließlich in <code className="rounded bg-sage/15 px-1">.env.local</code> gepflegt.
          Fehlende Keys lassen Features nie abstürzen — betroffene Module zeigen einen Hinweis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {integrations.map((i) => (
          <div key={i.key} className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5">
            <div>
              <p className="text-sm font-medium text-ink">{i.label}</p>
              <p className="text-xs text-muted">Doku: {i.docsHint}</p>
            </div>
            {i.status === "verbunden" && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" /> verbunden
              </span>
            )}
            {i.status === "unvollständig" && (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" /> unvollständig
              </span>
            )}
            {i.status === "fehlt" && (
              <span className="flex items-center gap-1 text-xs font-medium text-muted">
                <XCircle className="h-3.5 w-3.5" /> fehlt
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
