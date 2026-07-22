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

export async function createCustomer(formData: FormData) {
  const ctx = await requireContext();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Firmenname ist erforderlich.");

  const customer = await db.customer.create({
    data: {
      agencyId: ctx.agencyId,
      name,
      industry: String(formData.get("industry") ?? "") || null,
      location: String(formData.get("location") ?? "") || null,
      contactPerson: String(formData.get("contactPerson") ?? "") || null,
      email: String(formData.get("email") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
    },
  });

  await db.auditLog.create({
    data: {
      agencyId: ctx.agencyId,
      userId: ctx.userId,
      customerId: customer.id,
      action: "customer.created",
      entityType: "Customer",
      entityId: customer.id,
    },
  });

  revalidatePath("/dashboard/crm");
  redirect(`/dashboard/crm/${customer.id}`);
}

export async function updateCustomerStage(customerId: string, formData: FormData) {
  const ctx = await requireContext();
  const stage = String(formData.get("stage") ?? "");

  const customer = await db.customer.findFirst({
    where: { id: customerId, agencyId: ctx.agencyId },
  });
  if (!customer) throw new Error("Kunde nicht gefunden.");

  await db.customer.update({
    where: { id: customerId },
    data: { pipelineStage: stage as never },
  });

  await db.auditLog.create({
    data: {
      agencyId: ctx.agencyId,
      userId: ctx.userId,
      customerId,
      action: "customer.stage_changed",
      entityType: "Customer",
      entityId: customerId,
      changes: { pipelineStage: stage },
    },
  });

  revalidatePath("/dashboard/crm");
}

export async function addContact(customerId: string, formData: FormData) {
  const ctx = await requireContext();

  const customer = await db.customer.findFirst({
    where: { id: customerId, agencyId: ctx.agencyId },
  });
  if (!customer) throw new Error("Kunde nicht gefunden.");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name ist erforderlich.");

  await db.customerContact.create({
    data: {
      customerId,
      name,
      role: String(formData.get("role") ?? "") || null,
      email: String(formData.get("email") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
    },
  });

  revalidatePath(`/dashboard/crm/${customerId}`);
}

export async function addNote(customerId: string, formData: FormData) {
  const ctx = await requireContext();

  const customer = await db.customer.findFirst({
    where: { id: customerId, agencyId: ctx.agencyId },
  });
  if (!customer) throw new Error("Kunde nicht gefunden.");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await db.customerNote.create({
    data: { customerId, authorId: ctx.userId, body },
  });

  revalidatePath(`/dashboard/crm/${customerId}`);
}
