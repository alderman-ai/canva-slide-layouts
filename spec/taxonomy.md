# spec/taxonomy.md — the archetype tree

**7 families, 104 archetypes.** Read this before authoring or porting a layout, before adding a term to `spec/vocab/archetype.json`, and whenever the planner needs a substitute archetype. Ids here are the authority for `vocab/archetype.json` and for every layout's `archetype` frontmatter key.

Baseline of 62 from `research/02` § "Consolidated layout archetypes"; extensions from `research/03` §(a); harvest provenance from `research/05`. Targets set in `docs/PLAN.md` § "Specs carried over" ("~100 archetypes, each with `min_items/max_items` from the survey").

## How to read the table

| Column | Meaning |
|---|---|
| `id` | Stable lowercase kebab-case slug, derived from the name. Matches `spec/vocab/archetype.json`. Never renamed; superseded ids get a `deprecated` row, not an edit. |
| `family` | One of `structural`, `text`, `numbers`, `comparison`, `frameworks`, `process`, `image_people` — the seven values of `spec/vocab/family.json`. |
| `items` | `min–max` repeated content items. Two-dimensional archetypes read `A x B`. Feeds the layout JSON Schema `minItems` / `maxItems` (`research/06` §(c), Presenton pattern). |
| `d` | Default `density` 1–5 (`spec/rubrics.md` §1). |
| `p` | Default `polish_cost` 1–5 (`spec/rubrics.md` §3). |
| `slide_function` | `opening \| agenda \| section \| content \| summary \| closing \| appendix` — `spec/vocab/slide_function.json`, Layer 1 of `research/06` §(b). This is the archetype's structural job. A **layout** additionally carries `flow_role` (`opener \| bridge \| body \| evidence \| closer`, `spec/vocab/flow_role.json`), a coarser narrative axis set per layout, not per archetype. |
| `shape` | Typical `content_shape`: `text \| bullets \| number \| image \| chart \| table \| diagram \| quote` (`research/06` §(b) Layer 3). |
| `accepts` | `accepts_unit_types` (`research/06` §(b) Layer 2). |
| `follows` / `precedes` | `follows_well` / `precedes_well` suggestions, by archetype id. Advisory scoring input, not a constraint. |
| `variants` | `standard \| dense \| sparse`. **`dense*`** marks a dense variant that is planned for authoring (the overflow route in `spec/rubrics.md` §6 step 3). |

Density and polish defaults follow the per-family defaults in `spec/rubrics.md` §3.1 unless the archetype is called out in `research/03` §(d) by name.

---

## Family 1 — `structural` (14)

Deck chrome and navigation. Produces `orient`, `structure`, `close`.

| id | name | description | items | d | p | slide_function | shape | accepts | follows | precedes | variants |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `title-cover` | Title Cover | Deck opening: title, optional subtitle, date | 1–3 | 1 | 1 | opening | text | claim, summary | — | `agenda-toc`, `executive-summary-3col`, `statement` | standard, sparse |
| `intro-title-meta` | Intro Title Meta | Title plus presenter, org, date, confidentiality line | 2–5 | 2 | 1 | opening | text | claim, definition | `title-cover` | `agenda-toc` | standard |
| `agenda-toc` | Agenda TOC | Numbered contents list of the deck's sections | 3–8 | 3 | 1 | agenda | bullets | enumeration, summary | `title-cover`, `intro-title-meta` | `section-divider` | standard, dense* |
| `topic-agenda-tracker` | Topic Agenda Tracker | The agenda re-shown with the current item highlighted | 3–8 | 2 | 2 | agenda | bullets | enumeration | `agenda-toc`, `key-takeaway` | `section-divider`, `title-body` | standard |
| `section-divider` | Section Divider | Full-page section number and name | 1–2 | 1 | 1 | section | text | summary, claim | `agenda-toc`, `key-takeaway` | `title-body`, `statement`, `chart-insight-callout` | standard, sparse |
| `section-title-description` | Section Title Description | Section header with a framing paragraph beside it | 2–3 | 3 | 1 | section | text | definition, claim, summary | `agenda-toc` | `title-body`, `bullet-list` | standard, dense* |
| `divider-question` | Divider Question | The SCQA "Question" slide: one interrogative line | 1 | 1 | 1 | section | text | problem, claim | `title-body` | `executive-summary-3col`, `driver-tree` | standard, sparse |
| `executive-summary-3col` | Executive Summary 3col | Situation, Findings, Recommendation in three columns | 3 (x 4–5 lines) | 4 | 2 | summary | text | problem, evidence, solution, summary | `title-cover` | `agenda-toc`, `section-divider` | standard, dense* |
| `key-takeaway` | Key Takeaway | One boxed so-what closing a section | 1–3 | 2 | 1 | summary | text | summary, claim | `chart-insight-callout`, `harvey-ball-scorecard` | `section-divider`, `cta-next-steps` | standard |
| `appendix-title` | Appendix Title | Divider marking the start of back-up material | 1–2 | 1 | 1 | appendix | text | summary | `cta-next-steps`, `closing-thank-you` | `data-table`, `chart-dominant` | standard, sparse |
| `closing-thank-you` | Closing Thank You | Closing line or sign-off | 1–2 | 1 | 1 | closing | text | call_to_action, summary | `cta-next-steps` | `contact-card`, `appendix-title` | standard, sparse |
| `cta-next-steps` | CTA Next Steps | Explicit next actions with owners and dates | 2–5 | 3 | 1 | closing | bullets | call_to_action, solution, enumeration | `key-takeaway`, `roadmap-lanes` | `closing-thank-you`, `decisions-needed` | standard |
| `qa-slide` | QA Slide | Held slide for questions | 1 | 1 | 1 | closing | text | call_to_action | `closing-thank-you` | `contact-card`, `appendix-title` | standard, sparse |
| `contact-card` | Contact Card | Name, channels, QR code | 1–5 | 2 | 2 | closing | text | call_to_action | `closing-thank-you`, `qa-slide` | `appendix-title` | standard |

