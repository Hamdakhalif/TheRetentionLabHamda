import {
  Customer, CHANNELS, PRODUCTS, CANCEL_REASONS, N_ACQ_MONTHS, LAST_FULL_MONTH_IDX, AS_OF_DAY,
  monthStartDay, monthLabel,
} from "./data";

export interface Filters {
  month: string; // "all" or month index
  product: string;
  type: string;
  channels: string[];
  promo: string;
  tenure: string;
}

export const DEFAULT_FILTERS: Filters = {
  month: "all", product: "all", type: "all", channels: [...CHANNELS], promo: "all", tenure: "all",
};

export const TENURES = [
  { key: "lt90", label: "< 90 days", min: 0, max: 89 },
  { key: "90to180", label: "90–180 days", min: 90, max: 180 },
  { key: "181to365", label: "181–365 days", min: 181, max: 365 },
  { key: "gt365", label: "365+ days", min: 366, max: 99999 },
];

export const MAX_K = 12;

export function applyFilters(cs: Customer[], f: Filters): Customer[] {
  const t = TENURES.find((x) => x.key === f.tenure);
  return cs.filter(
    (c) =>
      (f.month === "all" || c.acqMonthIdx === Number(f.month)) &&
      (f.product === "all" || c.firstProduct === f.product) &&
      (f.type === "all" || c.type === f.type) &&
      f.channels.includes(c.channel) &&
      (f.promo === "all" || c.promo === f.promo) &&
      (!t || (c.tenureDays >= t.min && c.tenureDays <= t.max)),
  );
}

export const isRetainedAt = (c: Customer, k: number) => c.lastActiveDay >= monthStartDay(c.acqMonthIdx + k);
export const observable = (c: Customer, k: number) => c.acqMonthIdx + k <= LAST_FULL_MONTH_IDX;

export function retentionAt(cs: Customer[], k: number): number | null {
  const elig = cs.filter((c) => observable(c, k));
  if (elig.length < 5) return null;
  return elig.filter((c) => isRetainedAt(c, k)).length / elig.length;
}

export interface CohortRow { idx: number; label: string; size: number; cells: (number | null)[] }

export function cohortMatrix(cs: Customer[]): CohortRow[] {
  const rows: CohortRow[] = [];
  for (let m = 0; m < N_ACQ_MONTHS; m++) {
    const group = cs.filter((c) => c.acqMonthIdx === m);
    if (!group.length) continue;
    const cells = Array.from({ length: MAX_K + 1 }, (_, k) =>
      m + k > LAST_FULL_MONTH_IDX ? null : k === 0 ? 1 : group.filter((c) => isRetainedAt(c, k)).length / group.length,
    );
    rows.push({ idx: m, label: monthLabel(m), size: group.length, cells });
  }
  return rows;
}

export const repeatRate = (cs: Customer[]) => (cs.length ? cs.filter((c) => c.orders.length > 1).length / cs.length : 0);

export function monthlyChurn(cs: Customer[]) {
  const subs = cs.filter((c) => c.type === "Subscription");
  const exposure = subs.reduce((s, c) => s + Math.max(c.lastActiveDay - c.acqDay, 15) / 30.4, 0);
  const cancels = subs.filter((c) => c.status === "Cancelled").length;
  return { rate: exposure ? cancels / exposure : 0, cancels, subs: subs.length };
}

export const avgClv = (cs: Customer[]) => (cs.length ? cs.reduce((s, c) => s + c.clv, 0) / cs.length : 0);
export const totalRevenue = (cs: Customer[]) => cs.reduce((s, c) => s + c.clv, 0);

export function gaps(cs: Customer[]): number[] {
  const out: number[] = [];
  cs.forEach((c) => c.orders.forEach((o, i) => i > 0 && out.push(o.day - c.orders[i - 1].day)));
  return out;
}

export function median(xs: number[]) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function gapHistogram(cs: Customer[]) {
  const bins = [
    { label: "<30d", min: 0, max: 29 }, { label: "30–44d", min: 30, max: 44 }, { label: "45–59d", min: 45, max: 59 },
    { label: "60–74d", min: 60, max: 74 }, { label: "75–89d", min: 75, max: 89 }, { label: "90–119d", min: 90, max: 119 },
    { label: "120d+", min: 120, max: 99999 },
  ];
  const g = gaps(cs);
  return bins.map((b) => ({ label: b.label, orders: g.filter((x) => x >= b.min && x <= b.max).length }));
}

export function retentionCurves(cs: Customer[]) {
  return Array.from({ length: MAX_K + 1 }, (_, k) => {
    const row: Record<string, number | string | null> = { month: `M${k}` };
    row.All = retentionAt(cs, k);
    CHANNELS.forEach((ch) => (row[ch] = retentionAt(cs.filter((c) => c.channel === ch), k)));
    row.Subscription = retentionAt(cs.filter((c) => c.type === "Subscription"), k);
    row["One-time"] = retentionAt(cs.filter((c) => c.type === "One-time"), k);
    return row;
  });
}

