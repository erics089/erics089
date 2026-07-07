"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { BrandConfig } from "@prisma/client";

export function BrandForm({ brand }: { brand: BrandConfig }) {
  const router = useRouter();
  const [form, setForm] = React.useState(brand);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/brand", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Markenkonfiguration</CardTitle>
        <CardDescription>
          Farben, Typografie und Kanäle — Änderungen wirken sofort in der gesamten App.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label>Primärfarbe</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.colorPrimary}
                onChange={(e) => setForm({ ...form, colorPrimary: e.target.value })}
                className="h-10 w-12 rounded-md border border-border"
              />
              <Input value={form.colorPrimary} onChange={(e) => setForm({ ...form, colorPrimary: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Sekundärfarbe</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.colorSecondary}
                onChange={(e) => setForm({ ...form, colorSecondary: e.target.value })}
                className="h-10 w-12 rounded-md border border-border"
              />
              <Input
                value={form.colorSecondary}
                onChange={(e) => setForm({ ...form, colorSecondary: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Akzentfarbe</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.colorAccent}
                onChange={(e) => setForm({ ...form, colorAccent: e.target.value })}
                className="h-10 w-12 rounded-md border border-border"
              />
              <Input value={form.colorAccent} onChange={(e) => setForm({ ...form, colorAccent: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Schrift Headings</Label>
            <Input
              value={form.fontHeading}
              onChange={(e) => setForm({ ...form, fontHeading: e.target.value })}
              placeholder="z.B. Cormorant Garamond"
            />
          </div>
          <div>
            <Label>Schrift Fließtext</Label>
            <Input
              value={form.fontBody}
              onChange={(e) => setForm({ ...form, fontBody: e.target.value })}
              placeholder="z.B. Inter"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Monatsbudget Ads (€)</Label>
            <Input
              type="number"
              value={form.monthlyAdBudget}
              onChange={(e) => setForm({ ...form, monthlyAdBudget: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Sprachen</Label>
            <Select value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })}>
              <option value="DE">DE</option>
              <option value="DE+EN">DE + EN</option>
            </Select>
          </div>
        </div>

        <div>
          <Label>Bild-/Video-Tools</Label>
          <Input
            value={form.imageVideoTools}
            onChange={(e) => setForm({ ...form, imageVideoTools: e.target.value })}
            placeholder="z.B. Higgsfield MCP, Midjourney, Runway"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label>SetMore-URL</Label>
            <Input value={form.setmoreUrl} onChange={(e) => setForm({ ...form, setmoreUrl: e.target.value })} />
          </div>
          <div>
            <Label>Instagram</Label>
            <Input
              value={form.instagramHandle}
              onChange={(e) => setForm({ ...form, instagramHandle: e.target.value })}
            />
          </div>
          <div>
            <Label>Facebook</Label>
            <Input
              value={form.facebookHandle}
              onChange={(e) => setForm({ ...form, facebookHandle: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving} variant="gold">
            {saving ? "Speichert…" : "Änderungen speichern"}
          </Button>
          {saved && <span className="text-sm text-emerald-700">Gespeichert.</span>}
        </div>
      </CardContent>
    </Card>
  );
}
