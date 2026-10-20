import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Section, SectionHeader, Reveal, Tag, Pill, PhoneFrame } from "./common";
import { usePersist } from "@/lib/usePersist";

const IMPROVED = [
  { id: 1, title: "Clear subscription status", principle: "Visibility of system status (Nielsen #1)", why: "Status, cadence and product are the first thing she sees — no hunting.", hyp: "Clear status reduces 'I didn't know it was still active' cancellations.", metric: "Billing-related support tickets per 1k subscribers" },
  { id: 2, title: "Transparent next-order date", principle: "Predictability & trust", why: "Date and amount are explicit, with a countdown.", hyp: "Showing the next charge date and amount reduces cancellations within 48h after a charge.", metric: "Post-charge cancellation rate" },
  { id: 3, title: "Easy delivery adjustments", principle: "User control & freedom · Fitts's law", why: "Large, one-tap delay controls where the thumb naturally rests.", hyp: "One-tap delay converts overstock cancellations into schedule changes.", metric: "Delay usage vs. 'too much product' cancellations" },
  { id: 4, title: "Product swaps", principle: "Recognition over recall", why: "Visual tiles of alternatives instead of a search or support request.", hyp: "Visible swaps reduce 'want to try another product' churn.", metric: "Swap rate; 90-day post-swap retention" },
  { id: 5, title: "Clear rewards visibility", principle: "Goal-gradient effect", why: "A progress bar shows how close the next reward is.", hyp: "Visible progress increases next-order acceptance near a threshold.", metric: "Order acceptance within 1 order of reward" },
  { id: 6, title: "Accessible cancellation", principle: "Trust · ethical design · error prevention", why: "Cancel is visible and labelled, with one confirmation step and an undo.", hyp: "An honest exit increases trust and future reactivation without raising net churn.", metric: "Reactivation rate; flow CSAT (guardrail: churn)" },
  { id: 7, title: "Mobile-first usability", principle: "Thumb zone · 44px targets (WCAG 2.5.8)", why: "Primary actions sit in the lower half; targets meet minimum size.", hyp: "Mobile task completion rises when controls are reachable one-handed.", metric: "Mobile self-serve task completion rate" },
  { id: 8, title: "Reduced cognitive load", principle: "Hick's law · progressive disclosure", why: "One decision per card; secondary settings tucked away.", hyp: "Fewer visible choices reduce time-to-task and abandoned portal visits.", metric: "Median time to complete an adjustment" },
];

const STANDARD = [
  { id: 1, title: "Status buried in a dense table", principle: "Violates visibility of system status", why: "Five columns of small text; status is one cell among many." },
  { id: 2, title: "Next charge on a separate page", principle: "Hidden information → surprise charges", why: "'See billing' link instead of a date." },
  { id: 3, title: "Small, text-only links", principle: "Fitts's law: tiny targets", why: "Edit actions are 11px links, hard to tap on mobile." },
  { id: 4, title: "Cancel requires contacting support", principle: "Obstruction (a known dark pattern)", why: "Creates frustration, complaints and chargebacks." },
  { id: 5, title: "Rewards live elsewhere", principle: "Out of sight, out of mind", why: "No connection between the subscription and its benefits." },
];

const PRODUCTS = ["Debloat", "Sleep", "Calm", "Metabolism"];
const BASE = Date.UTC(2026, 5, 28);
const fmt = (d: number) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function Anno({ id, active, onClick, children, className = "" }: { id: number; active: number | null; onClick: (n: number) => void; children: React.ReactNode; className?: string }) {
  const on = active === id;
  return (
    <div className={`relative rounded-2xl transition-[box-shadow,opacity] duration-300 ${on ? "shadow-[0_0_0_2px_#D4A359]" : ""} ${active != null && !on ? "opacity-50" : ""} ${className}`}>
      <button data-testid={`hci-marker-${id}`} aria-label={`Annotation ${id}`} onClick={() => onClick(id)} className={`absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full font-mono text-[9px] transition-[background-color,transform] ${on ? "scale-110 bg-honey text-espresso" : "bg-espresso text-ivory"}`}>{id}</button>
      {children}
    </div>
  );
}

