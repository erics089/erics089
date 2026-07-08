import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt } from "@/lib/brand";
import { generateWithSelfCritique, MissingApiKeyError } from "@/lib/anthropic";
import { formatDateDE } from "@/lib/utils";

type IdeaResult = { format: string; concept: string; conversionScore: number };

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const ideas = await prisma.actionDayIdea.findMany({
    where: { calendarEventId: params.id },
    orderBy: { conversionScore: "desc" },
  });
  return NextResponse.json(ideas);
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const event = await prisma.calendarEvent.findUnique({ where: { id: params.id } });
  if (!event) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  try {
    const system = buildSystemPrompt({
      extra: `
# AUFGABE
Generiere genau 22 Content-Ideen für den Aktionstag „${event.title}” (${formatDateDE(event.date)}, Kategorie: ${event.category}).
Mische die Formate: Post, Story, Reel, Aktion (z.B. Sonderangebot/Event im Salon), Kooperation (z.B. mit Hansefit, lokalen Partnern).
Jede Idee braucht ein 1-Satz-Konzept und eine Conversion-Einschätzung von 1 (schwach) bis 5 (sehr stark).

Gib AUSSCHLIESSLICH dieses JSON-Format zurück:
{"ideas": [{"format": "Post|Story|Reel|Aktion|Kooperation", "concept": "1 prägnanter Satz", "conversionScore": 1-5}, ... genau 22 Einträge]}
`.trim(),
    });

    const { result } = await generateWithSelfCritique<{ ideas: IdeaResult[] }>({
      system,
      userPrompt: `Aktionstag: ${event.title}\nBeschreibung: ${event.description ?? "—"}`,
      maxTokens: 4096,
    });

    const created = await prisma.$transaction(
      result.ideas.slice(0, 22).map((idea) =>
        prisma.actionDayIdea.create({
          data: {
            calendarEventId: event.id,
            format: idea.format,
            concept: idea.concept,
            conversionScore: Math.min(5, Math.max(1, Math.round(idea.conversionScore))),
          },
        })
      )
    );

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      return NextResponse.json({ error: "MISSING_KEY", message: err.message }, { status: 424 });
    }
    console.error(err);
    return NextResponse.json({ error: "GENERATION_FAILED", message: "Ideen-Generierung fehlgeschlagen." }, { status: 500 });
  }
}
