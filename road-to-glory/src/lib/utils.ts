import type { GoalCategory } from "./types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Resolve an Avatar gradient seed into two hex stops. */
export function avatarGradient(seed: string): [string, string] {
  const palettes: Record<string, [string, string]> = {
    "gold-01": ["#3a2f16", "#0c0c0e"],
    "gold-02": ["#2b2733", "#0c0c0e"],
    "gold-03": ["#122a24", "#0c0c0e"],
    "gold-04": ["#301c22", "#0c0c0e"],
    "gold-05": ["#22222a", "#0c0c0e"],
    "gold-06": ["#2c2416", "#0c0c0e"],
  };
  return palettes[seed] ?? ["#22222a", "#0c0c0e"];
}

/** Event hero gradients (no external imagery — pure CSS art). */
export function eventGradient(key: string): string {
  const map: Record<string, string> = {
    carbon:
      "radial-gradient(120% 140% at 20% 0%, #2a2a30 0%, #101014 45%, #050506 100%)",
    harbour:
      "radial-gradient(120% 140% at 80% 0%, #14202b 0%, #0a1017 45%, #050506 100%)",
    aurora:
      "radial-gradient(120% 140% at 50% 0%, #1c2620 0%, #0e1512 45%, #050506 100%)",
    alpine:
      "radial-gradient(120% 140% at 30% 0%, #1e2128 0%, #0f1114 45%, #050506 100%)",
  };
  return map[key] ?? map.carbon;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString("en-GB", opts ?? { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string, now: Date = new Date()) {
  const diff = (now.getTime() - new Date(iso).getTime()) / 1000;
  const days = Math.floor(diff / 86400);
  if (days <= 0) {
    const hours = Math.floor(diff / 3600);
    if (hours <= 0) return "just now";
    return `${hours}h ago`;
  }
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function formatScore(n: number) {
  return n.toLocaleString("en-US");
}

const categoryAccents: Record<GoalCategory, string> = {
  Business: "◈",
  Wealth: "◆",
  Health: "⚡",
  Relationships: "❖",
  Mindset: "▲",
  Legacy: "✦",
  Impact: "◉",
  "Personal Mastery": "◇",
};

export function categoryGlyph(cat: GoalCategory) {
  return categoryAccents[cat] ?? "◆";
}
