import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ChevronRight, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Section, SectionHeader, Reveal, Tag, Pill, PhoneFrame } from "./common";
import { usePersist } from "@/lib/usePersist";

interface Option { id: string; label: string; detail: string; result: string }
interface Reason { key: string; label: string; offerTitle: string; offerBody: string; options: Option[]; hypothesis: string; benefit: string; metric: string; guardrail: string }

const REASONS: Reason[] = [
  {
    key: "too-much", label: "I have too much product",
    offerTitle: "Let's match deliveries to your shelf.", offerBody: "No need to cancel — move your next order or space deliveries further apart.",
    options: [
      { id: "delay-2w", label: "Delay 2 weeks", detail: "Next order moves to Jul 12", result: "Your next order now ships Jul 12." },
      { id: "delay-1m", label: "Delay 1 month", detail: "Next order moves to Jul 28", result: "Your next order now ships Jul 28." },
      { id: "freq-60", label: "Switch to every 60 days", detail: "Fewer deliveries, same subscriber price", result: "You'll now receive an order every 60 days." },
    ],
    hypothesis: "Many 'too much product' cancellations are cadence mismatches, not product dissatisfaction. Offering delay and frequency controls at the moment of intent will retain a meaningful share.",
    benefit: "She stops accumulating bottles without losing her routine or subscriber pricing.",
    metric: "Save rate for this reason; 90-day retained revenue per saved subscriber.", guardrail: "Re-cancellation within 60 days; complaint rate.",
  },
  {
    key: "price", label: "My subscription is too expensive",
    offerTitle: "Here's what your subscription includes.", offerBody: "Illustrative benefits shown. If it still doesn't fit, you can lower your spend without losing access.",
    options: [
      { id: "next-15", label: "15% off your next order", detail: "One-time incentive · test cell only", result: "15% will be applied to your next order." },
      { id: "freq-lower", label: "Lower monthly spend", detail: "Switch to every 60 days", result: "Your cadence is now every 60 days — about half the monthly spend." },
      { id: "smaller", label: "Switch to a smaller size", detail: "Where available", result: "Your next order will be the smaller size." },
    ],
    hypothesis: "Price objections are partly perceived-value objections. Restating benefits plus a spend-reducing option will save more subscribers than a discount alone, at lower margin cost.",
    benefit: "She sees the value she's already getting and has a way to spend less without leaving.",
    metric: "Save rate; contribution margin per saved subscriber.", guardrail: "Discount dependency (share of saves needing incentive); average order value.",
  },
  {
    key: "another", label: "I want to try another product",
    offerTitle: "Swap instead of starting over.", offerBody: "Keep your subscription and change what's in it. Your schedule and pricing stay the same.",
    options: [
      { id: "swap-sleep", label: "Swap to Sleep formula", detail: "Evening routine", result: "Your next order will be the Sleep formula." },
      { id: "swap-calm", label: "Swap to Calm formula", detail: "Daytime routine", result: "Your next order will be the Calm formula." },
      { id: "swap-help", label: "Help me choose", detail: "2-question routine finder", result: "We'll send a short routine finder — your order is on hold until you choose." },
    ],
    hypothesis: "Customers who want variety will stay if swapping is easier than cancelling and re-buying.",
    benefit: "She explores the range without losing subscriber status or re-entering payment details.",
    metric: "Swap rate; retention 90 days post-swap.", guardrail: "Swap-then-cancel rate; support contacts.",
  },
  {
    key: "inconsistent", label: "I'm not using it consistently",
    offerTitle: "Make it easier to remember.", offerBody: "Small cues help routines stick. These are habit tips — not health advice.",
    options: [
      { id: "routine", label: "Send me a 7-day routine guide", detail: "Email, habit-stacking tips", result: "Your 7-day routine guide is on its way." },
      { id: "sms-cue", label: "Text me a daily reminder", detail: "Opt-in SMS · reply STOP anytime", result: "Daily reminders are on. Reply STOP anytime to opt out." },
      { id: "pause-30", label: "Pause for 30 days", detail: "Use what you have first", result: "Your subscription is paused for 30 days." },
    ],
    hypothesis: "Inconsistent usage signals a habit-formation gap. Routine support will improve usage and reduce future churn better than an incentive.",
    benefit: "She gets practical help building the routine she originally wanted.",
    metric: "Save rate; next-order acceptance after guidance.", guardrail: "SMS opt-out rate; unsubscribe rate.",
  },
  {
    key: "not-ready", label: "I don't feel ready to reorder",
    offerTitle: "Take a break, not a goodbye.", offerBody: "Skip or pause — we'll remind you 5 days before anything ships.",
    options: [
      { id: "skip", label: "Skip next order", detail: "Resumes automatically after", result: "Your next order is skipped." },
      { id: "pause-60", label: "Pause for 60 days", detail: "Reminder 5 days before resuming", result: "Paused for 60 days. We'll remind you before it resumes." },
    ],
    hypothesis: "A low-commitment pause converts some hard churn into temporary breaks that resume.",
    benefit: "She keeps control of timing without having to rebuild her subscription later.",
    metric: "Pause-to-resume rate; 120-day retention.", guardrail: "Paused-forever rate; surprise-charge complaints.",
  },
  {
    key: "other", label: "I want to cancel for another reason",
    offerTitle: "Thanks for telling us.", offerBody: "No offers here — you can cancel right away. Optional: share what we could do better.",
    options: [],
    hypothesis: "Respecting a clear intent to leave protects brand trust and improves winback potential.",
    benefit: "A fast, respectful exit she'd be comfortable coming back to.",
    metric: "Cancellation flow CSAT; 180-day reactivation rate.", guardrail: "Time-to-cancel stays under 60 seconds.",
  },
];

