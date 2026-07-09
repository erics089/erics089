import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const templates = await prisma.whatsappTemplate.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(templates);
}
