# MIRRA Wellness — Marketing Command Center

Marketing-Steuerzentrale für **MIRRA WELLNESS**, Pasinger Straße 38a, 82152 Planegg.
Next.js 14 (App Router) + TypeScript + Tailwind + SQLite/Prisma, mit Anthropic als Content-Engine.

Alle Module funktionieren **ohne** externe API-Keys — sie zeigen dann einen eleganten
„Verbindung einrichten"-Hinweis statt abzustürzen. Sobald Keys in `.env.local` hinterlegt sind,
schalten sich die jeweiligen Features frei.

---

## 1. Setup

```bash
npm install
cp .env.example .env.local   # falls noch nicht geschehen
npm run db:push              # SQLite-Schema anlegen
npm run db:seed              # Aktionstage-Kalender befüllen (aktuelles + nächstes Jahr)
npm run dev                  # http://localhost:3000
```

Die Datei `.env` (ohne `.local`) enthält bereits den nicht-geheimen `DATABASE_URL`-Standardwert
und ist eingecheckt, damit `prisma`-Befehle direkt nach dem Klonen funktionieren. Alle
tatsächlichen Secrets gehören ausschließlich in `.env.local` (git-ignoriert).

### Build & Produktion

```bash
npm run build
npm start
```

### Docker (optional, für späteren Selbst-Hosting-Betrieb)

Ein einfaches `Dockerfile` liegt im Repo-Root bereit (`docker build -t mirra-command-center .`).
Für den produktiven Einsatz empfiehlt sich ein persistentes Volume für `prisma/dev.db` und
`public/uploads/`.

---

## 2. Wo bekommt Eric die API-Keys her?

Trage alle Keys in `.env.local` ein (Vorlage: `.env.example`). Ohne Key bleibt das jeweilige
Feature nutzbar, zeigt aber einen Hinweis statt der Live-Funktion.

