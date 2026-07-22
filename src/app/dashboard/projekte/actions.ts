"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAgencyContext } from "@/lib/agency-context";

async function requireContext() {
  const ctx = await getAgencyContext();
  if (!ctx) throw new Error("Nicht angemeldet oder keiner Agentur zugeordnet.");
  return ctx;
}

export async function createProject(formData: FormData) {
  const ctx = await requireContext();

  const name = String(formData.get("name") ?? "").trim();
  const customerId = String(formData.get("customerId") ?? "");
  const statusId = String(formData.get("statusId") ?? "");
  if (!name || !customerId || !statusId) {
    throw new Error("Name, Kunde und Status sind erforderlich.");
  }

  const customer = await db.customer.findFirst({
    where: { id: customerId, agencyId: ctx.agencyId },
  });
  if (!customer) throw new Error("Kunde nicht gefunden.");

  const budgetHoursRaw = String(formData.get("budgetHours") ?? "").trim();

  const project = await db.project.create({
    data: {
      agencyId: ctx.agencyId,
      customerId,
      name,
      type: String(formData.get("type") ?? "OTHER") as never,
      statusId,
      budgetHours: budgetHoursRaw ? Number(budgetHoursRaw) : null,
    },
  });

  await db.auditLog.create({
    data: {
      agencyId: ctx.agencyId,
      userId: ctx.userId,
      customerId,
      action: "project.created",
      entityType: "Project",
      entityId: project.id,
    },
  });

  revalidatePath("/dashboard/projekte");
  redirect(`/dashboard/projekte/${project.id}`);
}

export async function createTask(projectId: string, formData: FormData) {
  const ctx = await requireContext();

  const project = await db.project.findFirst({
    where: { id: projectId, agencyId: ctx.agencyId },
  });
  if (!project) throw new Error("Projekt nicht gefunden.");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Titel ist erforderlich.");

  const assigneeId = String(formData.get("assigneeId") ?? "") || null;
  const dueDateRaw = String(formData.get("dueDate") ?? "");

  await db.task.create({
    data: {
      projectId,
      title,
      priority: String(formData.get("priority") ?? "MEDIUM") as never,
      assigneeId,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      billable: formData.get("billable") === "on",
    },
  });

  revalidatePath(`/dashboard/projekte/${projectId}`);
}

export async function updateTaskStatus(taskId: string, formData: FormData) {
  const ctx = await requireContext();
  const status = String(formData.get("status") ?? "");

  const task = await db.task.findFirst({
    where: { id: taskId, project: { agencyId: ctx.agencyId } },
    select: { id: true, projectId: true },
  });
  if (!task) throw new Error("Aufgabe nicht gefunden.");

  await db.task.update({
    where: { id: taskId },
    data: { status: status as never },
  });

  revalidatePath(`/dashboard/projekte/${task.projectId}`);
}

export async function logTime(taskId: string, formData: FormData) {
  const ctx = await requireContext();

  const task = await db.task.findFirst({
    where: { id: taskId, project: { agencyId: ctx.agencyId } },
    select: { id: true, projectId: true },
  });
  if (!task) throw new Error("Aufgabe nicht gefunden.");

  const minutes = Number(formData.get("minutes") ?? 0);
  if (!minutes || minutes <= 0) throw new Error("Minuten müssen größer als 0 sein.");

  await db.timeEntry.create({
    data: {
      taskId,
      userId: ctx.userId,
      minutes,
      billable: formData.get("billable") === "on",
      note: String(formData.get("note") ?? "") || null,
    },
  });

  revalidatePath(`/dashboard/projekte/${task.projectId}`);
}
