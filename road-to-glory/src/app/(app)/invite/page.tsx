"use client";

import * as React from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, GoldDivider, Button, Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

const INVITE_CODE = "RTG-VALE-7X2";
const INVITES_LEFT = 3;

export default function InvitePage() {
  const [copied, setCopied] = React.useState(false);

  function copy() {
    navigator.clipboard?.writeText(INVITE_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <AppHeader title="Invite" back />
      <div className="stagger px-5 pb-10 pt-5">
        <Card glow className="p-6 text-center">
          <span className="text-3xl text-gold">✦</span>
          <h1 className="mt-3 font-display text-2xl leading-tight text-chalk">
            Extend the circle.
          </h1>
          <p className="mx-auto mt-2 max-w-[19rem] text-[13px] leading-relaxed text-mist">
            You may nominate {INVITES_LEFT} peers this season. Choose people who raise the
            room. Every referral carries your name.
          </p>

          <GoldDivider className="my-6" />

          <span className="text-[10px] uppercase tracking-luxe text-faint">Your invite code</span>
          <div className="mt-3 flex items-center justify-center gap-3">
            <code className="rounded-xl border border-gold/30 bg-ink px-5 py-3 font-display text-xl tracking-[0.2em] text-gold-gradient">
              {INVITE_CODE}
            </code>
            <button
              onClick={copy}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-line text-mist transition hover:border-gold/40 hover:text-gold active:scale-95"
              aria-label="Copy code"
            >
              <Icon name={copied ? "check" : "plus"} size={18} />
            </button>
          </div>
          {copied && <p className="mt-2 text-[11px] text-gold">Copied to clipboard</p>}

          <Badge variant="line" className="mt-5">{INVITES_LEFT} nominations remaining</Badge>
        </Card>

        <div className="mt-6 space-y-3">
          <Button variant="gold" size="lg" full icon={<Icon name="invite" size={18} />}>
            Share Invitation
          </Button>
          <Button variant="dark" size="lg" full>
            Nominate from Contacts
          </Button>
        </div>

        <Card className="mt-6 p-5">
          <div className="flex gap-3">
            <Icon name="lock" size={18} className="shrink-0 text-gold" />
            <p className="text-[12.5px] leading-relaxed text-mist">
              Referrals are peer reviewed like any application. A weak nomination reflects
              on your standing — nominate accordingly.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
