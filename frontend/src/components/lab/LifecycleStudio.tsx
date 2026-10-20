import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, MessageSquare, Trash2, FlaskConical, Save } from "lucide-react";
import { toast } from "sonner";
import { Section, SectionHeader, Reveal, Tag, Pill, PhoneFrame } from "./common";
import { Choice } from "./controls";
import { usePersist } from "@/lib/usePersist";

type Motivation = "consistency" | "novelty" | "value";
interface Persona { key: string; name: string; archetype: string; product: string; status: string; source: string; motivation: Motivation; smsOptIn: boolean; orders: number }

const PERSONAS: Persona[] = [
  { key: "maya", name: "Maya", archetype: "The Ritual Builder", product: "Sleep", status: "Subscriber · every 30 days", source: "Organic search", motivation: "consistency", smsOptIn: true, orders: 5 },
  { key: "zoe", name: "Zoe", archetype: "The Viral Discoverer", product: "Debloat", status: "One-time buyer", source: "TikTok creator video", motivation: "novelty", smsOptIn: true, orders: 1 },
  { key: "priya", name: "Priya", archetype: "The Value Seeker", product: "Calm", status: "Subscriber · every 60 days (BFCM)", source: "Paid social, BFCM offer", motivation: "value", smsOptIn: false, orders: 2 },
];

const pv = (p: Persona, v: Record<Motivation, string>) => v[p.motivation];
const hook = (p: Persona) => pv(p, { consistency: "your evening routine", novelty: "what's actually inside", value: "everything your subscription includes" });

interface Email { subject: string; preheader: string; headline: string; body: string; cta: string }
interface Journey { id: string; name: string; trigger: string; segment: string; timing: { when: string; ch: "Email" | "SMS"; label: string }[]; personalization: string[]; suppression: string[]; metrics: string[]; email: (p: Persona) => Email; sms: (p: Persona) => string }

