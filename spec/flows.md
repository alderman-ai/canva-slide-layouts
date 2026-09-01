# spec/flows.md — the ten flow templates and the budgeting algorithm

Read this when planning a deck (`deck-decompose`, `slides.ps1 plan`) or when adding a term to `spec/vocab/flow_template.json`. The numeric half of planning is `spec/rubrics.md`; the archetype ids used in every slot table are defined in `spec/taxonomy.md`.

Flow templates come from `research/03` §(b), verbatim in structure, re-expressed here as slot tables. Slot names are lowercase kebab-case and stable.

**Reading a slot table.** `required?` is one of `required` (the flow is invalid without it), `conditional` (a stated rule decides), `optional` (planner includes it if budget allows), `repeat` (the slot recurs; the multiplier is stated). `expected unit types` are `unit_type` values from `research/06` §(b) Layer 2, the same enum used by `accepts_unit_types` in `spec/taxonomy.md`.

---

## Purpose to flow mapping

`purpose` is a deck-brief dial. The values are the twelve in `spec/vocab/purpose.json` plus `perform`, added for the rapid talk; each `purpose` entry names the same default in its `examples`, so this table and the vocabulary must agree. Every `purpose` value has a row.

| `purpose` | Default flow | Alternates |
|---|---|---|
| `recommend` | `scqa_pyramid` | `slidedoc` |
| `fundraise` | `sequoia_pitch` | `kawasaki_10_20_30`, `slidebean_3act` |
| `pitch_short` | `kawasaki_10_20_30` | `sequoia_pitch`, `slidebean_3act` |
| `sell` | `slidebean_3act` | `sequoia_pitch` |
| `inspire` | `duarte_sparkline` | `takahashi_lessig` |
| `teach` | `gagne_teaching` | `workshop` |
| `report_status` | `status_update` | `scqa_pyramid` |
| `facilitate` | `workshop` | `gagne_teaching` |
| `document` | `slidedoc` | `scqa_pyramid` |
| `inform` | `slidedoc` | `gagne_teaching`, `status_update` |
| `launch` | `slidebean_3act` | `duarte_sparkline`, `sequoia_pitch` |
| `provoke` | `takahashi_lessig` | `duarte_sparkline` |
| `perform` | `takahashi_lessig` | `duarte_sparkline` |

---

## 1. `scqa_pyramid` — SCQA / Minto pyramid consulting deck

**Length** 20–60 slides · **Pace** 30–60 min presented, or read · **Default density** 4 (`consulting`) · **Purpose** `recommend`, `document`

Rule from `research/03` §(b)1: the action titles alone must carry the argument (the "title test"); the Resolution is 60–70% of the executive summary's text; the Situation slide contains nothing controversial.

| slot | archetypes allowed | expected unit types | required? |
|---|---|---|---|
| `cover` | `title-cover`, `intro-title-meta` | claim | required |
| `executive-summary` | `executive-summary-3col`, `key-takeaway` | problem, evidence, solution, summary | required |
| `situation` | `title-body`, `section-title-description`, `big-number`, `chart-dominant` | definition, evidence | required |
| `complication` | `statement`, `chart-insight-callout`, `waterfall-bridge`, `iceberg` | problem, cause_effect | required |
| `question` | `divider-question`, `statement` | problem, claim | optional |
| `agenda` | `agenda-toc` | enumeration | conditional (>=4 pillars) |
| `pillar-section` | `section-divider`, `topic-agenda-tracker` | summary | repeat, once per pillar |
| `pillar-evidence` | `chart-insight-callout`, `harvey-ball-scorecard`, `table-insight`, `data-table`, `comparison-table`, `driver-tree`, `two-by-two-matrix`, `timeline-three-layer`, `risk-priority-matrix` | evidence, statistic, comparison, cause_effect, chart_data, table | repeat, 3–6 per pillar |
| `pillar-takeaway` | `key-takeaway` | summary | optional, once per pillar |
| `recommendation` | `cta-next-steps`, `roadmap-lanes`, `gantt-chart`, `decisions-needed` | solution, call_to_action | required |
| `close` | `closing-thank-you`, `qa-slide`, `contact-card` | call_to_action | optional |
| `appendix` | `appendix-title`, `data-table`, `table-insight`, `chart-dominant` | table, evidence, chart_data | optional |

