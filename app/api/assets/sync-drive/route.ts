import { NextResponse } from "next/server";
import { syncGoogleDrive, NoDriveServerError } from "@/lib/google-drive-mcp";

export async function POST() {
  try {
    const result = await syncGoogleDrive();
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof NoDriveServerError) {
      return NextResponse.json({ error: "MISSING_CONNECTION", message: err.message }, { status: 424 });
    }
    return NextResponse.json(
      { error: "SYNC_FAILED", message: err instanceof Error ? err.message : "Synchronisierung fehlgeschlagen." },
      { status: 500 }
    );
  }
}
