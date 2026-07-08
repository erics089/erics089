export class MetaNotConfiguredError extends Error {
  constructor() {
    super("Meta Graph API ist nicht konfiguriert.");
    this.name = "MetaNotConfiguredError";
  }
}

export function metaConfigured() {
  return Boolean(process.env.META_ACCESS_TOKEN && process.env.META_IG_BUSINESS_ACCOUNT_ID);
}

/**
 * Veröffentlicht ein Bild-Posting auf Instagram über die Meta Graph API.
 * Benötigt eine öffentlich erreichbare Bild-URL (z.B. gehostetes Asset).
 */
export async function publishToInstagram(params: { imageUrl: string; caption: string }) {
  const token = process.env.META_ACCESS_TOKEN;
  const igUserId = process.env.META_IG_BUSINESS_ACCOUNT_ID;
  if (!token || !igUserId) throw new MetaNotConfiguredError();

  const base = `https://graph.facebook.com/v20.0/${igUserId}`;

  const createRes = await fetch(
    `${base}/media?image_url=${encodeURIComponent(params.imageUrl)}&caption=${encodeURIComponent(
      params.caption
    )}&access_token=${token}`,
    { method: "POST" }
  );
  const createJson = await createRes.json();
  if (!createRes.ok) throw new Error(createJson?.error?.message || "Media-Container konnte nicht erstellt werden.");

  const publishRes = await fetch(
    `${base}/media_publish?creation_id=${createJson.id}&access_token=${token}`,
    { method: "POST" }
  );
  const publishJson = await publishRes.json();
  if (!publishRes.ok) throw new Error(publishJson?.error?.message || "Veröffentlichung fehlgeschlagen.");

  return publishJson as { id: string };
}