const JOURNEYS: Journey[] = [
  {
    id: "welcome", name: "Welcome & first-purchase onboarding", trigger: "First order placed", segment: "New customers (order count = 1)",
    timing: [{ when: "Day 0", ch: "Email", label: "Order confirmed + what to expect" }, { when: "Day 2", ch: "Email", label: "How to start your routine" }, { when: "Day 5", ch: "SMS", label: "Delivery + first-use tip" }],
    personalization: ["First product → routine content", "Acquisition channel → tone (creator vs. search)", "Subscription vs. one-time → value framing"],
    suppression: ["Email requires marketing opt-in; transactional only otherwise", "SMS only with explicit SMS consent", "Quiet hours 9pm–9am local"],
    metrics: ["Day-14 engagement rate", "First-to-second order conversion", "Unsubscribe rate (guardrail)"],
    email: (p) => ({ subject: pv(p, { consistency: `${p.name}, your ${p.product} ritual starts here`, novelty: `You found us. Here's what to know about ${p.product}`, value: `Welcome, ${p.name} — here's how to get the most from your order` }), preheader: "A few small things that make a big difference.", headline: "Welcome to the ritual.", body: pv(p, { consistency: `Most people find it easiest to pair ${p.product} with something they already do every day. We'll share a simple 3-step start.`, novelty: `You probably saw ${p.product} on your feed. Here's the ingredient list, how to take it, and what real customers say about building it into a routine.`, value: `Your order includes subscriber pricing and you can skip, delay or swap any time — no strings.` }), cta: "Start your routine" }),
    sms: (p) => `Hi ${p.name}! Your ${p.product} is on its way 🌿 Tip: keep it where you'll see it each morning. Reply STOP to opt out.`,
  },
  {
    id: "education", name: "Post-purchase education", trigger: "Order delivered", segment: "All customers, days 3–21 post-delivery",
    timing: [{ when: "Day 3", ch: "Email", label: "How to use it" }, { when: "Day 10", ch: "Email", label: "Ingredient spotlight" }, { when: "Day 18", ch: "Email", label: "Routine check-in" }],
    personalization: ["Product-specific usage content", "Persona motivation → content angle", "Skip ingredient content for repeat buyers"],
    suppression: ["No health or outcome claims — usage and ingredient facts only", "Suppress if support ticket open"],
    metrics: ["Content click-through", "Day-30 repeat purchase", "Support contacts per order (guardrail)"],
    email: (p) => ({ subject: pv(p, { consistency: `Making ${p.product} part of ${hook(p)}`, novelty: `${p.product}, ingredient by ingredient`, value: `Getting the most out of every ${p.product} capsule` }), preheader: "A 2-minute read.", headline: pv(p, { consistency: "Habits beat intensity.", novelty: "What's actually inside.", value: "Small habits, full value." }), body: `Here's a simple way to make ${p.product} easy to remember — plus the why behind each ingredient. (Usage guidance only; not medical advice.)`, cta: "Read the guide" }),
    sms: (p) => `${p.name}, quick tip: stack your ${p.product} with something you already do daily — coffee, skincare, or bedtime. Reply STOP to opt out.`,
  },
  {
    id: "replenish", name: "Replenishment reminders", trigger: "Predicted run-out date − 7 days", segment: "One-time buyers & non-subscribed repeat buyers",
    timing: [{ when: "Run-out −7d", ch: "Email", label: "Running low?" }, { when: "Run-out −2d", ch: "SMS", label: "One-tap reorder" }, { when: "Run-out +5d", ch: "Email", label: "Subscribe & never run out" }],
    personalization: ["Run-out date from pack size × usage", "Last product + size pre-filled", "Offer subscription only to 2+ order customers"],
    suppression: ["Suppress if reordered in last 14 days", "Suppress subscribers (they get shipment notices)", "Max 2 SMS / 30 days"],
    metrics: ["Reorder within 14 days", "Days between purchases", "SMS opt-out rate (guardrail)"],
    email: (p) => ({ subject: pv(p, { consistency: `Don't break the streak, ${p.name}`, novelty: `Still loving ${p.product}?`, value: `Running low? Your reorder is ready` }), preheader: "Your bottle is probably close to empty.", headline: "Running low?", body: `Based on your last order, your ${p.product} is likely running low in about a week. Reorder in one tap — or set it to arrive automatically.`, cta: "Reorder now" }),
    sms: (p) => `Hi ${p.name}, your ${p.product} is probably running low. Reorder in 1 tap: brand.example/r/•••• Reply STOP to opt out.`,
  },
  {
    id: "milestone", name: "Subscription milestone recognition", trigger: "3rd, 6th, 12th subscription order", segment: "Active subscribers",
    timing: [{ when: "Order 3", ch: "Email", label: "3 months of ritual" }, { when: "Order 6", ch: "Email", label: "Half-year thank-you + sample" }, { when: "Order 12", ch: "SMS", label: "One-year note" }],
    personalization: ["Milestone count", "Sample = adjacent product to current routine", "Tone: gratitude, not upsell"],
    suppression: ["Suppress if a cancellation is pending", "Skip if CSAT < 3 in last 30 days"],
    metrics: ["Subscriber retention 60 days after milestone", "Sample-to-purchase rate", "Margin per subscriber (guardrail)"],
    email: (p) => ({ subject: `${p.name}, ${p.orders} orders in. Thank you.`, preheader: "A little something is in your next box.", headline: `${p.orders} deliveries of ${p.product}.`, body: pv(p, { consistency: "You've built something consistent — that's the hardest part. Your next box includes a sample we think fits your routine.", novelty: "You've explored more than most. Here's a sample of something new for your next box.", value: "As a thank-you, your next box includes a complimentary sample — no code needed." }), cta: "See what's next" }),
    sms: (p) => `${p.name} — ${p.orders} orders of ${p.product}! A thank-you sample is in your next box ✨ Reply STOP to opt out.`,
  },
  {
    id: "atrisk", name: "At-risk subscriber engagement", trigger: "Risk score high (skips, low opens, portal visits to cancel page)", segment: "Active subscribers with risk signals",
    timing: [{ when: "Signal +1d", ch: "Email", label: "Is your schedule still right?" }, { when: "Signal +4d", ch: "SMS", label: "Delay in one reply" }],
    personalization: ["Reason inferred from signal (overstock vs. disengaged)", "Show delay / swap controls inline", "Never lead with discount"],
    suppression: ["Suppress if contacted by support in 7 days", "Max 1 at-risk touch per cycle"],
    metrics: ["Next-order acceptance rate", "Delay/swap usage", "Cancellation rate (primary)"],
    email: (p) => ({ subject: `${p.name}, is your schedule still working?`, preheader: "Change it in 10 seconds.", headline: "Life changes. So can your deliveries.", body: `Your next ${p.product} order ships soon. If you have extra at home, delay it or change your frequency — it takes 10 seconds.`, cta: "Adjust my delivery" }),
    sms: (p) => `Hi ${p.name}, your next ${p.product} ships in 5 days. Have extra? Reply DELAY to push it 2 weeks. Reply STOP to opt out.`,
  },
  {
    id: "cancel", name: "Cancellation follow-up", trigger: "Subscription cancelled", segment: "Cancelled subscribers (reason captured)",
    timing: [{ when: "Day 0", ch: "Email", label: "Confirmation (transactional)" }, { when: "Day 21", ch: "Email", label: "Reason-matched check-in" }],
    personalization: ["Message branches on cancellation reason", "Preserve saved preferences for one-tap reactivation"],
    suppression: ["Day-0 confirmation is transactional — no marketing", "Respect marketing opt-out immediately", "No SMS after cancellation unless re-consented"],
    metrics: ["Reactivation within 90 days", "Unsubscribe rate (guardrail)", "Feedback response rate"],
    email: (p) => ({ subject: "Your subscription is cancelled", preheader: "No further charges.", headline: "You're all set.", body: `Your ${p.product} subscription is cancelled and you won't be charged again. If you ever want to come back, your preferences are saved and reactivation takes one tap.`, cta: "Share quick feedback" }),
    sms: () => "",
  },
  {
    id: "winback", name: "Winback campaigns", trigger: "90 / 150 days since last order", segment: "Lapsed customers with marketing consent",
    timing: [{ when: "Day 90", ch: "Email", label: "What's new" }, { when: "Day 120", ch: "Email", label: "Routine reset" }, { when: "Day 150", ch: "SMS", label: "Last note + offer test" }],
    personalization: ["Lead with new products if lapsed for 'try another'", "Incentive only in test cell", "Reference original first product"],
    suppression: ["Exit on any purchase", "Suppress hard bounces & complaints", "Sunset after 180 days of no engagement"],
    metrics: ["Reactivation rate", "Revenue per recipient", "Spam complaint rate (guardrail)"],
    email: (p) => ({ subject: pv(p, { consistency: `Ready to restart your ritual, ${p.name}?`, novelty: `A lot's new since you tried ${p.product}`, value: `${p.name}, we saved your spot` }), preheader: "No pressure — just an update.", headline: "It's been a while.", body: pv(p, { consistency: "Routines drift — it happens. Here's an easy way back in, starting this week.", novelty: "We've added new formulas since your first order. Here's what customers like you are trying.", value: "Your preferences are saved. Come back any time — and see what's included for subscribers." }), cta: "See what's new" }),
    sms: (p) => `Hi ${p.name}, it's been a while! Your ${p.product} preferences are saved — restart anytime: brand.example/w/•••• Reply STOP to opt out.`,
  },
  {
    id: "crosssell", name: "Cross-sell & product discovery", trigger: "2nd order delivered OR 60 days on one product", segment: "Repeat customers on a single product",
    timing: [{ when: "Order 2 +7d", ch: "Email", label: "Routine pairing" }, { when: "Day 60", ch: "Email", label: "Add to next box" }],
    personalization: ["Adjacent need-state to current product (e.g. day ↔ night)", "Add-to-subscription for subscribers", "Exclude products already owned"],
    suppression: ["Not before 2nd order", "Suppress if at-risk score high"],
    metrics: ["Multi-product customer rate", "AOV", "Subscription churn (guardrail)"],
    email: (p) => ({ subject: `Pairs well with ${p.product}`, preheader: "A day-and-night routine idea.", headline: "Complete the routine.", body: `Customers who use ${p.product} often pair it with a daytime formula. Add it to your next delivery — remove it anytime.`, cta: "Add to next box" }),
    sms: (p) => `${p.name}, want to try a routine pairing with ${p.product}? Add it to your next box in 1 tap: brand.example/x/•••• Reply STOP to opt out.`,
  },
  {
    id: "bfcm", name: "BFCM promotional cohort retention", trigger: "Acquired during BFCM window", segment: "BFCM first-time customers",
    timing: [{ when: "Day 7", ch: "Email", label: "Full-value story (no discount)" }, { when: "Day 25", ch: "Email", label: "Replenishment w/ flexibility" }, { when: "Day 45", ch: "SMS", label: "Subscribe-to-save test cell" }],
    personalization: ["Suppress discount language in cell A", "Highlight flexibility over price", "Track discount dependency per customer"],
    suppression: ["Exclude from Dec promos for 30 days (test cell)", "Holiday quiet hours", "SMS only with consent"],
    metrics: ["Full-price second order rate", "90-day retention vs. non-BFCM", "Discount cost per retained customer (guardrail)"],
    email: (p) => ({ subject: `${p.name}, the real reason people stay with ${p.product}`, preheader: "It's not the sale.", headline: "Beyond the sale.", body: pv(p, { consistency: "You joined during our biggest week — here's how to make it a routine that lasts well past it.", novelty: "You discovered us during the rush. Here's the story behind the formula — and why people reorder.", value: "You got a great deal. Here's what makes it worth keeping at everyday pricing — including flexibility to skip anytime." }), cta: "Build your routine" }),
    sms: (p) => `Hi ${p.name}! Loving your ${p.product}? Subscribers can skip or delay anytime. Set it up: brand.example/s/•••• Reply STOP to opt out.`,
  },
];

