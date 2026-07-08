// Berechnet die für MIRRA relevanten Aktionstage für ein gegebenes Jahr.
// Bewegliche Feiertage werden über den gaußschen Osteralgorithmus abgeleitet,
// alle anderen Termine sind feste Kalendertage bzw. Wochentagsregeln.

export type SeedEvent = {
  title: string;
  date: Date;
  category: "Feiertag" | "Saison" | "Gesundheitstag" | "Aktion" | "Lokal";
  recurring: boolean;
  description?: string;
};

function easterSunday(year: number): Date {
  // Gaußscher Osteralgorithmus (gregorianisch)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay();
  const offset = (weekday - firstWeekday + 7) % 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

function fridayOnOrBefore(date: Date): Date {
  const d = new Date(date);
  const diff = (d.getDay() - 5 + 7) % 7;
  return addDays(d, -diff);
}

function sundayOnOrBefore(date: Date): Date {
  const d = new Date(date);
  const diff = (d.getDay() - 0 + 7) % 7;
  return addDays(d, -diff);
}

export function buildActionDays(year: number): SeedEvent[] {
  const easter = easterSunday(year);
  const events: SeedEvent[] = [];

  const push = (
    title: string,
    date: Date,
    category: SeedEvent["category"],
    description?: string
  ) => events.push({ title, date, category, recurring: true, description });

  // Gesetzliche Feiertage Bayern
  push("Neujahr", new Date(year, 0, 1), "Feiertag");
  push("Heilige Drei Könige", new Date(year, 0, 6), "Feiertag");
  push("Karfreitag", addDays(easter, -2), "Feiertag");
  push("Ostermontag", addDays(easter, 1), "Feiertag");
  push("Tag der Arbeit", new Date(year, 4, 1), "Feiertag");
  push("Christi Himmelfahrt", addDays(easter, 39), "Feiertag", "In Deutschland zugleich Vatertag.");
  push("Pfingstmontag", addDays(easter, 50), "Feiertag");
  push("Fronleichnam", addDays(easter, 60), "Feiertag");
  push(
    "Mariä Himmelfahrt",
    new Date(year, 7, 15),
    "Feiertag",
    "Regionaler Feiertag in überwiegend katholischen bayerischen Gemeinden."
  );
  push("Tag der Deutschen Einheit", new Date(year, 9, 3), "Feiertag");
  push("Allerheiligen", new Date(year, 10, 1), "Feiertag");
  push("1. Weihnachtstag", new Date(year, 11, 25), "Feiertag");
  push("2. Weihnachtstag", new Date(year, 11, 26), "Feiertag");

  // Anlässe & Gesundheitstage
  push("Neujahrsvorsätze-Kampagnenstart", new Date(year, 0, 2), "Aktion", "Startschuss für Neujahrsvorsätze-Content (Selbstfürsorge statt Verzicht).");
  push("Valentinstag", new Date(year, 1, 14), "Aktion", "Geschenkgutschein-Anlass für Paare.");
  push("Weltschlaftag", fridayOnOrBefore(new Date(year, 2, 20)), "Gesundheitstag", "Freitag vor der Frühjahrs-Tagundnachtgleiche.");
  push("Tag der Rückengesundheit", new Date(year, 2, 15), "Gesundheitstag", "Passt ideal zu Neck Reset.");
  push("Frühjahrsmüdigkeit (Saisonstart)", new Date(year, 2, 1), "Saison", "Saisonales Erschöpfungsthema — Longevity/Infrarot-Content.");
  push("Weltgesundheitstag", new Date(year, 3, 7), "Gesundheitstag");
  push("Muttertag", nthWeekdayOfMonth(year, 4, 0, 2), "Aktion", "Wichtigster Gutschein-Anlass im Frühjahr.");
  push("Vatertag", addDays(easter, 39), "Aktion");
  push("Sommerferien Bayern (Beginn, ca.)", new Date(year, 6, 27), "Saison", "Ungefährer Beginn — bitte mit dem offiziellen bayerischen Ferienkalender abgleichen.");
  push("Internationaler Tag der Entspannung", new Date(year, 7, 15), "Gesundheitstag", "Kernbotschaft des Salons — MIRRA 8 Essentials in den Fokus stellen.");
  push("Slow Friday (Black-Friday-Alternative)", nthWeekdayOfMonth(year, 10, 5, 4), "Aktion", "Bewusste Entschleunigung statt Rabattschlacht.");
  const fourthAdvent = sundayOnOrBefore(new Date(year, 11, 24));
  push("Start Gutschein-Saison (1. Advent)", addDays(fourthAdvent, -21), "Saison", "Beginn der wichtigsten Geschenkgutschein-Phase des Jahres.");
  push("Heiligabend", new Date(year, 11, 24), "Saison");
  push("Silvester", new Date(year, 11, 31), "Saison");

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}
