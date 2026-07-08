import Link from "next/link";
import { repository } from "@/lib/repository";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, Avatar, Badge, GoldDivider, SectionHeader, StatTile, Button } from "@/components/ui/primitives";
import { ProgressRing } from "@/components/ui/Progress";
import { Icon } from "@/components/ui/Icon";
import { GoalCard } from "@/components/shared/GoalCard";
import { EventCard } from "@/components/shared/EventCard";
import { formatScore, categoryGlyph } from "@/lib/utils";

export default async function DashboardPage() {
  const [user, goals, events, feed, challenges] = await Promise.all([
    repository.getCurrentUser(),
    repository.getGoals(),
    repository.getEvents(),
    repository.getFeed(),
    repository.getChallenges(),
  ]);

  const overall = Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length);
  const nextEvent = events[0];
  const latest = feed[0];
  const challenge = challenges[0];

  return (
    <>
      <AppHeader
        right={
          <Link href="/settings" className="flex h-8 w-8 items-center justify-center rounded-full text-mist hover:text-chalk">
            <Icon name="settings" size={20} />
          </Link>
        }
      />

      <div className="stagger px-5 pb-10 pt-5">
        {/* Identity hero */}
        <Card glow className="overflow-hidden">
          <div className="flex items-center gap-5 p-5">
            <ProgressRing value={overall} size={120} label={`${overall}%`} sublabel="Ascent" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate font-display text-2xl text-chalk">{user.fullName}</h1>
                {user.verified && <Icon name="verified" size={16} className="shrink-0 text-gold" />}
              </div>
              <p className="mt-0.5 text-[12px] text-faint">
                {user.archetype} · {user.city}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="gold" glyph="✦">{user.levelOfGreatness}</Badge>
                <Badge variant="line">{user.membershipTier}</Badge>
              </div>
            </div>
          </div>
          <GoldDivider />
          <div className="grid grid-cols-3 divide-x divide-line">
            <MiniStat label="Glory Score" value={formatScore(user.gloryScore)} accent />
            <MiniStat label="Active Paths" value={String(goals.length)} />
            <MiniStat label="Standing" value="Top 4%" />
          </div>
        </Card>

        {/* Road to Glory preview */}
        <section className="mt-8">
          <SectionHeader title="Road to Glory" action="View all" href="/road" />
          <div className="space-y-3">
            {goals.slice(0, 2).map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>
        </section>

        {/* Challenge teaser */}
        {challenge && (
          <section className="mt-8">
            <SectionHeader title="Live Challenge" />
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gold">{categoryGlyph(challenge.category)}</span>
                  <h3 className="mt-1 font-display text-lg text-chalk">{challenge.title}</h3>
                  <p className="mt-0.5 text-[12px] text-faint">{challenge.progressMetric}</p>
                </div>
                <ProgressRing value={challenge.progress} size={70} stroke={5} label={`${challenge.progress}`} />
              </div>
              <Button variant="dark" size="sm" full className="mt-4">
                Update Progress
              </Button>
            </Card>
          </section>
        )}

        {/* Upcoming event */}
        {nextEvent && (
          <section className="mt-8">
            <SectionHeader title="Next Gathering" action="All events" href="/events" />
            <EventCard event={nextEvent} />
          </section>
        )}

        {/* Latest from the circle */}
        {latest && (
          <section className="mt-8">
            <SectionHeader title="From Your Circle" action="Feed" href="/feed" />
            <Link href="/feed">
              <Card className="p-5 transition-colors hover:border-gold/25">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-gold">◆</span>
                  <span className="text-[10px] uppercase tracking-luxe text-faint">New accomplishment</span>
                </div>
                <p className="font-display text-lg leading-snug text-chalk">{latest.title}</p>
                <p className="mt-1 line-clamp-2 text-[13px] text-mist">{latest.description}</p>
              </Card>
            </Link>
          </section>
        )}

        {/* Legacy teaser */}
        <section className="mt-8">
          <SectionHeader title="Legacy" action="Open log" href="/legacy" />
          <Link href="/legacy">
            <Card className="flex items-center gap-4 p-5 transition-colors hover:border-gold/25">
              <span className="text-2xl text-gold/80">✦</span>
              <div className="flex-1">
                <p className="text-sm text-chalk">Record what shaped you.</p>
                <p className="text-[12px] text-faint">Lessons, turning points, defining moments.</p>
              </div>
              <Icon name="chevron" size={18} className="text-faint" />
            </Card>
          </Link>
        </section>
      </div>
    </>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-4 py-4 text-center">
      <div className={accent ? "font-display text-xl text-gold-gradient" : "font-display text-xl text-chalk"}>
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-luxe text-faint">{label}</div>
    </div>
  );
}
