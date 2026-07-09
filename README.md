# MIRRA Wellness — Marketing Command Center

Marketing-Steuerzentrale für **MIRRA WELLNESS**, Pasinger Straße 38a, 82152 Planegg.
Next.js 14 (App Router) + TypeScript + Tailwind + Postgres/Prisma, mit Anthropic als Content-Engine.

Als **installierbare iOS-App (PWA)** nutzbar — siehe Abschnitt 3. Alle Module funktionieren
**ohne** externe API-Keys — sie zeigen dann einen eleganten „Verbindung einrichten"-Hinweis statt
abzustürzen. API-Keys lassen sich direkt in der App unter **Einstellungen** eintragen (landen
sicher in der Datenbank) — eine Server-Konsole oder `.env.local`-Zugriff sind dafür nicht nötig.

---

## 1. Lokales Setup

```bash
npm install
cp .env.example .env.local   # DATABASE_URL + ggf. weitere Keys eintragen
npm run db:push              # Postgres-Schema anlegen
npm run db:seed              # Aktionstage-Kalender befüllen (aktuelles + nächstes Jahr)
npm run dev                  # http://localhost:3000
```

Für `DATABASE_URL` reicht ein kostenloses [Neon](https://neon.tech)-Projekt (Postgres,
serverless, kein Server-Setup nötig — "Connection string" kopieren, in `.env.local` eintragen).
Alle übrigen Keys können auch später direkt in der laufenden App unter **Einstellungen → API-Keys**
eingetragen werden statt in `.env.local`.

### Build & Produktion

```bash
npm run build
npm start
```

### Docker (optional, für Selbst-Hosting)

```bash
docker build -t mirra-command-center .
docker run -e DATABASE_URL=postgresql://... -p 3000:3000 mirra-command-center
```

---

## 2. Wo bekommt Eric die API-Keys her?

Am einfachsten direkt in der App: **Einstellungen → API-Keys** → Key eintragen → „Speichern".
Alternativ funktionieren weiterhin Umgebungsvariablen in `.env.local` (Vorlage: `.env.example`) —
ein in der App eingetragener Key hat Vorrang. Ohne Key bleibt das jeweilige Feature nutzbar, zeigt
aber einen Hinweis statt der Live-Funktion.

