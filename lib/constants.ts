export const CAMPAIGN_STATUSES = [
  "Entwurf",
  "In Review",
  "Freigegeben",
  "Aktiv",
  "Beendet",
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const POST_STATUSES = ["Entwurf", "Review", "Freigegeben", "Veröffentlicht"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const AD_STATUSES = ["Entwurf", "Review", "Freigegeben"] as const;

export const CAMPAIGN_GOALS = [
  "Buchungen",
  "Gutscheinverkauf",
  "Markenbekanntheit",
  "Neueröffnung einer Behandlung",
  "Reaktivierung",
] as const;

export const CHANNELS = ["IG", "FB", "Meta Ads", "Google Ads", "E-Mail", "WhatsApp"] as const;

export const POST_TYPES = [
  { key: "feed", label: "Feed-Post" },
  { key: "carousel", label: "Carousel" },
  { key: "reel", label: "Reel-Skript" },
  { key: "story", label: "Story-Serie" },
] as const;

export const CALENDAR_CATEGORIES = [
  "Feiertag",
  "Saison",
  "Gesundheitstag",
  "Aktion",
  "Lokal",
] as const;

export const EMAIL_TYPES = [
  { key: "willkommen", label: "Willkommensserie" },
  { key: "gutschein", label: "Gutschein-Kampagne" },
  { key: "reaktivierung", label: "Reaktivierung („Wir vermissen dich”)" },
  { key: "newsletter", label: "Saisonaler Newsletter" },
] as const;

export const STATUS_COLORS: Record<string, string> = {
  Entwurf: "bg-stone-200 text-stone-700",
  "In Review": "bg-amber-100 text-amber-800",
  Review: "bg-amber-100 text-amber-800",
  Freigegeben: "bg-emerald-100 text-emerald-800",
  Aktiv: "bg-emerald-100 text-emerald-800",
  Veröffentlicht: "bg-sky-100 text-sky-800",
  Beendet: "bg-stone-300 text-stone-600",
};
