import { NextResponse } from "next/server";
import { buildSystemPrompt, TREATMENTS, PERSONAS } from "@/lib/brand";
import { generateWithSelfCritique, MissingApiKeyError } from "@/lib/anthropic";
import type { PostContent } from "@/lib/types";

const SLIDE_INSTRUCTIONS: Record<string, string> = {
  feed: "Ein einzelner Feed-Post: 1 Slide mit starkem Hook-Visual und komprimierter Botschaft (Hook+Pain+Lösung in einem Bild/Text), plus vollständige Caption in der Dramaturgie.",
  carousel:
    "Ein Carousel mit 5-7 Slides in der Dramaturgie: Hook-Slide, Pain-Slide, 1-2 Lösungs-Slides (MIRRA-Erlebnis sensorisch), Proof-Slide (Social Proof), CTA-Slide.",
  reel: "Ein Reel-Skript: 4-6 Szenen mit Regieanweisung (visuell) und Voiceover-Text je Szene, zusätzlich 1 zusammenfassender Slide-Eintrag für die Cover-Vorschau (role: hook).",
  story: "Eine Story-Serie: 4-6 aufeinanderfolgende Story-Slides, kurz und unmittelbar, mit CTA-Sticker-Idee im letzten Slide.",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postType, treatmentKey, personaKey, occasion, language, campaignContext } = body;

    const treatment = TREATMENTS.find((t) => t.key === treatmentKey);
    const persona = PERSONAS.find((p) => p.key === personaKey);

    const system = buildSystemPrompt({
      extra: `
# AUFGABE
Erstelle Social-Media-Content für Instagram/Facebook.
Format: ${postType} — ${SLIDE_INSTRUCTIONS[postType] ?? SLIDE_INSTRUCTIONS.feed}
Sprache der Ausgabe: ${language === "EN" ? "Englisch (gleicher Ton, gleiche Regeln)" : "Deutsch"}
${campaignContext ? `Kampagnen-Kontext: ${campaignContext}` : ""}

Gib AUSSCHLIESSLICH folgendes JSON-Format zurück (keine Erklärungen):
{
  "slides": [{"role": "hook|pain|solution|proof|cta", "headline": "...", "body": "...", "imageBrief": "kurzer, konkreter Bildkonzept-Prompt für ein Bild-Tool"}],
  "reelScenes": [{"scene": 1, "direction": "...", "voiceover": "..."}]  // nur bei Format "reel", sonst weglassen
  "captions": {"short": "...", "medium": "...", "storytelling": "..."},
  "hashtags": ["#PlaneggWellness", "#MünchenWest", "..."],
  "bestTime": "z.B. Dienstag 18:00 Uhr — Begründung in Klammern",
  "reasoning": "1-2 Sätze: Warum das aus Kundensicht konvertiert."
}
`.trim(),
    });

    const userPrompt = `
Behandlung im Fokus: ${treatment ? `${treatment.name} — ${treatment.description}` : "keine spezifische, salon-allgemein"}
Ziel-Persona: ${persona ? `${persona.name} — ${persona.description}` : "breite Zielgruppe"}
Anlass/Kontext: ${occasion || "kein spezieller Anlass"}
`.trim();

    const { result } = await generateWithSelfCritique<PostContent>({
      system,
      userPrompt,
      maxTokens: 3000,
    });

    return NextResponse.json({ content: result });
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      return NextResponse.json({ error: "MISSING_KEY", message: err.message }, { status: 424 });
    }
    console.error(err);
    return NextResponse.json({ error: "GENERATION_FAILED", message: "Generierung fehlgeschlagen." }, { status: 500 });
  }
}