---

## 2. `sequoia_pitch` — Sequoia pitch deck

**Length** 10 core, 12–15 with adds · **Pace** 20 min · **Default density** 2–3 · **Purpose** `fundraise`, `sell`

| slot | archetypes allowed | expected unit types | required? |
|---|---|---|---|
| `title` | `title-cover` | claim | required |
| `company-purpose` | `statement` | claim | required |
| `problem` | `bullet-list` (1–4), `statement`, `before-after` | problem | required |
| `traction-teaser` | `chart-dominant`, `stat-row`, `big-number` | statistic, evidence | conditional (traction is strong) |
| `solution` | `statement`, `image-points`, `device-frame` | solution | required |
| `why-now` | `timeline-horizontal`, `timeline-three-layer` | cause_effect, process | required |
| `market-size` | `big-number`, `layer-stack` (TAM stack), `funnel` | statistic | required |
| `competition` | `two-by-two-matrix`, `harvey-ball-scorecard`, `comparison-table` | comparison | required |
| `product` | `device-frame`, `image-points`, `image-grid`, `embed-webview` | figure, example | required |
| `business-model` | `pipeline-architecture`, `data-table`, `pricing-tiers`, `divergent-convergent-flow` | process, table | required |
| `team` | `team-grid` | example, evidence | required |
| `financials` | `chart-dominant`, `data-table`, `waterfall-bridge` | chart_data, statistic | required |
| `gtm` | `process-steps-horizontal`, `funnel`, `journey-map` | process | optional |
| `ask` | `decisions-needed`, `cta-next-steps` | call_to_action | optional |

---

## 3. `kawasaki_10_20_30` — Kawasaki 10/20/30

**Length** exactly 10 slides · **Pace** 20 min · **Default density** 2 (`talk`); the 30 pt floor is a **60 px** body minimum (`spec/rubrics.md` §1, `spec/type-scale.md` §1) · **Purpose** `pitch_short`, `fundraise`

Every slot is `required` and appears exactly once — the flow's whole point is the fixed count.

| slot | archetypes allowed | expected unit types | required? |
|---|---|---|---|
| `title` | `title-cover` | claim | required |
| `problem-opportunity` | `statement`, `bullet-list`, `big-number` | problem | required |
| `value-proposition` | `statement`, `icon-label-row` | solution, claim | required |
| `underlying-magic` | `pipeline-architecture`, `device-frame`, `layer-stack`, `image-points` | definition, solution, figure | required |
| `business-model` | `pricing-tiers`, `divergent-convergent-flow`, `data-table` | process, table | required |
| `go-to-market` | `process-steps-horizontal`, `funnel`, `map-markers` | process | required |
| `competitive-analysis` | `two-by-two-matrix`, `comparison-table`, `harvey-ball-scorecard` | comparison | required |
| `management-team` | `team-grid` | example, evidence | required |
| `financial-projections` | `chart-dominant`, `kpi-grid`, `data-table` | chart_data, statistic | required |
| `status-timeline-use-of-funds` | `timeline-horizontal`, `roadmap-lanes`, `cta-next-steps` | process, call_to_action | required |

---

## 4. `slidebean_3act` — Slidebean three-act pitch

**Length** 15–22 slides · **Pace** pitch pace, 10–20 min (`spec/rubrics.md` §4) · **Default density** 2–3 · **Purpose** `sell`, `launch`, `fundraise`

