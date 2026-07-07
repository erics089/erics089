"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Sparkles,
  CalendarDays,
  Target,
  MailPlus,
  FolderOpen,
  Settings,
  Droplets,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kampagnen", label: "Kampagnen-Manager", icon: Megaphone },
  { href: "/social", label: "Social Media Studio", icon: Sparkles },
  { href: "/kalender", label: "Content-Kalender", icon: CalendarDays },
  { href: "/ads", label: "Ads Center", icon: Target },
  { href: "/kommunikation", label: "E-Mail & WhatsApp", icon: MailPlus },
  { href: "/assets", label: "Asset-Bibliothek", icon: FolderOpen },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface/60 px-4 py-6 lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/25 text-ink">
          <Droplets className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <p className="font-heading text-lg tracking-wide text-ink">MIRRA</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Command Center</p>
        </div>
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-ink text-cream" : "text-ink/80 hover:bg-sage/15"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 rounded-xl bg-sage/10 px-3 py-3 text-xs text-muted">
        <p className="font-medium text-ink">Dein Ort für Tiefenentspannung</p>
        <p className="mt-1">Pasinger Straße 38a, 82152 Planegg</p>
      </div>
    </aside>
  );
}
