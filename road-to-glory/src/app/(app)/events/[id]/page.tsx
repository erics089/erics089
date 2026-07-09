import { notFound } from "next/navigation";
import { repository } from "@/lib/repository";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, Avatar, Badge, GoldDivider, SectionHeader } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { RsvpButton } from "@/components/shared/RsvpButton";
import { eventGradient, formatDateTime } from "@/lib/utils";

export async function generateStaticParams() {
  const events = await repository.getEvents();
  return events.map((e) => ({ id: e.id }));
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, members, self] = await Promise.all([
    repository.getEvent(params.id),
    repository.getMembers(),
    repository.getCurrentUser(),
  ]);
  if (!event) notFound();

  const byId = new Map([self, ...members].map((u) => [u.id, u]));
  const host = byId.get(event.hostId);
  const guests = [self, ...members].filter((u) => u.id !== event.hostId).slice(0, 4);
  const full = event.rsvpCount >= event.capacity;
  const spotsLeft = Math.max(0, event.capacity - event.rsvpCount);

  return (
    <>
      <AppHeader title="" back right={<Icon name="calendar" size={19} className="text-mist" />} />
      <div className="pb-32">
        {/* Hero */}
        <div className="vignette relative h-64" style={{ background: eventGradient(event.image) }}>
          <div className="absolute left-5 top-5">
            <Badge variant="gold" glyph="✦">{event.accessTier} Access</Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-5">
            <span className="text-[11px] uppercase tracking-luxe text-gold/90">{event.category}</span>
            <h1 className="mt-1.5 font-display text-3xl leading-tight text-chalk">{event.title}</h1>
          </div>
        </div>

        <div className="stagger px-5 pt-6">
          {/* Facts */}
          <Card className="divide-y divide-line">
            <Fact icon="calendar" label="When" value={formatDateTime(event.startAt)} />
            <Fact icon="pin" label="Where" value={`${event.location}, ${event.city}`} />
            {event.dressCode && <Fact icon="crown" label="Dress code" value={event.dressCode} />}
            <Fact icon="lock" label="Access" value={`${event.accessTier} and above`} />
          </Card>

          {/* Description */}
          <section className="mt-7">
            <SectionHeader title="The Evening" />
            <p className="text-[14px] leading-relaxed text-mist">{event.description}</p>
          </section>

          {/* Host */}
          {host && (
            <section className="mt-7">
              <SectionHeader title="Curated By" />
              <Card className="flex items-center gap-3.5 p-4">
                <Avatar seed={host.profileImage} name={host.fullName} size={48} ring />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-chalk">{host.fullName}</span>
                    {host.verified && <Icon name="verified" size={13} className="text-gold" />}
                  </div>
                  <span className="text-[11px] text-faint">{host.archetype} · {host.membershipTier}</span>
                </div>
                <Badge variant="line">Host</Badge>
              </Card>
            </section>
          )}

          {/* Guests */}
          <section className="mt-7">
            <SectionHeader title="Who's Coming" action={`${event.rsvpCount} attending`} />
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {guests.map((g) => (
                  <div key={g.id} className="rounded-full ring-2 ring-obsidian">
                    <Avatar seed={g.profileImage} name={g.fullName} size={40} />
                  </div>
                ))}
              </div>
              <span className="text-[12px] text-faint">
                {host?.fullName.split(" ")[0]} and {event.rsvpCount - 1} others
              </span>
            </div>
          </section>

          <GoldDivider className="mt-8" label={full ? "At capacity" : `${spotsLeft} seats remaining`} />
        </div>
      </div>

      {/* RSVP bar */}
      <div className="shrink-0 border-t border-line/70 bg-ink/90 px-5 pb-9 pt-4 backdrop-blur-xl">
        <RsvpButton full={full} />
      </div>
    </>
  );
}

function Fact({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5">
      <Icon name={icon} size={18} className="text-gold/80" />
      <span className="w-20 text-[11px] uppercase tracking-luxe text-faint">{label}</span>
      <span className="flex-1 text-right text-[13.5px] text-chalk">{value}</span>
    </div>
  );
}
