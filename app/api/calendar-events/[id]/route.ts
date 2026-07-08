import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const event = await prisma.calendarEvent.findUnique({
    where: { id: params.id },
    include: { ideas: true },
  });
  if (!event) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  return NextResponse.json(event);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const event = await prisma.calendarEvent.update({
    where: { id: params.id },
    data: {
      ...(body.title ? { title: body.title } : {}),
      ...(body.date ? { date: new Date(body.date) } : {}),
      ...(body.category ? { category: body.category } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
    },
  });
  return NextResponse.json(event);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.calendarEvent.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
