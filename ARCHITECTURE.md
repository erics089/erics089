# ARCHITECTURE.md — AGENTUR-OS

Dieses Dokument beschreibt die Architekturentscheidungen für AGENTUR-OS. Es wird bei
jeder relevanten Änderung fortgeschrieben.

## 0. Status

**Phase 0 (Fundament)** ist abgeschlossen: Next.js-App-Shell, Multi-Tenant-DB-Schema,
Auth mit RBAC, Docker-Compose-Setup, i18n-Grundlage, Seed-Daten.

## 1. Offene Produktentscheidungen — angenommene Defaults

Der ursprüngliche Auftrag verlangt, vor der Implementierung bis zu 10 priorisierte
Rückfragen zu offenen Produktentscheidungen zu stellen. Die interaktive Rückfrage
(`AskUserQuestion`) konnte im aktuellen, nicht-interaktiven Ausführungskontext (Trigger
auf `claude/agentur-os-setup-uoyqsc`) nicht zugestellt werden. Um trotzdem einen
lauffähigen Phase-0-Stand zu liefern, wurden folgende Entscheidungen mit der jeweils
architektonisch am wenigsten riskanten/am besten reversiblen Option getroffen. **Diese
Annahmen sollten im nächsten Review explizit bestätigt oder korrigiert werden:**

| # | Entscheidung | Gewählter Default | Begründung / Alternative |
|---|---|---|---|
| 1 | Backend-Architektur | Next.js API Routes (Monolith) | Schnellster Start, für Phase 0–3 ausreichend. Migration zu NestJS bei wachsender Komplexität (z.B. eigenständige Worker-Prozesse) möglich, ohne das Frontend anzufassen. |
| 2 | Multi-Tenancy | Shared DB + `agencyId`-Spalte, Query-Scoping auf Anwendungsebene | Einfachste Migrations-/Backup-Story für viele kleine Agentur-Mandanten. Schema- oder DB-per-Tenant wäre bei wenigen, sehr großen Agentur-Kunden vorzuziehen — Umstieg erfordert Datenmigration, sollte also früh entschieden werden. |
| 3 | Auth | Auth.js (NextAuth) v5, Credentials-Provider + TOTP-Scaffold, JWT-Sessions | Etablierter Next.js-Standard, gute Doku, RBAC lässt sich sauber über Callbacks/Middleware abbilden. |
| 4 | Repo-Struktur | Single Next.js App (kein Monorepo) | Kein Workspace-Overhead in Phase 0. Aufteilung in Packages (z.B. `worker`, `shared-types`) ist bei Bedarf ab Phase 4/5 (BullMQ-Worker) sinnvoll nachrüstbar. |
| 5 | Zahlungsintegration | Vorerst nur PDF-Rechnungen (Phase 3), keine Stripe/SEPA-API | Reduziert Scope von Phase 3 auf das gesetzlich Pflichtige (XRechnung/ZUGFeRD, GoBD). Zahlungsabwicklung ist ein eigenständiges Compliance-Thema (PCI/SEPA-Mandate) und wird als spätere Ausbaustufe behandelt. |
| 6 | Bildgen-Provider | Provider-Interface abstrahiert, Default `fal.ai` | Austauschbar per Konfiguration (`ApiCredential`-Modell), keine Kopplung an einen Anbieter im Code. |
| 7 | Demo-/Seed-Branding | „Musteragentur GmbH" + 2 fiktive Kunden (Bäckerei, Fitnessstudio) | Neutraler Platzhalter ohne Bezug zu echten Marken. |
| 8 | Roadmap-Priorisierung | Wie in Abschnitt 6 des Master-Prompts (Phase 0→6), keine Sonderpriorisierung von Zusatzmodulen aus Abschnitt 5 | Vermeidet Scope-Drift; Zusatzmodule fließen an der in der Roadmap vorgesehenen Stelle ein (z.B. Kundenportal in Phase 6). |

## 2. Multi-Tenancy-Modell

Drei Ebenen, wie im Auftrag gefordert:

