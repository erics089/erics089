import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { McpServer } from "@prisma/client";

/**
 * Generische MCP-Verbindungsschicht. Neue Server werden ausschließlich über
 * die Settings-Seite (Name + URL, siehe Prisma-Modell McpServer) hinzugefügt
 * — kein Code-Change nötig, um einen weiteren MCP-Server anzubinden.
 */
export async function connectMcp(server: Pick<McpServer, "url" | "apiKeyEnv" | "name">) {
  const headers: Record<string, string> = {};
  if (server.apiKeyEnv) {
    const key = process.env[server.apiKeyEnv];
    if (key) headers["Authorization"] = `Bearer ${key}`;
  }

  const transport = new StreamableHTTPClientTransport(new URL(server.url), {
    requestInit: { headers },
  });
  const client = new Client({ name: "mirra-command-center", version: "0.1.0" }, { capabilities: {} });
  await client.connect(transport);
  return client;
}

export async function testMcpServer(server: Pick<McpServer, "url" | "apiKeyEnv" | "name">) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const client = await connectMcp(server);
    const tools = await client.listTools().catch(() => ({ tools: [] }));
    await client.close();
    clearTimeout(timeout);
    return { ok: true as const, toolCount: tools.tools?.length ?? 0 };
  } catch (err) {
    clearTimeout(timeout);
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Verbindung fehlgeschlagen",
    };
  }
}