function ImprovedPortal({ active, setActive }: { active: number | null; setActive: (n: number | null) => void }) {
  const [delay, setDelay] = useState(0);
  const [freq, setFreq] = useState(30);
  const [product, setProduct] = useState("Debloat");
  const [cancelStep, setCancelStep] = useState<0 | 1 | 2>(0);
  const next = BASE + delay * 86400000;
  const daysLeft = Math.round((next - Date.UTC(2026, 5, 20)) / 86400000);
  const pick = (n: number) => setActive(active === n ? null : n);

  if (cancelStep === 2)
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <p className="font-serif text-2xl">Subscription cancelled.</p>
        <p className="mt-2 text-xs text-cocoa">No further charges. Your preferences are saved.</p>
        <button data-testid="hci-reactivate-btn" onClick={() => { setCancelStep(0); toast.success("Reactivated in one tap"); }} className="mt-6 rounded-full bg-espresso px-6 py-3 text-sm text-ivory">Reactivate</button>
      </div>
    );

  return (
    <div className="h-full overflow-y-auto px-4 pb-6 pt-11">
      <Anno id={8} active={active} onClick={pick} className="mb-3 p-1">
        <div className="flex items-baseline justify-between"><p className="font-serif text-2xl">My ritual</p><span className="text-[10px] text-cocoa/60">Settings</span></div>
      </Anno>
      <Anno id={1} active={active} onClick={pick} className="mb-3">
        <div className="rounded-2xl bg-sage/80 p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sagedeep"><span className="h-1.5 w-1.5 rounded-full bg-sagedeep" />Active · every {freq} days</div>
          <div data-testid="hci-product-name" className="mt-1 font-serif text-xl">{product} formula</div>
        </div>
      </Anno>
      <Anno id={2} active={active} onClick={pick} className="mb-3">
        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="text-[10px] uppercase tracking-[0.12em] text-cocoa/60">Next order</div>
          <div className="flex items-baseline justify-between"><span data-testid="hci-next-date" className="font-serif text-2xl">{fmt(next)}</span><span className="text-xs text-cocoa">$37.40 · in {daysLeft} days</span></div>
        </div>
      </Anno>
      <Anno id={3} active={active} onClick={pick} className="mb-3">
        <div className="grid grid-cols-3 gap-1.5">
          {[[7, "+1 wk"], [14, "+2 wks"], [30, "+1 mo"]].map(([d, l]) => (
            <button key={d} data-testid={`hci-delay-${d}`} onClick={() => { setDelay(delay + (d as number)); toast(`Next order moved to ${fmt(next + (d as number) * 86400000)}`); }} className="min-h-[44px] rounded-xl bg-butter text-xs font-medium transition-transform active:scale-95">{l}</button>
          ))}
        </div>
        <div className="mt-1.5 flex gap-1">
          {[30, 45, 60, 90].map((f) => (
            <button key={f} data-testid={`hci-freq-${f}`} onClick={() => setFreq(f)} className={`min-h-[36px] flex-1 rounded-lg border text-[11px] ${freq === f ? "border-espresso bg-espresso text-ivory" : "border-line bg-white"}`}>{f}d</button>
          ))}
        </div>
        {delay > 0 && <button data-testid="hci-delay-undo" onClick={() => setDelay(0)} className="mt-1 text-[10px] text-sagedeep underline">Undo delay</button>}
      </Anno>
      <Anno id={4} active={active} onClick={pick} className="mb-3">
        <div className="text-[10px] uppercase tracking-[0.12em] text-cocoa/60">Swap product</div>
        <div className="mt-1.5 grid grid-cols-4 gap-1.5">
          {PRODUCTS.map((p) => (
            <button key={p} data-testid={`hci-swap-${p.toLowerCase()}`} onClick={() => setProduct(p)} className={`flex min-h-[52px] flex-col items-center justify-center rounded-xl border text-[10px] ${product === p ? "border-espresso bg-white" : "border-line bg-white/50"}`}>
              <span className={`mb-1 h-4 w-3 rounded-sm ${{ Debloat: "bg-butterdeep", Sleep: "bg-[#C9CCE0]", Calm: "bg-sage", Metabolism: "bg-blushdeep" }[p]}`} />{p}
            </button>
          ))}
        </div>
      </Anno>
      <Anno id={5} active={active} onClick={pick} className="mb-3">
        <div className="rounded-2xl bg-blush/70 p-3.5">
          <div className="flex justify-between text-[11px]"><span>Rewards</span><span className="font-medium">1 order to your free sample</span></div>
          <div className="mt-2 h-1.5 rounded-full bg-white"><div className="h-full w-[80%] rounded-full bg-terracotta" /></div>
        </div>
      </Anno>
      <Anno id={6} active={active} onClick={pick} className="mb-1">
        {cancelStep === 0 ? (
          <button data-testid="hci-cancel-btn" onClick={() => setCancelStep(1)} className="min-h-[44px] w-full rounded-xl border border-line text-xs text-cocoa">Pause or cancel subscription</button>
        ) : (
          <div className="rounded-xl border border-espresso/20 bg-white p-3 text-xs">
            <p className="mb-2">Cancel {product}? No charges after today.</p>
            <div className="flex gap-2">
              <button data-testid="hci-cancel-confirm" onClick={() => setCancelStep(2)} className="min-h-[40px] flex-1 rounded-lg bg-espresso text-ivory">Yes, cancel</button>
              <button data-testid="hci-cancel-back" onClick={() => setCancelStep(0)} className="min-h-[40px] flex-1 rounded-lg border border-line">Keep it</button>
            </div>
          </div>
        )}
      </Anno>
      <Anno id={7} active={active} onClick={pick} className="mt-3 p-1"><p className="text-center text-[10px] text-cocoa/50">Primary controls sit in the thumb zone</p></Anno>
    </div>
  );
}

