import { repository } from "@/lib/repository";
import { AppHeader } from "@/components/layout/AppHeader";
import { EventCard } from "@/components/shared/EventCard";
import { SectionHeader } from "@/components/ui/primitives";

export default async function EventsPage() {
  const events = await repository.getEvents();
  const featured = events[0];
  const rest = events.slice(1);

  return (
    <>
      <AppHeader title="Events" />
      <div className="stagger px-5 pb-10 pt-5">
        <p className="mb-5 text-[12.5px] leading-relaxed text-faint">
          Rooms you cannot buy your way into. Presence is the currency.
        </p>

        <SectionHeader title="Curated Next" />
        <EventCard event={featured} />

        <div className="mt-8">
          <SectionHeader title="Upcoming" action={`${rest.length} gatherings`} />
          <div className="space-y-4">
            {rest.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
