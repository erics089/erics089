import { repository } from "@/lib/repository";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, Badge, GoldDivider, SectionHeader, Button } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/utils";

export default async function LegacyPage() {
  const [entries, achievements] = await Promise.all([
    repository.getLegacyEntries(),
    repository.getAchievements(),
  ]);
  const featured = entries[0];
  const rest = entries.slice(1);
  const unlocked = achievements.filter((a) => a.unlocked);

  return (
    <>
      <AppHeader title="Legacy Log" right={<Icon name="plus" size={20} className="text-gold" />} />
      <div className="stagger px-5 pb-10 pt-5">
        <p className="mb-6 text-[12.5px] leading-relaxed text-faint">
          Greatness is not only what you won. It is what you learned to become.
        </p>

        {/* Featured reflection — the centerpiece */}
        {featured && (
          <Card glow className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-3xl text-gold/80">{featured.symbol}</span>
              <Badge variant="line">{featured.category}</Badge>
            </div>
            <h2 className="font-display text-2xl leading-snug text-chalk">{featured.title}</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-mist">{featured.reflection}</p>
            <p className="mt-4 text-[11px] uppercase tracking-luxe text-faint">
              {formatDate(featured.createdAt)}
            </p>
          </Card>
        )}

        {/* Earlier reflections */}
        {rest.length > 0 && (
          <section className="mt-8">
            <GoldDivider className="mb-6" label="Earlier reflections" />
            <div className="space-y-3">
              {rest.map((e) => (
                <Card key={e.id} className="flex items-start gap-4 p-5">
                  <span className="text-xl text-gold/70">{e.symbol}</span>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-luxe text-faint">{e.category}</span>
                      <span className="text-line">·</span>
                      <span className="text-[10px] text-faint">{formatDate(e.createdAt)}</span>
                    </div>
                    <h3 className="font-display text-lg text-chalk">{e.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[13px] text-mist">{e.reflection}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Accomplishments / badges */}
        <section className="mt-8">
          <SectionHeader title="Verified Accomplishments" action={`${unlocked.length} earned`} />
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((a) => (
              <Card key={a.id} className={`p-4 ${a.unlocked ? "" : "opacity-45"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl text-gold">{a.icon}</span>
                  {!a.unlocked && <Icon name="lock" size={14} className="text-faint" />}
                </div>
                <h4 className="mt-3 text-sm font-medium text-chalk">{a.title}</h4>
                <p className="mt-0.5 text-[11px] text-faint">{a.rarity}</p>
              </Card>
            ))}
          </div>
        </section>

        <Button variant="dark" size="lg" full className="mt-8" icon={<Icon name="plus" size={18} />}>
          Record a reflection
        </Button>
      </div>
    </>
  );
}
