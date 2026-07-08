import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.status) data.status = body.status;
  if (body.title) data.title = body.title;
  if (body.contentJson) data.contentJson = JSON.stringify(body.contentJson);
  if (body.scheduledAt !== undefined) data.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
  if (body.status === "Veröffentlicht") data.publishedAt = new Date();

  const post = await prisma.post.update({ where: { id: params.id }, data });
  return NextResponse.json(post);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
