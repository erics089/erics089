import Anthropic from "@anthropic-ai/sdk";
import { TONALITY_RULES } from "./brand";

export class MissingApiKeyError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY fehlt");
    this.name = "MissingApiKeyError";
  }
}

let client: Anthropic | null = null;

function getClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new MissingApiKeyError();
  if (!client) client = new Anthropic({ apiKey: key });
  return client;
}

export function anthropicConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

/**
 * Generiert JSON-Content mit eingebautem Selbstkritik-Loop (Punkt [7]):
 * 1) Entwurf generieren
 * 2) Entwurf gegen die Wording-Regeln prüfen und genau einmal verbessern
 */
export async function generateWithSelfCritique<T = unknown>(params: {
  system: string;
  userPrompt: string;
  maxTokens?: number;
}): Promise<{ result: T; raw: string }> {
  const anthropic = getClient();
  const maxTokens = params.maxTokens ?? 4096;

  const draftMsg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: params.system,
    messages: [{ role: "user", content: params.userPrompt }],
  });
  const draftText = draftMsg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");

  const critiquePrompt = `
Hier ist dein erster Entwurf:

${draftText}

Prüfe diesen Entwurf jetzt selbstkritisch gegen folgende Wording-Regeln:
${TONALITY_RULES}

Verbessere den Entwurf GENAU EINMAL, falls nötig (falsche Tonalität, verbotene Formulierungen, fehlende Sensorik, schwacher CTA, fehlender Empathie-Bogen). Gib ausschließlich das finale, verbesserte JSON-Ergebnis zurück — gleiche Struktur wie im Entwurf, kein Markdown-Codefence, kein Kommentar.
`.trim();

  const finalMsg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: params.system,
    messages: [
      { role: "user", content: params.userPrompt },
      { role: "assistant", content: draftText },
      { role: "user", content: critiquePrompt },
    ],
  });
  const finalText = finalMsg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");

  const jsonStr = extractJson(finalText);
  try {
    return { result: JSON.parse(jsonStr) as T, raw: finalText };
  } catch {
    // Fallback: falls das Modell trotz Anweisung kein reines JSON liefert,
    // versuchen wir den Entwurf zu parsen.
    const draftJson = extractJson(draftText);
    return { result: JSON.parse(draftJson) as T, raw: draftText };
  }
}

export async function generateText(params: {
  system: string;
  userPrompt: string;
  maxTokens?: number;
}): Promise<string> {
  const anthropic = getClient();
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: params.maxTokens ?? 2048,
    system: params.system,
    messages: [{ role: "user", content: params.userPrompt }],
  });
  return msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
}
