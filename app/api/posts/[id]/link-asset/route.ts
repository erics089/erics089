import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const usage = await prisma.assetUsage.findFirst({
    where: { postId: params.id },
    orderBy: { usedAt: "desc" },
    include: { asset: true },
  });
  return NextResponse.json(usage);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const usage = await prisma.assetUsage.create({
    data: { assetId: body.assetId, postId: params.id, context: `Post: ${post.title}` },
    include: { asset: true },
  });
  return NextResponse.json(usage, { status: 201 });
}
