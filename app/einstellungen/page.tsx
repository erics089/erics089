import { getBrandConfig } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { getIntegrationStatuses, INTEGRATIONS } from "@/lib/integrations";
import { getMaskedSecrets } from "@/lib/secrets";
import { PageHeader } from "@/components/layout/page-header";
import { BrandForm } from "@/components/settings/brand-form";
import { McpServers } from "@/components/settings/mcp-servers";
import { ApiKeysForm } from "@/components/settings/api-keys-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const allEnvVars = INTEGRATIONS.flatMap((i) => i.envVars as readonly string[]);

  const [brand, mcpServers, statuses, masked] = await Promise.all([
    getBrandConfig(),
    prisma.mcpServer.findMany({ orderBy: { createdAt: "asc" } }),
    getIntegrationStatuses(),
    getMaskedSecrets(allEnvVars),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Einstellungen"
        description="Markenkonfiguration, API-Keys, MCP-Server und Verbindungsstatus aller externen Tools."
      />
      <ApiKeysForm initialStatuses={statuses} initialMasked={masked} />
      <McpServers initial={mcpServers} />
      <BrandForm brand={brand} />
    </div>
  );
}
