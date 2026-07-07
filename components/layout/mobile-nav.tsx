"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/kampagnen", label: "Kampagnen-Manager" },
  { href: "/social", label: "Social Media Studio" },
  { href: "/kalender", label: "Content-Kalender" },
  { href: "/ads", label: "Ads Center" },
  { href: "/kommunikation", label: "E-Mail & WhatsApp" },
  { href: "/assets", label: "Asset-Bibliothek" },
  { href: "/einstellungen", label: "Einstellungen" },
];

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="flex items-center justify-between border-b border-border bg-surface/70 px-4 py-3 lg:hidden">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/25 text-ink">
          <Droplets className="h-4 w-4" />
        </div>
        <span className="font-heading text-lg text-ink">MIRRA</span>
      </Link>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-md p-2 text-ink hover:bg-sage/10"
        aria-label="Menü"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-[57px] z-40 border-b border-border bg-surface p-3 shadow-soft">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium",
                  active ? "bg-ink text-cream" : "text-ink/80 hover:bg-sage/15"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
