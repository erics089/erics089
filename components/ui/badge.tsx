import * as React from "react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "outline" | "gold" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-sage/20 text-ink",
        variant === "outline" && "border border-border text-muted",
        variant === "gold" && "bg-gold/20 text-ink",
        className
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_COLORS[status] ?? "bg-stone-200 text-stone-700"
      )}
    >
      {status}
    </span>
  );
}
