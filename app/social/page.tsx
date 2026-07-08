import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PostGeneratorDialog } from "@/components/social/post-generator-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Plus, Instagram, Facebook } from "lucide-react";
import { formatDateShortDE } from "@/lib/utils";
import { POST_TYPES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SocialStudioPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status;
  const posts = await prisma.post.findMany({
    where: status ? { status } : {},
    orderBy: { updatedAt: "desc" },
  });

  const filters = [
    { label: "Alle", value: undefined },
    { label: "Entwurf", value: "Entwurf" },
    { label: "Review", value: "Review" },
    { label: "Freigegeben", value: "Freigegeben" },
    { label: "Veröffentlicht", value: "Veröffentlicht" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Media Studio"
        description="Carousel-Slides, Reel-Skripte und Story-Serien — mit Freigabe-Workflow vor jeder Veröffentlichung."
        action={
          <PostGeneratorDialog
            trigger={
              <span className={buttonVariants({ variant: "gold" })}>
                <Plus className="h-4 w-4" /> Neuer Post
              </span>
            }
          />
        }
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/social?status=${encodeURIComponent(f.value)}` : "/social"}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              status === f.value ? "bg-ink text-cream" : "bg-sage/10 text-ink/80 hover:bg-sage/20"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <div className="flex gap-2 text-ink/40">
              <Instagram className="h-6 w-6" />
              <Facebook className="h-6 w-6" />
            </div>
            <p className="font-heading text-lg text-ink">Noch keine Posts</p>
            <p className="max-w-sm text-sm text-muted">
              Erstelle deinen ersten Post — die KI generiert Slides, Captions und Hashtags nach der
              MIRRA-Dramaturgie.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/social/${post.id}`}>
            <Card className="h-full transition-shadow hover:shadow-soft">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-sage/15 px-2.5 py-0.5 text-xs font-medium text-ink/80">
                    {POST_TYPES.find((t) => t.key === post.type)?.label ?? post.type}
                  </span>
                  <StatusBadge status={post.status} />
                </div>
                <p className="font-heading text-lg leading-snug text-ink">{post.title}</p>
                <div className="mt-auto flex items-center justify-between text-xs text-muted">
                  <span>{post.language}</span>
                  <span>{formatDateShortDE(post.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
