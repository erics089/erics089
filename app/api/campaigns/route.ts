import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const campaigns = await prisma.campaign.findMany({
    where: status ? { status } : {},
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { posts: true, adSpecs: true } } },
  });
  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  const body = await req.json();
  const campaign = await prisma.campaign.create({
    data: {
      name: body.name,
      goal: body.goal,
      treatments: body.treatments,
      timeframeStart: body.timeframeStart ? new Date(body.timeframeStart) : null,
      timeframeEnd: body.timeframeEnd ? new Date(body.timeframeEnd) : null,
      occasion: body.occasion ?? null,
      budget: body.budget ? Number(body.budget) : null,
      persona: body.persona,
      channels: body.channels,
      offer: body.offer ?? null,
      assetStrategy: body.assetStrategy ?? "drive",
      status: "Entwurf",
    },
  });
  return NextResponse.json(campaign, { status: 201 });
}
