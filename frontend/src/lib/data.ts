// Synthetic dataset generator — deterministic (seeded) so every visitor sees the same data.
export type Channel = "TikTok" | "Instagram" | "Organic Search" | "Paid";
export type Product = "Debloat" | "Sleep" | "Calm" | "Metabolism";
export type Promo = "BFCM" | "Holiday" | "New Year Reset" | "Summer" | "Evergreen";
export type PurchaseType = "Subscription" | "One-time";
export type Status = "Active" | "Paused" | "Cancelled" | "One-time";

export const CHANNELS: Channel[] = ["TikTok", "Instagram", "Organic Search", "Paid"];
export const PRODUCTS: Product[] = ["Debloat", "Sleep", "Calm", "Metabolism"];
export const PROMOS: Promo[] = ["BFCM", "Holiday", "New Year Reset", "Summer", "Evergreen"];
export const CANCEL_REASONS = [
  "Too much product",
  "Too expensive",
  "Want to try another product",
  "Not using consistently",
  "Not ready to reorder",
  "Other reason",
];

export interface Order {
  day: number;
  value: number;
  product: Product;
}

export interface Customer {
  id: string;
  acqDay: number;
  acqMonthIdx: number;
  channel: Channel;
  firstProduct: Product;
  type: PurchaseType;
  frequency: number | null;
  status: Status;
  orders: Order[];
  clv: number;
  lastPurchaseDay: number;
  lastActiveDay: number;
  cancelReason: string | null;
  emailOptIn: boolean;
  smsOptIn: boolean;
  emailOpenRate: number;
  smsClickRate: number;
  promo: Promo;
  tenureDays: number;
}

export const N_CUSTOMERS = 2400;
export const START = Date.UTC(2024, 8, 1); // Sep 1 2024
export const N_ACQ_MONTHS = 16; // Sep 2024 – Dec 2025
const DAY = 86400000;
export const AS_OF_DAY = Math.round((Date.UTC(2026, 4, 31) - START) / DAY); // May 31 2026
export const LAST_FULL_MONTH_IDX = 20; // May 2026

export const monthStartDay = (m: number) => Math.round((Date.UTC(2024, 8 + m, 1) - START) / DAY);
export const monthLabel = (m: number) =>
  new Date(Date.UTC(2024, 8 + m, 1)).toLocaleString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