| slot | archetypes allowed | expected unit types | required? |
|---|---|---|---|
| `act1-cover` | `title-cover` (tagline 5–7 words) | claim | required |
| `act1-traction-teaser` | `big-number`, `stat-row`, `chart-dominant` | statistic, evidence | required |
| `act1-problem` | `statement`, `bullet-list`, `iceberg` | problem | required |
| `act1-market-overview` | `chart-dominant`, `big-number`, `map-markers` | statistic, evidence | required |
| `act2-solution` | `statement`, `image-split` | solution | required |
| `act2-product` | `device-frame`, `image-points` | figure, example | repeat, 1–2 |
| `act2-how-it-works` | `process-steps-horizontal`, `process-steps-vertical`, `pipeline-architecture` | process | required |
| `act2-target-audience` | `four-card-grid`, `journey-map`, `icon-label-row` | definition, enumeration | required |
| `act2-case-study` | `case-study`, `quote-evidence` | example, evidence | required |
| `act2-business-model` | `pricing-tiers`, `divergent-convergent-flow` | process, table | required |
| `act2-roadmap` | `roadmap-lanes`, `timeline-horizontal` | process | required |
| `act3-traction` | `chart-dominant`, `kpi-grid` | statistic, chart_data | required |
| `act3-unit-economics` | `waterfall-bridge`, `data-table`, `stat-row` | statistic, cause_effect | required |
| `act3-gtm` | `process-steps-horizontal`, `funnel` (2–3 channels) | process | required |
| `act3-tam` | `layer-stack`, `big-number` | statistic | required |
| `act3-competition` | `two-by-two-matrix`, `comparison-table` | comparison | required |
| `act3-secret-sauce` | `statement`, `pillar-diagram` | claim, solution | optional |
| `act3-team` | `team-grid` | example | required |
| `act3-financials` | `chart-dominant`, `data-table` | chart_data | required |
| `act3-ask` | `decisions-needed`, `cta-next-steps` | call_to_action | required |

---

## 5. `duarte_sparkline` — Duarte sparkline keynote

**Length** 18–40 slides · **Pace** 18–45 min at **1–3 slides/min** · **Default density** 1–2 (`cinematic` / `talk`) · **Purpose** `inspire`

| slot | archetypes allowed | expected unit types | required? |
|---|---|---|---|
| `title` | `title-cover` | claim | required |
| `what-is` | `statement`, `full-bleed-overlay`, `picture-caption` | definition, claim | required |
| `call-to-adventure` | `big-number`, `before-after`, `statement` | problem, statistic | required |
| `gap-pair` | `what is`: `statement`, `quote`, `picture-caption`, `big-number` / `what could be`: `statement`, `full-bleed-overlay`, `before-after`, `image-hero` | problem, solution, quote, statistic, figure | repeat, 3–5 pairs |
| `call-to-action` | `statement`, `cta-next-steps` | call_to_action | required |
| `new-bliss` | `full-bleed-overlay`, `image-hero` | figure, claim | required |

---

## 6. `gagne_teaching` — Gagne nine events, one module

**Length** 10–20 slides per module · **Pace** 1 slide per 1–2 min · **Default density** 3 (`briefing`) · **Purpose** `teach`

| slot | archetypes allowed | expected unit types | required? |
|---|---|---|---|
| `hook` | `big-number`, `full-bleed-overlay`, `question-slide` | statistic, problem, figure | required |
| `objectives` | `bullet-list` (3–4) | enumeration, summary | required |
| `recall-prompt` | `question-slide`, `definition` | definition, problem | required |
| `concept` | `definition` + `layer-stack`, `cycle-loop`, `pipeline-architecture`, `venn` | definition, cause_effect | required |
| `worked-example` | `process-steps-vertical`, `image-points`, `data-table`, `chart-insight-callout` | example, process, chart_data | required |
| `guided-case` | `case-study`, `quote-evidence` | example, evidence | required |
| `practice-instructions` | `numbered-list-panel`, `title-body` | call_to_action, process | required |
| `activity-timer` | `countdown-timer` | call_to_action | optional |
| `feedback-reveal` | `statement`, `bullet-list`, `before-after` | solution, summary | required |
| `quiz-check` | `question-slide`, `checklist-rag` | problem, enumeration | required |
| `recap` | `key-takeaway` | summary | required |
| `action-plan` | `cta-next-steps` | call_to_action | required |

---

## 7. `status_update` — Project status update

**Length** 4–6 slides · **Pace** read; **<=30 s exec scan per slide** · **Default density** 4 (`consulting`) · **Purpose** `report_status`

| slot | archetypes allowed | expected unit types | required? |
|---|---|---|---|
| `header-overall-rag` | `title-cover`, `key-takeaway` | summary, claim | required |
| `rag-table` | `status-table` (<=5–7 workstreams), `checklist-rag` | table, comparison, summary | required |
| `milestones` | `timeline-horizontal`, `gantt-chart`, `roadmap-lanes` | process | required |
| `accomplishments` | `bullet-list` (2–4), `stat-row` | evidence, summary | required |
| `upcoming` | `bullet-list` (2–4), `kanban-board` | process, enumeration | required |
| `risks-issues` | `risk-priority-matrix` (2–4), `status-table` | problem, evidence | required |
| `decisions-needed` | `decisions-needed` | call_to_action, solution | required |