---

## Family 2 — `text` (13)

Single-idea and prose layouts. Produces `assert`, `orient`, `humanize`.

| id | name | description | items | d | p | slide_function | shape | accepts | follows | precedes | variants |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `statement` | Statement | One centred sentence, nothing else on the page | 1 | 1 | 1 | content | text | claim, solution | `section-divider` | `chart-insight-callout`, `big-number` | standard, sparse |
| `question-slide` | Question Slide | A single question posed to the room | 1 | 1 | 1 | content | text | problem, claim | `statement` | `statement`, `driver-tree` | standard, sparse |
| `quote` | Quote | Pull quote with attribution | 1–2 | 2 | 1 | content | quote | quote | `title-body` | `statement`, `key-takeaway` | standard, sparse |
| `quote-evidence` | Quote Evidence | Quote on one side, corroborating stat or chart on the other | 2 | 3 | 2 | content | quote | quote, evidence, statistic | `quote` | `chart-insight-callout` | standard |
| `title-body` | Title Body | Action title over one column of prose or short bullets | 1–6 | 3 | 1 | content | text | claim, example, enumeration, summary | `section-divider` | `bullet-list`, `chart-insight-callout` | standard, dense* |
| `bullet-list` | Bullet List | Title plus two to six bullets | 2–6 | 3 | 1 | content | bullets | enumeration, claim, evidence, summary | `title-body` | `chart-dominant` | standard, dense* |
| `numbered-list-panel` | Numbered List Panel | Ordered list in a panel, numerals as graphic anchors | 3–6 | 3 | 1 | content | bullets | enumeration, process | `section-title-description` | `process-steps-horizontal` | standard, dense* |
| `two-column-text` | Two Column Text | Two independent text columns under one title | 2 x 2–5 | 4 | 1 | content | text | comparison, cause_effect, concession, enumeration | `title-body` | `side-by-side` | standard, dense* |
| `content-sidebar-callout` | Content Sidebar Callout | Main text at span 8 plus a callout box at span 4 | 2–6 | 4 | 2 | content | text | claim, evidence, concession, example | `title-body` | `key-takeaway` | standard, dense* |
| `definition` | Definition | A term with its definition, optionally a counter-example | 1–2 | 2 | 1 | content | text | definition | `section-divider` | `title-body`, `image-points` | standard |
| `decisions-needed` | Decisions Needed | The explicit asks, each with an owner and a deadline | 1–4 | 3 | 2 | summary | bullets | call_to_action, solution | `key-takeaway`, `status-table` | `cta-next-steps` | standard |
| `icon-label-row` | Icon Label Row | Exactly three (2–4) icon, label and one-liner columns | 2–4 | 2 | 2 | content | text | enumeration, definition, claim | `statement` | `title-body` | standard |
| `word-cloud` | Word Cloud | Weighted cloud of terms | 15–40 | 2 | 5 | content | diagram | enumeration | `section-divider` | `bullet-list` | standard |

---

## Family 3 — `numbers` (17)

Quantified evidence. Produces `prove`. Family polish default 3 (`research/03` §(d)).

