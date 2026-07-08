# Road to Glory ✦

An invite-only members club for high performers — a premium mobile app where
outliers define their path, track their ascent, and build a legacy among peers.
This is a working **Premium V1 / MVP**: a mobile-first PWA with fifteen screens,
a clean data layer, and a dark-gold luxury design system.

```bash
npm install
npm run dev          # → http://localhost:3000
```

On a phone it runs full-bleed; on a desktop it renders inside an iPhone frame
for demos and investor walkthroughs.

---

## Phase 1 — Strategy

**What it is.** Not another social network. A digital private members club that
fuses social networking, goal tracking, gamification, and status into one
prestige surface. Membership is invite-only and peer-reviewed, so it *feels* like
a status symbol — which is what justifies a premium retainer.

**Why people pay.** Access you can't buy (curated events, elite circle), proof
of excellence (verified accomplishments), real utility (goal accountability +
strategic intros), and reflected growth (a Legacy you build over years).

**Core modules.** Identity · Progress · Status · Community · Legacy · Events,
delivered through five primary tabs plus supporting flows.

**MVP vs. later.**

| In this MVP | Premium V2 / V3 |
|---|---|
| Onboarding + persona/goal setup | Real Supabase auth + peer-review workflow |
| Dashboard, Road to Glory, Feed, Social, Events | Push, real-time feed, chat in Mastermind Circles |
| Goal Engine, Legacy Log, Membership, Invite | AI coach with real insights, verification pipeline |
| Interactive RSVP, reactions, filters (mock data) | Payments / tiers, collectible prestige tokens |

## Phase 2 — Information Architecture

```
Splash (/)                    Brand intro → apply or enter
Onboarding (/onboarding)      6 steps: persona → ambition → goal → profile → invite → review
App shell (tab bar)
 ├─ Glory   /dashboard        Status dashboard (identity, ascent, teasers)
 ├─ Road    /road             Goals by arena  → /road/new  → /goal/[id] (Goal Engine)
 ├─ Feed    /feed             Milestone feed with elite reactions
 ├─ Circle  /social           Allies, Power Rings, leaderboard, intros
 └─ Events  /events           Curated gatherings → /events/[id] (RSVP)
Supporting: /legacy · /profile · /membership · /invite · /settings
```

**Key user flows** (all clickable): onboarding → application status; goal
creation (`/road/new`); event RSVP (`/events/[id]`); connection request
(`/social`); milestone reactions (`/feed`); legacy entry (`/legacy`).

## Phase 3 — Design System

Tokens live in `tailwind.config.ts` and `src/app/globals.css`.

- **Surfaces** — `obsidian #050506` → `ink` → `surface` → `elevated`, hairline
  `line #232329` dividers.
- **Gold** — a single accent ramp (`gold #C8A24B`, soft, deep) used *sparingly*:
  progress fills, one badge, dividers, key numerals. Never as a background fill.
- **Type** — Cormorant Garamond (display/serif) for impact, Inter for UI.
  Uppercase `tracking-luxe` labels for the editorial feel.
- **Components** — `Card`, `Button` (gold/outline/ghost/dark), `Badge`,
  `ProgressRing` (the signature "arc of ascent"), `ProgressBar`,
  `MilestoneTrack` (the vertical gold "road"), `Avatar`, `Chip`, `StatTile`,
  a hand-drawn `Icon` set.
- **Motion** — subtle only: staggered fade-ups, eased ring/bar fills, press
  scale on interactive elements.

---

## Tech & Architecture

- **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, mobile-first PWA.
  Chosen over React Native/Expo so the product runs instantly in any browser —
  no simulator — while staying a genuine app in structure and feel.
- **Data layer.** Every screen reads through `src/lib/repository.ts`, the single
  seam between UI and data. Today it returns typed mock data (`src/lib/mock-data.ts`)
  from async methods; swapping to Supabase means replacing the method bodies with
  `supabase.from(...)` queries — **no screen or component changes**.
- **Domain model.** `src/lib/types.ts` mirrors a future Postgres schema 1:1:
  `User, Goal, Milestone, LegacyEntry, Connection, RtgEvent, EventRSVP,
  Challenge, MembershipApplication, Achievement`.

### Project structure

```
src/
  app/
    page.tsx                     # Splash / brand intro
    onboarding/page.tsx          # Multi-step application
    (app)/
      layout.tsx                 # Phone frame + tab bar shell
      dashboard/  road/  feed/  social/  events/  legacy/
      goal/[id]/  events/[id]/  road/new/
      profile/  membership/  invite/  settings/
  components/
    ui/          # Icon, primitives (Card/Button/Badge/…), Progress
    layout/      # PhoneFrame, AppHeader, TabBar
    shared/      # GoalCard, MemberCard, EventCard, FeedCard, RsvpButton
  lib/           # types, mock-data, repository, utils
```

### Connecting a real backend (Supabase sketch)

1. `npm i @supabase/supabase-js`, add a client in `src/lib/supabase.ts`.
2. Create tables matching `src/lib/types.ts`.
3. Replace the bodies in `src/lib/repository.ts` (e.g.
   `getGoals: (uid) => supabase.from('goals').select().eq('userId', uid)`).
4. Add Supabase Auth to gate the `(app)` group and persist onboarding.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

_Working title: **Road to Glory**. Alternatives prepared in copy: “Ascendant”, “The Circle”, “Vantage”._
