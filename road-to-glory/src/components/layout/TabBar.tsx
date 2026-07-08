"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const tabs: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Glory", icon: "home" },
  { href: "/road", label: "Road", icon: "road" },
  { href: "/feed", label: "Feed", icon: "feed" },
  { href: "/social", label: "Circle", icon: "social" },
  { href: "/events", label: "Events", icon: "events" },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="relative z-40 shrink-0 border-t border-line bg-ink/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[480px] items-stretch justify-around px-2 pb-6 pt-2.5">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="group relative flex flex-1 flex-col items-center gap-1.5 py-1"
            >
              {active && (
                <span className="absolute -top-[11px] h-px w-8 bg-gold-line" />
              )}
              <Icon
                name={tab.icon}
                size={21}
                className={cn(
                  "transition-colors duration-200",
                  active ? "text-gold" : "text-faint group-hover:text-mist"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium tracking-wide transition-colors",
                  active ? "text-gold" : "text-faint group-hover:text-mist"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