Dimensions scored in the RAG table (`research/03` §(b)7): schedule, budget, scope, resources, quality.

---

## 8. `workshop` — Facilitated workshop

**Length** 15–30 slides per 2 h · **Pace** 40–80 slides per 1–4 h; **an activity every 15–20 min** · **Default density** 2–3 · **Purpose** `facilitate`

| slot | archetypes allowed | expected unit types | required? |
|---|---|---|---|
| `welcome` | `title-cover` | claim | required |
| `objectives` | `bullet-list` | enumeration, summary | required |
| `agenda-with-times` | `agenda-toc`, `calendar-grid`, `timeline-horizontal` | enumeration, process | required |
| `icebreaker` | `question-slide`, `statement` | problem | optional |
| `block-framing` | `title-body`, `definition`, `icon-label-row`, `image-points` | definition, claim, example | repeat, <=3 slides per block |
| `block-activity-instructions` | `numbered-list-panel`, `process-steps-vertical` | call_to_action, process | repeat, once per block |
| `block-timer` | `countdown-timer` | call_to_action | repeat, once per block |
| `block-debrief` | `question-slide`, `bullet-list` | problem, summary | repeat, once per block |
| `parking-lot` | `bullet-list` | enumeration | optional |
| `key-takeaways` | `key-takeaway` | summary | required |
| `next-steps-feedback` | `cta-next-steps`, `contact-card` | call_to_action | required |

---

## 9. `slidedoc` — Executive-summary-first read-deck (slidedoc)

**Length** 10–30 pages · **Pace** none — unpresented, governed by page count · **Default density** 5 (`slidedoc`; 100 words target, 250 max) · **Purpose** `document`, `inform`, `recommend`

| slot | archetypes allowed | expected unit types | required? |
|---|---|---|---|
| `cover` | `title-cover`, `intro-title-meta` | claim | required |
| `exec-summary` | `executive-summary-3col` | problem, evidence, solution, summary | required |
| `contents` | `agenda-toc` | enumeration | required |
| `topic-section` | `section-title-description` | definition, summary | repeat, once per topic |
| `topic-page` | `content-sidebar-callout`, `table-insight`, `chart-insight-callout`, `two-column-text`, `image-split`, `data-table` | evidence, claim, chart_data, table, example | repeat, 2–4 per topic |
| `recommendations` | `cta-next-steps`, `decisions-needed`, `key-takeaway` | solution, call_to_action | required |
| `appendix` | `appendix-title`, `data-table`, `chart-dominant` | table, chart_data, evidence | optional |

---

## 10. `takahashi_lessig` — Takahashi / Lessig rapid talk

**Length** 60–200 slides · **Pace** **3–5 slides/min** · **Default density** 1 (`cinematic`, <=6 words) · **Purpose** `perform`, `provoke`, `inspire`

**No bullets.** One word, phrase or image per slide, synchronised to speech.

| slot | archetypes allowed | expected unit types | required? |
|---|---|---|---|
| `title` | `title-cover` | claim | required |
| `beat` | `statement`, `big-number`, `full-bleed-overlay`, `picture-caption`, `question-slide`, `word-cloud` | claim, statistic, figure, problem, quote | repeat, 60–200 |
| `close` | `statement`, `closing-thank-you` | call_to_action, summary | optional |

---

## Budgeting algorithm

The planner's outline stage. Runs after parse and before layout selection, matching the converged pipeline order **parse, outline (review gate), layout selection, fill, render** (`research/06` §(d)).

### Step 1 — Length budget

```
if delivery_mode == read-deck:
    target_slides = brief.target_pages                 # pace does not apply (spec/rubrics.md §4)
else:
    target_slides = length_minutes * pace(deck_type)   # spec/rubrics.md §4
clamp target_slides into the flow template's length range
```

Cross-checks available when the brief is thin (`research/06` §(d)): ~1 slide/min for talks; ~2 min/slide for business decks (10 min to 5, 20 to 10, 30 to 15, 60 to 25, +/- 3–8); source length 3,000–8,000 words maps to 5–10 slides (PresentAgent); the DOC2PPT corpus mean is 16.8 slides per deck.

