export type ModuleDefinition = {
  key:
    | "CRM"
    | "BILLING"
    | "PROJECTS"
    | "WEBSITES"
    | "AI_MCP"
    | "MARKETING"
    | "BACKUP"
    | "SECURITY";
  slug: string;
  label: string;
  description: string;
};

/// Reihenfolge entspricht der Roadmap-Priorisierung (siehe ARCHITECTURE.md).
export const MODULES: ModuleDefinition[] = [
  {
    key: "CRM",
    slug: "crm",
    label: "Kundenverwaltung",
    description: "Kundenakten, Ansprechpartner, Lead-Pipeline.",
  },
  {
    key: "PROJECTS",
    slug: "projekte",
    label: "Projekte",
    description: "Aufgaben, Zeiterfassung, Kanban & Timeline.",
  },
  {
    key: "WEBSITES",
    slug: "websites",
    label: "Websites",
    description: "Wizard, Live-Vorschau, KI-Generierung, Onepage-MCP.",
  },
  {
    key: "BILLING",
    slug: "rechnungen",
    label: "Rechnungen",
    description: "Angebote, Rechnungen, XRechnung/ZUGFeRD, Retainer.",
  },
  {
    key: "MARKETING",
    slug: "marketing",
    label: "Marketing",
    description: "Kampagnen, Ad-Previews, KI-Creatives.",
  },
  {
    key: "AI_MCP",
    slug: "ki-mcp",
    label: "KI & MCP",
    description: "Provider-Keys, MCP-Server, Bild-/Videogenerierung.",
  },
  {
    key: "BACKUP",
    slug: "backup",
    label: "Backup & Rollback",
    description: "Snapshots, Restore, Update-Mechanismus.",
  },
  {
    key: "SECURITY",
    slug: "sicherheit",
    label: "Sicherheit",
    description: "2FA, Rollen, Audit-Log, DSGVO.",
  },
];
