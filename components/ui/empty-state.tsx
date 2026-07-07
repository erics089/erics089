import { PlugZap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Eleganter Hinweis für fehlende externe Verbindungen (API-Keys, MCP-Server).
 * Wird genutzt, damit fehlende Keys die App nie zum Absturz bringen.
 */
export function ConnectionNeeded({
  title = "Verbindung einrichten",
  description,
  href = "/einstellungen",
  className,
}: {
  title?: string;
  description: string;
  href?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-sage/40 bg-sage/5 px-6 py-10 text-center",
        className
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage/15 text-ink/70">
        <PlugZap className="h-5 w-5" />
      </div>
      <p className="font-heading text-lg text-ink">{title}</p>
      <p className="max-w-md text-sm text-muted">{description}</p>
      <Link
        href={href}
        className="mt-1 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-cream hover:bg-ink/90"
      >
        Zu den Einstellungen
      </Link>
    </div>
  );
}
