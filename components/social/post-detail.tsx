"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Languages, Loader2, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { SlidePreview } from "@/components/social/slide-preview";
import { AssetPicker } from "@/components/social/asset-picker";
import { ConnectionNeeded } from "@/components/ui/empty-state";
import { parsePostContent, type PostContentJson } from "@/lib/types";
import { POST_STATUSES } from "@/lib/constants";
import type { Post } from "@prisma/client";

export function PostDetail({ post }: { post: Post }) {
  const router = useRouter();
  const [data, setData] = React.useState<PostContentJson>(() => parsePostContent(post.contentJson));
  const [activeLang, setActiveLang] = React.useState(data.activeLanguage);
  const [status, setStatus] = React.useState(post.status);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [publishError, setPublishError] = React.useState<string | null>(null);
  const [linkedImageUrl, setLinkedImageUrl] = React.useState<string | null>(null);

  const content = data.languages[activeLang];
  const otherLang = activeLang === "DE" ? "EN" : "DE";
  const hasOtherLang = Boolean(data.languages[otherLang]);

  async function updateStatus(next: string) {
    setBusy("status");
    const res = await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) setStatus(next);
    setBusy(null);
    router.refresh();
  }

  async function translate() {
    setBusy("translate");
    const res = await fetch("/api/generate/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, targetLanguage: otherLang }),
    });
    const json = await res.json();
    if (res.ok) {
      const newData = { ...data, languages: { ...data.languages, [otherLang]: json.content } };
      setData(newData);
      setActiveLang(otherLang);
      await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentJson: newData }),
      });
    }
    setBusy(null);
  }

  async function exportZip() {
    window.location.href = `/api/posts/${post.id}/export`;
  }

  async function publish() {
    setBusy("publish");
    setPublishError(null);
    const res = await fetch(`/api/posts/${post.id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: linkedImageUrl }),
    });
    const json = await res.json();
    if (!res.ok) {
      setPublishError(json.message || "Veröffentlichung fehlgeschlagen.");
    } else {
      setStatus("Veröffentlicht");
    }
    setBusy(null);
  }

  async function remove() {
    if (!confirm("Diesen Post wirklich löschen?")) return;
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    router.push("/social");
    router.refresh();
  }

  const currentIndex = POST_STATUSES.indexOf(status as (typeof POST_STATUSES)[number]);
  const nextStatus = POST_STATUSES[currentIndex + 1];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/social" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Zurück zum Studio
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl text-ink">{post.title}</h1>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center gap-2">
          {hasOtherLang ? (
            <Button size="sm" variant="outline" onClick={() => setActiveLang(otherLang)}>
              <Languages className="h-3.5 w-3.5" /> {otherLang}-Version anzeigen
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={translate} disabled={busy === "translate"}>
              {busy === "translate" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Languages className="h-3.5 w-3.5" />
              )}
              Auf {otherLang} übersetzen
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={exportZip}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" variant="ghost" onClick={remove}>
            <Trash2 className="h-3.5 w-3.5 text-red-600" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <SlidePreview content={content} />
        </CardContent>
      </Card>

      <AssetPicker postId={post.id} onLinked={setLinkedImageUrl} />

      <Card>
        <CardHeader>
          <CardTitle>Warum das konvertiert</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">{content.reasoning}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Freigabe-Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {POST_STATUSES.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div
                  className={`h-2 flex-1 rounded-full ${
                    i <= currentIndex ? "bg-gold" : "bg-sage/15"
                  }`}
                />
                {i < POST_STATUSES.length - 1 && <span className="text-xs text-muted">›</span>}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {status !== "Entwurf" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus(POST_STATUSES[Math.max(0, currentIndex - 1)])}
                disabled={busy === "status"}
              >
                Zurück zu {POST_STATUSES[Math.max(0, currentIndex - 1)]}
              </Button>
            )}
            {nextStatus && nextStatus !== "Veröffentlicht" && (
              <Button size="sm" variant="gold" onClick={() => updateStatus(nextStatus)} disabled={busy === "status"}>
                Freigeben für „{nextStatus}”
              </Button>
            )}
            {status === "Freigegeben" && (
              <Button size="sm" variant="gold" onClick={publish} disabled={busy === "publish"}>
                {busy === "publish" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Jetzt veröffentlichen
              </Button>
            )}
          </div>
          {publishError && (
            <ConnectionNeeded
              title="Direkte Veröffentlichung nicht möglich"
              description={publishError}
            />
          )}
          {status === "Freigegeben" && !publishError && (
            <p className="text-xs text-muted">
              Direkte Veröffentlichung benötigt Meta-API-Keys und ein gehostetes Bild-Asset. Alternativ: Export nutzen.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
