import { Camera } from "lucide-react";
import { Section, Reveal, Tag } from "./common";

const ORGS = ["Treasury Board of Canada Secretariat", "Shared Services Canada", "Bank of Canada"];
const SKILLS = ["SQL", "Power BI", "React", "JavaScript", "Workflow automation", "API integrations"];
const STRENGTHS = [
  ["Analytical problem-solving", "Turning messy operational data into clear, decision-ready answers."],
  ["UX thinking", "An HCI lens on how people actually move through digital systems."],
  ["Testing & continuous improvement", "Ship, measure, refine — and document what was learned."],
  ["Cross-functional collaboration", "Translating between technical teams and business stakeholders."],
  ["Consumer curiosity", "A genuine interest in consumer behaviour, branding and wellness culture."],
];
const CONCEPTS = ["Cohort & subscription retention analysis", "Cancellation-flow design", "Lifecycle email/SMS strategy", "Retention experiment design", "CLV scenario modelling", "Competitive positioning"];

export default function About() {
  return (
    <Section id="strategist" testId="about-hamda-section">
      <div className="grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <div className="flex items-center gap-3"><span className="font-mono text-xs text-sagedeep">08</span><span className="h-px w-10 bg-sagedeep/40" /><span className="eyebrow">The strategist</span></div>
          <div data-testid="about-photo-placeholder" className="relative mt-8 flex aspect-[4/5] w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-t-[180px] rounded-b-2xl border border-dashed border-sagedeep/40 bg-gradient-to-b from-butter/80 to-blush/70">
            <Camera size={22} className="text-sagedeep" />
            <span className="mt-3 font-serif text-2xl italic text-espresso">Portrait coming soon</span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-sagedeep">Photo placeholder</span>
            <span className="absolute bottom-6 font-serif text-7xl text-espresso/10">HK</span>
          </div>
        </Reveal>
        <div className="lg:col-span-7">
          <Reveal>
            <h2 className="font-serif text-4xl leading-[1.05] tracking-tight text-espresso sm:text-5xl lg:text-6xl">Part wellness consumer. Part technologist. <em className="text-sagedeep">Entirely curious about why people stay.</em></h2>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-cocoa">
              Hamda Khalif is a Computer Science professional with a concentration in Human-Computer Interaction and approximately four years of experience across data analytics, software development and digital systems. She is also the customer this lab is about — someone who discovers, researches and builds routines around wellness products.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-12 grid gap-8 sm:grid-cols-2">
            <div data-testid="about-established">
              <Tag kind="established" />
              <h3 className="mt-4 font-serif text-2xl text-espresso">Professional experience</h3>
              <ul className="mt-3 space-y-2">{ORGS.map((o) => <li key={o} className="border-b border-line pb-2 text-sm text-espresso">{o}</li>)}</ul>
              <div className="mt-5 flex flex-wrap gap-1.5">{SKILLS.map((s) => <span key={s} className="rounded-full bg-sage px-3 py-1 text-xs text-sagedeep">{s}</span>)}</div>
              <p className="mt-4 text-xs leading-relaxed text-cocoa/80">Computer Science degree · concentration in Human-Computer Interaction · ~4 years in analytics, development & digital systems.</p>
            </div>
            <div data-testid="about-concepts">
              <Tag kind="concept" />
              <h3 className="mt-4 font-serif text-2xl text-espresso">Demonstrated in this lab</h3>
              <ul className="mt-3 space-y-2">{CONCEPTS.map((c) => <li key={c} className="border-b border-line pb-2 text-sm text-cocoa">{c}</li>)}</ul>
              <p className="mt-4 text-xs leading-relaxed text-cocoa/80">These are new strategy concepts built for this application — applications of existing analytical and technical skills, not claims of prior retention-management roles.</p>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mt-12">
            <div className="eyebrow mb-4">How she works</div>
            <div className="divide-y divide-line border-y border-line">
              {STRENGTHS.map(([t, d]) => (
                <div key={t} className="grid gap-1 py-3.5 sm:grid-cols-5"><span className="font-serif text-lg text-espresso sm:col-span-2">{t}</span><span className="text-sm text-cocoa sm:col-span-3">{d}</span></div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
