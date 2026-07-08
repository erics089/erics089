"use client";

import * as React from "react";
import Link from "next/link";
import { ImageIcon, Link2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Asset = { id: string; filename: string; previewUrl: string | null; mimeType: string };
type Usage = { asset: Asset } | null;

export function AssetPicker({ postId, onLinked }: { postId: string; onLinked?: (previewUrl: string | null) => void }) {
  const [usage, setUsage] = React.useState<Usage>(null);
  const [open, setOpen] = React.useState(false);
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    fetch(`/api/posts/${postId}/link-asset`)
      .then((r) => r.json())
      .then((u) => {
        setUsage(u);
        onLinked?.(u?.asset?.previewUrl ?? null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function openPicker() {
    setOpen(true);
    if (!loaded) {
      const res = await fetch("/api/assets");
      setAssets(await res.json());
      setLoaded(true);
    }
  }

  async function select(assetId: string) {
    const res = await fetch(`/api/posts/${postId}/link-asset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetId }),
    });
    const json = await res.json();
    setUsage(json);
    onLinked?.(json?.asset?.previewUrl ?? null);
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      {usage?.asset?.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={usage.asset.previewUrl} alt="" className="h-14 w-14 rounded object-cover" />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded bg-sage/10 text-ink/30">
          <ImageIcon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{usage?.asset ? usage.asset.filename : "Kein Bild-Asset verknüpft"}</p>
        <p className="text-xs text-muted">Für die direkte Veröffentlichung wird ein Asset benötigt.</p>
      </div>
      <Button size="sm" variant="outline" onClick={openPicker}>
        <Link2 className="h-3.5 w-3.5" /> Asset wählen
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Asset verknüpfen" className="max-w-2xl">
        {assets.length === 0 ? (
          <p className="text-sm text-muted">
            Keine Assets vorhanden.{" "}
            <Link href="/assets" className="underline">
              Zur Asset-Bibliothek
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {assets.map((a) => (
              <button
                key={a.id}
                onClick={() => select(a.id)}
                className="aspect-square overflow-hidden rounded-lg border border-border hover:border-gold"
              >
                {a.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.previewUrl} alt={a.filename} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-sage/10">
                    <ImageIcon className="h-5 w-5 text-ink/30" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </Dialog>
    </div>
  );
}
