import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, RotateCcw, X, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend, Cell,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Section, SectionHeader, Reveal, Tag, Stat, Field, Pill } from "./common";
import { Choice } from "./controls";
import { usePersist } from "@/lib/usePersist";
import { CUSTOMERS, CHANNELS, PRODUCTS, PROMOS, N_ACQ_MONTHS, monthLabel, fmtDay, Customer } from "@/lib/data";
import {
  DEFAULT_FILTERS, Filters, TENURES, applyFilters, cohortMatrix, kpis, retentionCurves, revenueByCohort, clvBy,
  gapHistogram, segmentation, cancelReasons, insights, cohortDetail, pct, usd, MAX_K,
} from "@/lib/metrics";

export const CH_COLORS: Record<string, string> = { TikTok: "#C88B73", Instagram: "#9E6B82", "Organic Search": "#6A7B68", Paid: "#D4A359", Subscription: "#6A7B68", "One-time": "#C88B73", All: "#1C1817" };

const tooltipStyle = { background: "#FDFBF7", border: "1px solid #EBE5DC", borderRadius: 12, fontSize: 12, fontFamily: "Plus Jakarta Sans" };

function Heatmap({ rows, selected, onSelect }: { rows: ReturnType<typeof cohortMatrix>; selected: number | null; onSelect: (i: number) => void }) {
  return (
    <div className="overflow-x-auto">
      <table data-testid="cohort-heatmap" className="w-full min-w-[720px] border-separate border-spacing-[3px] text-xs">
        <thead>
          <tr>
            <th className="pb-2 text-left font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-cocoa/70">Cohort</th>
            <th className="pb-2 text-right font-mono text-[10px] font-normal uppercase text-cocoa/70">n</th>
            {Array.from({ length: MAX_K + 1 }, (_, k) => (
              <th key={k} className="pb-2 font-mono text-[10px] font-normal text-cocoa/70">M{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.idx} data-testid={`cohort-row-${r.idx}`} onClick={() => onSelect(r.idx)} className={`cursor-pointer transition-opacity ${selected != null && selected !== r.idx ? "opacity-45 hover:opacity-80" : ""}`}>
              <td className={`whitespace-nowrap pr-2 font-mono text-[11px] ${selected === r.idx ? "font-semibold text-espresso" : "text-cocoa"}`}>{r.label}</td>
              <td className="pr-2 text-right font-mono text-[11px] text-cocoa/70">{r.size}</td>
              {r.cells.map((v, k) => (
                <td
                  key={k}
                  title={v == null ? "Not yet observable" : `${r.label} · M${k}: ${pct(v, 1)} retained`}
                  className="h-8 w-12 rounded-[5px] text-center font-mono text-[10px] transition-transform duration-200 hover:scale-110"
                  style={v == null ? { background: "repeating-linear-gradient(45deg,#F4EFE6,#F4EFE6 3px,#FDFBF7 3px,#FDFBF7 6px)" } : { background: `rgba(106,123,104,${0.08 + v * 0.92})`, color: v > 0.45 ? "#FDFBF7" : "#1C1817" }}
                >
                  {v == null ? "" : Math.round(v * 100)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-cocoa/80">
        <span className="flex items-center gap-2">0%<span className="h-2 w-24 rounded-full" style={{ background: "linear-gradient(90deg, rgba(106,123,104,0.08), rgba(106,123,104,1))" }} />100%</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: "repeating-linear-gradient(45deg,#F4EFE6,#F4EFE6 2px,#FDFBF7 2px,#FDFBF7 4px)" }} />Not yet observable</span>
        <span>Click any cohort row for detail.</span>
      </div>
    </div>
  );
}

function ChartBox({ title, note, children, testId }: { title: string; note?: string; children: React.ReactNode; testId: string }) {
  return (
    <div data-testid={testId} className="min-w-0">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h4 className="font-serif text-xl text-espresso">{title}</h4>
        {note && <span className="text-right text-[11px] text-cocoa/70">{note}</span>}
      </div>
      <div className="h-64">{children}</div>
    </div>
  );
}

function CohortDetailPanel({ idx, onClose }: { idx: number; onClose: () => void }) {
  const group = useMemo(() => CUSTOMERS.filter((c) => c.acqMonthIdx === idx), [idx]);
  const d = useMemo(() => cohortDetail(group, CUSTOMERS), [group]);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} data-testid="cohort-detail-panel" className="rounded-2xl bg-espresso p-6 text-ivory">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-honey">Selected cohort · all channels</span>
          <h4 className="mt-1 font-serif text-3xl">{monthLabel(idx)} acquisitions</h4>
        </div>
        <button data-testid="cohort-detail-close" onClick={onClose} aria-label="Close cohort detail" className="rounded-full border border-ivory/20 p-1.5 transition-colors hover:bg-ivory/10"><X size={14} /></button>
      </div>
      <div className="grid grid-cols-3 gap-4 border-y border-ivory/10 py-4">
        {[["Size", d.k.customers.toLocaleString()], ["M3 kept", pct(d.k.m3)], ["M6 kept", pct(d.k.m6)], ["Repeat", pct(d.k.repeat)], ["Avg CLV", usd(d.k.clv)], ["Subs", pct(d.k.subShare)]].map(([l, v]) => (
          <div key={l}><div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ivory/50">{l}</div><div className="font-serif text-2xl">{v}</div></div>
        ))}
      </div>
      <dl className="mt-4 space-y-1.5 text-xs text-ivory/80">
        <div className="flex justify-between"><dt>Top channel</dt><dd>{d.topChannel?.[0]} ({pct((d.topChannel?.[1] || 0) / group.length)})</dd></div>
        <div className="flex justify-between"><dt>Top first product</dt><dd>{d.topProduct?.[0]}</dd></div>
        <div className="flex justify-between"><dt>Top cancel reason</dt><dd>{d.reasons[0]?.count ? d.reasons[0].reason : "—"}</dd></div>
        <div className="flex justify-between"><dt>vs. overall M3</dt><dd>{pct(d.base.m3)}</dd></div>
      </dl>
      <div className="mt-5">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-honey">Potential opportunities · hypotheses</div>
        <ul className="space-y-2 text-sm leading-relaxed text-ivory/90">
          {d.opps.map((o) => <li key={o} className="flex gap-2"><span className="text-honey">→</span>{o}</li>)}
        </ul>
      </div>
    </motion.div>
  );
}

function downloadCsv(rows: Customer[]) {
  const header = ["customer_id", "acquisition_date", "channel", "first_product", "type", "frequency_days", "status", "orders", "clv_usd", "last_purchase", "cancel_reason", "email_opt_in", "sms_opt_in", "email_open_rate", "promo_cohort"];
  const lines = rows.map((c) => [c.id, fmtDay(c.acqDay), c.channel, c.firstProduct, c.type, c.frequency ?? "", c.status, c.orders.length, c.clv, fmtDay(c.lastPurchaseDay), c.cancelReason ?? "", c.emailOptIn, c.smsOptIn, c.emailOpenRate.toFixed(2), c.promo].map((v) => `"${String(v).replace(/"/g, "'")}"`).join(","));
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "retention-lab-synthetic-customers.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function CohortLab() {
  const [filters, setFilters] = usePersist<Filters>("cohort-filters", DEFAULT_FILTERS);
  const [selected, setSelected] = useState<number | null>(null);
  const [curveMode, setCurveMode] = usePersist<"channel" | "type">("cohort-curve-mode", "channel");
  const set = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });

  const filtered = useMemo(() => applyFilters(CUSTOMERS, filters), [filters]);
  const k = useMemo(() => kpis(filtered), [filtered]);
  const matrix = useMemo(() => cohortMatrix(filtered), [filtered]);
  const curves = useMemo(() => retentionCurves(filtered), [filtered]);
  const revenue = useMemo(() => revenueByCohort(filtered), [filtered]);
  const clvChannel = useMemo(() => clvBy(filtered, "channel", CHANNELS), [filtered]);
  const clvProduct = useMemo(() => clvBy(filtered, "firstProduct", PRODUCTS), [filtered]);
  const hist = useMemo(() => gapHistogram(filtered), [filtered]);
  const segs = useMemo(() => segmentation(filtered), [filtered]);
  const reasons = useMemo(() => cancelReasons(filtered), [filtered]);
  const story = useMemo(() => insights(filtered, CUSTOMERS), [filtered]);
  const curveKeys = curveMode === "channel" ? ["All", ...filters.channels] : ["Subscription", "One-time"];

  const toggleChannel = (ch: string) => {
    const next = filters.channels.includes(ch) ? filters.channels.filter((c) => c !== ch) : [...filters.channels, ch];
    if (!next.length) return toast("Keep at least one channel selected.");
    set({ channels: next });
  };

  const copyStory = () => {
    const text = ["What the Data Is Telling Us (synthetic data)", "", "Observations:", ...story.observations.map((o) => `• ${o}`), "", "Hypotheses to investigate:", ...story.hypotheses.map((h) => `• ${h}`), "", story.caution].join("\n");
    navigator.clipboard?.writeText(text).then(() => toast.success("Takeaways copied to clipboard"), () => toast.error("Clipboard unavailable"));
  };

  return (
    <Section id="cohorts" testId="cohort-intelligence-section">
      <SectionHeader
        index="02"
        eyebrow="Cohort intelligence lab"
        title={<>Who stays, who drifts, <em className="text-clay">and when.</em></>}
        intro={<>A working analytics surface over <strong className="font-medium text-espresso">{CUSTOMERS.length.toLocaleString()} synthetic customer records</strong> (Sep 2024 – Dec 2025 acquisitions, observed to May 31, 2026). Every number below is computed live from the dataset — change a filter and watch it recalculate.</>}
      />

      <Reveal>
        <div data-testid="cohort-filters" className="panel mb-8 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Acquisition month">
              <Choice testId="filter-month" label="Acquisition month" value={filters.month} onChange={(v) => set({ month: v })} options={[{ value: "all", label: "All months" }, ...Array.from({ length: N_ACQ_MONTHS }, (_, m) => ({ value: String(m), label: monthLabel(m) }))]} />
            </Field>
            <Field label="First product">
              <Choice testId="filter-product" label="First product" value={filters.product} onChange={(v) => set({ product: v })} options={[{ value: "all", label: "All products" }, ...PRODUCTS.map((p) => ({ value: p, label: p }))]} />
            </Field>
            <Field label="Purchase type">
              <Choice testId="filter-type" label="Purchase type" value={filters.type} onChange={(v) => set({ type: v })} options={[{ value: "all", label: "Subscription + one-time" }, { value: "Subscription", label: "Subscription" }, { value: "One-time", label: "One-time" }]} />
            </Field>
            <Field label="Promo / seasonal cohort">
              <Choice testId="filter-promo" label="Promotional cohort" value={filters.promo} onChange={(v) => set({ promo: v })} options={[{ value: "all", label: "All cohorts" }, ...PROMOS.map((p) => ({ value: p, label: p }))]} />
            </Field>
            <Field label="Customer tenure">
              <Choice testId="filter-tenure" label="Customer tenure" value={filters.tenure} onChange={(v) => set({ tenure: v })} options={[{ value: "all", label: "Any tenure" }, ...TENURES.map((t) => ({ value: t.key, label: t.label }))]} />
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[11px] font-medium uppercase tracking-[0.1em] text-cocoa/70">Channels</span>
              {CHANNELS.map((ch) => (
                <Pill key={ch} testId={`filter-channel-${ch.replace(/\s+/g, "-").toLowerCase()}`} active={filters.channels.includes(ch)} onClick={() => toggleChannel(ch)} className="!py-1.5 !text-xs">
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: CH_COLORS[ch] }} />{ch}
                </Pill>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span data-testid="cohort-filtered-count" className="font-mono text-xs text-cocoa">{filtered.length.toLocaleString()} / {CUSTOMERS.length.toLocaleString()} customers</span>
              <button data-testid="cohort-download-csv" onClick={() => { downloadCsv(filtered); toast.success(`Exported ${filtered.length} synthetic records`); }} className="btn-sm"><Download size={12} />CSV</button>
              <button data-testid="cohort-reset-filters" onClick={() => { setFilters(DEFAULT_FILTERS); setSelected(null); toast("Filters reset"); }} className="btn-sm"><RotateCcw size={12} />Reset</button>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div data-testid="cohort-kpis" className="mb-10 grid grid-cols-2 gap-x-6 gap-y-8 border-b border-line pb-10 sm:grid-cols-3 lg:grid-cols-6">
          <Stat testId="kpi-customers" label="Customers" value={k.customers.toLocaleString()} sub={<>{pct(k.subShare)} subscribers</>} />
          <Stat testId="kpi-repeat-rate" label="Repeat purchase" value={pct(k.repeat)} sub="2+ orders" />
          <Stat testId="kpi-churn" label="Sub churn / mo" value={pct(k.churn, 1)} sub="cancels ÷ sub-months" />
          <Stat testId="kpi-clv" label="Avg observed CLV" value={usd(k.clv)} sub="revenue to date" />
          <Stat testId="kpi-gap" label="Median reorder gap" value={<>{Math.round(k.gap)}<span className="text-xl">d</span></>} sub="days between orders" />
          <Stat testId="kpi-m3" label="M3 retention" value={pct(k.m3)} sub={<>M6: {pct(k.m6)}</>} />
        </div>
      </Reveal>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <Tabs defaultValue="retention">
            <TabsList className="mb-8 h-auto flex-wrap justify-start gap-1 rounded-full bg-linen p-1">
              {[["retention", "Retention"], ["revenue", "Revenue & CLV"], ["behaviour", "Behaviour & segments"], ["records", "Records"]].map(([v, l]) => (
                <TabsTrigger key={v} value={v} data-testid={`cohort-tab-${v}`} className="rounded-full px-4 py-1.5 text-xs data-[state=active]:bg-espresso data-[state=active]:text-ivory">{l}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="retention" className="space-y-12">
              <div>
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
                  <h4 className="font-serif text-2xl text-espresso">Cohort retention heatmap</h4>
                  <span className="text-[11px] text-cocoa/70">% of cohort still subscribed or purchasing in month N</span>
                </div>
                {matrix.length ? <Heatmap rows={matrix} selected={selected} onSelect={(i) => setSelected(i === selected ? null : i)} /> : <p className="text-sm text-cocoa">No cohorts match.</p>}
              </div>
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h4 className="font-serif text-2xl text-espresso">Retention curves</h4>
                  <div className="flex gap-1">
                    <Pill testId="curve-mode-channel" active={curveMode === "channel"} onClick={() => setCurveMode("channel")} className="!px-3 !py-1 !text-xs">By channel</Pill>
                    <Pill testId="curve-mode-type" active={curveMode === "type"} onClick={() => setCurveMode("type")} className="!px-3 !py-1 !text-xs">By purchase type</Pill>
                  </div>
                </div>
                <div data-testid="chart-retention-curves" className="h-72">
                  <ResponsiveContainer>
                    <LineChart data={curves} margin={{ left: -18, right: 8, top: 8 }}>
                      <CartesianGrid stroke="#EBE5DC" vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} domain={[0, 1]} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => pct(v, 1)} />
                      <Legend iconType="circle" iconSize={8} />
                      {curveKeys.map((key) => (
                        <Line key={key} type="monotone" dataKey={key} stroke={CH_COLORS[key]} strokeWidth={key === "All" ? 2.5 : 1.75} strokeDasharray={key === "All" ? "4 3" : undefined} dot={false} connectNulls={false} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-12">
              <ChartBox testId="chart-revenue-by-cohort" title="Revenue by acquisition cohort" note="Cumulative synthetic revenue, stacked by channel">
                <ResponsiveContainer>
                  <BarChart data={revenue} margin={{ left: -6, right: 8 }}>
                    <CartesianGrid stroke="#EBE5DC" vertical={false} />
                    <XAxis dataKey="cohort" tickLine={false} axisLine={false} interval={0} angle={-35} textAnchor="end" height={45} />
                    <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => usd(v)} cursor={{ fill: "#F4EFE6" }} />
                    <Legend iconType="circle" iconSize={8} />
                    {filters.channels.map((ch, i) => <Bar key={ch} dataKey={ch} stackId="a" fill={CH_COLORS[ch]} radius={i === filters.channels.length - 1 ? [4, 4, 0, 0] : 0} />)}
                  </BarChart>
                </ResponsiveContainer>
              </ChartBox>
              <div className="grid gap-10 sm:grid-cols-2">
                <ChartBox testId="chart-clv-by-channel" title="CLV by channel" note="Avg observed revenue / customer">
                  <ResponsiveContainer>
                    <BarChart data={clvChannel} layout="vertical" margin={{ left: 18, right: 16 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={92} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => usd(v)} cursor={{ fill: "#F4EFE6" }} />
                      <Bar dataKey="clv" radius={[0, 6, 6, 0]} barSize={18} label={{ position: "right", fontSize: 11, formatter: (v: number) => usd(v) }}>
                        {clvChannel.map((r) => <Cell key={r.name} fill={CH_COLORS[r.name]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartBox>
                <ChartBox testId="chart-clv-by-product" title="CLV & repeat by first product">
                  <ResponsiveContainer>
                    <BarChart data={clvProduct} margin={{ left: -10, right: 8 }}>
                      <CartesianGrid stroke="#EBE5DC" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis yAxisId="l" tickFormatter={(v) => `$${v}`} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="r" orientation="right" tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F4EFE6" }} />
                      <Legend iconType="circle" iconSize={8} />
                      <Bar yAxisId="l" dataKey="clv" name="Avg CLV ($)" fill="#6A7B68" radius={[6, 6, 0, 0]} barSize={22} />
                      <Bar yAxisId="r" dataKey="repeat" name="Repeat rate (%)" fill="#F3E6B4" radius={[6, 6, 0, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartBox>
              </div>
            </TabsContent>

            <TabsContent value="behaviour" className="space-y-12">
              <ChartBox testId="chart-time-between-purchases" title="Time between purchases" note={`Median ${Math.round(k.gap)} days · all repeat orders`}>
                <ResponsiveContainer>
                  <BarChart data={hist} margin={{ left: -14, right: 8 }}>
                    <CartesianGrid stroke="#EBE5DC" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F4EFE6" }} />
                    <Bar dataKey="orders" name="Repeat orders" fill="#C88B73" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartBox>
              <div data-testid="customer-segmentation">
                <div className="mb-4 flex items-baseline justify-between"><h4 className="font-serif text-xl text-espresso">Customer segmentation</h4><span className="text-[11px] text-cocoa/70">Rule-based, as of May 31, 2026</span></div>
                <div className="space-y-3">
                  {segs.map((s, i) => (
                    <div key={s.name} data-testid={`segment-${i}`} className="grid grid-cols-12 items-center gap-3">
                      <div className="col-span-12 sm:col-span-4"><div className="text-sm font-medium text-espresso">{s.name}</div><div className="text-[11px] text-cocoa/70">{s.desc}</div></div>
                      <div className="col-span-8 h-2.5 overflow-hidden rounded-full bg-linen sm:col-span-6">
                        <motion.div className="h-full rounded-full" style={{ background: ["#6A7B68", "#8B9B88", "#D4A359", "#7B82A8", "#C88B73", "#9E6B82"][i] }} initial={false} animate={{ width: `${s.share * 100}%` }} transition={{ duration: 0.6 }} />
                      </div>
                      <div className="col-span-4 text-right font-mono text-xs text-cocoa sm:col-span-2">{pct(s.share)} · {usd(s.clv)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div data-testid="cancel-reasons">
                <div className="mb-4 flex items-baseline justify-between"><h4 className="font-serif text-xl text-espresso">Cancellation reasons</h4><span className="text-[11px] text-cocoa/70">{reasons.reduce((s, r) => s + r.count, 0)} cancellations</span></div>
                <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  {reasons.map((r) => (
                    <div key={r.reason} className="flex items-center justify-between border-b border-dashed border-line py-2 text-sm"><span className="text-cocoa">{r.reason}</span><span className="font-mono text-xs text-espresso">{pct(r.share)}</span></div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="records">
              <div className="overflow-x-auto rounded-xl border border-line">
                <table data-testid="cohort-records-table" className="w-full min-w-[720px] text-left text-xs">
                  <thead className="bg-linen font-mono text-[10px] uppercase tracking-[0.1em] text-cocoa">
                    <tr>{["ID", "Acquired", "Channel", "First product", "Type", "Status", "Orders", "CLV", "Last order", "Promo"].map((h) => <th key={h} className="px-3 py-2.5 font-normal">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 12).map((c) => (
                      <tr key={c.id} className="border-t border-line bg-white">
                        <td className="px-3 py-2 font-mono">{c.id}</td><td className="px-3 py-2">{fmtDay(c.acqDay)}</td><td className="px-3 py-2">{c.channel}</td><td className="px-3 py-2">{c.firstProduct}</td>
                        <td className="px-3 py-2">{c.type}{c.frequency ? ` · ${c.frequency}d` : ""}</td><td className="px-3 py-2">{c.status}</td><td className="px-3 py-2">{c.orders.length}</td><td className="px-3 py-2">{usd(c.clv)}</td><td className="px-3 py-2">{fmtDay(c.lastPurchaseDay)}</td><td className="px-3 py-2">{c.promo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[11px] text-cocoa/70">Showing 12 of {filtered.length.toLocaleString()} filtered synthetic records. Export the full set with the CSV button.</p>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-24">
            <AnimatePresence>{selected != null && <CohortDetailPanel key={selected} idx={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
            <div data-testid="data-story-panel" className="rounded-2xl border border-line bg-butter/50 p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h4 className="font-serif text-2xl leading-tight text-espresso">What the Data Is Telling Us</h4>
                <button data-testid="data-story-copy-btn" onClick={copyStory} aria-label="Copy takeaways" className="btn-sm !px-2.5"><Copy size={12} /></button>
              </div>
              <div className="mb-2 flex items-center gap-2"><span className="eyebrow !text-[10px]">Observations</span><Tag kind="synthetic" /></div>
              <ul data-testid="data-story-observations" className="mb-6 space-y-2.5 text-sm leading-relaxed text-cocoa">
                {story.observations.map((o) => <li key={o} className="border-l-2 border-sagedeep/40 pl-3">{o}</li>)}
              </ul>
              <div className="mb-2 flex items-center gap-2"><span className="eyebrow !text-[10px]">To investigate</span><Tag kind="hypothesis" /></div>
              <ul data-testid="data-story-hypotheses" className="mb-5 space-y-2.5 text-sm leading-relaxed text-cocoa">
                {story.hypotheses.map((h) => <li key={h} className="border-l-2 border-honey/60 pl-3">{h}</li>)}
              </ul>
              <p className="rounded-xl bg-white/70 p-3 text-[11px] leading-relaxed text-cocoa">{story.caution}</p>
            </div>
          </div>
        </aside>
      </div>
    </Section>
  );
}
