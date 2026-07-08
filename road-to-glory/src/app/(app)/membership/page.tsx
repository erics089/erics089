import Link from "next/link";
import { repository } from "@/lib/repository";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, Badge, GoldDivider, SectionHeader, Button } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { cn, formatDate } from "@/lib/utils";

const tiers = [
  { name: "Candidate", note: "Application under review" },
  { name: "Selected", note: "Invited to complete profile" },
  { name: "Member", note: "Full access to the club" },
  { name: "Inner Circle", note: "Priority events & intros" },
  { name: "Founding Member", note: "Among the first hundred" },
  { name: "Sovereign", note: "By nomination only" },
];

export default async function MembershipPage() {
  const [app, user] = await Promise.all([
    repository.getMembershipApplication(),
    repository.getCurrentUser(),
  ]);
  const currentIdx = tiers.findIndex((t) => t.name === user.membershipTier);

  return (
    <>
      <AppHeader title="Membership" back />
      <div className="stagger px-5 pb-10 pt-5">
        {/* Application status */}
        <Card glow className="p-6 text-center">
          <span className="text-3xl text-gold">✦</span>
          <h1 className="mt-3 font-display text-2xl text-chalk">Application in Peer Review</h1>
          <p className="mx-auto mt-2 max-w-[18rem] text-[13px] leading-relaxed text-mist">
            Your standing is being evaluated by the panel. Most decisions land within
            seven days.
          </p>

          <div className="mt-6 flex items-center justify-between">
            {app.stages.map((s, i) => (
              <div key={s.label} className="flex flex-1 flex-col items-center">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-[13px]",
                    s.done
                      ? "border-gold bg-gold-fill text-obsidian"
                      : s.active
                        ? "border-gold text-gold shadow-goldsoft"
                        : "border-line text-faint"
                  )}
                >
                  {s.done ? <Icon name="check" size={15} /> : i + 1}
                </span>
                <span className={cn("mt-2 text-center text-[9.5px] uppercase tracking-wide", s.active ? "text-gold" : "text-faint")}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Details */}
        <section className="mt-7">
          <SectionHeader title="Your Application" />
          <Card className="divide-y divide-line">
            <Row label="Referral" value={app.referralSource} />
            <Row label="Submitted" value={formatDate(app.submittedAt)} />
            <Row label="Status" value="Peer review" gold />
          </Card>
          <Card className="mt-3 p-4">
            <p className="text-[12.5px] leading-relaxed text-mist">
              <span className="text-gold">Panel note — </span>
              {app.reviewNotes}
            </p>
          </Card>
        </section>

        {/* Tiers */}
        <section className="mt-8">
          <GoldDivider className="mb-6" label="The ladder" />
          <SectionHeader title="Membership Tiers" />
          <div className="space-y-2.5">
            {tiers.map((t, i) => {
              const current = i === currentIdx;
              return (
                <div
                  key={t.name}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-4",
                    current ? "border-gold/50 bg-gold/[0.06]" : "border-line"
                  )}
                >
                  <span className={cn("font-display text-lg", current ? "text-gold-gradient" : "text-faint")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <div className={cn("text-sm", current ? "text-chalk" : "text-mist")}>{t.name}</div>
                    <div className="text-[11px] text-faint">{t.note}</div>
                  </div>
                  {current && <Badge variant="gold">You</Badge>}
                </div>
              );
            })}
          </div>
        </section>

        <Link href="/invite" className="mt-8 block">
          <Button variant="gold" size="lg" full icon={<Icon name="invite" size={18} />}>
            Refer a Peer
          </Button>
        </Link>
      </div>
    </>
  );
}

function Row({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-[11px] uppercase tracking-luxe text-faint">{label}</span>
      <span className={cn("text-[13.5px]", gold ? "text-gold" : "text-chalk")}>{value}</span>
    </div>
  );
}
