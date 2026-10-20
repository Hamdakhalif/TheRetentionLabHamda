import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { Section, SectionHeader, Reveal, Tag } from "./common";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePersist } from "@/lib/usePersist";
import { N_CUSTOMERS } from "@/lib/data";

export const LINKEDIN_URL = "https://www.linkedin.com/in/hamda-khalif-387881231/";

const PHASES = [
  { key: "understand", days: "Days 1–30", name: "Understand", question: "Where is retention leaking, and do we trust the numbers?", deliverable: "Retention baseline & opportunity map", items: ["Audit retention metrics and data quality", "Review customer cohorts", "Map existing lifecycle journeys", "Examine cancellation reasons", "Evaluate subscription UX", "Identify baseline metrics"] },
  { key: "experiment", days: "Days 31–60", name: "Experiment", question: "Which interventions move retention without eroding margin or trust?", deliverable: "Prioritized test backlog with first tests live", items: ["Prioritize retention opportunities", "Launch initial lifecycle experiments", "Test replenishment messaging", "Prototype subscription UX improvements", "Develop cohort-specific engagement strategies"] },
  { key: "optimize", days: "Days 61–90", name: "Optimize", question: "What did we learn, and what do we scale?", deliverable: "Retention dashboard & next-quarter roadmap", items: ["Evaluate experiment results", "Refine lifecycle segmentation", "Expand successful initiatives", "Establish reporting dashboards", "Develop the next retention roadmap"] },
];

const METHOD = [
  { t: "The synthetic dataset", b: `${N_CUSTOMERS.toLocaleString()} customer records generated in the browser by a seeded random generator (so results are reproducible). Acquisitions span Sep 2024 – Dec 2025 and are observed through May 31, 2026. Fields include customer ID, acquisition date and channel, first product, full order history, subscription status and frequency, observed revenue (CLV), last purchase, cancellation reason, email/SMS consent and engagement, and promotional cohort. Channel, product and promotion effects on churn were set deliberately so patterns exist to discover — they are design choices, not facts about any brand.` },
  { t: "Metric definitions", b: "Retention at month N: share of a cohort still subscribed, or who placed an order, on or after the start of month N. Repeat purchase rate: share of customers with 2+ orders. Subscription churn / month: cancellations ÷ subscriber-months of exposure. CLV (observed): cumulative synthetic revenue to date — not margin and not predicted lifetime. Reorder gap: days between consecutive orders. Segments are rule-based and listed in the lab." },
  { t: "Modelling assumptions", b: "Prices are illustrative. Subscribers churn with a constant monthly hazard (higher in the first cycle), adjusted by channel, product, promotion and a latent engagement score. One-time buyers repurchase with a decaying probability. The CLV simulator uses a geometric survival model with constant churn, no discounting and no acquisition costs. A/B outcomes are random draws from assumed rates." },
  { t: "Limitations", b: "Nothing here reflects Arrae's, Lemme's or Cymbiotika's internal data, customers or performance. Competitive notes are general public observations that may be outdated and should be re-verified. Patterns in synthetic data demonstrate method, not truth; every hypothesis requires a controlled experiment on real data before acting." },
  { t: "Privacy & storage", b: "No accounts, no tracking of visitors' inputs to a server. Your filters, selections and saved test plans are stored only in this browser's localStorage." },
];

