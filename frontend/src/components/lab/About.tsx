import { Section, Reveal, Tag } from "./common";

const ORGS = ["Treasury Board of Canada Secretariat", "Shared Services Canada", "Bank of Canada", "Global Affairs Canada", "General Dynamics"];
const SKILLS = ["SQL", "Power BI", "React", "JavaScript", "Workflow automation", "API integrations"];
const STRENGTHS = [
  ["Analytical problem-solving", "I turn messy operational data into clear, decision-ready answers."],
  ["UX thinking", "I look at every system through an HCI lens — how people actually move through it."],
  ["Testing & continuous improvement", "I ship, measure, refine — and I write down what I learned."],
  ["Cross-functional collaboration", "I translate between technical teams and business stakeholders."],
  ["Consumer curiosity", "I'm genuinely fascinated by consumer behaviour, branding and wellness culture."],
];
const CONCEPTS = ["Cohort & subscription retention analysis", "Cancellation-flow design", "Lifecycle email/SMS strategy", "Retention experiment design", "CLV scenario modelling", "Competitive positioning"];

export default function About() {
  return (
    <Section id="strategist" testId="about-hamda-section">
      <div className="grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <div className="flex items-center gap-3"><span className="font-mono text-xs text-sagedeep">08</span><span className="h-px w-10 bg-sagedeep/40" /><span className="eyebrow">The strategist</span></div>
          <div data-testid="about-photo" className="relative mt-8 aspect-square w-full max-w-sm overflow-hidden rounded-full bg-butter ring-8 ring-blush shadow-[0_30px_60px_-30px_rgba(28,24,23,0.45)]">
            <img src="/img/hamda-portrait.jpg" alt="Portrait of Hamda Khalif" className="h-full w-full object-cover object-[55%_30%]" />
          </div>
          <p className="mt-6 max-w-sm text-center font-serif text-xl font-semibold italic text-espresso">Hamda Khalif</p>
        </Reveal>
        <div className="lg:col-span-7">
          <Reveal>
            <h2 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-espresso sm:text-5xl lg:text-6xl">Part wellness consumer. Part technologist. <em className="text-sagedeep">Entirely curious about why people stay.</em></h2>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-cocoa">
              Hamda Khalif is a Computer Science professional with a concentration in Human-Computer Interaction and <strong className="text-espresso">approximately four years of experience</strong> across data analytics, software development and digital systems. She is also the customer this lab is about — someone who discovers, researches and builds routines around wellness products.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-12 grid gap-8 sm:grid-cols-2">
            <div data-testid="about-established">
              <Tag kind="established" />
              <h3 className="mt-4 font-serif text-2xl text-espresso">Professional experience</h3>
              <ul className="mt-3 space-y-2">{ORGS.map((o) => <li key={o} className="border-b border-line pb-2 text-sm font-semibold text-espresso">{o}</li>)}</ul>
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
            <div className="eyebrow mb-4">How I work</div>
            <div className="divide-y divide-line border-y border-line">
              {STRENGTHS.map(([t, d]) => (
                <div key={t} className="grid gap-1 py-3.5 sm:grid-cols-5"><span className="font-serif text-lg font-semibold text-espresso sm:col-span-2">{t}</span><span className="text-sm text-cocoa sm:col-span-3">{d}</span></div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
