"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  DatabaseBackup,
  Globe,
  KanbanSquare,
  Megaphone,
  Receipt,
  ShieldCheck,
  Users,
} from "lucide-react";

import { MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CRM: Users,
  PROJECTS: KanbanSquare,
  WEBSITES: Globe,
  BILLING: Receipt,
  MARKETING: Megaphone,
  AI_MCP: Bot,
  BACKUP: DatabaseBackup,
  SECURITY: ShieldCheck,
};

export function AppSidebar({ agencyName }: { agencyName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          {agencyName.slice(0, 1).toUpperCase()}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">{agencyName}</span>
          <span className="text-xs text-muted-foreground">AGENTUR-OS</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-1">
          {MODULES.map((mod) => {
            const href = `/dashboard/${mod.slug}`;
            const isActive = pathname === href || pathname.startsWith(href + "/");
            const Icon = ICONS[mod.key];
            return (
              <li key={mod.key}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {mod.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
