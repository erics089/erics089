import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: { posts: true, adSpecs: true },
  });
  if (!campaign) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  return NextResponse.json(campaign);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of ["name", "status", "occasion", "offer", "budget"] as const) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  const campaign = await prisma.campaign.update({ where: { id: params.id }, data });
  return NextResponse.json(campaign);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.campaign.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
