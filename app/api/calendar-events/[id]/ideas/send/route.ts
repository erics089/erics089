import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FORMAT_TO_POST_TYPE: Record<string, string> = {
  Post: "feed",
  Story: "story",
  Reel: "reel",
  Aktion: "feed",
  Kooperation: "feed",
};

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const ideaIds: string[] = body.ideaIds ?? [];
  if (ideaIds.length === 0) {
    return NextResponse.json({ error: "Keine Ideen ausgewählt." }, { status: 400 });
  }

  const ideas = await prisma.actionDayIdea.findMany({ where: { id: { in: ideaIds }, calendarEventId: params.id } });

  const posts = await prisma.$transaction(
    ideas.map((idea) =>
      prisma.post.create({
        data: {
          type: FORMAT_TO_POST_TYPE[idea.format] ?? "feed",
          title: `${idea.format}: ${idea.concept.slice(0, 60)}`,
          language: "DE",
          status: "Entwurf",
          ideaId: idea.id,
          contentJson: JSON.stringify({
            activeLanguage: "DE",
            languages: {
              DE: {
                slides: [
                  {
                    role: "hook",
                    headline: idea.concept,
                    body: "Aus Aktionstag-Idee übernommen — im Social Media Studio vervollständigen.",
                    imageBrief: "Noch offen — bitte Bildkonzept ergänzen.",
                  },
                ],
                captions: { short: idea.concept, medium: idea.concept, storytelling: idea.concept },
                hashtags: [],
                bestTime: "",
                reasoning: `Idee mit Conversion-Einschätzung ${idea.conversionScore}/5 aus dem Aktionstage-Planer.`,
              },
            },
          }),
        },
      })
    )
  );

  return NextResponse.json(posts, { status: 201 });
}
