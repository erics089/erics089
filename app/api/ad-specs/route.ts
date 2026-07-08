import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");
  const specs = await prisma.adSpec.findMany({
    where: platform ? { platform } : {},
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(specs);
}
