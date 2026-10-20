import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Section, SectionHeader, Reveal, Tag, Pill } from "./common";
import { usePersist } from "@/lib/usePersist";

type BrandKey = "arrae" | "lemme" | "cymbiotika";

const BRANDS: Record<BrandKey, { name: string; format: string; summary: string; swatch: string }> = {
  arrae: {
    name: "Arrae",
    format: "Capsule supplements, need-state led (e.g. bloat, calm, sleep)",
    summary: "Soft, minimal, design-forward wellness — positioned around everyday feelings rather than clinical conditions.",
    swatch: "bg-butter",
  },
  lemme: {
    name: "Lemme",
    format: "Gummies and chewables with playful, colourful packaging",
    summary: "Celebrity-founded (co-founded by Kourtney Kardashian Barker), pop-culture forward, highly visible on social and in mass retail.",
    swatch: "bg-blush",
  },
  cymbiotika: {
    name: "Cymbiotika",
    format: "Liquid and liposomal formats, often in single-serve pouches",
    summary: "Premium, science-language positioning with a strong ambassador and creator presence.",
    swatch: "bg-sage",
  },
};

const DIMENSIONS = [
  "Brand identity & visual storytelling",
  "Product discovery & social positioning",
  "Influencer & creator marketing",
  "Subscription value proposition",
  "Customer engagement",
  "Loyalty & community",
  "Post-purchase experience",
  "Opportunities for differentiation",
];

const MATRIX: Record<BrandKey, { observed: string; hypothesis: string }[]> = {
  arrae: [
    { observed: "Pastel, editorial packaging and a calm, minimal site aesthetic.", hypothesis: "The aesthetic itself may act as a shelf-visible habit cue — a retention asset, not just an acquisition one." },
    { observed: "Products are framed by how the customer wants to feel, which travels well in short-form video.", hypothesis: "Feeling-based discovery may attract trial-heavy, trend-driven first purchases that need stronger onboarding." },
    { observed: "Visible creator and UGC content on social channels.", hypothesis: "Creator content could be repurposed post-purchase as 'how I use it' routine education." },
    { observed: "Offers a subscribe option on its site.", hypothesis: "Communicating flexibility (skip, delay, swap) may matter as much as price savings." },
    { observed: "Email capture and social presence are the most visible engagement surfaces.", hypothesis: "Lifecycle messaging tied to the customer's chosen need-state may outperform generic product promos." },
    { observed: "No assumptions made about internal loyalty programme performance.", hypothesis: "A ritual-based loyalty mechanic (consistency, not just spend) could fit the brand voice." },
    { observed: "Post-purchase experience is not publicly observable in detail.", hypothesis: "Days 14–45 are likely the highest-leverage window for routine formation." },
    { observed: "—", hypothesis: "Own the 'daily ritual' narrative: the brand you keep because it fits your life, not because it went viral." },
  ],
  lemme: [
    { observed: "Bright, playful packaging and a pop-culture tone.", hypothesis: "Strong novelty appeal; habit formation may rely on the gummy format being enjoyable." },
    { observed: "Founder visibility and social reach drive awareness.", hypothesis: "Awareness advantage is high; differentiation for competitors lies in depth of relationship, not reach." },
    { observed: "Heavy celebrity and creator association.", hypothesis: "Creator-led trust may transfer to first purchase faster than to long-term loyalty." },
    { observed: "Products are available both direct and through major retailers.", hypothesis: "Retail availability may reduce the perceived need to subscribe direct." },
    { observed: "Engagement largely visible through social and launches.", hypothesis: "Launch cadence keeps attention, but may encourage switching between SKUs." },
    { observed: "No assumptions made about loyalty programme details.", hypothesis: "Community is likely anchored in fandom rather than routine." },
    { observed: "Not publicly observable in detail.", hypothesis: "Format enjoyment (taste, texture) likely shapes repurchase." },
    { observed: "—", hypothesis: "A competitor can win on calm, considered trust where Lemme wins on excitement." },
  ],
  cymbiotika: [
    { observed: "Premium, ingredient- and science-language positioning.", hypothesis: "Appeals to the 'ingredient comparer' — trust must be earned through transparency." },
    { observed: "Strong presence through podcasts, creators and ambassadors.", hypothesis: "Long-form endorsement may produce more considered, higher-intent buyers." },
    { observed: "Visible ambassador / affiliate-style creator programme.", hypothesis: "Creator-as-educator model may support post-purchase usage education." },
    { observed: "Subscription offered on site.", hypothesis: "Premium price points make perceived value and flexibility critical to subscription survival." },
    { observed: "Educational content is prominent across channels.", hypothesis: "Education-led engagement could reduce 'not using consistently' churn." },
    { observed: "No assumptions made about loyalty programme details.", hypothesis: "Community is likely built around wellness philosophy and founder story." },
    { observed: "Single-serve formats are visible in product imagery.", hypothesis: "Format can reduce friction to daily use — a ritual design lesson." },
    { observed: "—", hypothesis: "Competitors can differentiate with warmth and simplicity where premium science messaging feels intense." },
  ],
};