export function revenueByCohort(cs: Customer[]) {
  return Array.from({ length: N_ACQ_MONTHS }, (_, m) => {
    const row: Record<string, number | string> = { cohort: monthLabel(m) };
    CHANNELS.forEach((ch) => (row[ch] = Math.round(totalRevenue(cs.filter((c) => c.acqMonthIdx === m && c.channel === ch)))));
    return row;
  }).filter((r) => CHANNELS.some((ch) => (r[ch] as number) > 0));
}

export function clvBy(cs: Customer[], key: "channel" | "firstProduct" | "promo" | "type", values: string[]) {
  return values
    .map((v) => {
      const g = cs.filter((c) => c[key] === v);
      return { name: v, clv: Math.round(avgClv(g)), customers: g.length, repeat: Math.round(repeatRate(g) * 100) };
    })
    .filter((r) => r.customers > 0);
}

export const SEGMENTS = [
  { key: "Loyal Ritualists", desc: "Active subscriber with 4+ orders" },
  { key: "Active Subscribers", desc: "Active or paused subscriber, fewer than 4 orders" },
  { key: "Repeat Buyers", desc: "One-time buyer with 2+ orders, purchased in last 90 days" },
  { key: "New & Unproven", desc: "Acquired in the last 60 days, single order" },
  { key: "At Risk", desc: "No purchase in 60–150 days, not subscribed" },
  { key: "Lapsed", desc: "Cancelled, or no purchase in 150+ days" },
];

export function segmentOf(c: Customer): string {
  const since = AS_OF_DAY - c.lastPurchaseDay;
  if (c.status === "Active" && c.orders.length >= 4) return "Loyal Ritualists";
  if (c.status === "Active" || c.status === "Paused") return "Active Subscribers";
  if (c.status === "Cancelled") return "Lapsed";
  if (c.tenureDays <= 60) return "New & Unproven";
  if (c.orders.length > 1 && since < 90) return "Repeat Buyers";
  if (since < 150) return "At Risk";
  return "Lapsed";
}

export function segmentation(cs: Customer[]) {
  return SEGMENTS.map((s) => {
    const g = cs.filter((c) => segmentOf(c) === s.key);
    return { name: s.key, desc: s.desc, customers: g.length, share: cs.length ? g.length / cs.length : 0, clv: Math.round(avgClv(g)) };
  });
}

export function cancelReasons(cs: Customer[]) {
  const cancelled = cs.filter((c) => c.cancelReason);
  return CANCEL_REASONS.map((r) => ({
    reason: r,
    count: cancelled.filter((c) => c.cancelReason === r).length,
    share: cancelled.length ? cancelled.filter((c) => c.cancelReason === r).length / cancelled.length : 0,
  })).sort((a, b) => b.count - a.count);
}

