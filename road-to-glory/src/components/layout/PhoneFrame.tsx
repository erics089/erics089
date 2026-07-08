import * as React from "react";

/**
 * PhoneFrame — presents the app as an iPhone on wide screens (demo / investor
 * view) and full-bleed on actual phones. The inner viewport is the app.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full bg-obsidian">
      {/* Full-bleed on mobile */}
      <div className="sm:hidden">
        <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col bg-ink">
          {children}
        </div>
      </div>

      {/* Framed device on tablet+ */}
      <div className="hidden min-h-[100dvh] items-center justify-center bg-[radial-gradient(120%_100%_at_50%_0%,#141416,#050506_70%)] py-10 sm:flex">
        <div className="relative">
          <div className="relative h-[860px] w-[400px] rounded-[3.2rem] border border-line bg-black p-3 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(200,162,75,0.08)]">
            {/* Side buttons */}
            <span className="absolute -left-[3px] top-32 h-14 w-[3px] rounded-l bg-line" />
            <span className="absolute -left-[3px] top-48 h-14 w-[3px] rounded-l bg-line" />
            <span className="absolute -right-[3px] top-40 h-20 w-[3px] rounded-r bg-line" />
            <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.6rem] bg-ink">
              {/* Notch */}
              <div className="pointer-events-none absolute left-1/2 top-2 z-50 h-7 w-32 -translate-x-1/2 rounded-full bg-black" />
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