export const dayToDate = (d: number) => new Date(START + d * DAY);
export const fmtDay = (d: number) =>
  dayToDate(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const PRICE: Record<Product, number> = { Debloat: 44, Sleep: 48, Calm: 46, Metabolism: 52 };

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function generate(): Customer[] {
  const rng = mulberry32(20260601);
  const gauss = () => {
    const u = 1 - rng();
    const v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const monthWeights = Array.from({ length: N_ACQ_MONTHS }, (_, m) => {
    const cal = (8 + m) % 12; // 0 = Jan
    let w = 1 + m * 0.035;
    if (cal === 10) w *= 2.6;
    if (cal === 11) w *= 1.45;
    if (cal === 0) w *= 1.35;
    if (cal >= 5 && cal <= 7) w *= 1.1;
    return w;
  });
  const months = monthWeights.map((_, i) => i);
  const customers: Customer[] = [];

  for (let i = 0; i < N_CUSTOMERS; i++) {
    const m = pick(rng, months, monthWeights);
    const cal = (8 + m) % 12;
    const mStart = monthStartDay(m);
    const mLen = monthStartDay(m + 1) - mStart;
    let promo: Promo = "Evergreen";
    let dayInMonth = Math.floor(rng() * mLen);
    if (cal === 10 && rng() < 0.68) {
      dayInMonth = 20 + Math.floor(rng() * 10);
      promo = "BFCM";
    } else if (cal === 11) promo = "Holiday";
    else if (cal === 0) promo = "New Year Reset";
    else if (cal >= 5 && cal <= 7) promo = "Summer";
    const acqDay = mStart + dayInMonth;

    const channel = pick(rng, CHANNELS, promo === "BFCM" ? [0.3, 0.22, 0.12, 0.36] : [0.34, 0.24, 0.18, 0.24]);
    const firstProduct = pick(rng, PRODUCTS, [0.38, 0.24, 0.2, 0.18]);
    const affinity = gauss();

    let pSub = 0.42 + (channel === "Organic Search" ? 0.08 : 0) - (channel === "TikTok" ? 0.1 : 0);
    pSub += (promo === "BFCM" ? -0.12 : 0) + (firstProduct === "Sleep" ? 0.06 : 0) + affinity * 0.05;
    const type: PurchaseType = rng() < clamp(pSub, 0.1, 0.8) ? "Subscription" : "One-time";

    const orders: Order[] = [];
    const orderValue = (product: Product, first: boolean) => {
      let v = PRICE[product] * (type === "Subscription" ? 0.85 : 1);
      if (first && promo === "BFCM") v *= 0.75;
      if (rng() < 0.16) v *= 1.7;
      return Math.round(v * 100) / 100;
    };
    const nextProduct = (p: Product) => (rng() < 0.18 ? PRODUCTS[Math.floor(rng() * 4)] : p);
    orders.push({ day: acqDay, value: orderValue(firstProduct, true), product: firstProduct });

    let status: Status = "One-time";
    let frequency: number | null = null;
    let cancelReason: string | null = null;
    let lastActiveDay = acqDay;
    const engagementPenalty = Math.exp(-0.35 * affinity);

    if (type === "Subscription") {
      frequency = pick(rng, [30, 60, 90], [0.6, 0.3, 0.1]);
      let hazard = 0.085;
      hazard += { TikTok: 0.035, Instagram: 0.01, "Organic Search": -0.025, Paid: 0.015 }[channel];
      hazard += { BFCM: 0.04, Holiday: 0.01, "New Year Reset": 0.015, Summer: 0, Evergreen: 0 }[promo];
      hazard += { Debloat: 0, Sleep: -0.02, Calm: -0.005, Metabolism: 0.01 }[firstProduct];
      hazard = clamp(hazard * engagementPenalty, 0.02, 0.3);
      let day = acqDay;
      let product = firstProduct;
      let cycle = 0;
      status = "Active";
      while (true) {
        const cycleHazard = 1 - Math.pow(1 - hazard * (cycle === 0 ? 1.6 : 1), frequency / 30);
        if (rng() < cycleHazard) {
          const cancelDay = day + Math.floor(rng() * frequency);
          if (cancelDay <= AS_OF_DAY) {
            status = "Cancelled";
            lastActiveDay = cancelDay;
            const w = [frequency === 30 ? 0.3 : 0.12, promo === "BFCM" ? 0.3 : 0.18, 0.14, affinity < 0 ? 0.22 : 0.12, 0.14, 0.08];
            cancelReason = pick(rng, CANCEL_REASONS, w);
          }
          break;
        }
        const next = day + frequency + Math.floor(rng() * 7) - 3;
        if (next > AS_OF_DAY) break;
        day = next;
        product = nextProduct(product);
        orders.push({ day, value: orderValue(product, false), product });
        cycle++;
      }
      if (status === "Active") {
        lastActiveDay = AS_OF_DAY;
        if (rng() < 0.06) {
          status = "Paused";
          lastActiveDay = orders[orders.length - 1].day;
        }
      }
    } else {
      let p = 0.3 + (channel === "Organic Search" ? 0.1 : 0) - (channel === "TikTok" ? 0.08 : 0);
      p += (promo === "BFCM" ? -0.07 : 0) + (firstProduct === "Sleep" ? 0.05 : 0) + affinity * 0.06;
      let day = acqDay;
      let product = firstProduct;
      while (rng() < clamp(p, 0.04, 0.8)) {
        const next = day + 28 + Math.floor(rng() * 75);
        if (next > AS_OF_DAY) break;
        day = next;
        product = nextProduct(product);
        orders.push({ day, value: orderValue(product, false), product });
        p *= 0.72;
      }
      lastActiveDay = day;
    }

    const emailOptIn = rng() < 0.82;
    const smsOptIn = rng() < (channel === "Organic Search" ? 0.36 : 0.5);
    const last = orders[orders.length - 1].day;
    customers.push({
      id: `SYN-${String(i + 1).padStart(5, "0")}`,
      acqDay,
      acqMonthIdx: m,
      channel,
      firstProduct,
      type,
      frequency,
      status,
      orders,
      clv: Math.round(orders.reduce((s, o) => s + o.value, 0) * 100) / 100,
      lastPurchaseDay: last,
      lastActiveDay,
      cancelReason,
      emailOptIn,
      smsOptIn,
      emailOpenRate: emailOptIn ? clamp(0.36 + 0.11 * affinity + (rng() - 0.5) * 0.1, 0.03, 0.9) : 0,
      smsClickRate: smsOptIn ? clamp(0.09 + 0.04 * affinity + (rng() - 0.5) * 0.04, 0.005, 0.4) : 0,
      promo,
      tenureDays: AS_OF_DAY - acqDay,
    });
  }
  return customers;
}

export const CUSTOMERS: Customer[] = generate();
