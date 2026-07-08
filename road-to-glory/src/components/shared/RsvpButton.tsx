"use client";

import * as React from "react";
import { Button } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

export function RsvpButton({ full }: { full: boolean }) {
  const [state, setState] = React.useState<"idle" | "going" | "waitlist">("idle");

  if (state === "going") {
    return (
      <Button variant="outline" size="lg" full icon={<Icon name="check" size={18} />}>
        You&apos;re attending
      </Button>
    );
  }
  if (state === "waitlist") {
    return (
      <Button variant="outline" size="lg" full>
        On the waitlist
      </Button>
    );
  }
  return (
    <Button variant="gold" size="lg" full onClick={() => setState(full ? "waitlist" : "going")}>
      {full ? "Request Waitlist" : "Reserve My Seat"}
    </Button>
  );
}
