"use client";

import * as React from "react";
import Link from "next/link";
import { Card, GoldDivider, Avatar, Badge } from "@/components/ui/primitives";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

function Toggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = React.useState(!!defaultOn);
  return (
    <button onClick={() => setOn((v) => !v)} className="flex w-full items-center gap-4 px-4 py-3.5 text-left">
      <div className="flex-1">
        <div className="text-[14px] text-chalk">{label}</div>
        <div className="text-[11.5px] text-faint">{desc}</div>
      </div>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
          on ? "border-gold/50 bg-gold/20" : "border-line bg-ink"
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all",
            on ? "left-[22px] bg-gold-fill" : "left-1 bg-faint"
          )}
        />
      </span>
    </button>
  );
}

function LinkRow({ href, icon, label, note }: { href: string; icon: IconName; label: string; note?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3.5 px-4 py-4">
      <Icon name={icon} size={19} className="text-gold/80" />
      <span className="flex-1 text-[14px] text-chalk">{label}</span>
      {note && <span className="text-[11px] text-faint">{note}</span>}
      <Icon name="chevron" size={16} className="text-faint" />
    </Link>
  );
}

export function SettingsView({ user }: { user: User }) {
  return (
    <div className="stagger px-5 pb-10 pt-5">
      {/* Account card */}
      <Link href="/profile">
        <Card className="flex items-center gap-3.5 p-4">
          <Avatar seed={user.profileImage} name={user.fullName} size={52} ring />
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-chalk">{user.fullName}</span>
              {user.verified && <Icon name="verified" size={13} className="text-gold" />}
            </div>
            <span className="text-[12px] text-faint">@{user.username}</span>
          </div>
          <Badge variant="gold">{user.membershipTier}</Badge>
        </Card>
      </Link>

      {/* Membership & access */}
      <div className="mt-7">
        <p className="mb-2.5 px-1 text-[11px] uppercase tracking-luxe text-faint">Membership</p>
        <Card className="divide-y divide-line">
          <LinkRow href="/membership" icon="crown" label="Membership & Status" note={user.membershipTier} />
          <LinkRow href="/invite" icon="invite" label="Invite & Referrals" note="3 left" />
        </Card>
      </div>

      {/* Visibility */}
      <div className="mt-7">
        <p className="mb-2.5 px-1 text-[11px] uppercase tracking-luxe text-faint">Visibility</p>
        <Card className="divide-y divide-line">
          <Toggle label="Discoverable profile" desc="Appear in curated connections" defaultOn />
          <Toggle label="Show Glory Score" desc="Display your score on the leaderboard" defaultOn />
          <Toggle label="Default goal privacy" desc="New paths start visible to allies" defaultOn />
        </Card>
      </div>

      {/* Notifications */}
      <div className="mt-7">
        <p className="mb-2.5 px-1 text-[11px] uppercase tracking-luxe text-faint">Notifications</p>
        <Card className="divide-y divide-line">
          <Toggle label="Intro requests" desc="When a peer requests a connection" defaultOn />
          <Toggle label="Event invitations" desc="Curated gatherings near you" defaultOn />
          <Toggle label="Circle milestones" desc="When allies reach a milestone" />
        </Card>
      </div>

      <GoldDivider className="my-8" label="Road to Glory" />

      <div className="space-y-1 text-center">
        <p className="text-[11px] text-faint">Code of Conduct · Privacy · Terms</p>
        <p className="text-[11px] text-faint">Version 1.0 — Premium Preview</p>
      </div>

      <Link href="/" className="mt-6 block text-center text-[13px] text-danger/80 hover:text-danger">
        Sign out
      </Link>
    </div>
  );
}