```
Plattformbetreiber (User.isPlatformOwner = true)
  └─ Agentur (Agency, White-Label-Mandant)
       └─ AgencyMembership (User ↔ Agency, Rolle: AGENCY_ADMIN | PROJECT_MANAGER | STAFF | ACCOUNTING | CLIENT)
            └─ Customer (Endkunde der Agentur; CLIENT-Memberships sind zusätzlich auf genau einen Customer gescoped)
```

- **Isolation:** Jede mandantenspezifische Tabelle trägt `agencyId`. Sämtliche
  Server-seitigen Queries filtern explizit danach (kein globales Auto-Scoping via
  Middleware in Phase 0 — das ist ein bekannter Schuldenposten, siehe Abschnitt 5).
- **Rollen vs. Rechte:** `AgencyRole` ist die grobe Rolle (Kanban-Spalten-Sichtbarkeit,
  Standard-Navigation). `ModulePermission` (canView/canEdit/canManage pro
  `AgencyModule`) erlaubt granulare Overrides pro Mitgliedschaft — Agentur-Admins können
  eigene `RolePreset`s aus Kombinationen davon speichern.
- **Kundenportal-Vorbereitung:** Die Rolle `CLIENT` plus `AgencyMembership.customerId`
  legt bereits das Datenmodell für das in Phase 6 geplante White-Label-Kundenportal.

## 3. Auth & Sicherheit

- **Auth.js v5**, Credentials-Provider, `bcryptjs` für Passwort-Hashes (Cost-Faktor 12).
- **2FA:** TOTP-Scaffold über `otplib` (`OTP`-Klasse, RFC-6238-konform) + QR-Code-Erzeugung
  (`qrcode`). `authorize()` verlangt bei `twoFactorEnabled = true` einen gültigen Code;
  fehlt er, wird `2FA_REQUIRED` als Fehlercode zurückgegeben, den das Login-Formular
  abfängt und ein zweites Eingabefeld einblendet. Die UI zum *Einrichten* von 2FA
  (Secret generieren, QR anzeigen, Code bestätigen) ist noch nicht gebaut — Folgearbeit
  in Phase 1/5.
- **Edge/Node-Split:** `src/lib/auth.config.ts` enthält nur Edge-taugliche Config
  (Session-Strategie, Callbacks, Pages) ohne DB-Zugriff und wird von `src/proxy.ts`
  (Next.js 16 Nachfolger von `middleware.ts`) genutzt. `src/lib/auth.ts` erweitert das
  um den Credentials-Provider (DB-Zugriff via Prisma) und läuft nur in
  Route-Handlern/Server-Components (Node-Runtime). Grund: Prisma nutzt Node-Builtins
  (`node:path`, `node:url`), die im Edge-Runtime nicht verfügbar sind.
- **Audit-Log:** `AuditLog`-Modell (agencyId, userId, customerId, action, changes als
  JSON) wird bereits im Seed befüllt und auf der Sicherheits-Seite live aus der DB
  gerendert, gescoped auf die Agentur des eingeloggten Nutzers.
- **Noch offen (Phase 5):** Rate-Limiting, CSRF-Härtung über reine SameSite-Cookies
  hinaus, DSGVO-Datenexport/Löschkonzept, verschlüsselter API-Key-Vault (Modell
  `ApiCredential` existiert, Ver-/Entschlüsselungslogik fehlt noch).

## 4. Tech-Stack im Detail

