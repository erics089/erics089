import { getBrandConfig } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { BrandForm } from "@/components/settings/brand-form";
import { McpServers } from "@/components/settings/mcp-servers";
import { ApiKeyStatus } from "@/components/settings/api-key-status";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [brand, mcpServers] = await Promise.all([
    getBrandConfig(),
    prisma.mcpServer.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Einstellungen"
        description="Markenkonfiguration, MCP-Server und Verbindungsstatus aller externen Tools."
      />
      <ApiKeyStatus />
      <McpServers initial={mcpServers} />
      <BrandForm brand={brand} />
    </div>
  );
}
