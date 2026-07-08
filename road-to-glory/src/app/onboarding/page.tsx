"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, GoldDivider } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { cn } from "@/lib/utils";
import type { Archetype, GoalCategory } from "@/lib/types";

const personas: { name: Archetype; glyph: string; desc: string }[] = [
  { name: "Entrepreneur", glyph: "◈", desc: "You build what did not exist." },
  { name: "Investor", glyph: "◆", desc: "You allocate capital to outliers." },
  { name: "Athlete", glyph: "⚡", desc: "You compete at the edge of the body." },
  { name: "Artist", glyph: "❖", desc: "You shape culture and taste." },
  { name: "Top Executive", glyph: "▲", desc: "You lead organizations at scale." },
  { name: "Philanthropist", glyph: "✦", desc: "You deploy resources for impact." },
  { name: "Creator", glyph: "◉", desc: "You command attention and audience." },
  { name: "Visionary", glyph: "◇", desc: "You see the decade before it arrives." },
];

const ambitions: GoalCategory[] = [
  "Business",
  "Wealth",
  "Health",
  "Relationships",
  "Mindset",
  "Legacy",
  "Impact",
  "Personal Mastery",
];

const STEPS = [
  "Persona",
  "Ambition",
  "First Goal",
  "Profile",
  "Invitation",
  "Review",
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [persona, setPersona] = React.useState<Archetype | null>(null);
  const [focus, setFocus] = React.useState<GoalCategory[]>([]);
  const [goal, setGoal] = React.useState("");
  const [name, setName] = React.useState("");
  const [city, setCity] = React.useState("");
  const [invite, setInvite] = React.useState("");

  const canAdvance = [
    persona !== null,
    focus.length >= 1,
    goal.trim().length > 3,
    name.trim().length > 1 && city.trim().length > 1,
    invite.trim().length > 3,
    true,
  ][step];

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else router.push("/membership");
  }

  function toggleFocus(c: GoalCategory) {
    setFocus((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : prev.length < 4 ? [...prev, c] : prev
    );
  }

  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col bg-obsidian bg-obsidian-fade">
        {/* Header + progress */}
        <div className="sticky top-0 z-30 border-b border-line/70 bg-ink/85 px-5 pb-4 pt-5 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="-ml-1 flex h-7 w-7 items-center justify-center rounded-full text-mist hover:text-chalk"
              >
                <Icon name="back" size={20} />
              </button>
            ) : (
              <Link href="/" className="-ml-1 flex h-7 w-7 items-center justify-center rounded-full text-mist hover:text-chalk">
                <Icon name="back" size={20} />
              </Link>
            )}
            <span className="text-[11px] uppercase tracking-luxe text-faint">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="w-7" />
          </div>
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-500",
                  i <= step ? "bg-gold-fill" : "bg-line"
                )}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="app-scroll no-scrollbar flex-1 px-5 py-7">
          {step === 0 && (
            <StepShell
              eyebrow="Define yourself"
              title="Which path is yours?"
              sub="Your persona shapes your circle, your feed, and the peers we surface."
            >
              <div className="grid grid-cols-1 gap-2.5">
                {personas.map((p) => {
                  const active = persona === p.name;
                  return (
                    <button
                      key={p.name}
                      onClick={() => setPersona(p.name)}
                      className={cn(
                        "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.99]",
                        active
                          ? "border-gold/50 bg-gold/[0.07] shadow-goldsoft"
                          : "border-line bg-surface/60 hover:border-gold/25"
                      )}
                    >
                      <span className={cn("text-xl", active ? "text-gold" : "text-mist")}>{p.glyph}</span>
                      <div className="flex-1">
                        <div className={cn("font-medium", active ? "text-chalk" : "text-chalk")}>{p.name}</div>
                        <div className="text-[12px] text-faint">{p.desc}</div>
                      </div>
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border transition",
                          active ? "border-gold bg-gold-fill text-obsidian" : "border-line text-transparent"
                        )}
                      >
                        <Icon name="check" size={14} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </StepShell>
          )}

          {step === 1 && (
            <StepShell
              eyebrow="Set your focus"
              title="Where will you compound?"
              sub="Choose up to four arenas. This becomes your Road to Glory."
            >
              <div className="flex flex-wrap gap-2.5">
                {ambitions.map((a) => {
                  const active = focus.includes(a);
                  return (
                    <button
                      key={a}
                      onClick={() => toggleFocus(a)}
                      className={cn(
                        "rounded-full border px-4 py-2.5 text-sm transition-all active:scale-95",
                        active
                          ? "border-gold/50 bg-gold/10 text-gold"
                          : "border-line text-mist hover:border-gold/25 hover:text-chalk"
                      )}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-[12px] text-faint">{focus.length} of 4 selected</p>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell
              eyebrow="Your first milestone"
              title="Name the mountain."
              sub="One goal that matters this year. You will break it into levels later."
            >
              <TextField
                label="Your defining goal"
                placeholder="e.g. Scale the company to $100M revenue"
                value={goal}
                onChange={setGoal}
                multiline
              />
            </StepShell>
          )}

          {step === 3 && (
            <StepShell eyebrow="Your standing" title="Present yourself." sub="This is how peers first encounter you.">
              <div className="space-y-4">
                <TextField label="Full name" placeholder="Marcus Vale" value={name} onChange={setName} />
                <TextField label="City" placeholder="Monaco" value={city} onChange={setCity} />
              </div>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell
              eyebrow="Access"
              title="Who opened the door?"
              sub="Membership is by invitation. Enter your referral or invite code."
            >
              <TextField label="Invite / referral code" placeholder="RTG-XXXX-000" value={invite} onChange={setInvite} />
              <Card className="mt-5 p-4">
                <div className="flex items-center gap-3">
                  <Icon name="lock" size={18} className="text-gold" />
                  <p className="text-[12.5px] leading-relaxed text-mist">
                    Every application is peer reviewed. Two Inner Circle endorsements
                    are required for admission.
                  </p>
                </div>
              </Card>
            </StepShell>
          )}

          {step === 5 && (
            <StepShell eyebrow="Review" title="Your application." sub="Confirm the essentials before submission.">
              <Card className="divide-y divide-line">
                <ReviewRow label="Persona" value={persona ?? "—"} />
                <ReviewRow label="Focus" value={focus.join(" · ") || "—"} />
                <ReviewRow label="Defining goal" value={goal || "—"} />
                <ReviewRow label="Name" value={name || "—"} />
                <ReviewRow label="City" value={city || "—"} />
                <ReviewRow label="Invite" value={invite || "—"} />
              </Card>
              <GoldDivider className="my-6" label="Code of conduct" />
              <p className="text-center text-[12.5px] leading-relaxed text-faint">
                I will show up with excellence, hold my peers to a higher standard,
                and treat this circle as the privilege it is.
              </p>
            </StepShell>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-line/70 bg-ink/85 px-5 pb-9 pt-4 backdrop-blur-xl">
          <Button variant="gold" size="lg" full disabled={!canAdvance} onClick={next}>
            {step === STEPS.length - 1 ? "Submit Application" : "Continue"}
          </Button>
        </div>
      </div>
    </PhoneFrame>
  );
}

function StepShell({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-up">
      <span className="text-[11px] uppercase tracking-luxe text-gold/90">{eyebrow}</span>
      <h2 className="mt-2 font-display text-3xl leading-tight text-chalk">{title}</h2>
      <p className="mt-2 mb-7 text-[14px] leading-relaxed text-mist">{sub}</p>
      {children}
    </div>
  );
}

function TextField({
  label,
  placeholder,
  value,
  onChange,
  multiline,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const cls =
    "w-full rounded-2xl border border-line bg-ink/70 px-4 py-3.5 text-[15px] text-chalk placeholder:text-faint outline-none transition focus:border-gold/50 focus:shadow-goldsoft";
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-luxe text-faint">{label}</span>
      {multiline ? (
        <textarea rows={3} className={cls} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={cls} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3.5">
      <span className="text-[11px] uppercase tracking-luxe text-faint">{label}</span>
      <span className="max-w-[60%] text-right text-[13.5px] text-chalk">{value}</span>
    </div>
  );
}
