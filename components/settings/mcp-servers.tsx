"use client";

import * as React from "react";
import { Plus, Trash2, PlugZap, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { McpServer } from "@prisma/client";

export function McpServers({ initial }: { initial: McpServer[] }) {
  const [servers, setServers] = React.useState(initial);
  const [testing, setTesting] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ name: "", url: "", kind: "generic", apiKeyEnv: "" });
  const [adding, setAdding] = React.useState(false);

  async function addServer() {
    if (!form.name || !form.url) return;
    setAdding(true);
    const res = await fetch("/api/mcp-servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const created = await res.json();
    setServers((s) => [...s, created]);
    setForm({ name: "", url: "", kind: "generic", apiKeyEnv: "" });
    setAdding(false);
  }

  async function removeServer(id: string) {
    await fetch(`/api/mcp-servers/${id}`, { method: "DELETE" });
    setServers((s) => s.filter((srv) => srv.id !== id));
  }

  async function testServer(id: string) {
    setTesting(id);
    const res = await fetch(`/api/mcp-servers/${id}/test`, { method: "POST" });
    const updated = await res.json();
    setServers((s) => s.map((srv) => (srv.id === id ? updated : srv)));
    setTesting(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MCP-Server</CardTitle>
        <CardDescription>
          Google Drive, Higgsfield und weitere Tools werden hier per Name + URL angebunden — ohne
          Code-Änderung.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {servers.length === 0 && (
          <p className="rounded-lg border border-dashed border-sage/40 bg-sage/5 px-4 py-6 text-center text-sm text-muted">
            Noch keine MCP-Server konfiguriert.
          </p>
        )}
        <div className="space-y-2">
          {servers.map((srv) => (
            <div
              key={srv.id}
              className="flex flex-col gap-2 rounded-xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage/15 text-ink/70">
                  <PlugZap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{srv.name}</p>
                  <p className="text-xs text-muted">{srv.url}</p>
                  {srv.lastError && <p className="text-xs text-red-600">{srv.lastError}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {srv.status === "verbunden" && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> verbunden
                  </span>
                )}
                {srv.status === "fehler" && (
                  <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                    <XCircle className="h-3.5 w-3.5" /> Fehler
                  </span>
                )}
                {srv.status === "unbekannt" && (
                  <span className="text-xs font-medium text-muted">ungetestet</span>
                )}
                <Button size="sm" variant="outline" onClick={() => testServer(srv.id)} disabled={testing === srv.id}>
                  {testing === srv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Testen"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => removeServer(srv.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border p-4">
          <p className="mb-3 text-sm font-medium text-ink">Neuen MCP-Server hinzufügen</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="z.B. Google Drive"
              />
            </div>
            <div>
              <Label>Server-URL</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div>
              <Label>Typ</Label>
              <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                <option value="generic">Generisch</option>
                <option value="google-drive">Google Drive</option>
                <option value="image-gen">Bild-/Video-Generierung</option>
              </Select>
            </div>
            <div>
              <Label>ENV-Variable für API-Key (optional)</Label>
              <Input
                value={form.apiKeyEnv}
                onChange={(e) => setForm({ ...form, apiKeyEnv: e.target.value })}
                placeholder="z.B. HIGGSFIELD_API_KEY"
              />
            </div>
          </div>
          <Button className="mt-3" size="sm" variant="gold" onClick={addServer} disabled={adding}>
            <Plus className="h-3.5 w-3.5" /> Server hinzufügen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
