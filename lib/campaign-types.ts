export type CampaignPlan = {
  funnel: { stage: string; description: string }[];
  contentPieces: { channel: string; format: string; concept: string; timing: string }[];
  adCopyVariants: { channel: string; headline: string; text: string }[];
  budgetSplit: { channel: string; amountPct: number; reasoning: string }[];
  kpis: { metric: string; target: string }[];
  reasoning: string;
};

export function parseCampaignPlan(raw: string | null): CampaignPlan | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CampaignPlan;
  } catch {
    return null;
  }
}
