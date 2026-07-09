"use client";

import * as React from "react";
import { Plus, Loader2, Sparkles, Download, Trash2, Mail } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ConnectionNeeded } from "@/components/ui/empty-state";
import { EMAIL_TYPES } from "@/lib/constants";
import { formatDateShortDE } from "@/lib/utils";
import type { EmailTemplate } from "@prisma/client";

export function EmailTab({ initial }: { initial: EmailTemplate[] }) {
  const [templates, setTemplates] = React.useState(initial);
  const [openGenerator, setOpenGenerator] = React.useState(false);
  const [preview, setPreview] = React.useState<EmailTemplate | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [missingKey, setMissingKey] = React.useState(false);
  const [form, setForm] = React.useState<{ type: string; occasion: string; language: string }>({
    type: EMAIL_TYPES[0].key,
    occasion: "",
    language: "DE",
  });

  async function generate() {
    setLoading(true);
    setMissingKey(false);
    const res = await fetch("/api/generate/email", {
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
      setTemplates((t) => [json, ...t]);
      setOpenGenerator(false);
      setPreview(json);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/email-templates/${id}`, { method: "DELETE" });
    setTemplates((t) => t.filter((x) => x.id !== id));
    setPreview(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <span onClick={() => setOpenGenerator(true)} className={buttonVariants({ variant: "gold", size: "sm" })}>
          <Plus className="h-3.5 w-3.5" /> Neue E-Mail generieren
        </span>
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <Mail className="h-5 w-5 text-ink/40" />
            <p className="text-sm text-muted">Noch keine E-Mail-Vorlagen generiert.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => (
          <Card key={t.id} className="cursor-pointer transition-shadow hover:shadow-soft" onClick={() => setPreview(t)}>
            <CardContent className="space-y-2 p-5">
              <span className="rounded-full bg-sage/15 px-2.5 py-0.5 text-xs font-medium text-ink/80">
                {EMAIL_TYPES.find((e) => e.key === t.type)?.label ?? t.type}
              </span>
              <p className="font-heading text-lg leading-snug text-ink">{t.subject}</p>
              <p className="text-xs text-muted">
                {t.language} · {formatDateShortDE(t.createdAt)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={openGenerator}
        onClose={() => setOpenGenerator(false)}
        title="Neue E-Mail generieren"
        description="Im Brand-Design, responsiv, mit CTA zu SetMore."
      >
        <div className="space-y-4">
          <div>
            <Label>Typ</Label>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {EMAIL_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Anlass / Kontext (optional)</Label>
            <Input value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })} />
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

      <Dialog open={!!preview} onClose={() => setPreview(null)} title={preview?.subject} className="max-w-2xl">
        {preview && (
          <div className="space-y-4">
            <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-border">
              <iframe srcDoc={preview.htmlBody} className="h-[60vh] w-full" title="E-Mail-Vorschau" />
            </div>
            <div className="flex items-center gap-2">
              <a href={`/api/email-templates/${preview.id}/export?format=html`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                <Download className="h-3.5 w-3.5" /> HTML
              </a>
              <a href={`/api/email-templates/${preview.id}/export?format=text`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                <Download className="h-3.5 w-3.5" /> Text
              </a>
              <Button size="sm" variant="ghost" onClick={() => remove(preview.id)}>
                <Trash2 className="h-3.5 w-3.5 text-red-600" />
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
