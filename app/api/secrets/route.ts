import { NextResponse } from "next/server";
import { getSecret, setSecret, maskSecret, getMaskedSecrets } from "@/lib/secrets";
import { INTEGRATIONS } from "@/lib/integrations";

const KNOWN_KEYS = new Set(INTEGRATIONS.flatMap((i) => i.envVars as readonly string[]));

export async function GET() {
  const masked = await getMaskedSecrets(Array.from(KNOWN_KEYS));
  return NextResponse.json(masked);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { key, value } = body as { key: string; value: string };
  if (!key || !KNOWN_KEYS.has(key)) {
    return NextResponse.json({ error: "Unbekannter Key." }, { status: 400 });
  }
  await setSecret(key, value ?? "");
  const stored = await getSecret(key);
  return NextResponse.json({ key, masked: stored ? maskSecret(stored) : null });
}
