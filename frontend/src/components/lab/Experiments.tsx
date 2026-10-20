import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell, LabelList } from "recharts";
import { RotateCcw } from "lucide-react";
import { Section, SectionHeader, Reveal, Tag } from "./common";
import { RangeField } from "./controls";
import { usePersist } from "@/lib/usePersist";
import { usd } from "@/lib/metrics";

interface Exp {
  id: string; name: string; problem: string; insight: string; hypothesis: string; cohort: string; control: string; variant: string;
  primary: string; guardrails: string[]; duration: string; baseline: number; mde: number; weekly: number; value: number; eligibleMonthly: number;
}

const EXPS: Exp[] = [
  { id: "A", name: "Flexible delivery reminders", problem: "Subscribers who accumulate product cancel instead of adjusting.", insight: "'Too much product' is a leading cancellation reason in the synthetic data, concentrated among 30-day subscribers.", hypothesis: "If pre-shipment reminders include one-tap delay and frequency controls, monthly subscription churn will decrease because overstocked customers can adjust instead of leaving.", cohort: "Active 30-day subscribers, orders 2–6", control: "Standard 'your order ships soon' notice", variant: "Reminder with inline Delay 2 weeks / Change frequency", primary: "Monthly subscription churn", guardrails: ["Revenue per subscriber (90 days)", "Delayed-order share", "Unsubscribes"], duration: "Two full billing cycles (~8 weeks) to capture next-order behaviour", baseline: 0.09, mde: 0.12, weekly: 1200, value: 120, eligibleMonthly: 4000 },
  { id: "B", name: "Personalized subscription education", problem: "New subscribers don't form a usage habit before their second shipment.", insight: "Early-life cancellations cluster before order 3; 'not using consistently' is a common reason.", hypothesis: "If onboarding content is tailored to the first product and acquisition context, second-order retention will increase because customers learn how the product fits their routine.", cohort: "New subscribers, days 0–45", control: "Generic three-email welcome sequence", variant: "Product- and channel-personalized routine sequence", primary: "Retention to 3rd order", guardrails: ["Unsubscribe rate", "Support contacts", "Email complaint rate"], duration: "~10 weeks: 45-day exposure + time to observe 3rd order", baseline: 0.55, mde: 0.06, weekly: 900, value: 90, eligibleMonthly: 3000 },
  { id: "C", name: "Sample-based loyalty vs. % discount", problem: "Discount-led loyalty erodes margin and trains customers to wait for deals.", insight: "BFCM-acquired cohorts repeat less in the synthetic data, suggesting discount-first relationships may be fragile.", hypothesis: "If milestone rewards offer a complimentary product sample instead of a percentage discount, retention will be equal or better at lower cost because the reward increases product discovery.", cohort: "Subscribers reaching order 3", control: "10% off next order at milestone", variant: "Complimentary sample of an adjacent product", primary: "Retention 60 days post-milestone", guardrails: ["Reward cost per retained subscriber", "AOV", "Cross-sell rate"], duration: "~12 weeks; milestone volume is lower", baseline: 0.78, mde: 0.04, weekly: 450, value: 140, eligibleMonthly: 1500 },
  { id: "D", name: "Simplified subscription portal", problem: "Portal complexity drives support contacts and abrupt cancellations.", insight: "HCI review (see HCI Lab) identifies hidden next-order dates and buried controls in the standard pattern.", hypothesis: "If the portal surfaces status, next-order date and adjustment controls on one screen, self-serve saves will increase because customers can find alternatives to cancelling.", cohort: "All subscribers visiting the portal", control: "Standard portal", variant: "Simplified, mobile-first portal", primary: "Cancellation rate among portal visitors", guardrails: ["Time-to-cancel (must not increase)", "Support tickets", "CSAT"], duration: "~6 weeks; high portal traffic, but requires engineering build", baseline: 0.18, mde: 0.1, weekly: 2500, value: 110, eligibleMonthly: 6000 },
];

type Ice = Record<string, { i: number; c: number; e: number }>;
const DEFAULT_ICE: Ice = { A: { i: 8, c: 7, e: 3 }, B: { i: 7, c: 6, e: 4 }, C: { i: 6, c: 5, e: 3 }, D: { i: 9, c: 6, e: 8 } };
type Ss = Record<string, { baseline: number; mde: number; weekly: number }>;
const DEFAULT_SS: Ss = Object.fromEntries(EXPS.map((e) => [e.id, { baseline: e.baseline, mde: e.mde, weekly: e.weekly }]));