### Step 2 — Structural slots first

Allocate every `required` structural slot in the flow (cover, exec summary, contents, recommendation, close) before any body content is placed. Two rules, both from `research/06` §(d):

- **Agenda rule.** Include the `agenda` slot (`agenda-toc`) when the deck has **>=4 sections**. Below that, drop it — an agenda for three sections costs a slide and earns nothing.
- **Section-divider rule.** Insert a `section-divider` at each top-level heading **when that section yields >=2 content slides and the deck has >=3 sections**. `research/06` §(d) records that no published numeric rule exists; this is the practical rule consistent with the corpus priors and with `END_SEC` in DOC2PPT's three-level policy.

`topic-agenda-tracker` may replace `section-divider` from the second section onward when the flow's density is <=3.

### Step 3 — Body budget

```
body_budget = target_slides - count(allocated structural slots)
```

Distribute `body_budget` across sections in proportion to their unit count weighted by `importance`, with the DOC2PPT prior **~2.4 slides per section** (16.8 / 6.99) as the starting allocation and the floor. A section whose share rounds below 1 is merged into its neighbour.

### Step 4 — Fill body slots

Walk the flow's body slots in order. For each slot, score every allowed archetype and take the best:

1. `accepts_unit_types` intersects the slot's expected unit types and the bound units' `unit_type` (hard filter).
2. Unit count fits the archetype's `items` min–max (hard filter).
3. `polish_cost` <= the brief's `polish` cap: `quick` <= 2, `standard` <= 3, `premium` any (`spec/rubrics.md` §3.2, hard filter).
4. `density` within +/-1 of the deck density and never above it (`spec/rubrics.md` §2, hard filter).
5. `content_shape` matches the units' `shape` (score).
6. Previous slide's `precedes_well` contains this id, or this id's `follows_well` contains the previous (score).
7. Repetition penalty: the same archetype used on the immediately preceding slide, or more than three times in a row within a section, is penalised.

### Step 5 — Fit check and overflow

Validate each provisional slide against the archetype's `items` bounds and each element's `maxChars` (`spec/type-scale.md` §3). On overflow apply `spec/rubrics.md` §6 in order: **split**, then substitute a larger same-family archetype, then bind the `dense*` variant, then drop the lowest-`importance` unit. Never shrink type below the density level's min body px; never raise the slide's density above the deck level.

### Step 6 — Rebalance and dedup

- Over budget by more than 10%: drop `optional` slots in reverse priority (`appendix`, `parking-lot`, `topic-agenda-tracker`, `pillar-takeaway`, `close` extras), then merge adjacent same-archetype slides.
- Under budget by more than 10%: promote `optional` slots, then split the densest slides (segmenting is always preferred to padding).
- Merge any pair of slides overlapping **>=80%** — DOC2PPT treats those as animation builds and removes them (`research/06` §(d)).

### Step 7 — Emit

Write `presentations/<slug>/plan.md`: frontmatter `flow_template`, `target_slides`, `density`, `polish`, `layout_sequence[]`; body table `slide | layout | units | fit | note`, plus the fit report (overflow, dropped units, budget math). This is the outline review gate — the operator edits it before any fill happens.

---

## Sources

- `research/03` §(b) — all ten flow templates, their slot orders, target lengths, pace figures and per-flow rules (title test, Resolution 60–70%, 30 pt floor, activity every 15–20 min, no bullets in the rapid talk).
- `research/03` §(c) — pace norms and the delivery-mode to density rule used in Steps 1 and 4.
- `research/03` §(d) — the polish cap applied in Step 4.
- `research/06` §(b) — the `unit_type` enum used in every "expected unit types" column, and the `slide_function` values behind the slot names.
- `research/06` §(c) — Presenton's per-layout min/max pattern, applied as the hard item-count filter in Step 4.
- `research/06` §(d) — decomposition priors, the agenda and section-divider rules (Step 2), the ~2.4 slides-per-section allocation (Step 3), the >=80% overlap merge (Step 6), and the pipeline order.
- `research/05` §4–§6 — narrative decks and slot grammars (FluidForm-ai/fluiddocs-deck-builder typed slide classes, SlideSpeak/slide-design-skill consulting and pitch grammars) that corroborate the slot names used here.
- `spec/taxonomy.md` — every archetype id in the tables above.
