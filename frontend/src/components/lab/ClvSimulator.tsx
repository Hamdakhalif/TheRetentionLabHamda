import { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Database, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Section, SectionHeader, Reveal, Tag } from "./common";
import { RangeField } from "./controls";
import { usePersist } from "@/lib/usePersist";
import { CUSTOMERS } from "@/lib/data";
import { monthlyChurn, usd } from "@/lib/metrics";

interface Inputs { n: number; aov: number; freq: number; gm: number; churn: number; improve: number; incentive: number }
const DEFAULTS: Inputs = { n: 10000, aov: 45, freq: 0.8, gm: 65, churn: 9, improve: 15, incentive: 1.5 };
const HORIZON = 24;

function model(x: Inputs) {
  const c = x.churn / 100;
  const c2 = c * (1 - x.improve / 100);
  const m = x.aov * x.freq * (x.gm / 100);
  const m2 = m - x.incentive;
  const series = [];
  let cumB = 0, cumS = 0, incentiveSpend = 0;
  for (let t = 0; t < HORIZON; t++) {
    const aB = x.n * Math.pow(1 - c, t);
    const aS = x.n * Math.pow(1 - c2, t);
    cumB += aB * m;
    cumS += aS * m2;
    incentiveSpend += aS * x.incentive;
    series.push({ month: `M${t + 1}`, Baseline: Math.round(cumB), Scenario: Math.round(cumS), activeB: Math.round(aB), activeS: Math.round(aS) });
  }
  return {
    m, m2, c, c2,
    lifeB: 1 / c, lifeS: 1 / c2,
    clvB: m / c, clvS: m2 / c2,
    h24B: cumB / x.n, h24S: cumS / x.n,
    cumB, cumS, incentiveSpend,
    series,
  };
}