const STRATEGIES = [
  { key: "benefit", label: "Benefit-led", subject: (p: Persona) => `What your ${p.product} subscription includes`, assumed: 0.042 },
  { key: "ritual", label: "Routine-led", subject: (p: Persona) => `A 30-second ritual for ${hook(p)}`, assumed: 0.048 },
  { key: "social", label: "Community / UGC-led", subject: (p: Persona) => `How others fit ${p.product} into their day`, assumed: 0.045 },
  { key: "incentive", label: "Incentive-led", subject: () => "A thank-you on your next order", assumed: 0.055 },
  { key: "flex", label: "Flexibility-led", subject: () => "Running low — or not? You decide when", assumed: 0.05 },
  { key: "education", label: "Education-led", subject: (p: Persona) => `${p.product}, ingredient by ingredient`, assumed: 0.046 },
];
const METRICS = ["Click-through rate", "Reorder within 14 days", "Subscription save rate", "One-time → subscription conversion"];
const GUARDRAILS = ["Unsubscribe rate", "Spam complaints", "Discount cost per order", "SMS opt-out rate", "Average order value"];

interface TestPlan { id: string; journey: string; a: string; b: string; hypothesis: string; metric: string; guardrails: string[]; n: number }

function simulate(pa: number, pb: number, n: number) {
  const draw = (p: number) => {
    const sd = Math.sqrt(n * p * (1 - p));
    let u = 0;
    for (let i = 0; i < 6; i++) u += Math.random();
    return Math.max(0, Math.round(n * p + (u - 3) * sd * 1.41));
  };
  const xa = draw(pa), xb = draw(pb);
  const ra = xa / n, rb = xb / n;
  const se = Math.sqrt((ra * (1 - ra)) / n + (rb * (1 - rb)) / n);
  const diff = rb - ra;
  const z = se ? diff / se : 0;
  return { ra, rb, lift: ra ? diff / ra : 0, lo: diff - 1.96 * se, hi: diff + 1.96 * se, sig: Math.abs(z) > 1.96 };
}

