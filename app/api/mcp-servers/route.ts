import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const servers = await prisma.mcpServer.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(servers);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name || !body.url) {
    return NextResponse.json({ error: "Name und URL sind erforderlich." }, { status: 400 });
  }
  const server = await prisma.mcpServer.create({
    data: {
      name: body.name,
      url: body.url,
      kind: body.kind ?? "generic",
      transport: body.transport ?? "http",
      apiKeyEnv: body.apiKeyEnv || null,
    },
  });
  return NextResponse.json(server, { status: 201 });
}