| id | name | description | items | d | p | slide_function | shape | accepts | follows | precedes | variants |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `big-number` | Big Number | One numeral at display size with a label and a source | 1 | 1 | 1 | content | number | statistic | `statement` | `chart-insight-callout` | standard, sparse |
| `stat-row` | Stat Row | Two or three statistics across a single row | 2–3 | 2 | 1 | content | number | statistic, comparison | `big-number` | `chart-dominant` | standard |
| `kpi-grid` | KPI Grid | Metric cards in a 2x2, 2x3 or 3x2 grid | 4–6 | 3 | 2 | content | number | statistic, enumeration | `stat-row` | `chart-insight-callout` | standard, dense* |
| `kpi-dashboard` | KPI Dashboard | Four to six tiles each with value, delta and sparkline | 4–6 | 4 | 4 | content | number | statistic, chart_data | `kpi-grid` | `chart-insight-callout` | standard, dense* |
| `stacked-kpi-ledger` | Stacked KPI Ledger | Vertically stacked metric rows, ledger style | 3–8 | 4 | 2 | content | number | statistic, enumeration | `kpi-grid` | `data-table` | standard, dense* |
| `progress-bars` | Progress Bars | Labelled bars showing progress against target | 2–6 | 3 | 2 | content | chart | statistic, comparison | `kpi-grid` | `thermometer-goal` | standard, dense* |
| `chart-dominant` | Chart Dominant | One chart occupying 70–80% of the page | 1 chart (1–4 series) | 3 | 3 | content | chart | chart_data, statistic, comparison | `title-body` | `chart-insight-callout`, `key-takeaway` | standard |
| `chart-insight-callout` | Chart Insight Callout | Chart at span 8, so-what box at span 4 pointing to the datum | 1 chart + 1–3 callouts | 4 | 3 | content | chart | chart_data, statistic, claim, cause_effect | `title-body`, `section-divider` | `key-takeaway` | standard, dense* |
| `data-table` | Data Table | Plain data table | 3–10 rows x 2–6 cols | 4 | 2 | content | table | table, comparison, enumeration | `chart-dominant` | `table-insight` | standard, dense* |
| `table-insight` | Table Insight | Table at span 8 with the read-out at span 4 | 3–8 rows + 1–3 callouts | 4 | 3 | content | table | table, claim, evidence | `data-table` | `key-takeaway` | standard, dense* |
| `waterfall-bridge` | Waterfall Bridge | Bridge from a start value to an end value | 3–8 bars | 3 | 3 | content | chart | cause_effect, chart_data, statistic | `big-number` | `chart-insight-callout` | standard |
| `marimekko` | Marimekko | Variable-width stacked columns | 3–8 cols x 2–6 segments | 4 | 4 | content | chart | comparison, chart_data | `chart-dominant` | `chart-insight-callout` | standard |
| `thermometer-goal` | Thermometer Goal | One metric against a target | 1 metric + 1 target | 1 | 2 | content | chart | statistic | `big-number` | `progress-bars` | standard, sparse |
| `pictograph-unit-chart` | Pictograph Unit Chart | Repeated unit icons encoding a quantity | 1–4 series | 2 | 5 | content | chart | statistic, comparison | `big-number` | `chart-dominant` | standard |
| `scatter-xy-plot` | Scatter XY Plot | Correlation plot, optional quadrant labels | 5–50 points | 3 | 3 | content | chart | comparison, chart_data, cause_effect | `chart-dominant` | `two-by-two-matrix` | standard |
| `status-table` | Status Table | Table with RAG dots or check glyphs per row | 3–7 rows | 4 | 2 | content | table | table, comparison, summary | `data-table` | `decisions-needed` | standard, dense* |
| `roi-calculator` | ROI Calculator | Input variables with a computed output | 2–5 variables | 3 | 5 | content | number | statistic, cause_effect | `big-number` | `chart-insight-callout` | standard |

---

## Family 4 — `comparison` (12)

Alternatives judged against each other. Produces `compare`. Family polish default 2 (`research/03` §(d)).

| id | name | description | items | d | p | slide_function | shape | accepts | follows | precedes | variants |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `side-by-side` | Side By Side | Option A and Option B in two mirrored columns | 2 x 2–5 | 3 | 2 | content | text | comparison, concession | `two-column-text` | `pros-cons`, `comparison-table` | standard, dense* |
| `three-column` | Three Column | Three parallel options or themes | 3 x 2–5 | 3 | 2 | content | text | comparison, enumeration | `side-by-side` | `four-card-grid` | standard, dense* |
| `four-card-grid` | Four Card Grid | Four cards on the 3/3/3/3 split | 4 x 1–4 | 3 | 2 | content | text | enumeration, comparison, definition | `three-column` | `icon-grid` | standard, dense* |
| `before-after` | Before After | Two states divided by a rule or arrow | 2 x 1–4 | 2 | 2 | content | text | comparison, cause_effect, solution | `statement` | `maturity-stairs` | standard |
| `pros-cons` | Pros Cons | Advantages against disadvantages for one option | 2 x 2–6 | 3 | 2 | content | bullets | comparison, concession, evidence | `side-by-side` | `decisions-needed` | standard, dense* |
| `comparison-table` | Comparison Table | Options as columns, criteria as rows | 2–5 cols x 3–8 rows | 4 | 2 | content | table | comparison, table | `side-by-side` | `harvey-ball-scorecard`, `decisions-needed` | standard, dense* |
| `harvey-ball-scorecard` | Harvey Ball Scorecard | Options scored against criteria with Harvey balls | 3–4 x 6–7 | 4 | 2 | content | table | comparison, evidence, summary | `comparison-table` | `decisions-needed`, `key-takeaway` | standard, dense* |
| `swot-grid` | SWOT Grid | Labelled 2x2 of strengths, weaknesses, opportunities, threats | 4 x 2–5 | 4 | 2 | content | table | comparison, concession, problem, solution | `section-divider` | `two-by-two-matrix` | standard, dense* |
| `checklist-rag` | Checklist RAG | Checklist or RAG-status list | 3–8 | 3 | 2 | content | bullets | enumeration, summary, evidence | `status-table` | `decisions-needed` | standard, dense* |
| `pricing-tiers` | Pricing Tiers | Two to four priced packages as columns | 2–4 | 3 | 2 | content | table | comparison, enumeration | `comparison-table` | `cta-next-steps` | standard, dense* |
| `venn` | Venn | Two to four overlapping sets | 2–4 | 2 | 3 | content | diagram | comparison, definition | `definition` | `two-by-two-matrix` | standard |
| `double-list-central-visual` | Double List Central Visual | Two lists flanking a central image or diagram | 2 x 2–5 | 3 | 3 | content | text | comparison, cause_effect | `side-by-side` | `image-points` | standard, dense* |

---

## Family 5 — `frameworks` (15)