const ORIGINAL_NOTES = [
  "Cancel link buried beneath account settings in small grey text.",
  "Generic loss-framing; no alternatives that match her reason.",
  "Reason is collected — but never used to help her.",
  "Outcome: cancellation, with no path back.",
];

function Screen({ children, k }: { children: React.ReactNode; k: string }) {
  return (
    <motion.div key={k} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex flex-col px-5 pb-6 pt-12">
      {children}
    </motion.div>
  );
}

const SubCard = () => (
  <div className="rounded-2xl bg-sage/70 p-4">
    <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-sagedeep">Active · every 30 days</div>
    <div className="mt-1 font-serif text-xl">Debloat formula</div>
    <div className="mt-2 text-xs text-cocoa">Next order <strong className="text-espresso">Jun 28</strong> · $37.40</div>
  </div>
);

export default function RescueStudio() {
  const [mode, setMode] = usePersist<"original" | "improved">("rescue-mode", "improved");
  const [reasonKey, setReasonKey] = usePersist("rescue-reason", "too-much");
  const [step, setStep] = useState(0);
  const [outcome, setOutcome] = useState<Option | "cancelled" | "kept" | null>(null);
  const [tally, setTally] = usePersist("rescue-tally", { saved: 0, cancelled: 0 });
  const reason = REASONS.find((r) => r.key === reasonKey) || REASONS[0];

  const reset = () => { setStep(0); setOutcome(null); };
  const finish = (o: Option | "cancelled" | "kept") => {
    setOutcome(o);
    setStep(9);
    if (o === "cancelled") setTally({ ...tally, cancelled: tally.cancelled + 1 });
    else setTally({ ...tally, saved: tally.saved + 1 });
  };
  const chooseReason = (k: string) => { setReasonKey(k); reset(); };

  const original = () => {
    if (step === 9)
      return (
        <Screen k="o-end">
          <div className="mt-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-linen"><Check size={20} /></div>
            <p className="font-serif text-2xl">{outcome === "kept" ? "Subscription kept." : "Your subscription has been cancelled."}</p>
            <p className="mt-2 text-xs text-cocoa">{outcome === "kept" ? "Nothing changed — the reason she wanted to leave is still there." : "Reason recorded. No follow-up options offered."}</p>
          </div>
        </Screen>
      );
    if (step === 0)
      return (
        <Screen k="o0">
          <p className="mb-4 text-[10px] uppercase tracking-[0.14em] text-cocoa/60">Account › Subscriptions</p>
          <SubCard />
          <div className="mt-4 space-y-2 text-xs text-cocoa">
            {["Billing information", "Shipping address", "Order history", "Account settings"].map((x) => <div key={x} className="flex justify-between border-b border-line py-2.5">{x}<ChevronRight size={14} /></div>)}
          </div>
          <button data-testid="rescue-original-cancel-link" onClick={() => setStep(1)} className="mt-auto text-left text-[10px] text-cocoa/40 underline">manage subscription status</button>
        </Screen>
      );
    if (step === 1)
      return (
        <Screen k="o1">
          <p className="mt-10 font-serif text-3xl leading-tight">Are you sure? You'll lose your savings forever.</p>
          <button data-testid="rescue-original-keep" onClick={() => finish("kept")} className="mt-8 rounded-full bg-espresso py-3.5 text-sm text-ivory">Keep my subscription</button>
          <button data-testid="rescue-original-continue" onClick={() => setStep(2)} className="mt-3 text-[11px] text-cocoa/50">continue</button>
        </Screen>
      );
    return (
      <Screen k="o2">
        <p className="mt-6 font-serif text-2xl">Reason for cancelling</p>
        <div className="mt-4 rounded-lg border border-line bg-white p-3 text-xs text-cocoa">{reason.label} ▾</div>
        <p className="mt-3 text-[10px] text-cocoa/60">Required field</p>
        <button data-testid="rescue-original-submit" onClick={() => finish("cancelled")} className="mt-auto rounded-lg bg-cocoa/80 py-3 text-sm text-ivory">Submit cancellation</button>
      </Screen>
    );
  };

  const improved = () => {
    if (step === 9)
      return (
        <Screen k="i-end">
          <div className="mt-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sage text-sagedeep"><Check size={22} /></div>
            <p data-testid="rescue-outcome-text" className="font-serif text-2xl leading-snug">{outcome === "cancelled" ? "You're cancelled. No more charges." : "Done — you're all set."}</p>
            <p className="mt-3 text-xs leading-relaxed text-cocoa">{outcome === "cancelled" ? "A confirmation email is on its way. Reactivate any time in one tap — your preferences are saved." : (outcome as Option)?.result}</p>
          </div>
          {outcome !== "cancelled" && <button data-testid="rescue-undo" onClick={() => { setStep(2); setOutcome(null); }} className="mx-auto mt-6 text-xs text-sagedeep underline">Undo / choose something else</button>}
          {outcome === "cancelled" && <div className="mt-8 rounded-xl bg-butter/70 p-4 text-xs text-cocoa">Optional: what could we do better? <span className="mt-2 block rounded-lg bg-white p-2 text-cocoa/50">Type here…</span></div>}
        </Screen>
      );
    if (step === 0)
      return (
        <Screen k="i0">
          <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-sagedeep">My subscription</p>
          <p className="mb-4 font-serif text-2xl">Hi Maya</p>
          <SubCard />
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {["Delay order", "Change frequency", "Swap product", "Edit address"].map((x) => <div key={x} className="rounded-xl border border-line bg-white p-3">{x}</div>)}
          </div>
          <button data-testid="rescue-improved-start" onClick={() => setStep(1)} className="mt-auto rounded-full border border-espresso py-3 text-sm">Pause, change or cancel</button>
        </Screen>
      );
    if (step === 1)
      return (
        <Screen k="i1">
          <button onClick={() => setStep(0)} className="mb-4 flex items-center gap-1 text-xs text-cocoa"><ArrowLeft size={12} />Back</button>
          <p className="font-serif text-2xl leading-tight">What's changing for you?</p>
          <div className="mt-4 space-y-1.5">
            {REASONS.map((r) => (
              <button key={r.key} data-testid={`rescue-phone-reason-${r.key}`} onClick={() => { setReasonKey(r.key); setStep(2); }} className={`w-full rounded-xl border px-3.5 py-2.5 text-left text-xs transition-colors ${r.key === reasonKey ? "border-espresso bg-white" : "border-line bg-white/60 hover:border-espresso/40"}`}>{r.label}</button>
            ))}
          </div>
        </Screen>
      );
    if (step === 2)
      return (
        <Screen k={"i2" + reason.key}>
          <button onClick={() => setStep(1)} className="mb-4 flex items-center gap-1 text-xs text-cocoa"><ArrowLeft size={12} />Back</button>
          <p className="font-serif text-2xl leading-tight">{reason.offerTitle}</p>
          <p className="mt-2 text-xs leading-relaxed text-cocoa">{reason.offerBody}</p>
          {reason.key === "price" && (
            <ul className="mt-3 space-y-1 rounded-xl bg-butter/60 p-3 text-[11px] text-cocoa">
              <li>✓ Subscriber pricing on every order <span className="text-cocoa/50">(illustrative)</span></li>
              <li>✓ Skip, delay or swap anytime</li>
              <li>✓ Free shipping <span className="text-cocoa/50">(illustrative)</span></li>
            </ul>
          )}
          <div className="mt-4 space-y-2">
            {reason.options.map((o) => (
              <button key={o.id} data-testid={`rescue-option-${o.id}`} onClick={() => finish(o)} className="w-full rounded-xl border border-line bg-white p-3 text-left transition-colors hover:border-sagedeep">
                <div className="text-sm font-medium">{o.label}</div><div className="text-[11px] text-cocoa">{o.detail}</div>
              </button>
            ))}
          </div>
          <button data-testid="rescue-improved-continue-cancel" onClick={() => setStep(3)} className="mt-auto rounded-full border border-espresso/30 py-3 text-sm text-espresso">Continue to cancel</button>
        </Screen>
      );
    return (
      <Screen k="i3">
        <button onClick={() => setStep(2)} className="mb-4 flex items-center gap-1 text-xs text-cocoa"><ArrowLeft size={12} />Back</button>
        <p className="font-serif text-2xl">Confirm cancellation</p>
        <div className="mt-4 rounded-xl bg-white p-4 text-xs text-cocoa">Debloat formula · every 30 days<br />No further orders or charges after today.</div>
        <button data-testid="rescue-improved-confirm-cancel" onClick={() => finish("cancelled")} className="mt-auto rounded-full bg-espresso py-3.5 text-sm text-ivory">Cancel subscription</button>
        <button onClick={() => setStep(0)} className="mt-2 py-2 text-xs text-cocoa">Never mind, keep it</button>
      </Screen>
    );
  };

  return (
    <Section id="rescue" testId="subscription-rescue-section" className="bg-blush/30">
      <SectionHeader
        index="03"
        eyebrow="Subscription rescue studio"
        title={<>A cancellation flow that <em className="text-sagedeep">listens</em> before it lets go.</>}
        intro="Pick a reason, then walk the same subscriber through the original and the proposed journey. Every intervention is tied to a hypothesis and a metric — and cancelling is never harder than in the original."
      />
      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <div className="mb-3 eyebrow">1 · Cancellation reason</div>
          <div className="space-y-1.5">
            {REASONS.map((r) => (
              <button key={r.key} data-testid={`rescue-reason-${r.key}`} onClick={() => chooseReason(r.key)} className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-[background-color,border-color] duration-300 ${reasonKey === r.key ? "border-espresso bg-white" : "border-transparent hover:border-line hover:bg-white/60"}`}>
                <span className={reasonKey === r.key ? "text-espresso" : "text-cocoa"}>{r.label}</span>
                <ChevronRight size={14} className={`transition-transform ${reasonKey === r.key ? "translate-x-0.5 text-espresso" : "text-cocoa/40"}`} />
              </button>
            ))}
          </div>
          <div className="mb-3 mt-8 eyebrow">2 · Journey</div>
          <div className="flex gap-2">
            <Pill testId="rescue-mode-original" active={mode === "original"} onClick={() => { setMode("original"); reset(); }}>Original</Pill>
            <Pill testId="rescue-mode-improved" active={mode === "improved"} onClick={() => { setMode("improved"); reset(); }}>Proposed</Pill>
          </div>
          <div data-testid="rescue-session-tally" className="mt-8 flex items-center justify-between rounded-xl border border-dashed border-line p-4 text-xs text-cocoa">
            <span>Your test runs: <strong className="text-espresso">{tally.saved}</strong> retained · <strong className="text-espresso">{tally.cancelled}</strong> cancelled</span>
            <button data-testid="rescue-reset-tally" onClick={() => { setTally({ saved: 0, cancelled: 0 }); toast("Tally cleared"); }} className="text-sagedeep underline">clear</button>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-4">
          <PhoneFrame testId="rescue-phone">
            <AnimatePresence mode="wait">{mode === "original" ? original() : improved()}</AnimatePresence>
          </PhoneFrame>
          <div className="mt-4 flex justify-center">
            <button data-testid="rescue-restart" onClick={reset} className="btn-sm"><RotateCcw size={12} />Restart journey</button>
          </div>
        </Reveal>

        <Reveal delay={0.2} className="lg:col-span-4">
          <AnimatePresence mode="wait">
            {mode === "original" ? (
              <motion.div key="on" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="rescue-original-notes">
                <div className="mb-4 eyebrow !text-terracotta">Friction audit · original journey</div>
                <ol className="space-y-4">
                  {ORIGINAL_NOTES.map((n, i) => (
                    <li key={n} className={`flex gap-3 text-sm leading-relaxed transition-opacity ${Math.min(step, 3) === i || (step === 9 && i === 3) ? "text-espresso" : "text-cocoa/60"}`}>
                      <span className="font-mono text-xs text-terracotta">0{i + 1}</span>{n}
                    </li>
                  ))}
                </ol>
                <p className="mt-6 rounded-xl bg-white/70 p-4 text-xs leading-relaxed text-cocoa">A deliberately generic, composite pattern seen across subscription e-commerce — not a depiction of any specific brand's portal.</p>
              </motion.div>
            ) : (
              <motion.div key={"in" + reason.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} data-testid="rescue-hypothesis-panel" className="space-y-5">
                <div><div className="mb-2 flex items-center gap-2"><span className="eyebrow">Retention hypothesis</span><Tag kind="hypothesis" /></div><p className="font-serif text-xl leading-snug text-espresso">{reason.hypothesis}</p></div>
                <div className="border-t border-line pt-4"><div className="eyebrow mb-1 !text-[10px]">Customer benefit</div><p className="text-sm text-cocoa">{reason.benefit}</p></div>
                <div className="border-t border-line pt-4"><div className="eyebrow mb-1 !text-[10px]">Primary metric</div><p className="text-sm text-cocoa">{reason.metric}</p></div>
                <div className="border-t border-line pt-4"><div className="eyebrow mb-1 !text-[10px]">Guardrail</div><p className="text-sm text-cocoa">{reason.guardrail}</p></div>
                <div className="rounded-xl bg-sage/60 p-4 text-xs leading-relaxed text-sagedeep">
                  <div className="mb-1 flex items-center gap-1.5 font-semibold"><ShieldCheck size={14} />No dark patterns</div>
                  "Continue to cancel" is visible on every offer screen, offers are never pre-selected, and cancelling takes the same number of taps as the original.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </Section>
  );
}