| Key | Wofür | Wo bekommen |
|---|---|---|
| `ANTHROPIC_API_KEY` | Content-Engine (alle Text-/Ideengenerierung) | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| `META_APP_ID` / `META_APP_SECRET` / `META_ACCESS_TOKEN` / `META_PAGE_ID` / `META_IG_BUSINESS_ACCOUNT_ID` / `META_AD_ACCOUNT_ID` | Instagram/Facebook-Posting, Meta Ads | [developers.facebook.com/apps](https://developers.facebook.com/apps) — App anlegen, Instagram-Business-Konto mit einer Facebook-Seite verknüpfen, Graph-API-Explorer nutzen |
| `GOOGLE_ADS_DEVELOPER_TOKEN` / `GOOGLE_ADS_CLIENT_ID` / `GOOGLE_ADS_CLIENT_SECRET` / `GOOGLE_ADS_REFRESH_TOKEN` / `GOOGLE_ADS_CUSTOMER_ID` | Google Ads API | [ads.google.com/aw/apicenter](https://ads.google.com/aw/apicenter) für den Developer Token, [console.cloud.google.com](https://console.cloud.google.com) für den OAuth-Client |
| `GOOGLE_DRIVE_CLIENT_ID` / `GOOGLE_DRIVE_CLIENT_SECRET` / `GOOGLE_DRIVE_REFRESH_TOKEN` / `GOOGLE_DRIVE_FOLDER_ID` | Asset-Bibliothek (Drive-Sync) | [console.cloud.google.com](https://console.cloud.google.com) — OAuth-Client (Desktop) + Drive API aktivieren. Zusätzlich unter **Einstellungen → MCP-Server** einen Server vom Typ „Google Drive" mit dessen URL eintragen |
| `HIGGSFIELD_API_KEY` / `MIDJOURNEY_API_KEY` / `RUNWAY_API_KEY` | Bild-/Video-Generierung | Jeweiliges Anbieter-Dashboard. Server-URL ebenfalls unter **Einstellungen → MCP-Server** eintragen |
| `EMAIL_PROVIDER_API_KEY` / `EMAIL_FROM_ADDRESS` | Versand der generierten E-Mail-Vorlagen | Beliebiger Versanddienst (z.B. Postmark, Sendgrid, Brevo) — aktuell werden E-Mails als HTML/Text exportiert, der Versand ist als Schnittstelle vorbereitet |
| `WHATSAPP_BUSINESS_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp-Versand | [business.facebook.com/wa/manage](https://business.facebook.com/wa/manage) |
| `BLOB_READ_WRITE_TOKEN` | Datei-Uploads in der Asset-Bibliothek, wenn auf Vercel gehostet | [vercel.com/docs/storage/vercel-blob](https://vercel.com/docs/storage/vercel-blob) — nur nötig auf Vercel, siehe Abschnitt 3 |

### MCP-Server (Google Drive, Higgsfield, weitere)

Unter **Einstellungen → MCP-Server** lassen sich beliebige MCP-Server per **Name + URL**
hinzufügen, testen und entfernen — ganz ohne Code-Änderung. Falls der Server einen API-Key
benötigt, wird der Name der zugehörigen Variable (z.B. `HIGGSFIELD_API_KEY`) hinterlegt; der Key
selbst wird ebenfalls unter **Einstellungen → API-Keys** eingetragen.

---

## 3. Als iOS-App installieren (PWA)

Die App ist eine Progressive Web App: einmal deployed, lässt sie sich auf dem iPhone/iPad wie eine
native App installieren (eigenes Icon, Vollbild ohne Browserleiste). Weil dieses Projekt in einer
Cloud-Sandbox entwickelt wurde und nicht direkt auf deinem Gerät läuft, muss es zunächst irgendwo
öffentlich erreichbar deployed werden — empfohlen: **Vercel**, kostenlos für diesen Einsatzzweck.

### Schritt 1 — Postgres-Datenbank anlegen

1. Auf [neon.tech](https://neon.tech) kostenlos registrieren, neues Projekt anlegen.
2. Den „Connection string" kopieren (Format `postgresql://user:pass@host/db?sslmode=require`).

### Schritt 2 — Auf Vercel deployen

1. Repository auf GitHub pushen (bereits geschehen, falls du aus diesem Branch arbeitest).
2. Auf [vercel.com/new](https://vercel.com/new) einloggen, das Repository importieren.
3. Als Umgebungsvariable **mindestens** `DATABASE_URL` (aus Schritt 1) eintragen. Alle anderen Keys
   (Anthropic etc.) lassen sich bequem später direkt in der App unter **Einstellungen → API-Keys**
   ergänzen — nicht zwingend schon beim Deploy nötig.
4. Deploy klicken. Nach dem ersten erfolgreichen Deploy einmalig das Datenbankschema anlegen:
   ```bash
   npx dotenv -e .env.local -- prisma db push    # lokal mit der Neon-URL in .env.local
   npx dotenv -e .env.local -- tsx prisma/seed.ts
   ```
   (Alternativ: `DATABASE_URL=<neon-url> npx prisma db push` direkt in der Kommandozeile.)
5. Optional, aber empfohlen für die Asset-Bibliothek: unter Vercel → Storage → **Blob** einen Store
   anlegen und den Token als `BLOB_READ_WRITE_TOKEN` in den Vercel-Umgebungsvariablen **oder** später
   in der App unter Einstellungen hinterlegen. Ohne diesen Token funktionieren Uploads lokal, aber
   nicht zuverlässig auf Vercel (dessen Dateisystem ist pro Funktionsaufruf ephemer).

### Schritt 3 — Auf dem iPhone installieren

1. Die Vercel-URL (z.B. `https://mirra-command-center.vercel.app`) in **Safari** auf dem iPhone öffnen
   — wichtig: nur Safari unterstützt „Zum Home-Bildschirm" mit vollem PWA-Verhalten auf iOS.
2. Teilen-Symbol antippen (Quadrat mit Pfeil nach oben) → **„Zum Home-Bildschirm"**.
3. Name bestätigen (Standard: „MIRRA") → **„Hinzufügen"**.
4. Ab jetzt startet ein Tap auf das Icon die App im Vollbild, ohne Safari-Adressleiste.
5. Beim ersten Start unter **Einstellungen → API-Keys** den Anthropic-Key (und optional weitere)
   eintragen — ab dann ist die App direkt vom iPhone aus voll nutzbar.

---

## 4. Wichtiger Hinweis: WhatsApp & DSGVO

Die im Modul **E-Mail & WhatsApp** generierten WhatsApp-Textbausteine dürfen **ausschließlich**
an Empfänger verschickt werden, die zuvor **ausdrücklich eingewilligt haben** (Opt-in), z.B. über
ein Double-Opt-in-Formular oder eine schriftliche Einverständniserklärung im Salon. Ein
Massenversand ohne Einwilligung verstößt gegen die DSGVO und die WhatsApp Business-Richtlinien.
Die App selbst versendet nichts automatisch — sie erstellt nur die Textvorlagen.

---

## 5. Architektur-Überblick

- **Next.js 14 App Router**, TypeScript, Tailwind CSS, handgebaute shadcn-artige UI-Komponenten
  (`components/ui`) — bewusst ohne Radix/shadcn-CLI, um volle Kontrolle über das Brand-Design zu behalten.
- **Prisma + Postgres** (`prisma/schema.prisma`) für Kampagnen, Posts, Kalender, Assets, MCP-Server,
  Ad-Spezifikationen, Kommunikationsvorlagen und API-Keys.
- **API-Keys direkt in der App** (`lib/secrets.ts`): jeder Key wird zuerst in der Datenbank gesucht,
  fällt sonst auf die gleichnamige Umgebungsvariable zurück — funktioniert also sowohl klassisch
  per `.env.local` als auch komplett über die Oberfläche (z.B. von der iOS-PWA aus).
- **Datei-Uploads** (`lib/storage.ts`): nutzt Vercel Blob, sobald `BLOB_READ_WRITE_TOKEN` gesetzt
  ist, sonst lokales Dateisystem unter `public/uploads` (nur für Self-Hosting zuverlässig).
- **Markenkonfiguration** (`lib/brand.ts` für feste Wissensbasis, `BrandConfig`-Tabelle für
  editierbare Werte wie Farben/Fonts/Budget) wird serverseitig in `app/layout.tsx` als CSS-Variablen
  injiziert — Änderungen unter Einstellungen wirken ohne Neubau sofort.
- **Content-Engine** (`lib/anthropic.ts`): jede Generierung läuft über einen zweistufigen
  Selbstkritik-Loop (Entwurf → Prüfung gegen die Wording-Regeln → genau eine Überarbeitung),
  bevor das Ergebnis ausgeliefert wird.
- **MCP-Integrationsschicht** (`lib/mcp.ts`, `lib/google-drive-mcp.ts`): Server werden über die
  Datenbank verwaltet, Verbindungen nutzen `@modelcontextprotocol/sdk` mit Streamable-HTTP-Transport.
- **PWA** (`public/manifest.json`, `public/sw.js`, `components/pwa-register.tsx`): installierbar auf
  iOS/Android, Safe-Area-Handling für Notch/Home-Indicator, minimaler Service Worker cached nur
  statische Icons — nie Seiten- oder API-Daten, damit in der App nie veraltete Inhalte erscheinen.
- **Freigabe-Workflows**: Kampagnen (Entwurf → In Review → Freigegeben → Aktiv → Beendet), Posts
  (Entwurf → Review → Freigegeben → Veröffentlicht) und Ad-Spezifikationen (Entwurf → Review →
  Freigegeben) — nichts geht ohne expliziten Klick live.

## 6. Module

| Modul | Pfad | Kurzbeschreibung |
|---|---|---|
| Dashboard | `/` | KPI-Überblick, Budget-Ampel, proaktive Aktionstag-Hinweise (21/7 Tage vorab) |
| Kampagnen-Manager | `/kampagnen` | Intake-Wizard (8 Kernfragen) → vollständiger KI-Kampagnenplan |
| Social Media Studio | `/social` | Carousel-/Reel-/Story-Generator, Freigabe-Workflow, Export, Meta-Publishing |
| Content-Kalender | `/kalender` | Aktionstage-Kalender, Drag-&-Drop-Planung, 22-Ideen-Generator |
| Ads Center | `/ads` | Meta-Ads- und Google-Ads-Strukturgenerator, Budget-Wächter |
| E-Mail & WhatsApp | `/kommunikation` | Markenkonforme E-Mail-Vorlagen, WhatsApp-Textbausteine |
| Asset-Bibliothek | `/assets` | Google-Drive-Sync, Upload, Tags, Verwendungshistorie |
| Einstellungen | `/einstellungen` | API-Keys, Markenkonfiguration, MCP-Server |

## 7. Datenbank zurücksetzen

```bash
# Vorsicht: löscht alle Daten in der verbundenen Postgres-Datenbank
npm run db:push
npm run db:seed
```
