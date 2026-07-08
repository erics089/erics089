import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const events = await prisma.calendarEvent.findMany({
    where: {
      ...(from && to ? { date: { gte: new Date(from), lte: new Date(to) } } : {}),
    },
    orderBy: { date: "asc" },
    include: { ideas: true },
  });
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.title || !body.date) {
    return NextResponse.json({ error: "Titel und Datum sind erforderlich." }, { status: 400 });
  }
  const event = await prisma.calendarEvent.create({
    data: {
      title: body.title,
      date: new Date(body.date),
      category: body.category ?? "Lokal",
      description: body.description ?? null,
      recurring: Boolean(body.recurring),
      isCustom: true,
    },
  });
  return NextResponse.json(event, { status: 201 });
}
