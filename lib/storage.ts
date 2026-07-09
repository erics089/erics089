import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { getSecret } from "./secrets";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Speichert eine hochgeladene Datei. Auf Vercel ist das Dateisystem
 * serverless-Funktionen ephemer (Uploads würden nicht persistieren), daher
 * wird bevorzugt Vercel Blob genutzt, sobald ein Token hinterlegt ist
 * (Einstellungen -> API-Keys oder BLOB_READ_WRITE_TOKEN in .env.local).
 * Ohne Token: lokales Dateisystem unter public/uploads (für Self-Hosting).
 */
export async function saveUpload(file: File): Promise<{ url: string }> {
  const ext = path.extname(file.name) || "";
  const safeName = `${randomUUID()}${ext}`;

  const blobToken = await getSecret("BLOB_READ_WRITE_TOKEN");
  if (blobToken) {
    const blob = await put(`uploads/${safeName}`, file, {
      access: "public",
      token: blobToken,
      contentType: file.type,
    });
    return { url: blob.url };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, safeName), buffer);
  return { url: `/uploads/${safeName}` };
}