| Key | Wofür | Wo bekommen |
|---|---|---|
| `ANTHROPIC_API_KEY` | Content-Engine (alle Text-/Ideengenerierung) | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| `META_APP_ID` / `META_APP_SECRET` / `META_ACCESS_TOKEN` / `META_PAGE_ID` / `META_IG_BUSINESS_ACCOUNT_ID` / `META_AD_ACCOUNT_ID` | Instagram/Facebook-Posting, Meta Ads | [developers.facebook.com/apps](https://developers.facebook.com/apps) — App anlegen, Instagram-Business-Konto mit einer Facebook-Seite verknüpfen, Graph-API-Explorer nutzen |
| `GOOGLE_ADS_DEVELOPER_TOKEN` / `GOOGLE_ADS_CLIENT_ID` / `GOOGLE_ADS_CLIENT_SECRET` / `GOOGLE_ADS_REFRESH_TOKEN` / `GOOGLE_ADS_CUSTOMER_ID` | Google Ads API | [ads.google.com/aw/apicenter](https://ads.google.com/aw/apicenter) für den Developer Token, [console.cloud.google.com](https://console.cloud.google.com) für den OAuth-Client |
| `GOOGLE_DRIVE_CLIENT_ID` / `GOOGLE_DRIVE_CLIENT_SECRET` / `GOOGLE_DRIVE_REFRESH_TOKEN` / `GOOGLE_DRIVE_FOLDER_ID` | Asset-Bibliothek (Drive-Sync) | [console.cloud.google.com](https://console.cloud.google.com) — OAuth-Client (Desktop) + Drive API aktivieren. Zusätzlich unter **Einstellungen → MCP-Server** einen Server vom Typ „Google Drive" mit dessen URL eintragen |
| `HIGGSFIELD_API_KEY` / `MIDJOURNEY_API_KEY` / `RUNWAY_API_KEY` | Bild-/Video-Generierung | Jeweiliges Anbieter-Dashboard. Server-URL ebenfalls unter **Einstellungen → MCP-Server** eintragen |
| `EMAIL_PROVIDER_API_KEY` / `EMAIL_FROM_ADDRESS` | Versand der generierten E-Mail-Vorlagen | Beliebiger Versanddienst (z.B. Postmark, Sendgrid, Brevo) — aktuell werden E-Mails als HTML/Text exportiert, der Versand ist als Schnittstelle vorbereitet |
| `WHATSAPP_BUSINESS_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp-Versand | [business.facebook.com/wa/manage](https://business.facebook.com/wa/manage) |

### MCP-Server (Google Drive, Higgsfield, weitere)

Unter **Einstellungen → MCP-Server** lassen sich beliebige MCP-Server per **Name + URL**
hinzufügen, testen und entfernen — ganz ohne Code-Änderung. Falls der Server einen API-Key
benötigt, wird der Name der ENV-Variable (z.B. `HIGGSFIELD_API_KEY`) hinterlegt; der Key selbst
bleibt in `.env.local`.

---

## 3. Wichtiger Hinweis: WhatsApp & DSGVO

Die im Modul **E-Mail & WhatsApp** generierten WhatsApp-Textbausteine dürfen **ausschließlich**
an Empfänger verschickt werden, die zuvor **ausdrücklich eingewilligt haben** (Opt-in), z.B. über
ein Double-Opt-in-Formular oder eine schriftliche Einverständniserklärung im Salon. Ein
Massenversand ohne Einwilligung verstößt gegen die DSGVO und die WhatsApp Business-Richtlinien.
Die App selbst versendet nichts automatisch — sie erstellt nur die Textvorlagen.

---

## 4. Architektur-Überblick

- **Next.js 14 App Router**, TypeScript, Tailwind CSS, handgebaute shadcn-artige UI-Komponenten
  (`components/ui`) — bewusst ohne Radix/shadcn-CLI, um volle Kontrolle über das Brand-Design zu behalten.
- **Prisma + SQLite** (`prisma/schema.prisma`) für Kampagnen, Posts, Kalender, Assets, MCP-Server,
  Ad-Spezifikationen und Kommunikationsvorlagen.
- **Markenkonfiguration** (`lib/brand.ts` für feste Wissensbasis, `BrandConfig`-Tabelle für
  editierbare Werte wie Farben/Fonts/Budget) wird serverseitig in `app/layout.tsx` als CSS-Variablen
  injiziert — Änderungen unter Einstellungen wirken ohne Neubau sofort.
- **Content-Engine** (`lib/anthropic.ts`): jede Generierung läuft über einen zweistufigen
  Selbstkritik-Loop (Entwurf → Prüfung gegen die Wording-Regeln → genau eine Überarbeitung),
  bevor das Ergebnis ausgeliefert wird.
- **MCP-Integrationsschicht** (`lib/mcp.ts`, `lib/google-drive-mcp.ts`): Server werden über die
  Datenbank verwaltet, Verbindungen nutzen `@modelcontextprotocol/sdk` mit Streamable-HTTP-Transport.
- **Freigabe-Workflows**: Kampagnen (Entwurf → In Review → Freigegeben → Aktiv → Beendet), Posts
  (Entwurf → Review → Freigegeben → Veröffentlicht) und Ad-Spezifikationen (Entwurf → Review →
  Freigegeben) — nichts geht ohne expliziten Klick live.

## 5. Module

| Modul | Pfad | Kurzbeschreibung |
|---|---|---|
| Dashboard | `/` | KPI-Überblick, Budget-Ampel, proaktive Aktionstag-Hinweise (21/7 Tage vorab) |
| Kampagnen-Manager | `/kampagnen` | Intake-Wizard (8 Kernfragen) → vollständiger KI-Kampagnenplan |
| Social Media Studio | `/social` | Carousel-/Reel-/Story-Generator, Freigabe-Workflow, Export, Meta-Publishing |
| Content-Kalender | `/kalender` | Aktionstage-Kalender, Drag-&-Drop-Planung, 22-Ideen-Generator |
| Ads Center | `/ads` | Meta-Ads- und Google-Ads-Strukturgenerator, Budget-Wächter |
| E-Mail & WhatsApp | `/kommunikation` | Markenkonforme E-Mail-Vorlagen, WhatsApp-Textbausteine |
| Asset-Bibliothek | `/assets` | Google-Drive-Sync, Upload, Tags, Verwendungshistorie |
| Einstellungen | `/einstellungen` | Markenkonfiguration, MCP-Server, API-Key-Status |

## 6. Datenbank zurücksetzen

```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```
