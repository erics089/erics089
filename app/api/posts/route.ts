import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const campaignId = searchParams.get("campaignId");
  const posts = await prisma.post.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(campaignId ? { campaignId } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const post = await prisma.post.create({
    data: {
      type: body.type,
      title: body.title,
      treatment: body.treatment ?? null,
      persona: body.persona ?? null,
      language: body.language ?? "DE",
      contentJson: JSON.stringify(body.contentJson),
      campaignId: body.campaignId ?? null,
      ideaId: body.ideaId ?? null,
      status: "Entwurf",
    },
  });
  return NextResponse.json(post, { status: 201 });
}
