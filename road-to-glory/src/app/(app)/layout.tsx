import * as React from "react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { TabBar } from "@/components/layout/TabBar";

/**
 * Shell for the five primary tabs and every detail screen beneath them.
 * The scroll area sits between a per-screen header and the persistent tab bar.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhoneFrame>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="app-scroll no-scrollbar relative flex-1 bg-obsidian bg-obsidian-fade">
          {children}
        </div>
        <TabBar />
      </div>
    </PhoneFrame>
  );
}
