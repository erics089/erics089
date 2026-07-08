import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishToInstagram, metaConfigured, MetaNotConfiguredError } from "@/lib/meta";
import { parsePostContent } from "@/lib/types";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!metaConfigured()) {
    return NextResponse.json({ error: "MISSING_KEY", message: "Meta Graph API ist nicht konfiguriert." }, { status: 424 });
  }
  const body = await req.json().catch(() => ({}));
  const imageUrl: string | undefined = body.imageUrl;
  if (!imageUrl) {
    return NextResponse.json(
      { error: "NO_IMAGE", message: "Für die direkte Veröffentlichung wird eine öffentlich erreichbare Bild-URL benötigt (Asset-Bibliothek)." },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const parsed = parsePostContent(post.contentJson);
  const content = parsed.languages[parsed.activeLanguage];
  const caption = `${content.captions.medium}\n\n${content.hashtags.join(" ")}`;

  try {
    const result = await publishToInstagram({ imageUrl, caption });
    const updated = await prisma.post.update({
      where: { id: params.id },
      data: { status: "Veröffentlicht", publishedAt: new Date() },
    });
    return NextResponse.json({ post: updated, metaId: result.id });
  } catch (err) {
    if (err instanceof MetaNotConfiguredError) {
      return NextResponse.json({ error: "MISSING_KEY", message: err.message }, { status: 424 });
    }
    return NextResponse.json(
      { error: "PUBLISH_FAILED", message: err instanceof Error ? err.message : "Veröffentlichung fehlgeschlagen." },
      { status: 500 }
    );
  }
}
