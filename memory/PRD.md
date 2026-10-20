# The Retention Lab — PRD

## Original problem statement
Build "The Retention Lab — An Arrae Growth Concept by Hamda Khalif": a premium, responsive, interactive strategic prototype (React, TypeScript, Tailwind, Recharts) showing how Hamda (CS + HCI, ~4 yrs analytics/automation) would approach Arrae's Senior Retention Manager role. Synthetic, clearly labelled data; independent concept; no accounts.

## User choices
- "Let's Talk Retention" → LinkedIn: https://www.linkedin.com/in/hamda-khalif-387881231/
- Portrait of Hamda supplied (About section); illustration supplied replaces hero product photo

## Architecture
- Frontend-only CRA + craco, TypeScript (.tsx, type-check via `npx tsc --noEmit`; fork-ts-checker removed from dev server)
- `src/lib/data.ts` seeded generator (2,400 customers), `src/lib/metrics.ts` all calculations, `src/lib/usePersist.ts` localStorage
- Sections in `src/components/lab/*`: Nav, Hero, Competitive, CohortLab, RescueStudio, LifecycleStudio, Experiments, ClvSimulator, HciLab, About, Roadmap (+methodology, closing, footer)
- Images in `public/img/`

## Implemented (June 2026)
- All 11 brief sections, live-calculated cohort heatmap/curves/revenue/CLV/gaps/segments/cancel reasons, cohort detail, data story panel, CSV export
- Rescue Studio original vs proposed flows for 6 reasons; Lifecycle 9 journeys × 3 personas, email/SMS previews with consent suppression, A/B builder w/ simulated results and saved plans
- Experiments A–D with ICE ranking, sample-size calc, scenario impact; CLV simulator with formulas; HCI portal comparison with annotations
- Testing iteration 1: 95% pass; all reported issues fixed (A/B input, hypothesis textarea, ROI format, reset scope, tally, persisted-state merge)

## Backlog
- P1: PDF/one-page export of the strategy; shareable links with filter state
- P2: Real public-data refresh for competitive notes; dark "presentation mode"
