import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CHANNEL_TO_TYPE: Record<string, string> = {
  IG: "feed",
  FB: "feed",
};

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { channel, format, concept, timing } = body;

  const post = await prisma.post.create({
    data: {
      campaignId: params.id,
      type: CHANNEL_TO_TYPE[channel] ?? "feed",
      title: `${channel} · ${format}: ${String(concept).slice(0, 50)}`,
      language: "DE",
      status: "Entwurf",
      contentJson: JSON.stringify({
        activeLanguage: "DE",
        languages: {
          DE: {
            slides: [
              {
                role: "hook",
                headline: concept,
                body: `Geplant für: ${timing}`,
                imageBrief: "Bildkonzept im Social Media Studio ergänzen.",
              },
            ],
            captions: { short: concept, medium: concept, storytelling: concept },
            hashtags: [],
            bestTime: timing ?? "",
            reasoning: "Aus dem Kampagnenplan übernommen — bitte im Studio vervollständigen.",
          },
        },
      }),
    },
  });

  return NextResponse.json(post, { status: 201 });
}
