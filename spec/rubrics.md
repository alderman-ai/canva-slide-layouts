# spec/rubrics.md — density, polish cost, pace, decomposition priors, overflow

Read this before planning a deck (`deck-decompose`), before assigning `density` / `polish_cost` to a new layout, and whenever a fit report says a slide overflows. It is the numeric half of the planner; the structural half is `spec/flows.md`.

Every number below is cited to `research/03` or `research/06`. Point sizes are converted at **1 pt = 2 px** (`research/04` §(c), restated in `spec/type-scale.md` §1). Where a research file gives no number, the cell says **unverified**.

---

## 1. Density rubric (levels 1–5)

`vocab/density.json` values, in level order 1-5: `cinematic`, `talk`, `briefing`, `consulting`, `slidedoc`. The frontmatter key `density` stores the **number** 1-5 so Obsidian can sort it; the vocabulary entry is the definition (`spec/schema.md` §Deliberate departures).

| Level | Name | Info units / slide | Words / slide | Lines of text | Min body px | Slides / min |
|---|---|---|---|---|---|---|
| **1** | `cinematic` | 1 idea; 1 visual + <=1 line | **<=6** | **<=2** | **84** (42 pt) | **2–5** |
| **2** | `talk` | 1 idea; **<=3** chunks | **<=25** | **<=6** | **60** (30 pt) | **1–2** |
| **3** | `briefing` | 1 message; **<=4** bullets x **<=4** units each; **<=4** items per tree level | **40–60** | <=8 (4 bullets x <=2 lines) | **40** (20 pt) | **0.5–1** (1 slide per 1–2 min) |
| **4** | `consulting` | 1 action title (<=15 words; McKinsey <=8) + **2–4** supporting points | **60–100** | title <=2 lines + 2–4 points | **28–32** (14–16 pt) | **1** (60 s presented) or read |
| **5** | `slidedoc` | multi-paragraph; several figures | **100 target, 250 max** (over 250 words, write a document instead) | uncapped | **unverified**; use the read-deck body 32 px (`research/04` §(c)) | **n/a** (not presented) |

Level-4 structural caps, also from `research/03` §(c): executive summary **3 columns x 4–5 lines**; dashboard **4–6 tiles**; Harvey-ball scorecard **3–4 options x 6–7 criteria**; process **<=4–5 steps**.

Level-3 grounding: Kosslyn "rule of four" and the 20 pt floor; Cowan ~4 chunks; the 6x6 rule read only as a 36-word ceiling. `research/03` § "Notes and gaps" records that 6x6 / 7x7 have **no research origin** — Kosslyn, Cowan and Mayer are the defensible basis for level 3. A cross-check from `research/06` §(d): **<=6 elements per slide** (PLOS Rule 7), one idea per slide, title = full-sentence takeaway (PLOS Rule 3).

Levels 1–3 for spoken delivery are further justified by Mayer redundancy / coherence / signaling / segmenting principles, which also forbid verbatim narration of on-screen text (`research/03` §(c)).

## 2. Delivery mode to default density

Script rule `level = f(mode)` (`research/03` §(c), closing paragraph):

| `delivery_mode` (`spec/vocab/delivery_mode.json`) | Default density | Type-scale column (`spec/type-scale.md` §2) |
|---|---|---|
| `live-talk` (keynote, conference, rapid talk) | **<=2** | live-talk |
| `briefing` / `teaching` | **3** | live-talk |
| `consulting` (and any deck for the `board` audience) | **4** | read-deck |
| `read-deck` (slidedoc, leave-behind) | **5** | read-deck |
| `workshop` | **3** | live-talk |
| `pitch` | **2** | live-talk |

The first four rows are the script rule verbatim. The last two complete the enum from `spec/vocab/density.json`, whose `examples` name them: `briefing` is the "default for delivery_mode briefing, teaching and workshop", `talk` the "default for delivery_mode live-talk and pitch".

The deck brief sets `density` explicitly or inherits it from `delivery_mode`. A layout's own `density` is its *natural* level; the planner may bind a layout whose density is within +/-1 of the deck level, and must not bind one above it.

---

## 3. Polish-cost rubric (levels 1–5)

`vocab/polish.json` values, in level order 1–5: `typography_only`, `type_primitives`, `chart_or_photo`, `curated_imagery`, `bespoke`. The frontmatter key `polish_cost` stores the **number** 1–5; the brief's separate `polish` dial (`quick` \| `standard` \| `premium`) caps it. Anchored on agency redesign tiers: fix-up USD 16 / redesign USD 43 / redraw USD 66 per slide, with data-viz and infographic slides costing 30–60% more and custom illustration +20–50% (`research/03` §(d)).

| Cost | Definition | Family defaults (`research/03` §(d)) |
|---|---|---|
| **1** | Typography only; looks finished with the type scale and spacing alone | **structural** (title, section, agenda, statement, big number, quote) and **text** (bullets, two-column text, definition) |
| **2** | Typography + primitives drawn in markup: icons, rules, cards, RAG dots | **comparison** tables, icon rows, pricing, Harvey ball, exec summary, simple chevrons |
| **3** | Needs a real chart engine or a supplied photo; alignment-sensitive | **numbers** (bar / line / pie / waterfall / scatter), timeline, Gantt, image+text, team grid, logo grid |
| **4** | Needs curated / high-res imagery or a multi-element diagram | full-bleed photo, photo 3-up, device mockups, maps, org chart, trees, journey map, Marimekko, dashboards |
| **5** | Bespoke illustration or infographic, animation, video, or a live embed | infographic, pictograph, word cloud, full video, webview, ROI calculator, iceberg / onion metaphors |

