import Link from "next/link";
import { Button } from "@/components/ui/primitives";
import { PhoneFrame } from "@/components/layout/PhoneFrame";

export default function SplashPage() {
  return (
    <PhoneFrame>
      <div className="vignette relative flex flex-1 flex-col overflow-hidden bg-[radial-gradient(130%_90%_at_50%_-5%,rgba(200,162,75,0.14),transparent_55%)]">
        {/* Faint ascending lines motif */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gold/25 to-transparent" />
          <div className="absolute left-1/2 top-1/3 h-px w-40 -translate-x-1/2 bg-gold-line" />
          <div className="absolute left-1/2 top-2/3 h-px w-24 -translate-x-1/2 bg-gold-line opacity-60" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="animate-fade-in">
            <span className="text-4xl text-gold">✦</span>
          </div>
          <h1 className="mt-8 animate-fade-up font-display text-5xl leading-[1.05] tracking-tightest text-chalk">
            Road to
            <br />
            <span className="text-gold-gradient">Glory</span>
          </h1>
          <p className="mt-6 max-w-[19rem] animate-fade-up text-[15px] leading-relaxed text-mist [animation-delay:0.1s]">
            An invite-only club for those who measure life in milestones. Define your
            path. Track your ascent. Build a legacy among peers.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-3 px-8 pb-12">
          <Link href="/onboarding">
            <Button variant="gold" size="lg" full>
              Request Membership
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="lg" full>
              Enter the Club
            </Button>
          </Link>
          <p className="mt-2 text-center text-[11px] uppercase tracking-luxe text-faint">
            By invitation · Peer reviewed
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
