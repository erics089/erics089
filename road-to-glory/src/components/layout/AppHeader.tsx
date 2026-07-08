"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * AppHeader — a quiet top bar. Either a brand wordmark (root tabs) or a
 * back affordance with a title (detail screens).
 */
export function AppHeader({
  title,
  back = false,
  right,
  className,
}: {
  title?: string;
  back?: boolean;
  right?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-line/70 bg-ink/85 px-5 backdrop-blur-xl",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {back && (
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="-ml-1.5 flex h-8 w-8 items-center justify-center rounded-full text-mist transition hover:text-chalk active:scale-90"
          >
            <Icon name="back" size={22} />
          </button>
        )}
        {title ? (
          <h1 className="truncate font-display text-lg text-chalk">{title}</h1>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-gold">✦</span>
            <span className="font-display text-lg tracking-wide text-chalk">
              Road to <span className="text-gold-gradient">Glory</span>
            </span>
          </Link>
        )}
      </div>
      <div className="flex items-center gap-1.5">{right}</div>
    </header>
  );
}
