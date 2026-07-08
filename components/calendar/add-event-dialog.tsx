"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { CALENDAR_CATEGORIES } from "@/lib/constants";

export function AddEventDialog({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    date: "",
    category: "Lokal" as (typeof CALENDAR_CATEGORIES)[number],
    description: "",
  });

  async function save() {
    if (!form.title || !form.date) return;
    setSaving(true);
    await fetch("/api/calendar-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setOpen(false);
    setForm({ title: "", date: "", category: "Lokal", description: "" });
    router.refresh();
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog open={open} onClose={() => setOpen(false)} title="Aktionstag hinzufügen" description="Eigene lokale Events oder Anlässe im Würmtal ergänzen.">
        <div className="space-y-4">
          <div>
            <Label>Titel</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="z.B. Planegger Wiesnfest" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Datum</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <Label>Kategorie</Label>
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as (typeof CALENDAR_CATEGORIES)[number] })}
              >
                {CALENDAR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>Beschreibung (optional)</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <Button variant="gold" onClick={save} disabled={saving} className="w-full">
            {saving ? "Speichert…" : "Aktionstag speichern"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