export function kpis(cs: Customer[]) {
  const churn = monthlyChurn(cs);
  return {
    customers: cs.length,
    repeat: repeatRate(cs),
    churn: churn.rate,
    clv: avgClv(cs),
    gap: median(gaps(cs)),
    subShare: cs.length ? churn.subs / cs.length : 0,
    m3: retentionAt(cs, 3),
    m6: retentionAt(cs, 6),
    revenue: totalRevenue(cs),
    emailOpen: avg(cs.filter((c) => c.emailOptIn).map((c) => c.emailOpenRate)),
    smsOptIn: cs.length ? cs.filter((c) => c.smsOptIn).length / cs.length : 0,
  };
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
export const pct = (v: number | null | undefined, d = 0) => (v == null ? "—" : `${(v * 100).toFixed(d)}%`);
export const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

function topBy<T extends string>(cs: Customer[], fn: (c: Customer) => T): [T, number] | null {
  const counts = new Map<T, number>();
  cs.forEach((c) => counts.set(fn(c), (counts.get(fn(c)) || 0) + 1));
  let best: [T, number] | null = null;
  counts.forEach((v, k) => (!best || v > best[1]) && (best = [k, v]));
  return best;
}

export interface Insight { observations: string[]; hypotheses: string[]; caution: string }

export function insights(filtered: Customer[], all: Customer[]): Insight {
  const f = kpis(filtered);
  const a = kpis(all);
  const obs: string[] = [];
  const hyp: string[] = [];
  if (filtered.length < 30) {
    return {
      observations: [`Only ${filtered.length} customers match these filters — too few to read patterns reliably.`],
      hypotheses: ["Broaden the filters (e.g. include more channels or months) before drawing any conclusions."],
      caution: "Small samples exaggerate noise.",
    };
  }
  const diff = (x: number, y: number) => (y ? (x - y) / y : 0);
  const isAll = filtered.length === all.length;
  obs.push(
    isAll
      ? `Across all ${f.customers.toLocaleString()} synthetic customers, ${pct(f.repeat)} made a second purchase and the median gap between orders is ${Math.round(f.gap)} days.`
      : `This selection of ${f.customers.toLocaleString()} customers has a ${pct(f.repeat)} repeat purchase rate vs. ${pct(a.repeat)} overall (${diff(f.repeat, a.repeat) >= 0 ? "+" : ""}${pct(diff(f.repeat, a.repeat))} relative).`,
  );
  if (f.m3 != null && a.m3 != null && !isAll)
    obs.push(`Month-3 retention is ${pct(f.m3)} vs. ${pct(a.m3)} for the full dataset.`);
  obs.push(`Subscribers are ${pct(f.subShare)} of this group; their modelled monthly churn is ${pct(f.churn, 1)}.`);

  const byCh = clvBy(filtered, "channel", CHANNELS).filter((r) => r.customers >= 20).sort((x, y) => y.clv - x.clv);
  if (byCh.length >= 2) {
    const best = byCh[0];
    const worst = byCh[byCh.length - 1];
    obs.push(`${best.name} customers carry the highest observed revenue per customer (${usd(best.clv)}); ${worst.name} the lowest (${usd(worst.clv)}).`);
    if (worst.name === "TikTok" || worst.name === "Paid")
      hyp.push(`${worst.name}-acquired customers may arrive with trend-driven intent rather than a defined need. Test whether an education-first onboarding flow narrows the gap.`);
    else hyp.push(`Investigate what differs in the first 30 days for ${worst.name} customers (first product, offer, message cadence) before assuming the channel itself is the cause.`);
  }
  const reasons = cancelReasons(filtered);
  if (reasons[0]?.count >= 5) {
    obs.push(`"${reasons[0].reason}" is the most-cited cancellation reason here (${pct(reasons[0].share)} of cancellations).`);
    const map: Record<string, string> = {
      "Too much product": "Overstock may be a cadence-fit problem rather than product dissatisfaction — a delay/frequency option at cancellation could retain some of these subscribers.",
      "Too expensive": "Price sensitivity may reflect perceived value rather than absolute price — test benefit clarity before testing deeper discounts.",
      "Want to try another product": "Customers citing a mismatch may stay if a swap is easier than a cancellation.",
      "Not using consistently": "Inconsistent usage suggests a habit-formation gap; routine prompts in the first 45 days are worth testing.",
      "Not ready to reorder": "A skip or pause option may convert hard churn into a temporary break.",
      "Other reason": "A large 'other' share signals the survey options need revisiting.",
    };
    hyp.push(map[reasons[0].reason]);
  }
  const bf = filtered.filter((c) => c.promo === "BFCM");
  const nonBf = filtered.filter((c) => c.promo !== "BFCM");
  if (bf.length >= 30 && nonBf.length >= 30) {
    const r1 = repeatRate(bf);
    const r2 = repeatRate(nonBf);
    obs.push(`BFCM-acquired customers repeat at ${pct(r1)} vs. ${pct(r2)} for non-BFCM customers in this view.`);
    if (r1 < r2) hyp.push("Discount-led cohorts may need a full-price value story before their first replenishment — test a post-BFCM education sequence vs. a second discount.");
  }
  if (f.gap > 0) hyp.push(`With a median ${Math.round(f.gap)}-day reorder gap, replenishment reminders timed ~${Math.max(Math.round(f.gap) - 7, 14)} days after purchase are a reasonable starting test.`);
  return {
    observations: obs,
    hypotheses: hyp,
    caution: "These are descriptive patterns in synthetic data. They show correlation, not causation — each hypothesis needs a controlled test.",
  };
}

export function cohortDetail(group: Customer[], all: Customer[]) {
  const k = kpis(group);
  const base = kpis(all);
  const topChannel = topBy(group, (c) => c.channel);
  const topProduct = topBy(group, (c) => c.firstProduct);
  const reasons = cancelReasons(group);
  const opps: string[] = [];
  if (k.m3 != null && base.m3 != null && k.m3 < base.m3) opps.push("Below-average M3 retention: prioritise this cohort for an early-life (days 14–60) engagement test.");
  if (k.subShare < base.subShare) opps.push("Lower subscription share: test a post-purchase subscription conversion offer framed around flexibility.");
  if (group.some((c) => c.promo === "BFCM")) opps.push("Contains BFCM acquisitions: monitor discount dependency and test value-first replenishment messaging.");
  if (reasons[0]?.count >= 3) opps.push(`Top cancellation reason is "${reasons[0].reason}" — route these customers to the matching Rescue Studio intervention.`);
  if (k.smsOptIn < 0.4) opps.push("SMS opt-in is low — consent-led SMS capture at checkout may widen the reachable audience.");
  if (!opps.length) opps.push("Performing at or above baseline: study this cohort's first-order mix and messaging as a model for others.");
  return { k, base, topChannel, topProduct, reasons, opps };
}

export { PRODUCTS, CHANNELS };
