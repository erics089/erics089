"use client";

import * as React from "react";
import { Plus, Loader2, Sparkles, Copy, Trash2, MessageCircle, ShieldAlert, Check } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ConnectionNeeded } from "@/components/ui/empty-state";
import { formatDateShortDE } from "@/lib/utils";
import type { WhatsappTemplate } from "@prisma/client";

export function WhatsappTab({ initial }: { initial: WhatsappTemplate[] }) {
  const [templates, setTemplates] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [missingKey, setMissingKey] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ occasion: "", language: "DE" });

  async function generate() {
    setLoading(true);
    setMissingKey(false);
    const res = await fetch("/api/generate/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setLoading(false);
    if (res.status === 424) {
      setMissingKey(true);
      return;
    }
    if (res.ok) {
      setTemplates((t) => [...json, ...t]);
      setOpen(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/whatsapp-templates/${id}`, { method: "DELETE" });
    setTemplates((t) => t.filter((x) => x.id !== id));
  }

  async function copy(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="space-y-4">
      <Card className="border-amber-300 bg-amber-50">
        <CardContent className="flex items-start gap-3 p-4">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p className="text-xs text-amber-800">
            DSGVO-Hinweis: WhatsApp-Broadcasts dürfen ausschließlich an Empfänger mit ausdrücklicher
            Opt-in-Einwilligung versendet werden. Details siehe README.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <span onClick={() => setOpen(true)} className={buttonVariants({ variant: "gold", size: "sm" })}>
          <Plus className="h-3.5 w-3.5" /> Neue Vorlage generieren
        </span>
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <MessageCircle className="h-5 w-5 text-ink/40" />
            <p className="text-sm text-muted">Noch keine WhatsApp-Textbausteine generiert.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => (
          <Card key={t.id}>
            <CardContent className="space-y-2 p-5">
              <p className="text-xs font-medium text-muted">{t.title}</p>
              <p className="text-sm text-ink">{t.text}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted">{formatDateShortDE(t.createdAt)}</span>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" onClick={() => copy(t.id, t.text)}>
                    {copiedId === t.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(t.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="WhatsApp-Textbausteine generieren"
        description="3 kurze, persönliche Varianten."
      >
        <div className="space-y-4">
          <div>
            <Label>Anlass / Kontext</Label>
            <Input value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })} placeholder="z.B. Reaktivierung, Muttertag" />
          </div>
          <div>
            <Label>Sprache</Label>
            <Select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
              <option value="DE">Deutsch</option>
              <option value="EN">Englisch</option>
            </Select>
          </div>
          {missingKey && (
            <ConnectionNeeded description="Für die KI-Generierung wird ein Anthropic API-Key benötigt. Trage ihn in .env.local ein." />
          )}
          <Button variant="gold" onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generieren
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
