import { repository } from "@/lib/repository";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, Avatar, SectionHeader, StatTile, GoldDivider } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { MemberCard } from "@/components/shared/MemberCard";
import { formatScore } from "@/lib/utils";

export default async function SocialPage() {
  const [self, members, connections] = await Promise.all([
    repository.getCurrentUser(),
    repository.getMembers(),
    repository.getConnections(),
  ]);
  const byId = new Map([self, ...members].map((u) => [u.id, u]));

  const other = (c: (typeof connections)[number]) =>
    c.requesterId === self.id ? c.receiverId : c.requesterId;

  const allies = connections
    .filter((c) => c.status === "connected")
    .map((c) => ({ user: byId.get(other(c))!, circle: c.circleType }))
    .filter((x) => x.user);
  const pending = connections
    .filter((c) => c.status === "pending")
    .map((c) => byId.get(other(c))!)
    .filter(Boolean);
  const suggested = connections
    .filter((c) => c.status === "suggested")
    .map((c) => byId.get(other(c))!)
    .filter(Boolean);

  const leaderboard = [self, ...members].sort((a, b) => b.gloryScore - a.gloryScore).slice(0, 5);

  return (
    <>
      <AppHeader title="Social Capital" />
      <div className="stagger px-5 pb-10 pt-5">
        {/* Overview */}
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Allies" value={String(allies.length)} glyph="✦" accent />
          <StatTile label="Power Rings" value={String(allies.filter((a) => a.circle === "Power Ring").length)} glyph="◆" />
          <StatTile label="Reach" value="1.2M" glyph="◉" />
        </div>

        {/* Requests */}
        {pending.length > 0 && (
          <section className="mt-8">
            <SectionHeader title="Intro Requests" action={`${pending.length} pending`} />
            <div className="space-y-3">
              {pending.map((u) => (
                <MemberCard key={u.id} user={u} cta="accept" />
              ))}
            </div>
          </section>
        )}

        {/* Allies */}
        <section className="mt-8">
          <SectionHeader title="Allies of Greatness" />
          <div className="space-y-3">
            {allies.map(({ user, circle }) => (
              <MemberCard key={user.id} user={user} circleType={circle} />
            ))}
          </div>
        </section>

        {/* Leaderboard */}
        <section className="mt-8">
          <SectionHeader title="Standing" action="This quarter" />
          <Card className="divide-y divide-line">
            {leaderboard.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3.5 px-4 py-3.5">
                <span className={`w-5 text-center font-display text-lg ${i === 0 ? "text-gold-gradient" : "text-faint"}`}>
                  {i + 1}
                </span>
                <Avatar seed={u.profileImage} name={u.fullName} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm text-chalk">{u.id === self.id ? "You" : u.fullName}</span>
                    {u.verified && <Icon name="verified" size={12} className="text-gold" />}
                  </div>
                  <span className="text-[11px] text-faint">{u.levelOfGreatness}</span>
                </div>
                <span className="text-[13px] text-gold">✦ {formatScore(u.gloryScore)}</span>
              </div>
            ))}
          </Card>
        </section>

        {/* Suggested */}
        {suggested.length > 0 && (
          <section className="mt-8">
            <GoldDivider className="mb-6" label="Curated for you" />
            <SectionHeader title="Strategic Connections" />
            <div className="space-y-3">
              {suggested.map((u) => (
                <MemberCard key={u.id} user={u} cta="connect" />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