function EmailPreview({ e, p, testId }: { e: Email; p: Persona; testId: string }) {
  return (
    <div data-testid={testId} className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_20px_60px_-35px_rgba(28,24,23,0.4)]">
      <div className="flex items-center gap-1.5 border-b border-line bg-linen/70 px-4 py-2.5">
        {["#EECECE", "#F3E6B4", "#E3E8E0"].map((c) => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}
        <span className="ml-3 font-mono text-[10px] text-cocoa/60">Inbox · concept preview</span>
      </div>
      <div className="border-b border-line px-5 py-3 text-xs">
        <div className="flex justify-between text-cocoa/70"><span>From: The Brand &lt;hello@brand.example&gt;</span><span>9:14 AM</span></div>
        <div className="mt-1 text-cocoa/70">To: {p.name.toLowerCase()}@example.com</div>
        <div data-testid={`${testId}-subject`} className="mt-2 text-sm font-semibold text-espresso">{e.subject}</div>
        <div className="text-cocoa/70">{e.preheader}</div>
      </div>
      <div className="bg-butter/40 px-6 py-8 sm:px-10">
        <div className="mb-6 text-center font-serif text-sm italic tracking-[0.3em] text-cocoa">B R A N D</div>
        <h5 className="text-center font-serif text-3xl leading-tight text-espresso">{e.headline}</h5>
        <p className="mx-auto mt-4 max-w-sm text-center text-sm leading-relaxed text-cocoa">{e.body}</p>
        <div className="mt-6 text-center"><span className="inline-block rounded-full bg-espresso px-6 py-2.5 text-xs text-ivory">{e.cta}</span></div>
        <p className="mt-8 text-center text-[10px] text-cocoa/50">You're receiving this because you opted in. Unsubscribe · Preferences</p>
      </div>
    </div>
  );
}

