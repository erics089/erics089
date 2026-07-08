import * as React from "react";

/**
 * Minimal, refined line-icon set. Stroke-based, 1.5px, inherits currentColor.
 * Kept in one file so the visual language stays consistent everywhere.
 */

export type IconName =
  | "home"
  | "road"
  | "feed"
  | "social"
  | "events"
  | "legacy"
  | "profile"
  | "chevron"
  | "back"
  | "plus"
  | "check"
  | "lock"
  | "verified"
  | "pin"
  | "calendar"
  | "trophy"
  | "spark"
  | "settings"
  | "invite"
  | "crown"
  | "target";

const paths: Record<IconName, React.ReactNode> = {
  home: <path d="M3 10.5 12 4l9 6.5M5 9.5V20h14V9.5" />,
  road: (
    <>
      <path d="M12 3v18" strokeDasharray="1 4" />
      <path d="M7 20 9 4h6l2 16" />
    </>
  ),
  feed: (
    <>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </>
  ),
  social: (
    <>
      <circle cx="8" cy="9" r="3" />
      <path d="M2.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 6.5a3 3 0 0 1 0 5.9M21.5 19a5.5 5.5 0 0 0-4-5.3" />
    </>
  ),
  events: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9h17M8 3v3M16 3v3" />
    </>
  ),
  legacy: (
    <>
      <path d="M6 3h12v6a6 6 0 0 1-12 0V3Z" />
      <path d="M9 21h6M12 15v6" />
      <path d="M6 5H4a2 2 0 0 0 0 4h.5M18 5h2a2 2 0 0 1 0 4h-.5" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </>
  ),
  chevron: <path d="m9 6 6 6-6 6" />,
  back: <path d="m15 6-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12 5 5 9-11" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  verified: (
    <>
      <path d="m12 3 2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.6 2.6.6 2.6-2.3 1.4-1 2.5-2.7-.2L12 21l-2.2-1.6-2.7.2-1-2.5-2.3-1.4.6-2.6L3.8 9l2.3-1.4 1-2.5 2.7.2L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9h17M8 3v3M16 3v3" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5a2 2 0 0 0 0 4h1M16 6h3a2 2 0 0 1 0 4h-1M9 20h6M12 13v7" />
    </>
  ),
  spark: <path d="M12 3v6m0 6v6M3 12h6m6 0h6M6.5 6.5l3 3m5 5 3 3m0-11-3 3m-5 5-3 3" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3m0 14v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M2 12h3m14 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  invite: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  crown: <path d="M4 8l3.5 4L12 6l4.5 6L20 8l-1.5 10h-13L4 8Z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
};

export function Icon({
  name,
  size = 22,
  className,
  strokeWidth = 1.5,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
