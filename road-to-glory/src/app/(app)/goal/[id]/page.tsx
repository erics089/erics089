import { notFound } from "next/navigation";
import { repository } from "@/lib/repository";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, Badge, GoldDivider, SectionHeader, Button } from "@/components/ui/primitives";
import { ProgressRing, MilestoneTrack } from "@/components/ui/Progress";
import { Icon } from "@/components/ui/Icon";
import { categoryGlyph, formatDate } from "@/lib/utils";

export default async function GoalDetailPage({ params }: { params: { id: string } }) {
  const goal = await repository.getGoal(params.id);
  if (!goal) notFound();

  const done = goal.actionSteps.filter((s) => s.done).length;

  return (
    <>
      <AppHeader title="Goal Engine" back />
      <div className="px-5 pb-10 pt-5">
        {/* Hero */}
        <Card glow className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-gold">{categoryGlyph(goal.category)}</span>
            <span className="text-[10px] uppercase tracking-luxe text-faint">{goal.category}</span>
            <Badge variant="line" className="ml-auto">{goal.visibility}</Badge>
          </div>
          <h1 className="font-display text-2xl leading-tight text-chalk">{goal.title}</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-mist">{goal.description}</p>

          <GoldDivider className="my-5" />

          <div className="flex items-center gap-5">
            <ProgressRing value={goal.progress} size={104} label={`${goal.progress}%`} sublabel="Complete" />
            <div className="flex-1 space-y-3">
              <Row label="Current level" value={`Level ${goal.currentLevel}`} />
              <Row label="Target level" value={`Level ${goal.targetLevel}`} />
              {goal.deadline && <Row label="Deadline" value={formatDate(goal.deadline)} />}
            </div>
          </div>
        </Card>

        {/* Next action */}
        <section className="mt-8">
          <SectionHeader title="Next Action" />
          <Card className="flex items-center gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold">
              <Icon name="target" size={20} />
            </span>
            <p className="flex-1 text-[15px] text-chalk">{goal.nextAction}</p>
          </Card>
        </section>

        {/* Action steps as the Road */}
        <section className="mt-8">
          <SectionHeader title="Milestones" action={`${done}/${goal.actionSteps.length} complete`} />
          <Card className="p-5">
            <MilestoneTrack steps={goal.actionSteps} />
          </Card>
        </section>

        {/* AI coach */}
        <section className="mt-8">
          <SectionHeader title="Coach Insight" />
          <Card className="p-5">
            <div className="flex gap-3">
              <span className="text-gold">✦</span>
              <p className="text-[13.5px] leading-relaxed text-mist">
                You are {goal.progress}% up this climb with {goal.targetLevel - goal.currentLevel} levels
                remaining. Protect the next action from noise — one decisive move this week
                keeps the compounding intact.
              </p>
            </div>
          </Card>
        </section>

        <div className="mt-8 flex gap-3">
          <Button variant="gold" size="lg" full icon={<Icon name="check" size={18} />}>
            Log Progress
          </Button>
          <Button variant="dark" size="lg" className="shrink-0 px-5">
            <Icon name="settings" size={18} />
          </Button>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] uppercase tracking-luxe text-faint">{label}</span>
      <span className="text-[13.5px] text-chalk">{value}</span>
    </div>
  );
}
