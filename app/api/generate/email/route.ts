import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt } from "@/lib/brand";
import { generateWithSelfCritique, MissingApiKeyError } from "@/lib/anthropic";
import { getBrandConfig } from "@/lib/settings";
import { buildEmailHtml, emailToPlainText, type EmailContent } from "@/lib/email-template";
import { EMAIL_TYPES } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, occasion, language } = body;
    const typeLabel = EMAIL_TYPES.find((t) => t.key === type)?.label ?? type;

    const system = buildSystemPrompt({
      extra: `
# AUFGABE
Erstelle den Copy-Inhalt für eine E-Mail vom Typ „${typeLabel}”.
Sprache: ${language === "EN" ? "Englisch" : "Deutsch"}

Gib AUSSCHLIESSLICH dieses JSON-Format zurück:
{
  "subject": "Betreffzeile, max. 60 Zeichen",
  "preheader": "Preheader-Text, max. 90 Zeichen",
  "headline": "Haupt-Überschrift der E-Mail",
  "paragraphs": ["2-4 Absätze als HTML-fähiger Text (nur <strong> erlaubt, keine anderen Tags)"],
  "ctaText": "Button-Text, einladend statt fordernd"
}
`.trim(),
    });

    const userPrompt = `Anlass/Kontext: ${occasion || "kein spezieller Anlass"}`;

    const { result } = await generateWithSelfCritique<EmailContent>({ system, userPrompt, maxTokens: 2048 });
    const brand = await getBrandConfig();

    const htmlBody = buildEmailHtml(result, brand);
    const textBody = emailToPlainText(result, brand);

    const template = await prisma.emailTemplate.create({
      data: {
        type,
        subject: result.subject,
        htmlBody,
        textBody,
        language: language ?? "DE",
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      return NextResponse.json({ error: "MISSING_KEY", message: err.message }, { status: 424 });
    }
    console.error(err);
    return NextResponse.json({ error: "GENERATION_FAILED", message: "Generierung fehlgeschlagen." }, { status: 500 });
  }
}
