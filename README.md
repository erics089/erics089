# AGENTUR-OS

White-Label All-in-One-Software für Werbe-, Web- und Online-Marketing-Agenturen.
Self-hosted, mandantenfähig (Plattformbetreiber → Agentur → Endkunde), 1:1 von Docker
auf jeden Server übertragbar.

Der aktuelle Stand ist **Phase 0 (Fundament)** — siehe [`ARCHITECTURE.md`](./ARCHITECTURE.md)
für Architekturentscheidungen und [`CHANGELOG.md`](./CHANGELOG.md) für den Fortschritt.

## Setup (lokal, mit Docker)

```bash
cp .env.example .env
docker compose up -d postgres redis
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Danach: [http://localhost:3000](http://localhost:3000) öffnen.

## Setup (lokal, ohne Docker)

Voraussetzung: PostgreSQL 16+ und Redis laufen bereits lokal, `DATABASE_URL` in `.env`
zeigt darauf.

```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

## Demo-Zugänge (Seed-Daten)

Nach `npx prisma db seed` sind folgende Test-Accounts verfügbar (Passwort jeweils `Demo123!`):

| Rolle                | E-Mail                              |
|-----------------------|--------------------------------------|
| Plattform-Owner        | `owner@agentur-os.local`            |
| Agentur-Admin           | `admin@musteragentur.de`            |
| Projektleiterin         | `pm@musteragentur.de`               |
| Mitarbeiter (Designer)  | `designer@musteragentur.de`         |
| Kunde (Portal-Zugang)   | `kunde@sonnenblick-baeckerei.de`    |

Demo-Agentur: **Musteragentur GmbH** mit den Kunden *Bäckerei Sonnenblick* und
*Fitness Loft Berlin*.

## Produktions-Deployment (Server/Docker Compose)

```bash
cp .env.example .env   # Werte anpassen: AUTH_SECRET, ENCRYPTION_KEY, POSTGRES_*, AGENCY_DOMAIN
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

Der `app`-Container läuft hinter Caddy (automatisches HTTPS über `AGENCY_DOMAIN`).
Websites, die über das Website-Modul erzeugt werden, landen unter `/sites/{kunde}/{projekt}/`
(siehe `sites_data`-Volume) und sind per SFTP/Git/rsync 1:1 auf andere Hoster übertragbar.

## Tech-Stack

- **Frontend/Backend:** Next.js 16 (App Router) + TypeScript + Tailwind v4 + eigene
  shadcn/ui-kompatible Komponenten
- **Datenbank:** PostgreSQL + Prisma ORM 7 (Migrations versioniert, `@prisma/adapter-pg`)
- **Auth:** Auth.js v5 (Credentials + TOTP-2FA), JWT-Sessions, RBAC pro Modul
- **i18n:** next-intl, Deutsch aktiv, Englisch vorbereitet
- **Queue/Automation:** BullMQ + Redis (ab Phase 5)
- **Deployment:** Docker Compose (Postgres, Redis, App, Caddy als Reverse Proxy)

## Nützliche Befehle

```bash
npx prisma studio          # DB-Browser
npx prisma migrate dev     # neue Migration erzeugen
npm run lint                # ESLint
npx tsc --noEmit             # Typecheck
```
