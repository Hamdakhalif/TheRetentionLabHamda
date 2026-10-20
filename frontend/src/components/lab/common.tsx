import React from "react";
import { motion } from "framer-motion";

export const Reveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export function SectionHeader({ index, eyebrow, title, intro }: { index: string; eyebrow: string; title: React.ReactNode; intro?: React.ReactNode }) {
  return (
    <Reveal className="mb-12 grid gap-6 lg:mb-16 lg:grid-cols-12">
      <div className="lg:col-span-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-sagedeep">{index}</span>
          <span className="h-px w-10 bg-sagedeep/40" />
          <span className="eyebrow">{eyebrow}</span>
        </div>
      </div>
      <div className="lg:col-span-9">
        <h2 className="font-serif text-3xl leading-[1.05] tracking-tight text-espresso sm:text-4xl lg:text-5xl">{title}</h2>
        {intro && <div className="mt-5 max-w-3xl text-base leading-relaxed text-cocoa">{intro}</div>}
      </div>
    </Reveal>
  );
}

const TAGS = {
  observed: { label: "Public observation", cls: "bg-sage text-sagedeep border-sagedeep/20" },
  hypothesis: { label: "Hypothesis", cls: "bg-butter text-[#8A6A1F] border-[#D4A359]/30" },
  recommendation: { label: "Recommendation", cls: "bg-blush text-[#9A5A45] border-terracotta/30" },
  simulated: { label: "Simulated", cls: "bg-[#ECEAF3] text-[#5B6190] border-[#7B82A8]/30" },
  scenario: { label: "Scenario, not forecast", cls: "bg-[#ECEAF3] text-[#5B6190] border-[#7B82A8]/30" },
  synthetic: { label: "Synthetic data", cls: "bg-[#ECEAF3] text-[#5B6190] border-[#7B82A8]/30" },
  established: { label: "Established experience", cls: "bg-sage text-sagedeep border-sagedeep/20" },
  concept: { label: "New concept", cls: "bg-butter text-[#8A6A1F] border-[#D4A359]/30" },
};

export type TagKind = keyof typeof TAGS;

export const Tag = ({ kind, className = "" }: { kind: TagKind; className?: string }) => (
  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${TAGS[kind].cls} ${className}`}>
    <span className="h-1 w-1 rounded-full bg-current" />
    {TAGS[kind].label}
  </span>
);

export const Section = ({ id, children, className = "", testId }: { id: string; children: React.ReactNode; className?: string; testId: string }) => (
  <section id={id} data-testid={testId} className={`scroll-mt-20 py-20 sm:py-28 ${className}`}>
    <div className="mx-auto max-w-7xl px-5 sm:px-8">{children}</div>
  </section>
);

export function Pill({ active, onClick, children, testId, className = "" }: { active: boolean; onClick: () => void; children: React.ReactNode; testId: string; className?: string }) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm transition-[background-color,color,border-color,transform] duration-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sagedeep/50 ${
        active ? "border-espresso bg-espresso text-ivory" : "border-line bg-white/60 text-cocoa hover:border-espresso/40 hover:bg-white"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export const Stat = ({ label, value, sub, testId }: { label: string; value: React.ReactNode; sub?: React.ReactNode; testId: string }) => (
  <div data-testid={testId} className="min-w-0">
    <div className="eyebrow mb-2 !text-[10px]">{label}</div>
    <div className="font-serif text-3xl leading-none text-espresso sm:text-4xl">{value}</div>
    {sub && <div className="mt-1.5 text-xs text-cocoa/80">{sub}</div>}
  </div>
);

export const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-cocoa/70">{label}</div>
    {children}
  </div>
);

export const PhoneFrame = ({ children, testId, className = "" }: { children: React.ReactNode; testId?: string; className?: string }) => (
  <div data-testid={testId} className={`relative mx-auto w-full max-w-[330px] rounded-[44px] border border-espresso/10 bg-espresso p-2.5 shadow-[0_30px_80px_-30px_rgba(28,24,23,0.45)] ${className}`}>
    <div className="relative h-[620px] overflow-hidden rounded-[36px] bg-ivory">
      <div className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-espresso" />
      {children}
    </div>
  </div>
);
