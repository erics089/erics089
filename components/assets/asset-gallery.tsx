"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RefreshCw, Upload, Loader2, Trash2, Film, ImageIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ConnectionNeeded } from "@/components/ui/empty-state";
import { formatDateShortDE } from "@/lib/utils";

type Usage = { id: string; context: string | null; usedAt: string; post: { id: string; title: string } | null };
type AssetWithUsages = {
  id: string;
  filename: string;
  mimeType: string;
  previewUrl: string | null;
  tags: string;
  source: string;
  usages: Usage[];
};

export function AssetGallery({ initialAssets }: { initialAssets: AssetWithUsages[] }) {
  const router = useRouter();
  const [assets, setAssets] = React.useState(initialAssets);
  const [query, setQuery] = React.useState("");
  const [syncing, setSyncing] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [syncError, setSyncError] = React.useState<string | null>(null);
  const [missingConnection, setMissingConnection] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filtered = assets.filter(
    (a) =>
      a.filename.toLowerCase().includes(query.toLowerCase()) ||
      a.tags.toLowerCase().includes(query.toLowerCase())
  );

  async function refresh() {
    const res = await fetch("/api/assets");
    setAssets(await res.json());
  }

  async function syncDrive() {
    setSyncing(true);
    setSyncError(null);
    setMissingConnection(false);
    const res = await fetch("/api/assets/sync-drive", { method: "POST" });
    const json = await res.json();
    if (res.status === 424) {
      setMissingConnection(true);
    } else if (!res.ok) {
      setSyncError(json.message);
    } else {
      await refresh();
    }
    setSyncing(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    await fetch("/api/assets/upload", { method: "POST", body: form });
    await refresh();
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function updateTags(id: string, tags: string) {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, tags } : a)));
    await fetch(`/api/assets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
  }

  async function remove(id: string) {
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    setAssets((prev) => prev.filter((a) => a.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nach Dateiname oder Tag suchen…"
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={syncDrive} disabled={syncing}>
          {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Von Google Drive synchronisieren
        </Button>
        <Button
          variant="gold"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Hochladen
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
      </div>

      {missingConnection && (
        <ConnectionNeeded description="Für die Google-Drive-Synchronisierung muss unter Einstellungen ein MCP-Server vom Typ „Google Drive” eingerichtet werden." />
      )}
      {syncError && <p className="text-sm text-red-600">{syncError}</p>}

      {filtered.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <ImageIcon className="h-6 w-6 text-ink/40" />
            <p className="font-heading text-lg text-ink">Noch keine Assets</p>
            <p className="max-w-sm text-sm text-muted">
              Lade Bilder/Videos hoch oder synchronisiere die bestehende Google-Drive-Bibliothek.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {filtered.map((asset) => (
          <Card key={asset.id} className="overflow-hidden">
            <div className="flex aspect-square items-center justify-center bg-sage/10">
              {asset.previewUrl ? (
                asset.mimeType.startsWith("video/") ? (
                  <video src={asset.previewUrl} className="h-full w-full object-cover" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.previewUrl} alt={asset.filename} className="h-full w-full object-cover" />
                )
              ) : asset.mimeType.startsWith("video/") ? (
                <Film className="h-8 w-8 text-ink/30" />
              ) : (
                <ImageIcon className="h-8 w-8 text-ink/30" />
              )}
            </div>
            <CardContent className="space-y-2 p-3">
              <p className="truncate text-xs font-medium text-ink" title={asset.filename}>
                {asset.filename}
              </p>
              <input
                defaultValue={asset.tags}
                onBlur={(e) => updateTags(asset.id, e.target.value)}
                placeholder="Tags, kommagetrennt"
                className="w-full rounded border border-border bg-white/60 px-2 py-1 text-xs"
              />
              {asset.usages.length > 0 && (
                <div className="text-[10px] text-muted">
                  Zuletzt genutzt:{" "}
                  {asset.usages[0].post ? (
                    <Link href={`/social/${asset.usages[0].post.id}`} className="underline hover:text-ink">
                      {asset.usages[0].post.title}
                    </Link>
                  ) : (
                    asset.usages[0].context
                  )}{" "}
                  · {formatDateShortDE(asset.usages[0].usedAt)}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-sage/15 px-1.5 py-0.5 text-[10px] text-ink/70">{asset.source}</span>
                <button onClick={() => remove(asset.id)} className="text-muted hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