export default function ClvSimulator() {
  const [x, setX] = usePersist<Inputs>("clv-inputs", DEFAULTS);
  const r = useMemo(() => model(x), [x]);
  const set = (k: keyof Inputs) => (v: number) => setX({ ...x, [k]: v });
  const delta = r.cumS - r.cumB;
  const roi = r.incentiveSpend > 0 ? (delta + r.incentiveSpend) / r.incentiveSpend : null;

  const loadSynthetic = () => {
    const orders = CUSTOMERS.flatMap((c) => c.orders);
    const aov = orders.reduce((s, o) => s + o.value, 0) / orders.length;
    const churn = monthlyChurn(CUSTOMERS).rate * 100;
    setX({ ...x, aov: Math.round(aov), churn: Math.round(churn * 2) / 2 });
    toast.success(`Loaded AOV ${usd(aov)} and churn ${churn.toFixed(1)}% from the synthetic dataset`);
  };

  return (
    <Section id="clv" testId="clv-simulator-section">
      <SectionHeader index="06" eyebrow="Customer lifetime value simulator" title={<>What a point of churn is <em className="text-plum">really worth.</em></>} intro="A transparent scenario model for subscribers. Change the assumptions and compare a baseline against a retention-improvement scenario that includes the cost of the incentive used to achieve it." />

      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <div className="panel p-6">
            <div className="mb-2 flex items-center justify-between"><span className="eyebrow">Assumptions</span><button data-testid="clv-reset" onClick={() => setX(DEFAULTS)} className="btn-sm"><RotateCcw size={12} />Reset</button></div>
            <RangeField testId="clv-customers" label="Number of customers" value={x.n} display={x.n.toLocaleString()} min={1000} max={100000} step={1000} onChange={set("n")} />
            <RangeField testId="clv-aov" label="Average order value" value={x.aov} display={`$${x.aov}`} min={20} max={120} step={1} onChange={set("aov")} />
            <RangeField testId="clv-frequency" label="Purchase frequency (orders / month)" value={x.freq} display={x.freq.toFixed(2)} min={0.25} max={1.5} step={0.05} onChange={set("freq")} />
            <RangeField testId="clv-margin" label="Gross margin" value={x.gm} display={`${x.gm}%`} min={30} max={85} step={1} onChange={set("gm")} />
            <RangeField testId="clv-churn" label="Monthly churn rate" value={x.churn} display={`${x.churn}%`} min={2} max={25} step={0.5} onChange={set("churn")} />
            <div className="my-3 border-t border-dashed border-line" />
            <RangeField testId="clv-improvement" label="Retention improvement (churn reduction)" value={x.improve} display={`−${x.improve}%`} min={0} max={40} step={1} onChange={set("improve")} hint={`Scenario churn: ${(r.c2 * 100).toFixed(2)}% / month`} />
            <RangeField testId="clv-incentive" label="Incentive cost per customer / month" value={x.incentive} display={`$${x.incentive.toFixed(2)}`} min={0} max={10} step={0.25} onChange={set("incentive")} />
            <button data-testid="clv-load-synthetic" onClick={loadSynthetic} className="btn-sm mt-4 w-full !py-2.5"><Database size={12} />Use AOV & churn from synthetic dataset</button>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="min-w-0 lg:col-span-8">
          <div className="mb-3 flex items-center gap-2"><Tag kind="scenario" /><span className="text-[11px] text-cocoa/70">Modelled outputs. Not Arrae results.</span></div>
          <div data-testid="clv-comparison" className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {[
              ["", "Baseline", "Scenario"],
              ["Monthly churn", `${(r.c * 100).toFixed(1)}%`, `${(r.c2 * 100).toFixed(2)}%`],
              ["Expected lifetime", `${r.lifeB.toFixed(1)} mo`, `${r.lifeS.toFixed(1)} mo`],
              ["Margin / customer / mo", `$${r.m.toFixed(2)}`, `$${r.m2.toFixed(2)}`],
              ["Lifetime CLV (margin)", usd(r.clvB), usd(r.clvS)],
              ["24-month CLV (margin)", usd(r.h24B), usd(r.h24S)],
              ["24-mo contribution, all customers", usd(r.cumB), usd(r.cumS)],
            ].map((row, i) => row.map((cell, j) => (
              <div key={`${i}-${j}`} data-testid={i > 0 && j > 0 ? `clv-cell-${i}-${j}` : undefined} className={`${i === 0 ? "bg-linen py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-cocoa" : "bg-white py-3.5"} ${j === 0 ? "text-sm text-cocoa" : i === 0 ? "" : "font-serif text-2xl text-espresso"} px-5 ${j === 2 && i > 0 ? "bg-sage/30" : ""} ${i > 0 && j === 0 ? "hidden sm:block" : ""} ${i === 0 && j === 0 ? "hidden sm:block" : ""}`}>
                {i > 0 && j > 0 && <span className="block text-[10px] font-sans text-cocoa/60 sm:hidden">{row[0]}</span>}
                {cell}
              </div>
            )))}
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div data-testid="clv-incremental" className="rounded-2xl bg-espresso p-5 text-ivory"><div className="font-mono text-[10px] uppercase tracking-[0.14em] text-honey">Incremental 24-mo contribution</div><div className={`mt-2 font-serif text-4xl ${delta < 0 ? "text-blushdeep" : ""}`}>{delta >= 0 ? "+" : "−"}{usd(Math.abs(delta))}</div></div>
            <div className="rounded-2xl bg-butter/70 p-5"><div className="eyebrow !text-[10px]">Incentive spend (24 mo)</div><div className="mt-2 font-serif text-4xl">{usd(r.incentiveSpend)}</div></div>
            <div data-testid="clv-roi" className="rounded-2xl bg-blush/70 p-5"><div className="eyebrow !text-[10px]">Return per $1 of incentive</div><div className="mt-2 font-serif text-4xl">{roi == null ? "—" : `${roi < -0.005 ? "−" : ""}$${Math.abs(roi).toFixed(2)}`}</div></div>
          </div>
          {delta < 0 && <p data-testid="clv-warning" className="mt-3 text-sm text-terracotta">At these assumptions the incentive costs more than the retention it buys — the scenario destroys value.</p>}

          <div data-testid="clv-chart" className="mt-8 h-72">
            <ResponsiveContainer>
              <AreaChart data={r.series} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6A7B68" stopOpacity={0.35} /><stop offset="100%" stopColor="#6A7B68" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C88B73" stopOpacity={0.25} /><stop offset="100%" stopColor="#C88B73" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="#EBE5DC" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} interval={2} />
                <YAxis tickFormatter={(v) => (v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${Math.round(v / 1000)}k`)} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#FDFBF7", border: "1px solid #EBE5DC", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => usd(v)} />
                <Legend iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="Baseline" stroke="#C88B73" fill="url(#gB)" strokeWidth={2} />
                <Area type="monotone" dataKey="Scenario" stroke="#6A7B68" fill="url(#gS)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-[11px] text-cocoa/70">Cumulative contribution margin from a single cohort of {x.n.toLocaleString()} subscribers over 24 months.</p>

          <div data-testid="clv-formulas" className="mt-8 grid gap-6 rounded-2xl border border-line bg-white/60 p-6 sm:grid-cols-2">
            <div>
              <div className="eyebrow mb-3">Formulas</div>
              <ul className="space-y-2 font-mono text-xs leading-relaxed text-espresso">
                <li>margin/mo = AOV × frequency × GM%</li>
                <li>lifetime (mo) = 1 ÷ churn</li>
                <li>CLV = margin/mo ÷ churn</li>
                <li>churn′ = churn × (1 − improvement)</li>
                <li>CLV′ = (margin/mo − incentive) ÷ churn′</li>
                <li>24-mo = Σ<sub>t=0..23</sub> N(1−churn)<sup>t</sup> × margin</li>
              </ul>
            </div>
            <div>
              <div className="eyebrow mb-3">Assumptions & limits</div>
              <ul className="space-y-1.5 text-xs leading-relaxed text-cocoa">
                <li>· Constant churn (geometric survival); real churn is front-loaded.</li>
                <li>· No discounting, acquisition cost, shipping or fulfilment costs.</li>
                <li>· Incentive applied to every scenario customer, every month (conservative).</li>
                <li>· Improvement is an input assumption — it is what an experiment would need to prove.</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
