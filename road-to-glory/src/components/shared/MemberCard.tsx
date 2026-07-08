import * as React from "react";
import type { User, CircleType } from "@/lib/types";
import { Card, Avatar, Badge, Button } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { formatScore } from "@/lib/utils";

const circleTone: Record<CircleType, string> = {
  Ally: "text-mist",
  "Power Ring": "text-gold",
  Mastermind: "text-gold-soft",
};

export function MemberCard({
  user,
  circleType,
  cta,
}: {
  user: User;
  circleType?: CircleType;
  cta?: "connect" | "accept" | "pending";
}) {
  return (
    <Card className="flex items-center gap-3.5 p-4">
      <Avatar seed={user.profileImage} name={user.fullName} size={52} ring={user.membershipTier === "Founding Member"} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-medium text-chalk">{user.fullName}</span>
          {user.verified && <Icon name="verified" size={14} className="shrink-0 text-gold" />}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-faint">
          <span>{user.archetype}</span>
          <span className="text-line">·</span>
          <span>{user.city}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[11px] text-mist">
            <span className="text-gold">✦</span> {formatScore(user.gloryScore)}
          </span>
          {circleType && (
            <span className={`text-[10px] uppercase tracking-luxe ${circleTone[circleType]}`}>
              {circleType}
            </span>
          )}
        </div>
      </div>
      {cta === "connect" && (
        <Button variant="outline" size="sm" className="shrink-0">
          Connect
        </Button>
      )}
      {cta === "accept" && (
        <Button variant="gold" size="sm" className="shrink-0">
          Accept
        </Button>
      )}
      {cta === "pending" && <Badge variant="line" className="shrink-0">Pending</Badge>}
    </Card>
  );
}