function SmsPreview({ text, p, journey }: { text: string; p: Persona; journey: Journey }) {
  const blocked = !p.smsOptIn || !text;
  return (
    <PhoneFrame testId="lifecycle-sms-preview" className="!max-w-[280px] [&>div]:!h-[520px]">
      <div className="flex h-full flex-col">
        <div className="border-b border-line bg-white/80 px-4 pb-3 pt-10 text-center">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-sage font-serif text-sm">B</div>
          <div className="text-[11px] font-medium">Brand · SMS</div>
        </div>
        <div className="flex-1 space-y-3 p-4">
          <div className="text-center text-[10px] text-cocoa/50">Today 10:02 AM</div>
          {blocked ? (
            <div data-testid="lifecycle-sms-suppressed" className="rounded-2xl border border-dashed border-terracotta/50 bg-blush/50 p-4 text-center text-xs leading-relaxed text-cocoa">
              <strong className="block text-espresso">Suppressed</strong>
              {!text ? `No SMS in "${journey.name}" — post-cancellation SMS requires fresh consent.` : `${p.name} hasn't given SMS consent, so this journey falls back to email only.`}
            </div>
          ) : (
            <motion.div key={text} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} data-testid="lifecycle-sms-bubble" className="max-w-[88%] rounded-2xl rounded-bl-md bg-linen px-3.5 py-2.5 text-[13px] leading-snug text-espresso">{text}</motion.div>
          )}
        </div>
        <div className="m-3 rounded-full border border-line bg-white px-4 py-2 text-[11px] text-cocoa/40">Text message</div>
      </div>
    </PhoneFrame>
  );
}

