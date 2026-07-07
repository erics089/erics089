"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  description,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-10 backdrop-blur-sm animate-fade-in">
      <div
        className={cn(
          "w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-soft",
          className
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-heading text-xl text-ink">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-sage/10 hover:text-ink"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
