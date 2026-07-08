import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const asset = await prisma.asset.update({
    where: { id: params.id },
    data: {
      ...(body.tags !== undefined ? { tags: body.tags } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
    },
  });
  return NextResponse.json(asset);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.asset.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
