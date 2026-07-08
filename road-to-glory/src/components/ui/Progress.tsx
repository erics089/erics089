import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ProgressRing — the signature "arc of ascent". A gold sweep on a dark track.
 */
export function ProgressRing({
  value,
  size = 132,
  stroke = 7,
  label,
  sublabel,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ;
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E4C879" />
            <stop offset="60%" stopColor="#C8A24B" />
            <stop offset="100%" stopColor="#9A7A2E" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#232329" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGold)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="font-display text-3xl text-gold-gradient leading-none">{label}</span>}
        {sublabel && <span className="mt-1 text-[10px] uppercase tracking-luxe text-faint">{sublabel}</span>}
      </div>
    </div>
  );
}

/**
 * ProgressBar — a thin gold fill on a dark track with an optional glow tip.
 */
export function ProgressBar({
  value,
  className,
  height = 5,
}: {
  value: number;
  className?: string;
  height?: number;
}) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-full bg-line", className)}
      style={{ height }}
    >
      <div
        className="h-full rounded-full bg-gold-fill"
        style={{
          width: `${v}%`,
          boxShadow: "0 0 12px -2px rgba(200,162,75,0.6)",
          transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </div>
  );
}

/**
 * MilestoneTrack — the vertical "Road": dark spine that fills gold to the
 * current checkpoint. Used inside the Road to Glory goal cards.
 */
export function MilestoneTrack({
  steps,
}: {
  steps: { label: string; done: boolean }[];
}) {
  return (
    <div className="relative pl-1">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
            {!last && (
              <span
                className={cn(
                  "absolute left-[6px] top-4 h-full w-px",
                  step.done ? "bg-gold/60" : "bg-line"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border",
                step.done
                  ? "border-gold bg-gold-fill shadow-[0_0_10px_-1px_rgba(200,162,75,0.7)]"
                  : "border-line bg-ink"
              )}
            />
            <span className={cn("text-[13px] leading-tight", step.done ? "text-chalk" : "text-faint")}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
