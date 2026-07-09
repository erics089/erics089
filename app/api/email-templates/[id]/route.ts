import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const template = await prisma.emailTemplate.findUnique({ where: { id: params.id } });
  if (!template) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  return NextResponse.json(template);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.emailTemplate.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
