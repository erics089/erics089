import Link from "next/link";
import { repository } from "@/lib/repository";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, Avatar, Badge, GoldDivider, SectionHeader, StatTile, Button } from "@/components/ui/primitives";
import { ProgressRing } from "@/components/ui/Progress";
import { Icon } from "@/components/ui/Icon";
import { formatScore, formatDate, categoryGlyph } from "@/lib/utils";

export default async function ProfilePage() {
  const [user, goals, achievements, legacy] = await Promise.all([
    repository.getCurrentUser(),
    repository.getGoals(),
    repository.getAchievements(),
    repository.getLegacyEntries(),
  ]);
  const overall = Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length);
  const unlocked = achievements.filter((a) => a.unlocked);

  return (
    <>
      <AppHeader
        title="Profile"
        back
        right={
          <Link href="/settings" className="flex h-8 w-8 items-center justify-center rounded-full text-mist hover:text-chalk">
            <Icon name="settings" size={20} />
          </Link>
        }
      />
      <div className="stagger px-5 pb-10 pt-5">
        {/* Identity */}
        <div className="flex flex-col items-center text-center">
          <Avatar seed={user.profileImage} name={user.fullName} size={96} ring />
          <div className="mt-4 flex items-center gap-2">
            <h1 className="font-display text-3xl text-chalk">{user.fullName}</h1>
            {user.verified && <Icon name="verified" size={18} className="text-gold" />}
          </div>
          <p className="mt-1 text-[13px] text-mist">@{user.username}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <Badge variant="gold" glyph="✦">{user.levelOfGreatness}</Badge>
            <Badge variant="line">{user.archetype}</Badge>
            <Badge variant="line" glyph="📍">{user.city}</Badge>
          </div>
          <p className="mt-4 max-w-[20rem] text-[13.5px] leading-relaxed text-mist">{user.bio}</p>
        </div>

        {/* Membership card */}
        <Card glow className="mt-7 overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <div>
              <span className="text-[10px] uppercase tracking-luxe text-gold/90">Membership</span>
              <p className="mt-1 font-display text-xl text-chalk">{user.membershipTier}</p>
              <p className="mt-0.5 text-[11px] text-faint">Member since {formatDate(user.createdAt, { month: "long", year: "numeric" })}</p>
            </div>
            <ProgressRing value={overall} size={72} stroke={5} label={`${overall}%`} />
          </div>
          <GoldDivider />
          <div className="grid grid-cols-3 divide-x divide-line">
            <MiniStat label="Glory" value={formatScore(user.gloryScore)} accent />
            <MiniStat label="Milestones" value={String(unlocked.length)} />
            <MiniStat label="Reflections" value={String(legacy.length)} />
          </div>
        </Card>

        {/* Focus areas */}
        <section className="mt-8">
          <SectionHeader title="Focus Arenas" />
          <div className="flex flex-wrap gap-2">
            {user.focusAreas.map((f) => (
              <span key={f} className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-[13px] text-mist">
                <span className="text-gold">{categoryGlyph(f)}</span>
                {f}
              </span>
            ))}
          </div>
        </section>

        {/* Accomplishments */}
        <section className="mt-8">
          <SectionHeader title="Accomplishments" action="Legacy" href="/legacy" />
          <div className="grid grid-cols-4 gap-3">
            {unlocked.slice(0, 4).map((a) => (
              <div key={a.id} className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-ink/60 py-4">
                <span className="text-2xl text-gold">{a.icon}</span>
                <span className="px-1 text-center text-[9px] uppercase tracking-wide text-faint">{a.title}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 flex gap-3">
          <Button variant="dark" size="lg" full>Edit Profile</Button>
          <Link href="/invite" className="flex-1">
            <Button variant="outline" size="lg" full icon={<Icon name="invite" size={18} />}>
              Invite
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-4 py-4 text-center">
      <div className={accent ? "font-display text-xl text-gold-gradient" : "font-display text-xl text-chalk"}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-luxe text-faint">{label}</div>
    </div>
  );
}
