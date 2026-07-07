import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testMcpServer } from "@/lib/mcp";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const server = await prisma.mcpServer.findUnique({ where: { id: params.id } });
  if (!server) return NextResponse.json({ error: "Server nicht gefunden." }, { status: 404 });

  const result = await testMcpServer(server);
  const updated = await prisma.mcpServer.update({
    where: { id: params.id },
    data: {
      status: result.ok ? "verbunden" : "fehler",
      lastError: result.ok ? null : result.error,
      lastTestedAt: new Date(),
    },
  });
  return NextResponse.json({ ...updated, testResult: result });
}
