import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt, TREATMENTS, CATCHMENT_AREA } from "@/lib/brand";
import { generateWithSelfCritique, MissingApiKeyError } from "@/lib/anthropic";
import type { GoogleAdSpec } from "@/lib/ads-types";

const DEFAULT_SEEDS = [
  "Massage Planegg",
  "Massage München West",
  "Infrarot Massage München",
  "Hot Stone Gräfelfing",
  "Geschenkgutschein Massage München",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { treatmentKey, seedKeywords, budget, campaignId } = body;

    const treatment = TREATMENTS.find((t) => t.key === treatmentKey);
    const seeds: string[] = seedKeywords?.length ? seedKeywords : DEFAULT_SEEDS;

    const system = buildSystemPrompt({
      extra: `
# AUFGABE
Erstelle eine Google-Ads-Struktur mit Keyword-Recherche und RSA-Texten (Responsive Search Ads).
Einzugsgebiet für Geo-Targeting: ${CATCHMENT_AREA}

Gib AUSSCHLIESSLICH dieses JSON-Format zurück:
{
  "adGroups": [
    {
      "name": "...",
      "keywords": [{"keyword": "...", "matchType": "exact|phrase|broad"}],
      "headlines": ["genau 15 Headlines, je max. 30 Zeichen, premium formuliert, kein Rabatt-Geschrei"],
      "descriptions": ["genau 4 Descriptions, je max. 90 Zeichen"]
    }
  ],
  "extensions": {"sitelinks": ["...", "..."], "callouts": ["...", "..."], "structuredSnippets": ["...", "..."]},
  "geoTargeting": "Radius-Beschreibung um Planegg",
  "budgetSuggestion": {"dailyTotal": Zahl, "monthlyTotal": Zahl, "reasoning": "..."},
  "reasoning": "2-3 Sätze: Warum das konvertiert."
}
Erstelle 2-4 Anzeigengruppen basierend auf den Seed-Keywords, jede mit erweiterten Keyword-Vorschlägen (long-tail, lokal).
`.trim(),
    });

    const userPrompt = `
Seed-Keywords: ${seeds.join(", ")}
Behandlung im Fokus: ${treatment ? treatment.name : "salon-allgemein"}
Verfügbares Budget: ${budget ? `${budget} €/Monat` : "vom Modell vorschlagen"}
`.trim();

    const { result } = await generateWithSelfCritique<GoogleAdSpec>({ system, userPrompt, maxTokens: 4096 });

    const adSpec = await prisma.adSpec.create({
      data: {
        platform: "GOOGLE",
        campaignId: campaignId || null,
        name: `Google Ads — ${treatment?.name ?? seeds[0]}`,
        budget: result.budgetSuggestion?.monthlyTotal ?? null,
        specJson: JSON.stringify(result),
        status: "Entwurf",
      },
    });

    return NextResponse.json(adSpec, { status: 201 });
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      return NextResponse.json({ error: "MISSING_KEY", message: err.message }, { status: 424 });
    }
    console.error(err);
    return NextResponse.json({ error: "GENERATION_FAILED", message: "Generierung fehlgeschlagen." }, { status: 500 });
  }
}
