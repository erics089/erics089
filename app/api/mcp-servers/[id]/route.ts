import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const server = await prisma.mcpServer.update({
    where: { id: params.id },
    data: {
      name: body.name,
      url: body.url,
      kind: body.kind,
      transport: body.transport,
      apiKeyEnv: body.apiKeyEnv || null,
    },
  });
  return NextResponse.json(server);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.mcpServer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
