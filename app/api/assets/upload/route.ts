import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const tags = (form.get("tags") as string) || "";

  if (!file) {
    return NextResponse.json({ error: "Keine Datei übermittelt." }, { status: 400 });
  }
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    return NextResponse.json({ error: "Nur Bild- oder Videodateien sind erlaubt." }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name) || "";
  const safeName = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, safeName), buffer);

  const asset = await prisma.asset.create({
    data: {
      source: "upload",
      filename: file.name,
      mimeType: file.type,
      previewUrl: `/uploads/${safeName}`,
      tags,
    },
  });

  return NextResponse.json(asset, { status: 201 });
}
