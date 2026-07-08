export type MetaAdSet = {
  name: string;
  targeting: { geoRadius: string; interests: string[]; lookalike: string };
  dailyBudget: number;
  ads: { headline: string; primaryText: string; creativeConcept: string }[];
};

export type MetaAdSpec = {
  objective: string;
  adSets: MetaAdSet[];
  budgetSuggestion: { dailyTotal: number; monthlyTotal: number; reasoning: string };
  reasoning: string;
};

export type GoogleAdGroup = {
  name: string;
  keywords: { keyword: string; matchType: "exact" | "phrase" | "broad" }[];
  headlines: string[];
  descriptions: string[];
};

export type GoogleAdSpec = {
  adGroups: GoogleAdGroup[];
  extensions: { sitelinks: string[]; callouts: string[]; structuredSnippets: string[] };
  geoTargeting: string;
  budgetSuggestion: { dailyTotal: number; monthlyTotal: number; reasoning: string };
  reasoning: string;
};

export function parseAdSpec<T>(raw: string): T {
  return JSON.parse(raw) as T;
}
