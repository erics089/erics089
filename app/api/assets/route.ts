import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const tag = searchParams.get("tag");

  const assets = await prisma.asset.findMany({
    where: {
      ...(q ? { filename: { contains: q } } : {}),
      ...(tag ? { tags: { contains: tag } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { usages: { include: { post: true }, orderBy: { usedAt: "desc" } } },
  });
  return NextResponse.json(assets);
}
