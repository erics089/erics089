import { prisma } from "./prisma";

/**
 * Liest einen API-Key. DB-Wert (in den Einstellungen eingetragen) hat
 * Vorrang vor der gleichnamigen Umgebungsvariable — so funktioniert die App
 * sowohl mit .env.local (klassisches Self-Hosting) als auch rein über die
 * Oberfläche (z.B. von unterwegs über die iOS-PWA, ohne Server-Zugriff).
 */
export async function getSecret(key: string): Promise<string | undefined> {
  const row = await prisma.secret.findUnique({ where: { key } });
  if (row?.value) return row.value;
  return process.env[key] || undefined;
}

export async function setSecret(key: string, value: string): Promise<void> {
  const trimmed = value.trim();
  if (!trimmed) {
    await prisma.secret.deleteMany({ where: { key } });
    return;
  }
  await prisma.secret.upsert({
    where: { key },
    update: { value: trimmed },
    create: { key, value: trimmed },
  });
}

export async function hasSecret(key: string): Promise<boolean> {
  return Boolean(await getSecret(key));
}

/** Maskierte Vorschau für die UI, z.B. "sk-ant-••••7f2a" */
export function maskSecret(value: string): string {
  if (value.length <= 6) return "••••";
  return `${value.slice(0, 6)}••••${value.slice(-4)}`;
}

export async function getMaskedSecrets(keys: string[]): Promise<Record<string, string | null>> {
  const entries = await Promise.all(
    keys.map(async (key) => {
      const value = await getSecret(key);
      return [key, value ? maskSecret(value) : null] as const;
    })
  );
  return Object.fromEntries(entries);
}
