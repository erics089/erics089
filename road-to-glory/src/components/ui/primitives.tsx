import * as React from "react";
import Link from "next/link";
import { cn, avatarGradient, initials } from "@/lib/utils";
import { Icon } from "./Icon";

/* ------------------------------------------------------------------ Card */

export function Card({
  className,
  children,
  glow = false,
  as: Tag = "div",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { glow?: boolean; as?: any }) {
  return (
    <Tag
      className={cn(
        "relative rounded-xl2 border border-line bg-surface/80 shadow-card backdrop-blur-sm",
        glow && "shadow-goldsoft border-gold/25",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------------- Button */

type ButtonProps = {
  variant?: "gold" | "outline" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
  full?: boolean;
  icon?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "gold",
  size = "md",
  full,
  icon,
  className,
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 select-none";
  const sizes = {
    sm: "h-9 px-4 text-[13px]",
    md: "h-12 px-6 text-sm",
    lg: "h-14 px-7 text-[15px]",
  }[size];
  const variants = {
    gold: "bg-gold-fill text-obsidian shadow-goldsoft hover:brightness-110",
    outline: "border border-gold/40 text-gold hover:bg-gold/10",
    ghost: "text-mist hover:text-chalk hover:bg-white/[0.04]",
    dark: "bg-elevated border border-line text-chalk hover:border-gold/30",
  }[variant];
  return (
    <button className={cn(base, sizes, variants, full && "w-full", className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

/* ----------------------------------------------------------------- Badge */

export function Badge({
  children,
  variant = "line",
  className,
  glyph,
}: {
  children: React.ReactNode;
  variant?: "gold" | "line" | "solid";
  className?: string;
  glyph?: string;
}) {
  const variants = {
    gold: "border-gold/40 text-gold bg-gold/[0.06]",
    line: "border-line text-mist",
    solid: "border-transparent bg-elevated text-chalk",
  }[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-luxe",
        variants,
        className
      )}
    >
      {glyph && <span className="text-[11px] leading-none">{glyph}</span>}
      {children}
    </span>
  );
}

/* ----------------------------------------------------------- GoldDivider */

export function GoldDivider({ className, label }: { className?: string; label?: string }) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="h-px flex-1 bg-gold-line opacity-60" />
        <span className="text-[10px] uppercase tracking-luxe text-faint">{label}</span>
        <div className="h-px flex-1 bg-gold-line opacity-60" />
      </div>
    );
  }
  return <div className={cn("h-px w-full bg-gold-line opacity-50", className)} />;
}

/* ---------------------------------------------------------- SectionHeader */

export function SectionHeader({
  title,
  action,
  href,
  className,
}: {
  title: string;
  action?: string;
  href?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between", className)}>
      <h2 className="text-[11px] font-semibold uppercase tracking-luxe text-mist">{title}</h2>
      {action &&
        (href ? (
          <Link href={href} className="flex items-center gap-1 text-[11px] uppercase tracking-luxe text-gold/90 transition hover:text-gold">
            {action}
            <Icon name="chevron" size={13} />
          </Link>
        ) : (
          <span className="text-[11px] uppercase tracking-luxe text-faint">{action}</span>
        ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Avatar */

export function Avatar({
  seed,
  name,
  size = 44,
  ring = false,
  className,
}: {
  seed: string;
  name: string;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  const [a, b] = avatarGradient(seed);
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full font-display text-chalk",
        ring && "ring-1 ring-gold/50 ring-offset-2 ring-offset-obsidian",
        className
      )}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(120% 120% at 30% 20%, ${a}, ${b})`,
        fontSize: size * 0.36,
      }}
    >
      <span className="tracking-tightest opacity-90">{initials(name)}</span>
    </div>
  );
}

/* -------------------------------------------------------------- StatTile */

export function StatTile({
  label,
  value,
  glyph,
  accent = false,
}: {
  label: string;
  value: string;
  glyph?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line bg-ink/60 px-4 py-3">
      <div className="flex items-center gap-1.5">
        {glyph && <span className={cn("text-xs", accent ? "text-gold" : "text-faint")}>{glyph}</span>}
        <span className="text-[10px] uppercase tracking-luxe text-faint">{label}</span>
      </div>
      <span className={cn("font-display text-2xl leading-none", accent ? "text-gold-gradient" : "text-chalk")}>
        {value}
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------- Chip */

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all",
        active
          ? "border-gold/50 bg-gold/10 text-gold"
          : "border-line text-mist hover:border-gold/25 hover:text-chalk"
      )}
    >
      {children}
    </button>
  );
}