| Ebene | Wahl | Hinweise |
|---|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) | Diese Version bricht mit einigen Konventionen aus dem Trainingsdatensatz: `middleware.ts` → `proxy.ts`, Prisma-generierter Client erfordert jetzt einen Driver-Adapter (siehe unten). |
| Sprache | TypeScript, strict | — |
| Styling | Tailwind v4 (CSS-first config, `@theme inline`) | Kein `tailwind.config.js` mehr nötig. |
| UI-Komponenten | Eigene shadcn/ui-kompatible Komponenten unter `src/components/ui` | Die shadcn-CLI-Registry (`ui.shadcn.com`) ist in dieser Sandbox netzwerkseitig blockiert; Komponenten wurden manuell nach shadcn-Konventionen (Radix + CVA + Tailwind) gebaut. `components.json` liegt bereit, damit `npx shadcn add …` funktioniert, sobald Netzwerkzugriff besteht. |
| ORM | Prisma 7 (`@prisma/adapter-pg`, `pg`) | **Breaking Change ggü. Prisma <7:** `datasource.url` darf nicht mehr im Schema stehen (nur noch in `prisma.config.ts`), und `PrismaClient` benötigt zwingend einen `adapter` (siehe `src/lib/db.ts`). Generierter Client liegt unter `src/generated/prisma` (git-ignoriert, wird per `postinstall`-Hook erzeugt). |
| DB | PostgreSQL 17 (Docker) / 16 (in dieser Sandbox lokal getestet, da kein privilegierter Docker-Daemon verfügbar war) | — |
| Queue | Redis + BullMQ | Container in `docker-compose.yml` vorbereitet, Worker-Code folgt Phase 5. |
| i18n | `next-intl` | `src/i18n/messages/{de,en}.json` enthalten die in Phase 0 gebauten UI-Strings. Provider ist global eingebunden (`NextIntlClientProvider` in `src/components/providers.tsx`), Locale-Erkennung über `NEXT_LOCALE`-Cookie (Default `de`). **Bestehende Phase-0-Komponenten nutzen noch hartkodierte deutsche Strings** statt `useTranslations()` — das war eine bewusste Entscheidung, um keine halb migrierte Zwischenstufe zu hinterlassen. Umstellung ist eine in sich abgeschlossene Folgeaufgabe (siehe CHANGELOG "Nächste Schritte"). |
| Deployment | Docker Compose: `postgres`, `redis`, `app` (Next.js `standalone`-Output), `caddy` (Reverse Proxy, Auto-HTTPS über `AGENCY_DOMAIN`) | In dieser Sandbox ohne privilegierten Docker-Daemon nicht startbar; `docker compose config` wurde zur Syntaxprüfung genutzt, die App wurde stattdessen gegen eine lokal installierte PostgreSQL-Instanz getestet (Login-Flow, RBAC-Scoping, Proxy-Redirect — siehe CHANGELOG). |

## 5. Bekannte technische Schulden (bewusst für Phase 0 zurückgestellt)

- Kein automatisches Tenant-Scoping (z.B. via Prisma-Client-Extension), jede Query
  muss `agencyId` manuell filtern. Sollte vor Phase 1 (mehr Endpunkte) als
  Prisma-Extension oder Repository-Layer nachgezogen werden, um Datenlecks zwischen
  Agenturen strukturell auszuschließen.
- Kein UI-Flow zum Aktivieren/Einrichten von 2FA (nur Verifikationslogik vorhanden).
- `ApiCredential.encryptedValue` hat noch keine Ver-/Entschlüsselungs-Implementierung
  (nur Datenmodell).
- next-intl ist als Infrastruktur vorhanden, aber noch nicht in den Phase-0-Komponenten
  verdrahtet.
- Docker-Compose-Setup ist syntaktisch validiert, aber in dieser Sandbox nicht real
  gebaut/gestartet worden (kein Docker-Daemon verfügbar).

## 6. Verzeichnisstruktur (Auszug)

```
src/
  app/
    login/                 # Login-Seite + Formular
    dashboard/              # Geschützter Bereich (Proxy erzwingt Auth)
      crm/ projekte/ websites/ rechnungen/ marketing/ ki-mcp/ backup/ sicherheit/
    api/auth/[...nextauth]/  # Auth.js Route-Handler
  components/
    ui/                     # shadcn-kompatible Primitive
    app-sidebar.tsx, user-menu.tsx, module-placeholder.tsx, providers.tsx
  i18n/
    messages/{de,en}.json, request.ts
  lib/
    auth.ts, auth.config.ts, db.ts, totp.ts, modules.ts, utils.ts
  proxy.ts                  # Next.js 16 Middleware-Nachfolger (Auth-Guard für /dashboard)
prisma/
  schema.prisma, seed.ts, migrations/
```