const STAGES = ["Discover", "Consider", "First purchase", "Ritual", "Return"];
const JOURNEY: Record<BrandKey, { she: string; moment: string; opportunity: string }[]> = {
  arrae: [
    { she: "Sees a creator describe how they feel after meals.", moment: "Emotional relevance", opportunity: "Tag first-touch creator content so onboarding can echo it." },
    { she: "Visits the site, reads ingredients, checks reviews.", moment: "Trust building", opportunity: "Clear, compliant ingredient storytelling; no overclaiming." },
    { she: "Buys one bottle — maybe subscribes for the discount.", moment: "Commitment", opportunity: "Set expectations for how and when to use it." },
    { she: "Tries to fit it into her morning or evening.", moment: "Habit formation", opportunity: "Routine prompts timed to real usage, not order dates." },
    { she: "Bottle runs low — or sits half-full.", moment: "Decision point", opportunity: "Usage-aware replenishment, easy delay or swap." },
  ],
  lemme: [
    { she: "Sees a celebrity or viral launch.", moment: "Hype", opportunity: "Hypothesis: high awareness, lower intent clarity." },
    { she: "Finds it on a retail shelf or online.", moment: "Convenience", opportunity: "Hypothesis: purchase location fragments the relationship." },
    { she: "Buys a flavour she's curious about.", moment: "Novelty", opportunity: "Hypothesis: format enjoyment drives repeat." },
    { she: "Enjoys the gummy as a treat.", moment: "Pleasure-based habit", opportunity: "Hypothesis: strong habit if taste holds." },
    { she: "Tries the next launch, or drifts.", moment: "Switching", opportunity: "Hypothesis: loyalty to brand, not SKU." },
  ],
  cymbiotika: [
    { she: "Hears a long-form podcast endorsement.", moment: "Considered intent", opportunity: "Hypothesis: higher-intent first purchase." },
    { she: "Researches formulation and sourcing.", moment: "Scrutiny", opportunity: "Hypothesis: transparency is the conversion lever." },
    { she: "Pays a premium price point.", moment: "Value pressure", opportunity: "Hypothesis: must feel worth it quickly." },
    { she: "Uses single-serve pouches daily.", moment: "Low-friction ritual", opportunity: "Hypothesis: format supports consistency." },
    { she: "Re-evaluates cost at renewal.", moment: "Value check", opportunity: "Hypothesis: flexibility reduces price churn." },
  ],
};

const DRIVERS = [
  { name: "Product experience", body: "Does she notice a difference she can describe in her own words? Retention starts with whether the product earns its place in the routine.", metric: "Repeat purchase rate by first product" },
  { name: "Trust", body: "Honest ingredient storytelling and compliant claims build confidence that compounds over time — overclaiming erodes it at the first disappointment.", metric: "Review sentiment, support contacts per order" },
  { name: "Perceived value", body: "Value is price divided by meaning. Clear subscriber benefits and visible progress change the equation more than deeper discounts.", metric: "'Too expensive' share of cancellations" },
  { name: "Subscription flexibility", body: "Life changes faster than delivery schedules. Skip, delay, swap and pause should be easier than cancelling.", metric: "Save rate in cancellation flow" },
  { name: "Meaningful engagement", body: "Messages should help her use the product, not just buy more of it. Relevance beats frequency.", metric: "Engaged subscribers, unsubscribe rate" },
];

