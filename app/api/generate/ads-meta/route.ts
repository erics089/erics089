import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt, TREATMENTS, PERSONAS, CATCHMENT_AREA } from "@/lib/brand";
import { generateWithSelfCritique, MissingApiKeyError } from "@/lib/anthropic";
import type { MetaAdSpec } from "@/lib/ads-types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { treatmentKey, personaKey, occasion, budget, campaignId, objective } = body;

    const treatment = TREATMENTS.find((t) => t.key === treatmentKey);
    const persona = PERSONAS.find((p) => p.key === personaKey);

    const system = buildSystemPrompt({
      extra: `
# AUFGABE
Erstelle eine Meta-Ads-Kampagnenstruktur (Kampagne → Ad Sets → Ads) für Instagram/Facebook.
Einzugsgebiet für Geo-Targeting: ${CATCHMENT_AREA}

Gib AUSSCHLIESSLICH dieses JSON-Format zurück:
{
  "objective": "z.B. Conversions (Buchungen) | Traffic | Awareness",
  "adSets": [
    {
      "name": "...",
      "targeting": {"geoRadius": "z.B. 10km um Planegg", "interests": ["...", "..."], "lookalike": "z.B. 1% Lookalike bestehender Kunden"},
      "dailyBudget": Zahl in Euro,
      "ads": [{"headline": "...", "primaryText": "...", "creativeConcept": "kurzes Bild-/Video-Konzept"}]
    }
  ],
  "budgetSuggestion": {"dailyTotal": Zahl, "monthlyTotal": Zahl, "reasoning": "..."},
  "reasoning": "2-3 Sätze: Warum das konvertiert."
}
Erstelle 2-3 Ad Sets mit je 3-5 Ads (Ad-Copy-Varianten + Creative-Konzepte).
`.trim(),
    });

    const userPrompt = `
Behandlung im Fokus: ${treatment ? treatment.name : "salon-allgemein"}
Ziel-Persona: ${persona ? persona.name : "breite Zielgruppe"}
Anlass: ${occasion || "kein spezieller Anlass"}
Kampagnenziel: ${objective || "Buchungen"}
Verfügbares Budget: ${budget ? `${budget} €/Monat` : "vom Modell vorschlagen"}
`.trim();

    const { result } = await generateWithSelfCritique<MetaAdSpec>({ system, userPrompt, maxTokens: 4096 });

    const adSpec = await prisma.adSpec.create({
      data: {
        platform: "META",
        campaignId: campaignId || null,
        name: `Meta Ads — ${treatment?.name ?? "Allgemein"}${occasion ? ` (${occasion})` : ""}`,
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
