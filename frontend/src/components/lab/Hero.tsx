import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import { Tag } from "./common";

const HERO_IMG = "/img/hero-illustration.jpg";

const LENSES = [
  { consumer: "Finds a product on her For You page at 11:40pm", analyst: "Acquisition channel, first-touch attribution, creator cohort" },
  { consumer: "Screenshots the ingredient list and compares it to two others", analyst: "Consideration friction, PDP engagement, trust signals" },
  { consumer: "Notices the packaging on her shelf every morning", analyst: "Brand recall as a habit cue, ritual formation" },
  { consumer: "Builds a routine — or quietly lets the bottle sit", analyst: "Usage cadence vs. replenishment timing, churn risk" },
];

const ease = [0.22, 1, 0.36, 1];

export default function Hero() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <section data-testid="hero-section" className="grain relative overflow-hidden pt-28 sm:pt-32">
      <div className="pointer-events-none absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-butter blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-blush/80 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 sm:px-8 lg:grid-cols-12 lg:pb-28">
        <div className="lg:col-span-7">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="mb-10 flex flex-wrap items-center gap-3">
            <span className="eyebrow">The Retention Lab · An Arrae Growth Concept by Hamda Khalif</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease }}
            data-testid="hero-headline"
            className="font-serif text-5xl leading-[0.98] tracking-tight text-espresso sm:text-6xl lg:text-[5.4rem]"
          >
            I am the customer <br className="hidden sm:block" />
            you're trying <em className="text-sagedeep">to retain.</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease }} className="mt-8 max-w-xl font-serif text-2xl italic leading-snug text-cocoa sm:text-[1.7rem]">
            And I understand the technology, data, and experiences that make her come back.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35, ease }} className="mt-8 max-w-xl space-y-4 text-[15px] leading-relaxed text-cocoa">
            <p>
              I'm <strong className="font-semibold text-espresso">Hamda Khalif</strong> — a Computer Science professional with a concentration in Human-Computer Interaction and about four years of experience in data analytics, automation, and digital systems.
            </p>
            <p>
              I'm also her: the wellness consumer who discovers products on TikTok, compares ingredients, notices branding, follows the trends, and builds daily routines around the products that earn a place on her shelf. This lab is how I'd think about keeping her.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5, ease }} className="mt-10 flex flex-wrap gap-3">
            <button data-testid="hero-explore-strategy-btn" onClick={() => scrollTo("market")} className="btn-primary">
              Explore the Retention Strategy <ArrowRight size={16} />
            </button>
            <button data-testid="hero-meet-strategist-btn" onClick={() => scrollTo("strategist")} className="btn-ghost">
              Meet the Strategist
            </button>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.2, ease }} className="relative lg:col-span-5">
          <div className="relative ml-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-t-[200px] rounded-b-2xl">
            <img src={HERO_IMG} alt="Illustration of a woman doing her beauty routine at home" className="h-full w-full object-cover object-[center_30%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/30 via-transparent to-transparent" />
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.8, ease }}
            data-testid="hero-customer-card"
            className="absolute -left-2 bottom-10 w-64 rounded-2xl border border-white/60 bg-ivory/80 p-5 shadow-[0_20px_50px_-20px_rgba(28,24,23,0.35)] backdrop-blur-xl sm:-left-10"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-sagedeep">Customer SYN-00417</span>
              <Tag kind="synthetic" />
            </div>
            <dl className="space-y-1.5 text-xs text-cocoa">
              <div className="flex justify-between"><dt>First touch</dt><dd className="font-medium text-espresso">TikTok · creator video</dd></div>
              <div className="flex justify-between"><dt>First order</dt><dd className="font-medium text-espresso">Debloat · one-time</dd></div>
              <div className="flex justify-between"><dt>Day 38</dt><dd className="font-medium text-espresso">Bottle half full</dd></div>
              <div className="flex justify-between"><dt>Churn risk</dt><dd className="font-medium text-terracotta">Rising</dd></div>
            </dl>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1, ease }}
            className="absolute -top-2 right-2 rounded-full border border-white/70 bg-butter/90 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-espresso backdrop-blur"
          >
            Day 38 is where she decides
          </motion.div>
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="eyebrow">Two lenses, one customer</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div data-testid="hero-lenses" className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          {LENSES.map((l, i) => (
            <div key={i} className="group bg-ivory p-6 transition-colors duration-500 hover:bg-white">
              <span className="font-mono text-[10px] text-sagedeep">0{i + 1}</span>
              <p className="mt-3 font-serif text-lg leading-snug text-espresso">"{l.consumer}"</p>
              <div className="mt-5 flex items-start gap-2 border-t border-dashed border-line pt-4 text-xs leading-relaxed text-cocoa">
                <ArrowDownRight size={14} className="mt-0.5 shrink-0 text-terracotta transition-transform duration-300 group-hover:translate-x-0.5" />
                {l.analyst}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden border-y border-line bg-espresso py-3 text-ivory">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em]">
          {Array.from({ length: 2 }).map((_, j) => (
            <div key={j} className="flex gap-10">
              {["Independent concept", "Not affiliated with or endorsed by Arrae", "All customer data is synthetic", "No internal metrics implied", "Built in React + TypeScript", "Scenarios are not forecasts"].map((t) => (
                <span key={t + j} className="flex items-center gap-10">{t}<span className="text-honey">✦</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