export default function Competitive() {
  const [brand, setBrand] = usePersist<BrandKey>("ci-brand", "arrae");
  const [stage, setStage] = useState(0);
  const [dim, setDim] = usePersist<number>("ci-dim", 3);
  const [driver, setDriver] = useState(0);
  const j = JOURNEY[brand][stage];

  return (
    <Section id="market" testId="competitive-intelligence-section" className="bg-linen/50">
      <SectionHeader
        index="01"
        eyebrow="Competitive intelligence"
        title={<>The Wellness Girl Economy.</>}
        intro={
          <>
            A customer-facing read of three brands competing for the same shelf. Public observations are general and should be re-verified;
            everything else is clearly marked as hypothesis. <strong className="font-medium text-espresso">No competitor metrics or internal practices are known or implied.</strong>
          </>
        }
      />

      <Reveal className="mb-6 flex flex-wrap gap-2" >
        {(Object.keys(BRANDS) as BrandKey[]).map((k) => (
          <Pill key={k} testId={`ci-brand-${k}`} active={brand === k} onClick={() => { setBrand(k); setStage(0); }}>
            {BRANDS[k].name}
          </Pill>
        ))}
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div key={brand} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} data-testid="ci-brand-profile" className={`relative overflow-hidden rounded-2xl ${BRANDS[brand].swatch} p-8`}>
              <Tag kind="observed" />
              <h3 className="mt-6 font-serif text-5xl text-espresso">{BRANDS[brand].name}</h3>
              <p className="mt-4 font-serif text-xl italic leading-snug text-cocoa">{BRANDS[brand].summary}</p>
              <p className="mt-6 border-t border-espresso/10 pt-4 text-sm text-cocoa"><span className="eyebrow mr-2 !text-[10px]">Format</span>{BRANDS[brand].format}</p>
            </motion.div>
          </AnimatePresence>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="panel p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <span className="eyebrow">Her journey with {BRANDS[brand].name}</span>
              <Tag kind="hypothesis" />
            </div>
            <div className="relative mb-8 flex justify-between">
              <div className="absolute left-0 right-0 top-[13px] h-px bg-line" />
              <motion.div className="absolute left-0 top-[13px] h-px bg-espresso" animate={{ width: `${(stage / (STAGES.length - 1)) * 100}%` }} transition={{ duration: 0.5 }} />
              {STAGES.map((s, i) => (
                <button key={s} data-testid={`ci-stage-${i}`} onClick={() => setStage(i)} className="relative z-10 flex flex-col items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[10px] transition-[background-color,color,transform] duration-300 ${i <= stage ? "border-espresso bg-espresso text-ivory" : "border-line bg-white text-cocoa"} ${i === stage ? "scale-110" : ""}`}>{i + 1}</span>
                  <span className={`hidden text-[11px] sm:block ${i === stage ? "font-semibold text-espresso" : "text-cocoa"}`}>{s}</span>
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={brand + stage} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.3 }} data-testid="ci-stage-detail" className="grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="eyebrow mb-2 !text-[10px]">{STAGES[stage]} · what she does</div>
                  <p className="font-serif text-2xl leading-snug text-espresso">{j.she}</p>
                  <p className="mt-3 text-sm text-cocoa">Moment: <span className="font-medium text-espresso">{j.moment}</span></p>
                </div>
                <div className="rounded-xl border border-dashed border-terracotta/40 bg-blush/40 p-5">
                  <div className="eyebrow mb-2 !text-[10px] !text-terracotta">Retention lens</div>
                  <p className="text-sm leading-relaxed text-cocoa">{j.opportunity}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-16">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <h3 className="font-serif text-3xl text-espresso">Side-by-side comparison</h3>
          <div className="flex gap-2"><Tag kind="observed" /><Tag kind="hypothesis" /></div>
        </div>
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {DIMENSIONS.map((d, i) => (
            <Pill key={d} testId={`ci-dimension-${i}`} active={dim === i} onClick={() => setDim(i)} className="shrink-0 !text-xs">{d}</Pill>
          ))}
        </div>
        <div data-testid="ci-comparison-grid" className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {(Object.keys(BRANDS) as BrandKey[]).map((k) => (
            <div key={k} className={`bg-white p-6 transition-colors ${brand === k ? "bg-ivory" : ""}`}>
              <div className="mb-4 flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${BRANDS[k].swatch} ring-1 ring-espresso/10`} /><span className="font-serif text-2xl">{BRANDS[k].name}</span></div>
              <AnimatePresence mode="wait">
                <motion.div key={dim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
                  <div>
                    <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-sagedeep">Observed</div>
                    <p className="text-sm leading-relaxed text-cocoa">{MATRIX[k][dim].observed}</p>
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8A6A1F]">Hypothesis</div>
                    <p className="text-sm leading-relaxed text-cocoa">{MATRIX[k][dim].hypothesis}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="my-24">
        <blockquote data-testid="ci-strategic-question" className="mx-auto max-w-4xl text-center font-serif text-3xl italic leading-tight text-espresso sm:text-5xl">
          "When every wellness brand is competing for her first purchase, what makes her choose the same brand <span className="text-sagedeep">again?</span>"
        </blockquote>
      </Reveal>

      <Reveal>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span className="eyebrow">Retention thesis</span>
            <h3 className="mt-3 font-serif text-4xl leading-tight text-espresso">From Viral Product to Daily Ritual.</h3>
            <p className="mt-4 text-sm leading-relaxed text-cocoa">Virality earns the first order. Five forces decide whether she's still here at month six. Select one to see how it connects to a measurable metric.</p>
          </div>
          <div className="lg:col-span-8">
            <div className="divide-y divide-line border-y border-line">
              {DRIVERS.map((d, i) => (
                <button key={d.name} data-testid={`ritual-driver-${i}`} onClick={() => setDriver(i)} className="group block w-full py-5 text-left" aria-expanded={driver === i}>
                  <div className="flex items-baseline gap-5">
                    <span className="font-mono text-xs text-sagedeep">0{i + 1}</span>
                    <span className={`font-serif text-2xl transition-colors sm:text-3xl ${driver === i ? "text-espresso" : "text-cocoa/60 group-hover:text-espresso"}`}>{d.name}</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {driver === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
                        <div className="grid gap-4 pl-9 pt-3 sm:grid-cols-3">
                          <p className="text-sm leading-relaxed text-cocoa sm:col-span-2">{d.body}</p>
                          <div className="rounded-xl bg-sage/70 p-4 text-xs text-sagedeep"><span className="block font-mono uppercase tracking-[0.12em]">Measure with</span><span className="mt-1 block text-sm text-espresso">{d.metric}</span></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
