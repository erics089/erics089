import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt, TREATMENTS, PERSONAS } from "@/lib/brand";
import { generateWithSelfCritique, MissingApiKeyError } from "@/lib/anthropic";
import { getBrandConfig } from "@/lib/settings";
import type { CampaignPlan } from "@/lib/campaign-types";
import { formatDateDE } from "@/lib/utils";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const campaign = await prisma.campaign.findUnique({ where: { id: params.id } });
  if (!campaign) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  try {
    const brand = await getBrandConfig();
    const treatmentNames = campaign.treatments
      .split(",")
      .map((k) => TREATMENTS.find((t) => t.key === k)?.name ?? k)
      .join(", ");
    const persona = PERSONAS.find((p) => p.key === campaign.persona)?.name ?? campaign.persona;

    const system = buildSystemPrompt({
      extra: `
# AUFGABE
Erstelle einen vollständigen Kampagnenplan für MIRRA WELLNESS.

Gib AUSSCHLIESSLICH dieses JSON-Format zurück:
{
  "funnel": [{"stage": "Awareness|Consideration|Conversion|Retention", "description": "..."}],
  "contentPieces": [{"channel": "IG|FB|Meta Ads|Google Ads|E-Mail|WhatsApp", "format": "...", "concept": "1-2 Sätze Konzept", "timing": "z.B. Woche 1, Dienstag"}],
  "adCopyVariants": [{"channel": "Meta Ads|Google Ads", "headline": "...", "text": "..."}],
  "budgetSplit": [{"channel": "...", "amountPct": 0-100, "reasoning": "..."}],
  "kpis": [{"metric": "...", "target": "..."}],
  "reasoning": "2-3 Sätze: Warum dieser Plan aus Kundensicht konvertiert."
}
Erstelle 6-10 contentPieces über die gewählten Kanäle verteilt, 3-5 adCopyVariants, budgetSplit muss in Summe 100 ergeben und nur gewählte Kanäle mit Media-Budget enthalten (Meta Ads/Google Ads), 3-5 kpis passend zum Ziel.
`.trim(),
    });

    const userPrompt = `
Kampagnenname: ${campaign.name}
Ziel: ${campaign.goal}
Behandlung(en): ${treatmentNames}
Zeitraum: ${campaign.timeframeStart ? formatDateDE(campaign.timeframeStart) : "offen"} bis ${campaign.timeframeEnd ? formatDateDE(campaign.timeframeEnd) : "offen"}
Anlass: ${campaign.occasion || "kein spezieller Anlass"}
Budget gesamt: ${campaign.budget ? `${campaign.budget} €` : "nicht festgelegt"} (Monats-Ads-Budget-Obergrenze des Salons: ${brand.monthlyAdBudget} €)
Primäre Persona: ${persona}
Kanäle: ${campaign.channels}
Angebot/Mehrwert: ${campaign.offer || "kein spezielles Angebot"}
Asset-Strategie: ${campaign.assetStrategy === "generate" ? "Neue Bilder generieren" : "Bestehende Google-Drive-Assets nutzen"}
`.trim();

    const { result } = await generateWithSelfCritique<CampaignPlan>({
      system,
      userPrompt,
      maxTokens: 4096,
    });

    const updated = await prisma.campaign.update({
      where: { id: params.id },
      data: { planJson: JSON.stringify(result), status: "In Review" },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      return NextResponse.json({ error: "MISSING_KEY", message: err.message }, { status: 424 });
    }
    console.error(err);
    return NextResponse.json({ error: "GENERATION_FAILED", message: "Plan-Generierung fehlgeschlagen." }, { status: 500 });
  }
}
