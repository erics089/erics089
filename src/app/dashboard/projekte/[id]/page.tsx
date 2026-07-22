import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAgencyContext } from "@/lib/agency-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StageSelect } from "@/components/stage-select";
import { createTask, logTime, updateTaskStatus } from "../actions";

const TASK_STATUSES = [
  { value: "TODO", label: "Offen" },
  { value: "IN_PROGRESS", label: "In Arbeit" },
  { value: "REVIEW", label: "Review" },
  { value: "DONE", label: "Erledigt" },
] as const;

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Niedrig",
  MEDIUM: "Mittel",
  HIGH: "Hoch",
  URGENT: "Dringend",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getAgencyContext();
  if (!ctx) notFound();

  const project = await db.project.findFirst({
    where: { id, agencyId: ctx.agencyId },
    include: {
      customer: true,
      status: true,
      tasks: {
        include: { assignee: true, timeEntries: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!project) notFound();

  const members = await db.agencyMembership.findMany({
    where: { agencyId: ctx.agencyId, role: { not: "CLIENT" } },
    include: { user: true },
  });

  const totalMinutes = project.tasks.reduce(
    (sum, t) => sum + t.timeEntries.reduce((s, e) => s + e.minutes, 0),
    0
  );
  const usedHours = totalMinutes / 60;
  const budgetHours = project.budgetHours ? Number(project.budgetHours) : null;
  const usagePct = budgetHours ? Math.round((usedHours / budgetHours) * 100) : null;

  const createTaskWithId = createTask.bind(null, project.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/projekte" className="text-sm text-muted-foreground hover:underline">
          ← Projekte
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{project.name}</h1>
        <p className="text-sm text-muted-foreground">
          <Link href={`/dashboard/crm/${project.customer.id}`} className="hover:underline">
            {project.customer.name}
          </Link>{" "}
          · {project.status.name}
        </p>
      </div>

      {budgetHours && (
        <Card>
          <CardContent className="flex items-center justify-between p-4 text-sm">
            <span>
              Budget: {usedHours.toFixed(1)}h / {budgetHours.toFixed(1)}h
            </span>
            <Badge variant={usagePct && usagePct > 90 ? "destructive" : "secondary"}>
              {usagePct}%
            </Badge>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Neue Aufgabe</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTaskWithId} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="title" className="text-xs">
                Titel
              </Label>
              <Input id="title" name="title" className="h-8 w-56" required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="priority" className="text-xs">
                Priorität
              </Label>
              <select
                id="priority"
                name="priority"
                defaultValue="MEDIUM"
                className="h-8 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="assigneeId" className="text-xs">
                Zuständig
              </Label>
              <select
                id="assigneeId"
                name="assigneeId"
                className="h-8 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option value="">— niemand —</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="dueDate" className="text-xs">
                Fällig
              </Label>
              <Input id="dueDate" name="dueDate" type="date" className="h-8" />
            </div>
            <label className="flex items-center gap-1.5 pb-1.5 text-xs text-muted-foreground">
              <input type="checkbox" name="billable" defaultChecked />
              Abrechenbar
            </label>
            <Button type="submit" size="sm" variant="outline">
              Aufgabe anlegen
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TASK_STATUSES.map((column) => (
          <div key={column.value} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {column.label} (
              {project.tasks.filter((t) => t.status === column.value).length})
            </h2>
            <div className="flex flex-col gap-3">
              {project.tasks
                .filter((t) => t.status === column.value)
                .map((task) => {
                  const taskMinutes = task.timeEntries.reduce((s, e) => s + e.minutes, 0);
                  return (
                    <Card key={task.id}>
                      <CardContent className="flex flex-col gap-2 p-4 text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium">{task.title}</span>
                          <Badge variant="outline">{PRIORITY_LABELS[task.priority]}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {task.assignee?.name ?? "Niemand zugewiesen"}
                          {task.dueDate &&
                            ` · fällig ${task.dueDate.toLocaleDateString("de-DE")}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(taskMinutes / 60).toFixed(1)}h erfasst
                        </div>
                        <StageSelect
                          action={updateTaskStatus.bind(null, task.id)}
                          defaultValue={task.status}
                          stages={TASK_STATUSES}
                        />
                        <form
                          action={logTime.bind(null, task.id)}
                          className="flex items-center gap-1.5"
                        >
                          <Input
                            name="minutes"
                            type="number"
                            min="1"
                            placeholder="Min."
                            className="h-7 w-16 text-xs"
                            required
                          />
                          <Button type="submit" size="sm" variant="ghost" className="h-7 px-2 text-xs">
                            Zeit +
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
