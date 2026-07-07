export const INTEGRATIONS = [
  {
    key: "anthropic",
    label: "Anthropic (Content-Engine)",
    envVars: ["ANTHROPIC_API_KEY"],
    docsHint: "console.anthropic.com/settings/keys",
  },
  {
    key: "meta",
    label: "Meta Graph API (Instagram/Facebook + Meta Ads)",
    envVars: ["META_ACCESS_TOKEN", "META_APP_ID", "META_APP_SECRET"],
    docsHint: "developers.facebook.com/apps",
  },
  {
    key: "google-ads",
    label: "Google Ads API",
    envVars: ["GOOGLE_ADS_DEVELOPER_TOKEN", "GOOGLE_ADS_CUSTOMER_ID"],
    docsHint: "ads.google.com/aw/apicenter",
  },
  {
    key: "google-drive",
    label: "Google Drive (Asset-Bibliothek)",
    envVars: ["GOOGLE_DRIVE_CLIENT_ID", "GOOGLE_DRIVE_REFRESH_TOKEN"],
    docsHint: "console.cloud.google.com",
  },
  {
    key: "higgsfield",
    label: "Higgsfield (Bild-/Video-Generierung)",
    envVars: ["HIGGSFIELD_API_KEY"],
    docsHint: "higgsfield.ai",
  },
  {
    key: "midjourney",
    label: "Midjourney",
    envVars: ["MIDJOURNEY_API_KEY"],
    docsHint: "Anbieter-Dashboard",
  },
  {
    key: "runway",
    label: "Runway",
    envVars: ["RUNWAY_API_KEY"],
    docsHint: "runwayml.com",
  },
  {
    key: "email",
    label: "E-Mail-Versand",
    envVars: ["EMAIL_PROVIDER_API_KEY"],
    docsHint: "z.B. Postmark, Sendgrid, Brevo",
  },
  {
    key: "whatsapp",
    label: "WhatsApp Business API",
    envVars: ["WHATSAPP_BUSINESS_TOKEN"],
    docsHint: "business.facebook.com/wa/manage",
  },
] as const;

export function getIntegrationStatuses() {
  return INTEGRATIONS.map((integration) => {
    const connected = integration.envVars.every((v) => Boolean(process.env[v]));
    const partially = !connected && integration.envVars.some((v) => Boolean(process.env[v]));
    return {
      ...integration,
      status: connected ? "verbunden" : partially ? "unvollständig" : "fehlt",
    } as const;
  });
}
