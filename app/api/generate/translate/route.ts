import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/brand";
import { generateWithSelfCritique, MissingApiKeyError } from "@/lib/anthropic";
import type { PostContent } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, targetLanguage } = body as { content: PostContent; targetLanguage: "DE" | "EN" };

    const system = buildSystemPrompt({
      extra: `
# AUFGABE
Übersetze/adaptiere den folgenden Social-Media-Content ins ${targetLanguage === "EN" ? "Englische" : "Deutsche"} — gleicher Ton, gleiche Dramaturgie, keine wörtliche Übersetzung sondern natürliche Adaption. Gib exakt die gleiche JSON-Struktur zurück wie im Input.
`.trim(),
    });

    const userPrompt = JSON.stringify(content);

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
    return NextResponse.json({ error: "GENERATION_FAILED", message: "Übersetzung fehlgeschlagen." }, { status: 500 });
  }
}
