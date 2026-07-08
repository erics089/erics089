import { NextResponse } from "next/server";
import JSZip from "jszip";
import { prisma } from "@/lib/prisma";
import { parsePostContent } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const parsed = parsePostContent(post.contentJson);
  const zip = new JSZip();

  for (const [lang, content] of Object.entries(parsed.languages)) {
    const folder = zip.folder(lang)!;

    const slidesText = content.slides
      .map((s, i) => `Slide ${i + 1} [${s.role}]\nHeadline: ${s.headline}\nText: ${s.body}\nBild-Prompt: ${s.imageBrief}\n`)
      .join("\n---\n\n");
    folder.file("slides.txt", slidesText);

    if (content.reelScenes?.length) {
      const reelText = content.reelScenes
        .map((s) => `Szene ${s.scene}\nRegie: ${s.direction}\nVoiceover: ${s.voiceover}\n`)
        .join("\n---\n\n");
      folder.file("reel-skript.txt", reelText);
    }

    const captionText = `KURZ\n${content.captions.short}\n\nMITTEL\n${content.captions.medium}\n\nSTORYTELLING\n${content.captions.storytelling}`;
    folder.file("captions.txt", captionText);

    folder.file("hashtags.txt", content.hashtags.join(" "));
    folder.file("meta.txt", `Bester Posting-Zeitpunkt: ${content.bestTime}\n\nWarum das konvertiert: ${content.reasoning}`);
  }

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${post.title.replace(/[^a-z0-9äöüß]+/gi, "-")}.zip"`,
    },
  });
}