export function sampleSize(p1: number, mde: number) {
  const p2 = Math.min(0.999, p1 * (1 + mde));
  const pBar = (p1 + p2) / 2;
  const za = 1.96, zb = 0.8416;
  const num = za * Math.sqrt(2 * pBar * (1 - pBar)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
  return Math.ceil((num * num) / ((p2 - p1) * (p2 - p1)));
}

const COLORS = ["#6A7B68", "#C88B73", "#D4A359", "#7B82A8"];

export default function Experiments() {
  const [sel, setSel] = usePersist("exp-selected", "A");
  const [ice, setIce] = usePersist<Ice>("exp-ice", DEFAULT_ICE);
  const [ss, setSs] = usePersist<Ss>("exp-ss", DEFAULT_SS);
  const e = EXPS.find((x) => x.id === sel) || EXPS[0];
  const s = ss[e.id];
  const n = sampleSize(s.baseline, s.mde);
  const weeks = Math.ceil((2 * n) / s.weekly);
  const lowerIsBetter = e.id === "A" || e.id === "D";
  const affected = e.eligibleMonthly * 12 * s.baseline * s.mde;
  const scenarioValue = affected * e.value;

  const ranked = useMemo(
    () => EXPS.map((x, i) => ({ ...x, color: COLORS[i], ...ice[x.id], score: (ice[x.id].i * ice[x.id].c) / ice[x.id].e })).sort((a, b) => b.score - a.score),
    [ice],
  );
  const setI = (k: "i" | "c" | "e", v: number) => setIce({ ...ice, [e.id]: { ...ice[e.id], [k]: v } });
  const setS = (k: "baseline" | "mde" | "weekly", v: number) => setSs({ ...ss, [e.id]: { ...s, [k]: v } });

  return (
    <Section id="experiments" testId="experimentation-engine-section" className="bg-sage/40">
      <SectionHeader index="05" eyebrow="Retention experimentation engine" title={<>Every idea is a hypothesis <em className="text-sagedeep">until it's tested.</em></>} intro="Four proposed experiments, each with a full test design. Adjust impact, confidence and effort to re-rank the roadmap, and tune the statistical assumptions to see what a test would really require." />

      <div className="mb-8 flex flex-wrap gap-2">
        {EXPS.map((x, i) => (
          <button key={x.id} data-testid={`exp-select-${x.id}`} onClick={() => setSel(x.id)} className={`flex items-center gap-3 rounded-full border py-2 pl-2 pr-5 text-sm transition-[background-color,border-color] duration-300 ${sel === x.id ? "border-espresso bg-white" : "border-line bg-white/40 hover:bg-white/80"}`}>
            <span className="flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs text-ivory" style={{ background: COLORS[i] }}>{x.id}</span>{x.name}
          </button>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} data-testid="exp-detail" className="panel p-6 sm:p-8">
              <div className="mb-5 flex flex-wrap items-center gap-2"><span className="eyebrow">Experiment {e.id}</span><Tag kind="hypothesis" /></div>
              <h3 className="font-serif text-3xl leading-tight text-espresso sm:text-4xl">{e.name}</h3>
              <p className="mt-4 font-serif text-xl italic leading-snug text-cocoa">{e.hypothesis}</p>
              <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {[["Problem statement", e.problem], ["Customer insight", e.insight], ["Target cohort", e.cohort], ["Primary success metric", e.primary], ["Control", e.control], ["Variant", e.variant], ["Guardrail metrics", e.guardrails.join(" · ")], ["Test duration assumptions", e.duration]].map(([t, v]) => (
                  <div key={t} className="border-t border-line pt-3"><dt className="eyebrow mb-1 !text-[10px]">{t}</dt><dd className="text-sm leading-relaxed text-cocoa">{v}</dd></div>
                ))}
              </dl>

              <div className="mt-8 rounded-2xl bg-linen/70 p-5 sm:p-6">
                <div className="mb-2 flex items-center justify-between"><span className="eyebrow">Sample-size considerations</span><span className="font-mono text-[10px] text-cocoa/60">α = 0.05 · power = 80%</span></div>
                <RangeField testId={`exp-${e.id}-baseline`} label={`Baseline rate (${e.primary.toLowerCase()})`} value={s.baseline} display={`${(s.baseline * 100).toFixed(0)}%`} min={0.02} max={0.9} step={0.01} onChange={(v) => setS("baseline", v)} />
                <RangeField testId={`exp-${e.id}-mde`} label="Minimum detectable effect (relative)" value={s.mde} display={`${(s.mde * 100).toFixed(0)}%`} min={0.02} max={0.3} step={0.01} onChange={(v) => setS("mde", v)} />
                <RangeField testId={`exp-${e.id}-weekly`} label="Eligible customers per week (assumed)" value={s.weekly} display={s.weekly.toLocaleString()} min={100} max={5000} step={50} onChange={(v) => setS("weekly", v)} />
                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-line pt-4">
                  <div><div className="eyebrow !text-[10px]">Per arm</div><div data-testid="exp-sample-size" className="font-serif text-3xl">{n.toLocaleString()}</div></div>
                  <div><div className="eyebrow !text-[10px]">Est. duration</div><div data-testid="exp-duration" className="font-serif text-3xl">{weeks}<span className="text-lg"> wks</span></div></div>
                  <div><div className="eyebrow !text-[10px]">Target</div><div className="font-serif text-3xl">{lowerIsBetter ? "↓" : "↑"}{(s.baseline * s.mde * 100).toFixed(1)}<span className="text-lg">pts</span></div></div>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-cocoa/70">Two-proportion test: n = (z<sub>α/2</sub>√(2p̄(1−p̄)) + z<sub>β</sub>√(p₁(1−p₁)+p₂(1−p₂)))² ÷ (p₂−p₁)². Duration = 2n ÷ weekly eligible, before allowing for full outcome windows.</p>
              </div>

              <div data-testid="exp-impact-scenario" className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-periwinkle/40 p-5">
                <div className="max-w-sm text-sm text-cocoa">If the variant achieved exactly the MDE across ~{e.eligibleMonthly.toLocaleString()} eligible customers/month at an assumed {usd(e.value)} value per outcome, the annual scenario would be:</div>
                <div className="text-right"><Tag kind="scenario" /><div className="mt-2 font-serif text-3xl text-espresso">~{usd(scenarioValue)}</div><div className="text-[11px] text-cocoa/70">{Math.round(affected).toLocaleString()} outcomes / yr</div></div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-2xl text-espresso">Prioritization · I × C ÷ E</h3>
              <button data-testid="exp-reset-ice" onClick={() => { setIce(DEFAULT_ICE); setSs(DEFAULT_SS); }} className="btn-sm"><RotateCcw size={12} />Reset</button>
            </div>
            <div className="panel mb-6 p-5">
              <div className="mb-1 text-sm text-cocoa">Scoring <strong className="text-espresso">Experiment {e.id}</strong></div>
              <RangeField testId={`ice-${e.id}-impact`} label="Impact" value={ice[e.id].i} display={`${ice[e.id].i}/10`} min={1} max={10} step={1} onChange={(v) => setI("i", v)} />
              <RangeField testId={`ice-${e.id}-confidence`} label="Confidence" value={ice[e.id].c} display={`${ice[e.id].c}/10`} min={1} max={10} step={1} onChange={(v) => setI("c", v)} />
              <RangeField testId={`ice-${e.id}-effort`} label="Effort (higher = harder)" value={ice[e.id].e} display={`${ice[e.id].e}/10`} min={1} max={10} step={1} onChange={(v) => setI("e", v)} />
            </div>
            <ol data-testid="exp-ranked-list" className="mb-6 space-y-2">
              {ranked.map((r, i) => (
                <motion.li layout key={r.id} transition={{ type: "spring", stiffness: 400, damping: 35 }} onClick={() => setSel(r.id)} data-testid={`exp-rank-${r.id}`} className={`flex cursor-pointer items-center gap-4 rounded-xl border bg-white px-4 py-3 ${sel === r.id ? "border-espresso" : "border-line"}`}>
                  <span className="font-serif text-2xl text-cocoa/50">{i + 1}</span>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                  <span className="flex-1 text-sm text-espresso">{r.id} · {r.name}</span>
                  <span className="font-mono text-sm text-espresso">{r.score.toFixed(1)}</span>
                </motion.li>
              ))}
            </ol>
            <div data-testid="exp-priority-matrix" className="h-64 rounded-2xl bg-white/60 p-2">
              <ResponsiveContainer>
                <ScatterChart margin={{ top: 16, right: 20, bottom: 18, left: -10 }}>
                  <CartesianGrid stroke="#EBE5DC" />
                  <XAxis type="number" dataKey="e" name="Effort" domain={[0, 10]} tickLine={false} label={{ value: "Effort →", position: "insideBottom", offset: -10, fontSize: 10, fill: "#4A4441" }} />
                  <YAxis type="number" dataKey="i" name="Impact" domain={[0, 10]} tickLine={false} label={{ value: "Impact", angle: -90, position: "insideLeft", offset: 20, fontSize: 10, fill: "#4A4441" }} />
                  <ZAxis type="number" dataKey="c" range={[120, 700]} name="Confidence" />
                  <Tooltip cursor={false} contentStyle={{ background: "#FDFBF7", border: "1px solid #EBE5DC", borderRadius: 12, fontSize: 12 }} />
                  <Scatter data={ranked}>
                    {ranked.map((r) => <Cell key={r.id} fill={r.color} fillOpacity={0.85} />)}
                    <LabelList dataKey="id" position="center" fill="#FDFBF7" fontSize={11} />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[11px] text-cocoa/70">Top-left = high impact, low effort. Bubble size = confidence. Scores are judgement inputs, not data.</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