Named conceptual structures. Produces `structure`. Duarte relationship families (Flow, Join, Segment, Network, Stack) are the organising principle (`research/02` #13, `research/03` §(a) 23–31).

| id | name | description | items | d | p | slide_function | shape | accepts | follows | precedes | variants |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `two-by-two-matrix` | Two By Two Matrix | Labelled axes with items plotted in four quadrants | 2 axes + 2–8 items | 3 | 3 | content | diagram | comparison, claim | `scatter-xy-plot`, `swot-grid` | `risk-priority-matrix`, `key-takeaway` | standard |
| `risk-priority-matrix` | Risk Priority Matrix | Likelihood against impact with risks plotted | 3–10 risks | 4 | 3 | content | diagram | problem, comparison, evidence | `two-by-two-matrix` | `decisions-needed` | standard, dense* |
| `pyramid` | Pyramid | Tiered pyramid or temple, base to apex | 3–5 tiers | 2 | 3 | content | diagram | enumeration, claim, summary | `section-divider` | `layer-stack` | standard |
| `funnel` | Funnel | Narrowing stages with volumes | 3–6 stages | 3 | 3 | content | diagram | process, statistic | `chart-dominant` | `journey-map` | standard |
| `cycle-loop` | Cycle Loop | Closed loop of repeating stages | 3–6 | 2 | 3 | content | diagram | process, cause_effect | `process-steps-horizontal` | `hub-and-spoke` | standard |
| `onion-concentric` | Onion Concentric | Concentric rings from core to periphery | 3–5 rings | 2 | 5 | content | diagram | definition, enumeration | `definition` | `target-bullseye` | standard |
| `value-chain` | Value Chain | Chevroned chain of value-adding activities | 3–7 links | 3 | 2 | content | diagram | process, enumeration | `process-steps-horizontal` | `chevron-sequence` | standard |
| `driver-tree` | Driver Tree | Root issue or hypothesis branching to drivers and leaves | 1 root + 2–4 x 2–4 (max 4 per level) | 4 | 4 | content | diagram | problem, cause_effect, evidence | `divider-question` | `chart-insight-callout` | standard, dense* |
| `pillar-diagram` | Pillar Diagram | Pillars standing on a labelled base | 2–5 pillars | 2 | 3 | content | diagram | enumeration, claim | `statement` | `title-body` | standard |
| `iceberg` | Iceberg | Visible surface items over hidden sub-surface causes | 1–3 visible + 2–5 hidden | 3 | 5 | content | diagram | cause_effect, problem, evidence | `statement` | `driver-tree` | standard |
| `layer-stack` | Layer Stack | Horizontal layers stacked base to top | 3–6 layers | 3 | 3 | content | diagram | enumeration, definition, process | `pyramid` | `pipeline-architecture` | standard |
| `target-bullseye` | Target Bullseye | Concentric target with a priority core | 3–4 rings | 2 | 3 | content | diagram | claim, enumeration | `onion-concentric` | `cta-next-steps` | standard |
| `hub-and-spoke` | Hub And Spoke | Central hub radiating to satellites | 1 hub + 3–8 spokes | 3 | 3 | content | diagram | enumeration, definition, cause_effect | `cycle-loop` | `stakeholder-map` | standard, dense* |
| `segment-wheel` | Segment Wheel | Wheel divided into conceptual wedges | 3–6 wedges | 2 | 3 | content | diagram | enumeration | `hub-and-spoke` | `cycle-loop` | standard |
| `convergence-join` | Convergence Join | Two to four inputs merging into one output | 2–4 in + 1 out | 2 | 3 | content | diagram | cause_effect, solution, process | `divergent-convergent-flow` | `statement` | standard |

---

## Family 6 — `process` (16)

Order and time. Produces `sequence`. Family polish default 3 (`research/03` §(d)).

| id | name | description | items | d | p | slide_function | shape | accepts | follows | precedes | variants |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `process-steps-horizontal` | Process Steps Horizontal | Left-to-right numbered steps | 3–6 | 3 | 2 | content | diagram | process | `numbered-list-panel` | `timeline-horizontal` | standard, dense* |
| `process-steps-vertical` | Process Steps Vertical | Top-to-bottom numbered steps with descriptions | 3–6 | 4 | 2 | content | diagram | process, example | `process-steps-horizontal` | `flowchart-decisions` | standard, dense* |
| `timeline-horizontal` | Timeline Horizontal | Dated milestones on a horizontal rail | 3–8 | 3 | 3 | content | diagram | process, statistic | `process-steps-horizontal` | `roadmap-lanes` | standard, dense* |
| `timeline-vertical` | Timeline Vertical | Dated milestones on a vertical rail | 3–8 | 4 | 3 | content | diagram | process, example | `timeline-horizontal` | `roadmap-lanes` | standard, dense* |
| `roadmap-lanes` | Roadmap Lanes | Phases across, workstream lanes down | 2–5 lanes x 3–6 phases | 4 | 3 | content | diagram | process, solution | `timeline-horizontal` | `gantt-chart`, `cta-next-steps` | standard, dense* |
| `pipeline-architecture` | Pipeline Architecture | Boxed components wired left to right | 4–10 nodes | 4 | 4 | content | diagram | process, definition | `layer-stack` | `flowchart-decisions` | standard, dense* |
| `flowchart-decisions` | Flowchart Decisions | Nodes with decision diamonds and branches | 4–10 nodes | 4 | 4 | content | diagram | process, cause_effect, solution | `pipeline-architecture` | `key-takeaway` | standard, dense* |
| `chevron-sequence` | Chevron Sequence | Interlocking chevrons, one per stage | 3–6 | 2 | 2 | content | diagram | process, enumeration | `process-steps-horizontal` | `value-chain` | standard |
| `maturity-stairs` | Maturity Stairs | Ascending steps from current to target state | 3–5 | 3 | 3 | content | diagram | process, solution, comparison | `before-after` | `roadmap-lanes` | standard |
| `timeline-three-layer` | Timeline Three Layer | Phases above the line, milestones on it, risks below | 3–8 milestones | 4 | 3 | content | diagram | process, problem, evidence | `timeline-horizontal` | `risk-priority-matrix` | standard, dense* |
| `gantt-chart` | Gantt Chart | Task rows against a timescale with bars | 4–12 rows | 4 | 3 | content | chart | process, table | `roadmap-lanes` | `cta-next-steps` | standard, dense* |
| `kanban-board` | Kanban Board | Status columns holding cards | 3–4 cols x 2–5 cards | 4 | 3 | content | table | process, enumeration, summary | `status-table` | `decisions-needed` | standard, dense* |
| `calendar-grid` | Calendar Grid | One month grid with dated events | 1 month | 4 | 3 | content | table | process, table | `gantt-chart` | `cta-next-steps` | standard |
| `journey-map` | Journey Map | Stages across, experience rows down | 4–7 x 2–4 | 4 | 4 | content | diagram | process, example, problem | `funnel` | `chart-insight-callout` | standard, dense* |
| `divergent-convergent-flow` | Divergent Convergent Flow | One source fanning out, or many merging in | 1 to 2–4, or 2–4 to 1 | 2 | 3 | content | diagram | cause_effect, process | `process-steps-horizontal` | `convergence-join` | standard |
| `countdown-timer` | Countdown Timer | On-screen timer for a workshop activity | 1 | 1 | 5 | content | number | call_to_action | `title-body` | `bullet-list` | standard, sparse |

---

## Family 7 — `image_people` (17)

Pictures, product and people. Produces `humanize`, `prove`. Family polish default 4 (`research/03` §(d)). `case-study` and `stakeholder-map` sit here because `research/02` places them in "Image & people", though their content is mostly text.

| id | name | description | items | d | p | slide_function | shape | accepts | follows | precedes | variants |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `full-bleed-overlay` | Full Bleed Overlay | Edge-to-edge image with one overlaid line | 1 image + 0–2 lines | 1 | 4 | content | image | figure, claim | `statement` | `section-divider` | standard, sparse |
| `image-hero` | Image Hero | Image band over a text band, roughly 60/40 | 1 image + 1–3 lines | 2 | 4 | content | image | figure, claim | `section-divider` | `image-points` | standard |
| `image-split` | Image Split | Image on one half, text on the other (50/50 or 60/40) | 1 image + 1–5 | 3 | 3 | content | image | figure, example, claim | `title-body` | `image-points` | standard, dense* |
| `image-points` | Image Points | Image beside three or four annotated points | 1 image + 3–4 | 3 | 3 | content | image | figure, enumeration, example | `image-split` | `device-frame` | standard, dense* |
| `image-grid` | Image Grid | 3x2 or 4x3 grid of images | 6–12 | 2 | 4 | content | image | figure, enumeration | `image-hero` | `photo-gallery` | standard, dense* |
| `picture-caption` | Picture Caption | One picture with a caption or lower-third only | 1 image + 1 caption | 1 | 3 | content | image | figure | `full-bleed-overlay` | `image-split` | standard, sparse |
| `icon-grid` | Icon Grid | Grid of icon-and-label cells | 4–12 | 3 | 2 | content | text | enumeration, definition | `four-card-grid` | `logo-wall` | standard, dense* |
| `team-grid` | Team Grid | Head-shots with names and roles | 3–8 | 3 | 3 | content | image | example, enumeration | `section-divider` | `org-chart` | standard, dense* |
| `case-study` | Case Study | Logo, context, action, result, with a supporting image | 3–5 blocks | 4 | 3 | content | image | example, evidence, solution | `statement` | `stat-row`, `logo-wall` | standard, dense* |
| `stakeholder-map` | Stakeholder Map | Actors positioned by influence and interest | 4–12 actors | 4 | 4 | content | diagram | comparison, enumeration | `hub-and-spoke` | `risk-priority-matrix` | standard, dense* |
| `device-frame` | Device Frame | Product screens inside laptop, desktop or phone frames | 1–3 screens | 2 | 4 | content | image | figure, example, solution | `image-points` | `case-study` | standard |
| `logo-wall` | Logo Wall | Grid of customer or partner logos | 6–24 | 2 | 3 | content | image | evidence, enumeration | `case-study` | `stat-row` | standard, dense* |
| `org-chart` | Org Chart | Reporting tree, at most three levels | 1 root + 2–5 per level, max 3 levels | 4 | 4 | content | diagram | enumeration, definition | `team-grid` | `stakeholder-map` | standard, dense* |
| `map-markers` | Map Markers | Geographic map with plotted markers | 1 map + 1–10 markers | 3 | 4 | content | image | figure, statistic, enumeration | `chart-dominant` | `stat-row` | standard |
| `photo-gallery` | Photo Gallery | Three-up or six-up photo strip | 3–6 | 2 | 4 | content | image | figure, example | `image-grid` | `picture-caption` | standard |
| `embed-webview` | Embed Webview | A live web view or embedded frame | 1 frame | 2 | 5 | content | image | figure, example | `device-frame` | `video-full` | standard |
| `video-full` | Video Full | One full-page video | 1 | 1 | 5 | content | image | figure, example | `embed-webview` | `statement` | standard, sparse |

---

## Counts

| Family | Archetypes |
|---|---|
| `structural` | 14 |
| `text` | 13 |
| `numbers` | 17 |
| `comparison` | 12 |
| `frameworks` | 15 |
| `process` | 16 |
| `image_people` | 17 |
| **Total** | **104** |

---

## Recommended sequences per family

Short, reusable runs the planner can drop into a flow slot. They express the `follows_well` / `precedes_well` edges above as concrete chains.

**`structural`**
- Deck open: `title-cover` → `executive-summary-3col` → `agenda-toc` → `section-divider`
- Section hinge: `key-takeaway` → `topic-agenda-tracker` → `section-divider`
- Deck close: `key-takeaway` → `cta-next-steps` → `closing-thank-you` → `qa-slide` → `contact-card` → `appendix-title`
- SCQA hinge: `title-body` (complication) → `divider-question` → `executive-summary-3col`

**`text`**
- Assert then support: `statement` → `title-body` → `bullet-list` → `key-takeaway`
- Frame a term: `definition` → `icon-label-row` → `image-points`
- Humanise: `quote` → `quote-evidence` → `chart-insight-callout`
- Two-sided argument: `two-column-text` → `content-sidebar-callout` (concession) → `decisions-needed`

**`numbers`**
- Headline to proof: `big-number` → `stat-row` → `chart-dominant` → `chart-insight-callout` → `key-takeaway`
- Performance review: `kpi-grid` → `kpi-dashboard` → `waterfall-bridge` → `table-insight`
- Status: `status-table` → `progress-bars` → `decisions-needed`

**`comparison`**
- Narrow the field: `side-by-side` → `three-column` → `comparison-table` → `harvey-ball-scorecard` → `decisions-needed`
- Trade-off: `pros-cons` → `two-by-two-matrix` → `key-takeaway`
- Commercial: `pricing-tiers` → `cta-next-steps`

**`frameworks`**
- Diagnose: `divider-question` → `driver-tree` → `iceberg` → `chart-insight-callout`
- Position: `swot-grid` → `two-by-two-matrix` → `risk-priority-matrix`
- Explain a system: `pyramid` → `layer-stack` → `pipeline-architecture`
- Radiate: `hub-and-spoke` → `segment-wheel` → `stakeholder-map`

**`process`**
- Explain a method: `process-steps-horizontal` → `process-steps-vertical` → `flowchart-decisions`
- Plan: `timeline-horizontal` → `timeline-three-layer` → `roadmap-lanes` → `gantt-chart` → `cta-next-steps`
- Improve: `before-after` → `maturity-stairs` → `roadmap-lanes`
- Customer: `funnel` → `journey-map` → `chart-insight-callout`
- Workshop block: `title-body` (instructions) → `countdown-timer` → `bullet-list` (debrief)

**`image_people`**
- Set the scene: `full-bleed-overlay` → `picture-caption` → `image-split`
- Show the product: `image-points` → `device-frame` → `embed-webview`
- Prove with people: `case-study` → `logo-wall` → `stat-row`
- Introduce the team: `team-grid` → `org-chart` → `stakeholder-map`

---

## Sources

### Research anchors per family

| Family | Baseline | Extensions | Harvest evidence |
|---|---|---|---|
| `structural` | `research/02` #1–11 | `research/03` §(a) 1–4 | `research/05` §1, §2, §4, §6 |
| `text` | `research/02` #12–20 | `research/03` §(a) 5–7, 32, 48 | `research/05` §2, §4 |
| `numbers` | `research/02` #21–30 | `research/03` §(a) 9–17 | `research/05` §4, §5 |
| `comparison` | `research/02` #31–38 | `research/03` §(a) 18–22 | `research/05` §5, §6 |
| `frameworks` | `research/02` #39–46 | `research/03` §(a) 23–31 | `research/02` #13, `research/05` §4 |
| `process` | `research/02` #47–52 | `research/03` §(a) 33–42 | `research/05` §2, §4 |
| `image_people` | `research/02` #53–62 | `research/03` §(a) 8, 43–50 | `research/05` §2, §4, §5 |

### Repos and catalogs, and the archetypes each informed

- **likaku/Mck-ppt-design-skill** (Apache-2.0; `research/02` #1) — the 67-method / 13-family catalog and `layout-matrix.yaml` character budgets that set `maxChars` for **every** archetype; specifically shaped `executive-summary-3col`, `harvey-ball-scorecard`, `chart-insight-callout`, `timeline-three-layer`, `waterfall-bridge`, `marimekko`, `driver-tree`.
- **op7418/guizang-ppt-skill** (AGPL — structure ideas only, quarantined per `research/05`; `research/02` #2) — S01–S22 Swiss layouts behind `title-cover`, `statement`, `stacked-kpi-ledger`, `side-by-side`, `cycle-loop`, `image-grid`, `image-hero`, `closing-thank-you`.
- **lewislulu/html-ppt-skill** (MIT; `research/02` #3) — `title-cover`, `agenda-toc`, `section-divider`, `bullet-list`, `two-column-text`, `three-column`, `quote`, `big-number`, `kpi-grid`, `data-table`, `timeline-horizontal`, `roadmap-lanes`, `comparison-table`, `pros-cons`, `gantt-chart`, `image-hero`, `image-grid`, `chart-dominant`, `process-steps-horizontal`, `cta-next-steps`, `closing-thank-you`.
- **zarazhangrui/frontend-slides**, **beautiful-html-templates**, **archlizheng/frontend-slides-editable** (MIT; `research/02` #4) — the fixed 1920x1080 stage and absolute-positioned object model behind every layout's geometry.
- **dreamid27/frontend-slides** (MIT; `research/05` §4, rank 1) — 88 fixed-canvas presets grouped opening / section / list / stats / chart / closing / video / quote / comparison / timeline / image / agenda / pricing / team / roadmap / risk / spec / gallery / qa / prose / case / definition / process; the primary evidence for `stat-row`, `stacked-kpi-ledger`, `pricing-tiers`, `risk-priority-matrix`, `case-study`, `definition`, `qa-slide`, `photo-gallery`, `team-grid`, `roadmap-lanes`.
- **hugohe3/ppt-master** (MIT; `research/05` §5, rank 2) — `presentation_core` and `editorial_bleed` page types behind `title-body`, `side-by-side`, `content-sidebar-callout`, `picture-caption`, `statement`, `image-split`, `four-card-grid`, `kpi-dashboard`, `timeline-horizontal`, `chart-insight-callout`, `table-insight`, `full-bleed-overlay`, `quote`, `image-grid`, `photo-gallery`, `device-frame`.
- **zcag/tahta** (MIT; `research/05` §2, rank 3) — `agenda-toc`, `statement`, `full-bleed-overlay`, `chart-dominant`, `three-column`, `side-by-side`, `definition`, `pipeline-architecture`, `logo-wall`, `big-number`, `content-sidebar-callout`, `stat-row`, `process-steps-horizontal`, `timeline-horizontal`.
- **jxpeng98/slidev-theme-scholarly** (MIT; `research/05` §2, rank 4) — `agenda-toc`, `side-by-side`, `icon-grid`, `pipeline-architecture`, `comparison-table`, `key-takeaway`, `image-split`, `timeline-horizontal`, `question-slide`.
- **FluidForm-ai/fluiddocs-deck-builder** (MIT; `research/05` §4, rank 5) — typed slide classes that ground the pitch-oriented archetypes `statement`, `case-study`, `pricing-tiers`, `roadmap-lanes`, `team-grid`, `cta-next-steps`, and the flow slots in `spec/flows.md`.
- **presenton/presenton** (Apache-2.0; `research/05` §5) — the per-layout min/max-item pattern applied to the `items` column, plus `title-cover`, `agenda-toc`, `icon-label-row`, `four-card-grid`, `contact-card`.
- **Jorin1222/html-slides-skill** (MIT; `research/05` §4) — `title-cover`, `section-divider`, `two-column-text`, `four-card-grid`, `agenda-toc`, `stat-row`, `before-after`, `case-study`, `closing-thank-you`.
- **Akxan/ppt-agent-skill** (MIT; `research/05` §6) — compositional grammars (asymmetric, L-shape, T-shape, waterfall, three-column, single-focus) that inform the `variants` column rather than individual archetypes.
- **SlideSpeak/slide-design-skill** (MIT; `research/05` §6) — consulting grammar (`executive-summary-3col`, `section-divider`, `three-column`, `image-split`, `chart-insight-callout`, `two-by-two-matrix`, `process-steps-horizontal`, `comparison-table`) and pitch grammar (`statement` problem, `big-number` market, `chart-dominant` traction, `pricing-tiers`, `team-grid`, `comparison-table`, `decisions-needed` ask).
- **WayneZhon/KingDee-PPT-Skill** (MIT, PPTX geometry; `research/05` §6) — `kpi-grid`, `side-by-side`, `process-steps-horizontal`, `image-split`, `timeline-horizontal`, `kpi-dashboard`, `layer-stack`, `icon-label-row`, `full-bleed-overlay`, `before-after`, `quote`.
- **Slidev built-ins and themes** — neversink, apple-basic, shibainu, penguin, gemini, unicorn (MIT; `research/02` #5, `research/05` §2) — `statement`, `quote`, `section-divider`, `title-cover`, `image-split`, `two-column-text`, `photo-gallery`, `image-grid`, `closing-thank-you`, `kanban-board` (gemini `table`), `data-table`.
- **anthropics/skills pptx** (proprietary, read-only; `research/02` #6) — `image-split`, `icon-label-row`, `four-card-grid`, `icon-grid`, `full-bleed-overlay`; also the "never repeat a layout" rule behind the `variants` column.
- **StrategyU 14 consulting layouts** (`research/02` #7, `research/03` §(a) 5, 9, 10, 18, 35, 48) — `chart-insight-callout` (chart two-thirds / takeaway one-third), `kpi-dashboard`, `harvey-ball-scorecard`, `executive-summary-3col`, `timeline-three-layer`, `icon-label-row`, `quote-evidence`.
- **mrigankad/SlideArchitect** (`research/02` #8) — the five-family split that this seven-family tree extends.
- **1weiho/open-slide**, **icgma/slide-skill**, **Kuneosu/make-slide**, **danny0926/ppt-skills** (MIT; `research/02` #9–12) — `title-cover`, `section-divider`, `bullet-list`, `two-column-text`, `big-number`, `quote`, `closing-thank-you`, `image-split`, `process-steps-horizontal`, `icon-grid`, `timeline-horizontal`.
- **Duarte Diagrammer / slide:ology taxonomy** (`research/02` #13) — the Flow, Join, Segment, Network, Stack families behind `divergent-convergent-flow`, `convergence-join`, `segment-wheel`, `hub-and-spoke`, `layer-stack`, `cycle-loop`.
- **Google Slides predefined layouts, PowerPoint built-ins, Keynote themes** (`research/02` #14, `research/03` §(e)) — `title-cover`, `intro-title-meta`, `section-divider`, `section-title-description`, `title-body`, `two-column-text`, `statement` (MAIN_POINT), `big-number` (BIG_NUMBER), `picture-caption` (CAPTION_ONLY), `definition`, `quote`, `agenda-toc`, `topic-agenda-tracker`.
- **Beautiful.ai 62 named smart slides** (`research/03` §(e), §(a) 3, 11–17, 21, 28–29, 32, 37–40, 42–47, 49–50) — `contact-card`, `thermometer-goal`, `pictograph-unit-chart`, `scatter-xy-plot`, `roi-calculator`, `venn`, `target-bullseye`, `hub-and-spoke`, `word-cloud`, `kanban-board`, `calendar-grid`, `journey-map`, `flowchart-decisions`, `countdown-timer`, `device-frame`, `logo-wall`, `org-chart`, `map-markers`, `embed-webview`, `video-full`, `funnel`, `swot-grid`, `gantt-chart`, `team-grid`, `image-grid`.
- **think-cell** (`research/03` §(a) 11, 12, 36) — `waterfall-bridge`, `marimekko`, `gantt-chart`.
- **Infodiagram 18 diagram types** (`research/03` §(a) 22, 24–26, 33–34) — `double-list-central-visual`, `pillar-diagram`, `onion-concentric`, `iceberg`, `chevron-sequence`, `maturity-stairs`.
- **Pitch layout categories** (`research/03` §(e), §(a) 20, 43) — `pricing-tiers`, `device-frame`, `team-grid`, `timeline-horizontal`, `quote`.
- **Gamma card layouts** (`research/03` §(e)) — `title-cover`, `two-column-text`, `timeline-horizontal`, `four-card-grid`, `image-split`, `quote`, `stat-row`, `photo-gallery`, `embed-webview`.
- **Deckary status-deck standards** (`research/03` §(a) 6, 16) — `decisions-needed`, `status-table`, `checklist-rag`.
- **Slideworks / Analyst Academy** (`research/03` §(a) 4, 23; §(b) 1) — `divider-question`, `driver-tree`.
- **hs150521/Endfield-PPT-Template** (`research/05` §7) — the ten-page named set that confirms the emit shape for `title-cover`, `agenda-toc`, `section-divider`, `title-body`, `image-split`, `kpi-dashboard`, `comparison-table`, `timeline-horizontal`, `quote`, `closing-thank-you`.
- **WebSlides**, **niujingjingbfsu/slides-design-systems**, **ChenChen913/html-presentation-v1**, **v0id-byte/peg-design-system** (MIT; `research/05` §1, §4) — secondary composition evidence for `big-number`, `stat-row`, `pricing-tiers`, `image-split`, `full-bleed-overlay`, `logo-wall`.

### Conflicts resolved

| Conflict | Resolution |
|---|---|
| `research/02` #43 places **Venn** in `frameworks`; `research/03` §(a) 21 places it in `comparison` | `comparison` — the later survey, and the layout's job is set overlap |
| `research/02` #15 places **Quote + evidence** in single-idea text; `research/03` §(a) 19 places it in `comparison` | `text` — it is a humanising assertion, not an evaluation of alternatives |
| `research/02` #45 "Concentric system diagram" and `research/03` §(a) 25 "Onion / concentric" | Merged into `onion-concentric` |
| `research/02` #46 "Value chain / chevrons" and `research/03` §(a) 33 "Chevron sequence" | Split: `value-chain` (frameworks, a named business structure) and `chevron-sequence` (process, a generic ordered form) |
| `research/02` #52 bundles "Pipeline / architecture / decision tree"; `research/03` §(a) 40 adds "Flowchart w/ decisions" | Split into `pipeline-architecture` and `flowchart-decisions`; the decision-tree case folds into the latter |
| `research/02` #36 bundles "Comparison table / scorecard / Harvey balls" | Split into `comparison-table` and `harvey-ball-scorecard`, which has its own 3–4 x 6–7 cardinality (`research/03` §(a) 18) |
| `research/02` #11 "Q&A / contact" and `research/03` §(a) 3 "Contact / Thank-you" | Split into `qa-slide` and `contact-card`; the thank-you half is `closing-thank-you` |
| `research/02` #58 "Picture with caption" and `research/03` §(a) 8 "Caption-only / full-bleed with lower-third" | Merged into `picture-caption`; the full-bleed case is `full-bleed-overlay` |
| `research/03` §(a) 32 files **Word cloud** under "text/frameworks" | `text` — it renders a term set, not a relationship |
