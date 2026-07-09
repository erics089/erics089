import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const template = await prisma.emailTemplate.findUnique({ where: { id: params.id } });
  if (!template) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "html";
  const body = format === "text" ? template.textBody : template.htmlBody;
  const ext = format === "text" ? "txt" : "html";

  return new NextResponse(body, {
    headers: {
      "Content-Type": format === "text" ? "text/plain; charset=utf-8" : "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${template.subject.replace(/[^a-z0-9äöüß]+/gi, "-")}.${ext}"`,
    },
  });
}