export default function LifecycleStudio() {
  const [jid, setJid] = usePersist("lc-journey", "welcome");
  const [pkey, setPkey] = usePersist("lc-persona", "maya");
  const [view, setView] = useState<"email" | "sms">("email");
  const j = JOURNEYS.find((x) => x.id === jid) || JOURNEYS[0];
  const p = PERSONAS.find((x) => x.key === pkey) || PERSONAS[0];
  const email = useMemo(() => j.email(p), [j, p]);

  const [a, setA] = useState("benefit");
  const [b, setB] = useState("ritual");
  const [metric, setMetric] = useState(METRICS[0]);
  const [guards, setGuards] = useState<string[]>(["Unsubscribe rate"]);
  const [nRaw, setNRaw] = useState("4000");
  const n = Math.max(200, Math.min(100000, Math.round(Number(nRaw)) || 200));
  const sa = STRATEGIES.find((s) => s.key === a)!;
  const sb = STRATEGIES.find((s) => s.key === b)!;
  const [hyp, setHyp] = useState<string | null>(null);
  const defaultHyp = `If we lead the "${j.name}" message with a ${sb.label.toLowerCase()} angle instead of ${sa.label.toLowerCase()}, ${metric.toLowerCase()} will increase because it better matches what ${p.archetype.toLowerCase()} customers value.`;
  const [result, setResult] = useState<ReturnType<typeof simulate> | null>(null);
  const [plans, setPlans] = usePersist<TestPlan[]>("lc-ab-plans", []);

  const run = () => {
    if (a === b) return toast.error("Pick two different strategies to compare.");
    setResult(simulate(sa.assumed, sb.assumed, n));
  };
  const save = () => {
    if (a === b) return toast.error("Pick two different strategies to compare.");
    setPlans([{ id: String(Date.now()), journey: j.name, a: sa.label, b: sb.label, hypothesis: hyp ?? defaultHyp, metric, guardrails: guards, n }, ...plans].slice(0, 8));
    toast.success("Test plan saved to this browser");
  };

  return (
    <Section id="lifecycle" testId="lifecycle-studio-section">
      <SectionHeader index="04" eyebrow="Email & SMS lifecycle studio" title={<>Nine journeys. Three customers. <em className="text-sagedeep">One relationship.</em></>} intro="Choose a journey and a persona to see how triggers, timing, consent rules and messaging adapt. Previews are conceptual and use a neutral placeholder brand." />

      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-3">
          <div className="eyebrow mb-3">Journeys</div>
          <div className="space-y-0.5">
            {JOURNEYS.map((x, i) => (
              <button key={x.id} data-testid={`lc-journey-${x.id}`} onClick={() => setJid(x.id)} className={`flex w-full items-baseline gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-[background-color,color] duration-300 ${jid === x.id ? "bg-espresso text-ivory" : "text-cocoa hover:bg-linen"}`}>
                <span className={`font-mono text-[10px] ${jid === x.id ? "text-honey" : "text-sagedeep"}`}>{String(i + 1).padStart(2, "0")}</span>{x.name}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="min-w-0 lg:col-span-9">
          <Reveal className="mb-8">
            <div className="eyebrow mb-3">Persona</div>
            <div className="grid gap-3 sm:grid-cols-3">
              {PERSONAS.map((x) => (
                <button key={x.key} data-testid={`lc-persona-${x.key}`} onClick={() => setPkey(x.key)} className={`rounded-2xl border p-4 text-left transition-[background-color,border-color,transform] duration-300 active:scale-[0.98] ${pkey === x.key ? "border-espresso bg-white" : "border-line bg-white/40 hover:border-espresso/30"}`}>
                  <div className="flex items-baseline justify-between"><span className="font-serif text-2xl">{x.name}</span><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-sagedeep">{x.archetype}</span></div>
                  <div className="mt-2 text-xs leading-relaxed text-cocoa">{x.product} · {x.status}<br />{x.source} · SMS {x.smsOptIn ? "opted in" : "not consented"}</div>
                </button>
              ))}
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.div key={j.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} data-testid="lc-journey-detail" className="mb-10">
              <div className="mb-6 grid gap-6 border-y border-line py-6 sm:grid-cols-2">
                <div><div className="eyebrow mb-1 !text-[10px]">Trigger</div><p className="text-sm text-espresso">{j.trigger}</p></div>
                <div><div className="eyebrow mb-1 !text-[10px]">Customer segment</div><p className="text-sm text-espresso">{j.segment}</p></div>
              </div>
              <div className="mb-8 flex gap-0 overflow-x-auto">
                {j.timing.map((t, i) => (
                  <div key={i} className="relative min-w-[180px] flex-1 pr-4">
                    <div className="mb-3 flex items-center gap-2"><span className={`flex h-7 w-7 items-center justify-center rounded-full ${t.ch === "Email" ? "bg-butter" : "bg-blush"}`}>{t.ch === "Email" ? <Mail size={13} /> : <MessageSquare size={13} />}</span><span className="h-px flex-1 bg-line" /></div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-sagedeep">{t.when} · {t.ch}</div>
                    <div className="mt-1 text-sm text-espresso">{t.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                {[["Personalization rules", j.personalization], ["Suppression & consent", j.suppression], ["Success metrics", j.metrics]].map(([title, items]) => (
                  <div key={title as string}><div className="eyebrow mb-2 !text-[10px]">{title as string}</div><ul className="space-y-1.5 text-[13px] leading-relaxed text-cocoa">{(items as string[]).map((it) => <li key={it} className="flex gap-2"><span className="text-sagedeep">·</span>{it}</li>)}</ul></div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              <Pill testId="lc-view-email" active={view === "email"} onClick={() => setView("email")} className="!py-1.5 !text-xs">Email preview</Pill>
              <Pill testId="lc-view-sms" active={view === "sms"} onClick={() => setView("sms")} className="!py-1.5 !text-xs">SMS preview</Pill>
            </div>
            <span className="hidden text-[11px] text-cocoa/70 sm:block">Sample messaging · not a live campaign</span>
          </div>
          <div className="grid items-start gap-8 md:grid-cols-5">
            <div className={`md:col-span-3 ${view === "sms" ? "hidden md:block" : ""}`}><EmailPreview e={email} p={p} testId="lifecycle-email-preview" /></div>
            <div className={`md:col-span-2 ${view === "email" ? "hidden md:block" : ""}`}><SmsPreview text={j.sms(p)} p={p} journey={j} /></div>
          </div>
        </div>
      </div>

      <Reveal className="mt-20">
        <div data-testid="ab-test-builder" className="rounded-3xl bg-espresso p-6 text-ivory sm:p-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-honey">A/B messaging test builder</span>
              <h3 className="mt-2 font-serif text-3xl sm:text-4xl">Compare two strategies for “{j.name}”.</h3>
            </div>
            <Tag kind="simulated" />
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {[["A · Control", a, setA, "ab-strategy-a", sa], ["B · Variant", b, setB, "ab-strategy-b", sb]].map(([label, val, setter, tid, s]: any) => (
                  <div key={tid} className="rounded-2xl bg-ivory/5 p-4">
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ivory/60">{label}</div>
                    <div className="text-espresso"><Choice testId={tid} label={label} value={val} onChange={(v) => { setter(v); setResult(null); }} options={STRATEGIES.map((x) => ({ value: x.key, label: x.label }))} /></div>
                    <p className="mt-3 text-sm italic text-ivory/80">“{s.subject(p)}”</p>
                  </div>
                ))}
              </div>
              <div>
                <div className="mb-1.5 text-[11px] uppercase tracking-[0.1em] text-ivory/60">Hypothesis</div>
                <textarea data-testid="ab-hypothesis-input" value={hyp ?? defaultHyp} onChange={(e) => setHyp(e.target.value)} rows={4} className="w-full rounded-xl border border-ivory/15 bg-ivory/5 p-3 text-sm text-ivory focus:border-honey focus:outline-none" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="text-espresso"><div className="mb-1.5 text-[11px] uppercase tracking-[0.1em] text-ivory/60">Primary metric</div><Choice testId="ab-primary-metric" label="Primary metric" value={metric} onChange={(v) => { setMetric(v); setResult(null); }} options={METRICS.map((m) => ({ value: m, label: m }))} /></div>
                <div><div className="mb-1.5 text-[11px] uppercase tracking-[0.1em] text-ivory/60">Recipients per arm</div><input data-testid="ab-sample-size-input" type="number" min={200} max={100000} step={100} value={nRaw} onChange={(e) => { setNRaw(e.target.value); setResult(null); }} onBlur={() => setNRaw(String(n))} className="h-10 w-full rounded-xl border border-ivory/15 bg-ivory/5 px-3 text-sm text-ivory focus:border-honey focus:outline-none" /></div>
              </div>
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.1em] text-ivory/60">Guardrail metrics</div>
                <div className="flex flex-wrap gap-2">
                  {GUARDRAILS.map((g) => (
                    <button key={g} data-testid={`ab-guardrail-${g.replace(/\s+/g, "-").toLowerCase()}`} aria-pressed={guards.includes(g)} onClick={() => setGuards(guards.includes(g) ? guards.filter((x) => x !== g) : [...guards, g])} className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${guards.includes(g) ? "border-honey bg-honey text-espresso" : "border-ivory/20 text-ivory/80 hover:border-ivory/50"}`}>{g}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button data-testid="ab-run-simulation-btn" onClick={run} className="inline-flex items-center gap-2 rounded-full bg-honey px-6 py-3 text-sm font-medium text-espresso transition-transform active:scale-[0.97]"><FlaskConical size={15} />Run simulated test</button>
                <button data-testid="ab-save-plan-btn" onClick={save} className="inline-flex items-center gap-2 rounded-full border border-ivory/30 px-6 py-3 text-sm transition-colors hover:bg-ivory/10"><Save size={15} />Save test plan</button>
              </div>
            </div>

            <div className="space-y-6">
              <div data-testid="ab-simulation-result" className="rounded-2xl border border-ivory/10 p-6">
                {result ? (
                  <>
                    <div className="mb-4 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-honey">Simulated outcome · illustrative only</span></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div><div className="text-[11px] text-ivory/60">A · {sa.label}</div><div className="font-serif text-3xl">{(result.ra * 100).toFixed(2)}%</div></div>
                      <div><div className="text-[11px] text-ivory/60">B · {sb.label}</div><div className="font-serif text-3xl">{(result.rb * 100).toFixed(2)}%</div></div>
                      <div><div className="text-[11px] text-ivory/60">Relative lift</div><div data-testid="ab-result-lift" className={`font-serif text-3xl ${result.lift >= 0 ? "text-[#B8C9B5]" : "text-blushdeep"}`}>{result.lift >= 0 ? "+" : ""}{(result.lift * 100).toFixed(1)}%</div></div>
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-ivory/70">95% CI on absolute difference: {(result.lo * 100).toFixed(2)} to {(result.hi * 100).toFixed(2)} pts. {result.sig ? "Simulated difference clears the 95% threshold." : "Simulated difference is not statistically distinguishable — a real test would need more volume or a bolder variant."}</p>
                    <p className="mt-3 text-[11px] leading-relaxed text-ivory/50">Draws random outcomes from assumed response rates ({(sa.assumed * 100).toFixed(1)}% vs {(sb.assumed * 100).toFixed(1)}%) chosen for demonstration. These are not campaign results. Re-run to see sampling noise.</p>
                  </>
                ) : (
                  <p className="text-sm text-ivory/60">Run a simulation to see how sampling noise and sample size affect what you could conclude. No real campaign data is used.</p>
                )}
              </div>
              <div data-testid="ab-saved-plans">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ivory/60">Saved test plans ({plans.length})</div>
                {plans.length === 0 && <p className="text-xs text-ivory/50">Saved plans stay in this browser.</p>}
                <div className="space-y-2">
                  {plans.map((pl) => (
                    <div key={pl.id} data-testid={`ab-plan-${pl.id}`} className="flex items-start justify-between gap-3 rounded-xl bg-ivory/5 p-3 text-xs">
                      <div><div className="font-medium text-ivory">{pl.a} vs {pl.b}</div><div className="text-ivory/60">{pl.journey} · {pl.metric} · n={pl.n.toLocaleString()}/arm · guardrails: {pl.guardrails.join(", ") || "none"}</div></div>
                      <button data-testid={`ab-plan-delete-${pl.id}`} aria-label="Delete plan" onClick={() => setPlans(plans.filter((x) => x.id !== pl.id))} className="text-ivory/50 hover:text-ivory"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