Rationale carried from `research/03` §(d): text-only slides are "considerably" cheaper; cost climbs with dependence on external assets (photos), rendering engines (charts) and hand-drawn composition (diagrams, infographics). The Kosslyn compatibility principle means a *wrong* chart form is a visible defect, so the numbers family carries a higher failure risk than the text family at the same nominal cost.

### 3.1 Per-family defaults used by `spec/taxonomy.md`

| Family | Default `polish_cost` | Typical range in the family |
|---|---|---|
| `structural` | 1 | 1–2 |
| `text` | 1 | 1–5 (word cloud is 5) |
| `numbers` | 3 | 1–5 |
| `comparison` | 2 | 2–3 |
| `frameworks` | 3 | 2–5 |
| `process` | 3 | 2–4 |
| `image_people` | 4 | 3–5 |

### 3.2 The `polish` dial caps `polish_cost`

`docs/PLAN.md` § "Specs carried over": `quick` <= 2, `standard` <= 3, `premium` = any. The planner drops or substitutes any archetype whose `polish_cost` exceeds the cap.

---

## 4. Pace norms

Used for the length budget in `spec/flows.md` § "Budgeting algorithm".

| Deck type | Slides | Duration | Slides / min |
|---|---|---|---|
| Pitch | 10–15 | 10–20 min | ~0.75–1.5 |
| Conference talk | ~1 per minute | — | ~1 |
| Lecture | 20–45 | 45–90 min | ~0.5 |
| Workshop | 40–80 | 1–4 h | ~0.3–0.7 |
| Webinar | 30–55 | 30–60 min | ~1 |
| Read-deck | 10–30 pages | no pace | n/a (governed by page count) |

Source: `research/03` §(c) closing paragraph (SlideEgg, Envato, Lethbridge), plus `docs/PLAN.md` § "Specs carried over" for the read-deck row.

Cross-checks from `research/06` §(d): ~1 slide / min for talks (PLOS Rule 2, "a 20-minute presentation should have somewhere around 20 slides"); ~2 min / slide for business decks (10 min to 5 slides, 20 to 10, 30 to 15, 60 to 25, +/- 3–8); speaking rate **100–150 wpm**; Kawasaki 10 slides / 20 min / 30 pt.

---

## 5. Decomposition priors

All from `research/06` §(d). The planner uses these to size the deck before it places anything.

| Prior | Value | System |
|---|---|---|
| Slides per deck | **16.8** | DOC2PPT corpus (Table 1) |
| Sentences per slide | **8.1** | DOC2PPT |
| Figures per deck | **2.5** | DOC2PPT |
| Sections per source document | **6.99** | DOC2PPT |
| **Slides per section** | **~2.4** (16.8 / 6.99) | DOC2PPT, derived |
| Words per slide sentence vs source sentence | **11.6 vs 17.3**, paraphrase compression **~0.67** | DOC2PPT |
| Animation-build detection | slides with **>=80%** overlap with their predecessor are treated as builds and removed | DOC2PPT |
| Text compression | 12,155 words to 774 words = **14.4x** | Paper2Poster |
| Figure compression | 22.6 figures to 8.7 figures = **2.6x** | Paper2Poster |
| Layout method | binary-tree split sized by word count and figure aspect ratio | Paper2Poster |
| Document length to slide count | **3,000–8,000 words to 5–10 slides** | PresentAgent |
| Narration per slide | **30–150 s** | PresentAgent |
| Generation caps seen in products | 5–10 recommended (presentation-ai); 10 free / 100 paid (Gamma) | `research/06` §(d) |

**Section-divider rule** (`research/06` §(d)): no published numeric rule exists. The practical rule consistent with the priors, adopted here: insert a `section-divider` at each top-level heading **when that section yields >=2 content slides and the deck has >=3 sections**; add an `agenda-toc` **when the deck has >=4 sections**.

**Pipeline order** (converges across PPTAgent, Presenton, banana-slides and presentation-ai, `research/06` §(d)): parse, outline (review gate), per-slide layout selection, fill, render.

---

## 6. Overflow rule

**Split before you raise density.** When bound content exceeds the layout `max_items` or any element `maxChars` (`spec/type-scale.md` §3), the planner:

1. **Splits** the slide into two slides of the same archetype (segmenting — Mayer, `research/03` §(c)); or
2. **substitutes** a same-family archetype with a larger `max_items` (for example `kpi-grid` to `kpi-dashboard`, `bullet-list` to `two-column-text`); or
3. **binds the dense variant** of the archetype where one exists (the `dense*` entries in the `variants` column of `spec/taxonomy.md`); or
4. **drops** the lowest-`importance` unit and records it in the fit report.

It never reduces a font size below the level **min body px** (§1), and never raises the slide `density` above the deck level (§2). `research/03` §(c) states the rule directly: "Overflow triggers a split (segmenting) before density is raised."

Corollary from `research/06` §(d): if a split would produce two slides that overlap >=80%, merge them back and drop instead.

---

## Sources

- `research/03` §(c) — density rubric levels 1–5, the delivery-mode script rule, pace norms, the overflow/segmenting rule, and the note that 6x6 / 7x7 are folklore.
- `research/03` §(d) — polish-cost rubric, agency price anchors, per-family defaults, the chart-form failure-risk note.
- `research/06` §(d) — decomposition priors (DOC2PPT, Paper2Poster, PresentAgent), slides-per-minute cross-checks, <=6 elements per slide, section-divider and agenda rules, pipeline order.
- `research/04` §(c) — the 1 pt = 2 px conversion used for every "min body px" cell.
- `docs/PLAN.md` § "Specs carried over" — the `polish` dial caps and the read-deck pace row.
