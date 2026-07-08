import { repository } from "@/lib/repository";
import { AppHeader } from "@/components/layout/AppHeader";
import { FeedCard } from "@/components/shared/FeedCard";
import { GoldDivider } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

export default async function FeedPage() {
  const [feed, self, members] = await Promise.all([
    repository.getFeed(),
    repository.getCurrentUser(),
    repository.getMembers(),
  ]);
  const byId = new Map([self, ...members].map((u) => [u.id, u]));

  return (
    <>
      <AppHeader
        title="Milestone Feed"
        right={<Icon name="spark" size={20} className="text-gold" />}
      />
      <div className="stagger px-5 pb-10 pt-5">
        <p className="mb-5 text-[12.5px] leading-relaxed text-faint">
          No noise. Only verified progress from the people you rise with.
        </p>
        <div className="space-y-4">
          {feed.map((item, i) => {
            const author = byId.get(item.userId);
            if (!author) return null;
            return (
              <div key={item.id}>
                <FeedCard item={item} author={author} />
                {i === 1 && <GoldDivider className="my-6" label="Earlier" />}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
