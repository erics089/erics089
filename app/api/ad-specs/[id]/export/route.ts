import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MetaAdSpec, GoogleAdSpec } from "@/lib/ads-types";

function metaToText(spec: MetaAdSpec): string {
  let out = `ZIEL: ${spec.objective}\n\n`;
  spec.adSets.forEach((set, i) => {
    out += `AD SET ${i + 1}: ${set.name}\n`;
    out += `Targeting: ${set.targeting.geoRadius} | Interessen: ${set.targeting.interests.join(", ")} | ${set.targeting.lookalike}\n`;
    out += `Tagesbudget: ${set.dailyBudget} €\n\n`;
    set.ads.forEach((ad, j) => {
      out += `  Ad ${j + 1}: ${ad.headline}\n  Text: ${ad.primaryText}\n  Creative: ${ad.creativeConcept}\n\n`;
    });
  });
  out += `BUDGET: ${spec.budgetSuggestion.dailyTotal} €/Tag · ${spec.budgetSuggestion.monthlyTotal} €/Monat\n${spec.budgetSuggestion.reasoning}\n\n`;
  out += `WARUM DAS KONVERTIERT\n${spec.reasoning}\n`;
  return out;
}

function googleToText(spec: GoogleAdSpec): string {
  let out = `GEO-TARGETING: ${spec.geoTargeting}\n\n`;
  spec.adGroups.forEach((group, i) => {
    out += `ANZEIGENGRUPPE ${i + 1}: ${group.name}\n`;
    out += `Keywords: ${group.keywords.map((k) => `${k.keyword} [${k.matchType}]`).join(", ")}\n\n`;
    out += `Headlines:\n${group.headlines.map((h, j) => `  ${j + 1}. ${h}`).join("\n")}\n\n`;
    out += `Descriptions:\n${group.descriptions.map((d, j) => `  ${j + 1}. ${d}`).join("\n")}\n\n`;
  });
  out += `Sitelinks: ${spec.extensions.sitelinks.join(" | ")}\n`;
  out += `Callouts: ${spec.extensions.callouts.join(" | ")}\n`;
  out += `Structured Snippets: ${spec.extensions.structuredSnippets.join(" | ")}\n\n`;
  out += `BUDGET: ${spec.budgetSuggestion.dailyTotal} €/Tag · ${spec.budgetSuggestion.monthlyTotal} €/Monat\n${spec.budgetSuggestion.reasoning}\n\n`;
  out += `WARUM DAS KONVERTIERT\n${spec.reasoning}\n`;
  return out;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const spec = await prisma.adSpec.findUnique({ where: { id: params.id } });
  if (!spec) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const parsed = JSON.parse(spec.specJson);
  const text = spec.platform === "META" ? metaToText(parsed) : googleToText(parsed);
  const header = `${spec.name}\nPlattform: ${spec.platform}\nStatus: ${spec.status}\n\n${"=".repeat(50)}\n\n`;

  return new NextResponse(header + text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${spec.name.replace(/[^a-z0-9äöüß]+/gi, "-")}.txt"`,
    },
  });
}
