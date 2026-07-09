import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt } from "@/lib/brand";
import { generateWithSelfCritique, MissingApiKeyError } from "@/lib/anthropic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { occasion, language } = body;

    const system = buildSystemPrompt({
      extra: `
# AUFGABE
Erstelle 3 kurze, persönliche WhatsApp-Broadcast-Textbausteine (KEINE E-Mail-Sprache, direkt und warm wie eine persönliche Nachricht, max. 3-4 Sätze, ohne Emoji-Ketten).
Sprache: ${language === "EN" ? "Englisch" : "Deutsch"}

Gib AUSSCHLIESSLICH dieses JSON-Format zurück:
{"variants": [{"label": "Kurz|Persönlich|Mit Anlass-Bezug", "text": "..."}]}
Genau 3 Varianten.
`.trim(),
    });

    const userPrompt = `Anlass/Kontext: ${occasion || "allgemeine Ansprache"}`;

    const { result } = await generateWithSelfCritique<{ variants: { label: string; text: string }[] }>({
      system,
      userPrompt,
      maxTokens: 1024,
    });

    const created = await prisma.$transaction(
      result.variants.map((v) =>
        prisma.whatsappTemplate.create({
          data: {
            title: `${occasion || "Broadcast"} — ${v.label}`,
            text: v.text,
            language: language ?? "DE",
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
    return NextResponse.json({ error: "GENERATION_FAILED", message: "Generierung fehlgeschlagen." }, { status: 500 });
  }
}
