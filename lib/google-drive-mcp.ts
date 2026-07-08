import { prisma } from "./prisma";
import { connectMcp } from "./mcp";

export class NoDriveServerError extends Error {
  constructor() {
    super("Kein Google-Drive-MCP-Server konfiguriert.");
    this.name = "NoDriveServerError";
  }
}

type DriveFileLike = {
  id?: string;
  name?: string;
  title?: string;
  mimeType?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  url?: string;
};

function extractFiles(payload: unknown): DriveFileLike[] {
  if (Array.isArray(payload)) return payload as DriveFileLike[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of ["files", "items", "results", "data"]) {
      if (Array.isArray(obj[key])) return obj[key] as DriveFileLike[];
    }
  }
  return [];
}

/**
 * Best-effort-Synchronisierung: verbindet sich mit dem konfigurierten
 * Google-Drive-MCP-Server, sucht ein plausibles "Dateien auflisten"-Tool
 * und übernimmt die Ergebnisse in die Asset-Bibliothek. Da MCP-Server für
 * Google Drive unterschiedliche Tool-Namen verwenden können, wird heuristisch
 * nach einem passenden Tool gesucht statt einen fixen Namen vorauszusetzen.
 */
export async function syncGoogleDrive() {
  const server = await prisma.mcpServer.findFirst({ where: { kind: "google-drive" } });
  if (!server) throw new NoDriveServerError();

  const client = await connectMcp(server);
  try {
    const { tools } = await client.listTools();
    const candidate = tools.find((t) => /file|drive|asset|search|list/i.test(t.name));
    if (!candidate) {
      throw new Error(
        `Kein passendes Tool auf „${server.name}” gefunden. Verfügbare Tools: ${tools.map((t) => t.name).join(", ") || "keine"}`
      );
    }

    const result = await client.callTool({ name: candidate.name, arguments: {} });
    const textBlocks = Array.isArray(result.content)
      ? result.content.filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text)
      : [];

    let files: DriveFileLike[] = [];
    for (const text of textBlocks) {
      try {
        files = extractFiles(JSON.parse(text));
        if (files.length) break;
      } catch {
        // kein JSON in diesem Block — ignorieren
      }
    }

    let synced = 0;
    for (const file of files) {
      const id = file.id ?? file.name ?? file.title;
      if (!id) continue;
      const existing = await prisma.asset.findFirst({ where: { driveFileId: String(id) } });
      const data = {
        source: "drive",
        driveFileId: String(id),
        filename: file.name ?? file.title ?? "Unbenannt",
        mimeType: file.mimeType ?? "image/jpeg",
        previewUrl: file.thumbnailLink ?? file.webViewLink ?? file.url ?? null,
      };
      if (existing) {
        await prisma.asset.update({ where: { id: existing.id }, data });
      } else {
        await prisma.asset.create({ data });
      }
      synced += 1;
    }

    return { synced, toolUsed: candidate.name };
  } finally {
    await client.close();
  }
}
