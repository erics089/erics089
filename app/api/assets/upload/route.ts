import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/storage";

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

  const { url } = await saveUpload(file);

  const asset = await prisma.asset.create({
    data: {
      source: "upload",
      filename: file.name,
      mimeType: file.type,
      previewUrl: url,
      tags,
    },
  });

  return NextResponse.json(asset, { status: 201 });
}