function StandardPortal({ active, setActive }: { active: number | null; setActive: (n: number | null) => void }) {
  const pick = (n: number) => setActive(active === n ? null : n);
  return (
    <div className="h-full overflow-y-auto bg-white px-3 pb-6 pt-11 font-sans">
      <p className="mb-1 text-[11px] font-semibold">ACCOUNT DASHBOARD</p>
      <p className="mb-3 text-[9px] text-cocoa/60">Home › Account › Subscriptions › Manage</p>
      <Anno id={1} active={active} onClick={pick} className="mb-3">
        <table className="w-full border border-line text-[8.5px]">
          <thead className="bg-linen"><tr>{["Sub #", "Item", "Qty", "Interval", "Status"].map((h) => <th key={h} className="border border-line p-1 text-left font-medium">{h}</th>)}</tr></thead>
          <tbody><tr>{["#48213", "DBL-60CT", "1", "30 Day(s)", "ACTV"].map((c) => <td key={c} className="border border-line p-1">{c}</td>)}</tr></tbody>
        </table>
      </Anno>
      <Anno id={2} active={active} onClick={pick} className="mb-3 p-1"><p className="text-[9px] text-cocoa">Next charge: <span className="text-[#5B6190] underline">see billing</span></p></Anno>
      <Anno id={3} active={active} onClick={pick} className="mb-3 p-1">
        <div className="flex flex-wrap gap-2 text-[8.5px] text-[#5B6190] underline"><span>edit interval</span><span>edit qty</span><span>edit item</span><span>edit address</span><span>edit payment</span></div>
      </Anno>
      <div className="mb-3 space-y-1 text-[8.5px] text-cocoa/70"><p>Order history (12)</p><p>Payment methods</p><p>Communication preferences</p><p>Terms of service</p></div>
      <Anno id={5} active={active} onClick={pick} className="mb-3 p-1"><p className="text-[8.5px] text-cocoa/70">Loyalty: visit Rewards page</p></Anno>
      <Anno id={4} active={active} onClick={pick} className="p-1"><p className="text-[8px] leading-relaxed text-cocoa/50">To cancel or modify your subscription status, please contact customer support at least 72 hours before your next billing date.</p></Anno>
    </div>
  );
}

export default function HciLab() {
  const [mode, setMode] = usePersist<"standard" | "improved">("hci-mode", "improved");
  const [active, setActive] = useState<number | null>(null);
  const list = mode === "improved" ? IMPROVED : STANDARD;
  return (
    <Section id="hci" testId="hci-lab-section" className="bg-linen/60">
      <SectionHeader index="07" eyebrow="Human-computer interaction lab" title={<>Retention is a <em className="text-sagedeep">usability</em> problem first.</>} intro="A conceptual subscription portal, before and after. Tap any numbered marker — on the phone or in the list — to see the HCI principle behind it and the retention hypothesis it creates. The improved portal is fully interactive." />
      <div className="mb-8 flex gap-2">
        <Pill testId="hci-mode-standard" active={mode === "standard"} onClick={() => { setMode("standard"); setActive(null); }}>Standard portal</Pill>
        <Pill testId="hci-mode-improved" active={mode === "improved"} onClick={() => { setMode("improved"); setActive(null); }}>Improved portal</Pill>
      </div>
      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <PhoneFrame testId="hci-portal-phone">
            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full">
                {mode === "improved" ? <ImprovedPortal active={active} setActive={setActive} /> : <StandardPortal active={active} setActive={setActive} />}
              </motion.div>
            </AnimatePresence>
          </PhoneFrame>
          <p className="mt-4 text-center text-[11px] text-cocoa/70">Conceptual prototype · generic composite, not any brand's live portal.</p>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="mb-4 flex items-center gap-2">
            <span className="eyebrow">{mode === "improved" ? "Design decisions" : "Friction points"}</span>
            {mode === "improved" && <Tag kind="hypothesis" />}
          </div>
          <div data-testid="hci-annotations" className="divide-y divide-line border-y border-line">
            {list.map((a: any) => (
              <button key={mode + a.id} data-testid={`hci-annotation-${a.id}`} onClick={() => setActive(active === a.id ? null : a.id)} aria-expanded={active === a.id} className="block w-full py-4 text-left">
                <div className="flex items-baseline gap-4">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] transition-colors ${active === a.id ? "bg-honey text-espresso" : mode === "improved" ? "bg-espresso text-ivory" : "bg-terracotta text-ivory"}`}>{a.id}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2"><span className="font-serif text-xl text-espresso">{a.title}</span><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-sagedeep">{a.principle}</span></div>
                    <AnimatePresence initial={false}>
                      {active === a.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <p className="pt-2 text-sm leading-relaxed text-cocoa">{a.why}</p>
                          {a.hyp && (
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <div className="rounded-xl bg-butter/70 p-3 text-xs text-cocoa"><span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-[#8A6A1F]">Testable hypothesis</span>{a.hyp}</div>
                              <div className="rounded-xl bg-sage/70 p-3 text-xs text-cocoa"><span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-sagedeep">Measure</span>{a.metric}</div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