export default function Roadmap() {
  const [phase, setPhase] = usePersist("roadmap-phase", 0);
  const [done, setDone] = usePersist<string[]>("roadmap-checked", []);
  const p = PHASES[phase];
  const toggle = (id: string) => setDone(done.includes(id) ? done.filter((d) => d !== id) : [...done, id]);
  const total = PHASES.reduce((s, x) => s + x.items.length, 0);

  return (
    <>
      <Section id="roadmap" testId="roadmap-section" className="bg-butter/40">
        <SectionHeader index="09" eyebrow="The retention roadmap" title={<>A proposed first 90 days.</>} intro={<>A proposed approach for how I would begin — <strong className="font-medium text-espresso">not work already performed for Arrae.</strong> Tick items to use it as a working checklist; progress saves in your browser.</>} />
        <div className="mb-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
          {PHASES.map((x, i) => {
            const count = x.items.filter((_, j) => done.includes(`${x.key}-${j}`)).length;
            return (
              <button key={x.key} data-testid={`roadmap-phase-${x.key}`} onClick={() => setPhase(i)} className={`p-6 text-left transition-colors duration-300 ${phase === i ? "bg-espresso text-ivory" : "bg-ivory hover:bg-white"}`}>
                <div className={`font-mono text-[11px] uppercase tracking-[0.16em] ${phase === i ? "text-honey" : "text-sagedeep"}`}>{x.days}</div>
                <div className="mt-2 font-serif text-4xl">{x.name}</div>
                <div className={`mt-4 h-1 rounded-full ${phase === i ? "bg-ivory/15" : "bg-line"}`}><motion.div className={`h-full rounded-full ${phase === i ? "bg-honey" : "bg-sagedeep"}`} animate={{ width: `${(count / x.items.length) * 100}%` }} /></div>
                <div className={`mt-2 text-[11px] ${phase === i ? "text-ivory/60" : "text-cocoa/70"}`}>{count}/{x.items.length} planned items ticked</div>
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={p.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} data-testid="roadmap-phase-detail" className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Tag kind="recommendation" />
              <p className="mt-4 font-serif text-3xl italic leading-snug text-espresso">"{p.question}"</p>
              <p className="mt-6 text-sm text-cocoa"><span className="eyebrow mr-2 !text-[10px]">Deliverable</span>{p.deliverable}</p>
            </div>
            <ul className="space-y-2 lg:col-span-7">
              {p.items.map((it, j) => {
                const id = `${p.key}-${j}`;
                const on = done.includes(id);
                return (
                  <li key={id}>
                    <button data-testid={`roadmap-item-${id}`} onClick={() => toggle(id)} aria-pressed={on} className="flex w-full items-center gap-4 rounded-xl border border-line bg-white/70 px-4 py-3.5 text-left transition-[background-color,border-color] hover:border-espresso/30">
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${on ? "border-sagedeep bg-sagedeep text-ivory" : "border-line"}`}>{on && <Check size={12} />}</span>
                      <span className={`text-sm ${on ? "text-cocoa/60 line-through" : "text-espresso"}`}>{it}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </AnimatePresence>
        <p className="mt-6 text-right font-mono text-[11px] text-cocoa/70">{done.length}/{total} items ticked overall</p>
      </Section>

      <Section id="methodology" testId="methodology-section">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span className="eyebrow">Methodology</span>
            <h3 className="mt-3 font-serif text-4xl leading-tight text-espresso">How this lab was built — and what it can't tell you.</h3>
            <div className="mt-4 flex flex-wrap gap-2"><Tag kind="synthetic" /><Tag kind="simulated" /></div>
          </div>
          <Accordion type="single" collapsible defaultValue="m-0" className="lg:col-span-8">
            {METHOD.map((m, i) => (
              <AccordionItem key={m.t} value={`m-${i}`} className="border-line">
                <AccordionTrigger data-testid={`methodology-item-${i}`} className="py-5 text-left font-serif text-2xl font-normal text-espresso hover:no-underline">{m.t}</AccordionTrigger>
                <AccordionContent className="pb-6 text-sm leading-relaxed text-cocoa">{m.b}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      <section data-testid="closing-section" className="grain relative overflow-hidden bg-espresso py-28 text-ivory sm:py-36">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sagedeep/30 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
          <Reveal>
            <p data-testid="closing-quote" className="font-serif text-4xl leading-[1.08] sm:text-6xl lg:text-7xl">
              Acquisition starts the relationship. <em className="text-honey">Experience determines whether it lasts.</em>
            </p>
          </Reveal>
          <Reveal delay={0.15} className="mt-14 flex flex-wrap items-center gap-6">
            <a data-testid="cta-lets-talk-retention" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-ivory px-8 py-4 text-sm font-medium text-espresso transition-[background-color,transform] duration-300 hover:bg-butter active:scale-[0.97]">
              Let's Talk Retention <ArrowUpRight size={16} />
            </a>
            <span className="font-mono text-xs text-ivory/60">Connect with Hamda on LinkedIn</span>
          </Reveal>
        </div>
      </section>

      <footer data-testid="site-footer" className="border-t border-ivory/10 bg-espresso px-5 pb-10 text-ivory/60 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-ivory/10 pt-8 text-[11px] leading-relaxed sm:flex-row sm:justify-between">
          <span>The Retention Lab — An Arrae Growth Concept by Hamda Khalif. An independent concept.</span>
          <span>All customer data is synthetic. Scenarios are not forecasts.</span>
        </div>
      </footer>
    </>
  );
}
