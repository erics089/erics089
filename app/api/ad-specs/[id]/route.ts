import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const spec = await prisma.adSpec.findUnique({ where: { id: params.id } });
  if (!spec) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  return NextResponse.json(spec);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const spec = await prisma.adSpec.update({
    where: { id: params.id },
    data: { ...(body.status ? { status: body.status } : {}), ...(body.budget !== undefined ? { budget: body.budget } : {}) },
  });
  return NextResponse.json(spec);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.adSpec.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
