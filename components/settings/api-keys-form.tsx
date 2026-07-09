"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Loader2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { INTEGRATIONS } from "@/lib/integrations";

type Status = "verbunden" | "unvollständig" | "fehlt";

export function ApiKeysForm({
  initialStatuses,
  initialMasked,
}: {
  initialStatuses: { key: string; status: Status }[];
  initialMasked: Record<string, string | null>;
}) {
  const [masked, setMasked] = React.useState(initialMasked);
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState<string | null>(null);

  function statusFor(integrationKey: string): Status {
    return initialStatuses.find((s) => s.key === integrationKey)?.status ?? "fehlt";
  }

  async function save(envVar: string) {
    const value = drafts[envVar] ?? "";
    if (!value) return;
    setSaving(envVar);
    const res = await fetch("/api/secrets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: envVar, value }),
    });
    const json = await res.json();
    setMasked((m) => ({ ...m, [envVar]: json.masked }));
    setDrafts((d) => ({ ...d, [envVar]: "" }));
    setSaving(null);
    setSaved(envVar);
    setTimeout(() => setSaved(null), 2000);
  }

  async function clear(envVar: string) {
    setSaving(envVar);
    await fetch("/api/secrets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: envVar, value: "" }),
    });
    setMasked((m) => ({ ...m, [envVar]: null }));
    setSaving(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API-Keys</CardTitle>
        <CardDescription>
          Direkt hier eintragen — die Keys landen sicher in der Datenbank und wirken sofort, auch
          wenn die App nur über die iOS-PWA bedient wird. Alternativ funktionieren weiterhin
          Umgebungsvariablen in <code className="rounded bg-sage/15 px-1">.env.local</code>; ein hier
          eingetragener Key hat Vorrang. Fehlende Keys lassen Features nie abstürzen — betroffene
          Module zeigen stattdessen einen Hinweis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {INTEGRATIONS.map((integration) => {
          const status = statusFor(integration.key);
          return (
            <div key={integration.key} className="rounded-xl border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{integration.label}</p>
                  <p className="text-xs text-muted">Doku: {integration.docsHint}</p>
                </div>
                <StatusPill status={status} />
              </div>
              <div className="space-y-2">
                {integration.envVars.map((envVar) => (
                  <div key={envVar} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label className="mb-1 text-xs text-muted">{envVar}</Label>
                      <Input
                        type="password"
                        value={drafts[envVar] ?? ""}
                        onChange={(e) => setDrafts((d) => ({ ...d, [envVar]: e.target.value }))}
                        placeholder={masked[envVar] ?? "nicht gesetzt"}
                      />
                    </div>
                    <div className="flex items-end gap-1 pb-0.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => save(envVar)}
                        disabled={saving === envVar || !drafts[envVar]}
                      >
                        {saving === envVar ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : saved === envVar ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          "Speichern"
                        )}
                      </Button>
                      {masked[envVar] && (
                        <Button size="sm" variant="ghost" onClick={() => clear(envVar)} disabled={saving === envVar}>
                          Entfernen
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: Status }) {
  if (status === "verbunden")
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> verbunden
      </span>
    );
  if (status === "unvollständig")
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5" /> unvollständig
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-muted">
      <XCircle className="h-3.5 w-3.5" /> fehlt
    </span>
  );
}
