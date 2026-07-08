# CHANGELOG.md — AGENTUR-OS

Alle nennenswerten Änderungen an AGENTUR-OS werden hier fortlaufend dokumentiert.
Format lose angelehnt an [Keep a Changelog](https://keepachangelog.com/).

## [Phase 0] — Fundament — 2026-07-08

### Hinzugefügt

- **Projekt-Setup:** Next.js 16.2 (App Router, TypeScript, Tailwind v4, ESLint).
- **Datenbank:** Prisma-7-Schema mit Multi-Tenant-Modell (`Agency`, `User`,
  `AgencyMembership`, `AgencyRole`, `ModulePermission`, `AgencyModule`, `RolePreset`,
  `Customer`, `PipelineStage`, `ApiCredential`, `AuditLog`). Erste Migration
  (`20260707230244_init`) erzeugt und gegen eine echte PostgreSQL-Instanz angewendet.
- **Auth:** Auth.js v5 mit Credentials-Provider, bcrypt-Passwort-Hashing,
  TOTP-2FA-Verifikation (`otplib`), JWT-Sessions, Edge/Node-Split
  (`auth.config.ts` vs. `auth.ts`) für kompatible Middleware.
- **RBAC:** Granulare Modul-Berechtigungen (canView/canEdit/canManage) pro
  Agentur-Mitgliedschaft, Rollen-Presets als Grundlage für vom Agentur-Admin
  definierbare Custom-Rollen.
- **App-Shell:** Sidebar-Navigation mit allen 8 Kernmodulen (CRM, Projekte, Websites,
  Rechnungen, Marketing, KI & MCP, Backup, Sicherheit), Topbar mit Nutzer-Menü
  (Abmelden), geschützter Dashboard-Bereich via Proxy-Guard.
- **Design-System:** Eigene shadcn/ui-kompatible Komponenten (Button, Input, Label,
  Card, Avatar, DropdownMenu, Separator, Badge) mit Light/Dark-Theme über
  CSS-Variablen (OKLCH), White-Label-fähig (Primärfarbe pro Agentur override-bar
  vorbereitet).
- **Sicherheits-Modul (erste Ausbaustufe):** Live-Ansicht des Audit-Logs, gescoped auf
  die Agentur des eingeloggten Nutzers — demonstriert echte Mandantentrennung, nicht
  nur Mock-Daten.
- **i18n:** `next-intl` eingebunden, Message-Kataloge für DE (aktiv) und EN
  (vorbereitet), Locale-Provider global verdrahtet.
- **Docker Compose:** `postgres`, `redis`, `app` (Multi-Stage-Dockerfile,
  `output: "standalone"`), `caddy` als Reverse Proxy. `docker compose config`
  syntaktisch validiert (echter Build/Start in dieser Sandbox mangels privilegiertem
  Docker-Daemon nicht möglich).
- **Seed-Daten:** Demo-Agentur „Musteragentur GmbH" mit 2 Kunden (Bäckerei
  Sonnenblick, Fitness Loft Berlin), 5 Test-Accounts (Owner, Agentur-Admin,
  Projektleiterin, Mitarbeiter, Kunde) — Zugangsdaten siehe `README.md`.
- **Doku:** `README.md` (Setup in < 5 Befehlen), `ARCHITECTURE.md`,
  `.env.example` (vollständig, inkl. Platzhalter für Bildgen-/MCP-/Backup-Provider).

### Entschieden (siehe ARCHITECTURE.md Abschnitt 1 für Details)

- Next.js API Routes statt separatem NestJS-Backend.
- Shared-DB-Multi-Tenancy (`agencyId`-Spalte) statt Schema-/DB-per-Tenant.
- Auth.js statt Better-Auth.
- Single-App-Repo statt Monorepo.
- Zahlungsintegration (Stripe/SEPA) auf spätere Phase verschoben, Phase 3 fokussiert
  auf PDF-Rechnungen/XRechnung.
- `fal.ai` als Default-Bildgen-Provider hinter austauschbarem Interface.

Diese Entscheidungen wurden ohne interaktive Nutzerbestätigung getroffen, da die
Rückfrage im aktuellen Ausführungskontext technisch nicht zustellbar war. Bitte im
nächsten Review bestätigen oder korrigieren.

### Bekannte Einschränkungen / nächste Schritte

- Kein automatisches Tenant-Scoping auf DB-Ebene — jede Query filtert manuell nach
  `agencyId`. Vor Phase 1 als Prisma-Extension nachziehen.
- 2FA-Setup-UI (Secret/QR-Code anzeigen, Aktivierung bestätigen) fehlt noch —
  nur die Verifikationslogik beim Login ist gebaut.
- `ApiCredential`-Verschlüsselung (AES-256-GCM mit `ENCRYPTION_KEY`) ist als Feld
  vorgesehen, aber noch nicht implementiert.
- next-intl ist einsatzbereit, aber die in Phase 0 gebauten Komponenten nutzen noch
  hartkodierte deutsche Strings statt `useTranslations()`.
- Docker Compose wurde syntaktisch, aber nicht funktional in dieser Umgebung getestet
  (kein Docker-Daemon in der Sandbox verfügbar). Login-Flow, RBAC-Scoping und der
  Proxy-Redirect wurden stattdessen gegen eine lokal installierte PostgreSQL-Instanz
  end-to-end per `npm run dev` + `curl` verifiziert.

### Nächste Schritte (Phase 1)

- CRM-Ausbau: vollständige Kundenakte (Dokumente, Verträge, IBAN/SEPA-UI,
  Integrations-Statusleiste), Lead-Pipeline als Kanban.
- Projekt-/Aufgaben-Modul: Status-Workflows, Zeiterfassung, Kanban/Liste/Timeline.
- Tenant-Scoping als Prisma-Extension.
- 2FA-Setup-Flow in der Sicherheits-Seite.
