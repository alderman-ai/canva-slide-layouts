# Canva Slide System — Plan (approved 2026-09-02)

> status: in execution · steps 0-1 complete (handover, foundation) · next: step 2 probe
> superseded source: ~/.claude/plans/this-directory-will-be-modular-beacon.md

## Changelog

- 2026-09-02 · plan approved after five research passes and four scope refinements; copied here verbatim.
- 2026-09-02 · step 0 (handover) and step 1 (foundation) executed; see docs/WORKLOG.md. Naming convention added as Decision 15.

---

# Canva Slide System — Markdown-first plan (v4)

## Context

`C:\Users\alder\Desktop\Canva templates` is empty. It becomes a git repo and an Obsidian vault that does three jobs:

1. **Layout library**: one hybrid MD file per slide layout (flat frontmatter for retrieval, element table for geometry), with HTML generated from it. Layouts are the *class* library.
2. **Ontology and controlled vocabulary**: a formal schema for layouts, slides, content units, and flows, so a script and a Claude Code session can both retrieve layouts by typed attributes and map content to them deterministically.
3. **Presentation projects**: a per-deck directory holding the brief, all local context files, the extracted content units, the deck plan, and one filled hybrid MD per slide (the *instances*). The whole finished deck is then batch-uploaded to Canva within MCP constraints, leaving only redlining and last-mile brand/style polish for you.

Operator surfaces: PowerShell (`slides.ps1`) and Obsidian (Bases views). Claude Code does the semantic work through repo-local commands.

Out of scope: color/brand styling; finding, downloading, or installing fonts (you install fonts in Canva). Layouts designed around non-native fonts are in scope.

## Hard rules

- Repo holds **Markdown, HTML/CSS/SVG, JSON, PNG previews only**. No PPTX or other vendor design files, ever; `.gitignore` blocks them and `validate` fails if one exists.
- Flat frontmatter only (scalars and flat lists). Structured per-element data lives in the MD body as tables.
- Every layout, slide, unit, and deck carries the full key set of its schema so Bases, Dataview, PowerShell, and grep never hit missing keys.

## Facts established (2026-09-01 probes + research)

| Item | Finding |
|---|---|
| Canva page | 1920 x 1080 px; ≤350 pages per design |
| HTML import | MCP `import-design-from-url` accepts public HTTPS HTML/zip; the tool description itself is the spec: `data-document-role="page"` on every page element (no nesting), optional `data-label` and `data-speaker-notes`, `intended_design_type: presentation`. Community imports of annotated HTML (fixed 1920x1080 sections, even flex/grid inside) came back as multi-page `presentation` designs with text readable via the API, i.e. not rasterized. Failure mode is a silent, irreversible "Code design" (no conversion path back). Fonts: Canva does not fetch webfonts; name Canva-library families and expect substitution otherwise. 20 req/min; large imports auto-split (threshold undocumented), recombine with `merge-designs`. **Probe confirms on this account** |
| Edit API | `edit-design`: all ops in one call target one page; ops and commit are separate calls; 27 ops incl. `add_text`, `format_text`, `replace_text`, `find_and_replace_text`, `insert_shape` (SVG M/L/H/V/C/S/A/Z), `insert_fill`, `add_page`, `replace_speaker_notes` (≤5000 chars). **No op sets font family**; `format_text` weight is normal/bold only and styles the whole box; `replace_text` resets line-height to 1.4 and list markers (community-measured), so `find_and_replace_text` is preferred and `format_text` is re-applied after replacements; `add_text` lands as black 16px. Inferred rates ~20/min open and commit, ~50/min operations. Tables (`sheet`) are opaque to the API |
| Assembly from masters | `merge-designs` (≤500 ops per call; new designs accept only `insert_pages`) pulls master pages in order; `read-design` with a transaction returns every element's `locator_id` (page metadata capped at 50 pages unless `page_indices` set); text is then filled by locator. Fonts, sizes, and positions are **inherited from the master**, which is the only way to get exact fonts through the API |
| Brand Templates / autofill | `publish-brand-template` needs Teams/Enterprise scope (a Pro user got "Not allowed"); `autofill-design` is absent from this connector. Reuse mechanism is therefore **master designs in a folder + `copy-design`/`merge-designs`**, plus Template links made in the UI |
| Assets / export | `upload-asset-from-url` 30/min, images <50 MB; `export-design` 20/min (pptx, pdf, png, jpg, gif, mp4, csv), `get-export-formats` first. Max pages per design unverified (350 is a community figure) |
| Account | Brand kit `alderman.ai` (`kAHHTmdCWzo`); empty folder "Presentation templates" (`FAFsWyFFv3w`) |
| Tooling | node 24, python 3.14, git, gh (logged in `alderman-ai`) |

## Assumptions

1. This directory is both the repo root and an Obsidian vault root (you can move or symlink it into your main vault later).
2. HTML-import hosting: public GitHub repo `alderman-ai/canva-slide-layouts`; only committed, placeholder-only layout HTML is public. **Filled presentation decks are not committed to the public repo**: they live in `presentations/` which is git-ignored from the public repo (or kept in a separate private repo); their upload uses the direct-build route or the master+merge route, both of which need no hosting. If the probe shows HTML import is the only editable route, filled decks go through a private, per-upload host only with your explicit go-ahead each time.
3. Semantic steps (reading context files, extracting units, writing copy) are performed by Claude Code following repo-local command files; deterministic steps (validation, matching, building, indexing) are node scripts. Both write to the same MD files.

## Repository layout

```
canva-slide-layouts/                       (git repo + Obsidian vault)
  README.md · CLAUDE.md                    # CLAUDE.md = rules, boot ritual, read list, commands, status block (see Step 0)
  docs/                                    # PLAN.md, DECISIONS.md, OPEN-QUESTIONS.md, GLOSSARY.md, WORKLOG.md
  research/                                # verbatim research reports 01–10 + README index (see Step 0)
  .claude/skills/                          # repo-local skills (SKILL.md + scripts/ + references/); names provisional
    deck-decompose/   element-mockup/   slide-redline/   slide-intake/   bundle-upload/
    (each SKILL.md is the operator procedure; shared helpers live in scripts/lib; bundle-upload is self-contained so it can be vendored into bundles)
  bundles/                                 # exported portable bundles (each can become its own public repo); see Skill 5
  spec/
    ontology.md                            # entities, relations, cardinalities (human-readable)
    schema/                                # JSON Schema per entity: layout, slide, unit, deck, font, asset
    vocab/                                 # controlled vocabularies as flat JSON enums with definitions
      family.json archetype.json content_shape.json unit_type.json flow_role.json
      element_role.json density.json polish.json audience.json purpose.json evidence_kind.json
    taxonomy.md                            # archetype tree + per-archetype accepts/produces
    flows.md                               # named flow templates (ordered archetype slots)
    rubrics.md                             # density, polish-cost, length budgeting rules with sources
    grid.md · type-scale.md                # 1920x1080 grid, type ladder, char budgets
    fonts.json                             # font registry (family, weights, source, canva_native, fallback)
    canva-limits.md                        # limits + probe findings + route decision
  layouts/                                 # L001-….md  (class library; source of truth)
  presentations/                           # one directory per deck (instances)
    <slug>/
      brief.md            # flat frontmatter dials + free-text brief
      context/            # all local source files (md, txt, pdf, csv, images, urls.md)
      units.md            # extracted typed content units (one ## per unit; flat frontmatter for the set)
      plan.md             # deck plan: ordered slides → layout id → unit ids; fit report
      slides/S01-….md     # filled hybrid MD per slide (layout table with real text, unit bindings)
      build/              # deck.html, canva-ops/*.json, previews/
      canva.md            # design id, page ids, upload log, redline sync log
  bases/                                   # Obsidian Bases: layouts, units, decks, redlines
  build/                                   # generated from layouts: html/, canva-ops/, previews/
  manifest/                                # derived caches: layouts.json, canva-index.json, assets.json
  assets/                                  # gray placeholder images/icons (SVG/PNG)
  scripts/
    slides.ps1                             # validate | build | find | show | new-deck | plan | fill-check | ops | index | sync
    lib/md.mjs                             # frontmatter + table parse/serialize
    validate.mjs build-html.mjs build-canva-ops.mjs ingest-html.mjs
    match.mjs (unit→layout scoring)  plan.mjs (budgeting + sequencing)  index.mjs  preview.mjs
```

## Ontology (→ `spec/ontology.md`, `spec/schema/*.json`, `spec/vocab/*.json`)

Entities and key relations:

- **Layout** (class). Attributes: `id, family, archetype, variant, flow_role, content_shape[], density, info_units, min_items, max_items, text_capacity_chars, polish_cost, slots_image, slots_chart, slots_table, fonts[], fonts_native, follows_well[], precedes_well[], tags[], status, canva_*`. Relations: `accepts` unit types with cardinality (e.g. KPI grid accepts 4–6 `stat`), `produces` a communicative function (`orient, assert, prove, compare, sequence, structure, humanize, close`).
- **Element** (row of a layout table): `n, role, x, y, w, h, font, weight, size, lh, align, maxChars, text, binds` (which unit field fills it: `unit.title`, `unit.items[i]`, `unit.value`).
- **ContentUnit** (from a corpus): `uid, unit_type (claim|evidence|stat|comparison|sequence|list|definition|quote|example|image_ref|table|timeline|risk|decision|ask), shape, items, chars, has_number, evidence_kind, source (file#anchor), importance 1–5, section`. Units are the atoms the planner places.
- **Slide** (instance): a Layout id + bound units + filled element table + speaker notes + `canva_page_id`, `locators[]`, `redline_status`.
- **Deck**: brief dials (`audience, purpose, length_minutes, target_slides, density, polish, style_hint, brand_kit_id`), ordered slides, flow template used, fit report.
- **Flow template**: ordered slots, each naming allowed archetypes and expected unit types (e.g. SCQA, pitch, teaching, status update, workshop; more from research).
- **Font**: registry entry with Canva fallback. **Asset**: placeholder or real image with Canva asset id.

Controlled vocabularies are flat JSON files in SKOS-style shape (`value, prefLabel, altLabels[], definition, broader, inScheme, examples[], sources[]`), referenced by the schemas, rendered into `ontology.md`, and used by `validate` to reject unknown terms. CLAUDE.md tells every session to use only vocab values.

Grounding from prior art (details and citations go into `ontology.md`):

- **Element roles** (`vocab/element_role.json`) reconcile OOXML `ST_PlaceholderType` and Google Slides `PlaceholderType`: `title, subtitle, body (body_kind: bullets|prose), column, caption, picture, chart, table, diagram, media, number, quote, attribution, icon, label, eyebrow, shape, divider, footer, slide_number, date, notes`. Each element is keyed by `(role, index)` exactly as both object models do. Chrome roles (footer, slide_number, date) are excluded from planning.
- **Content units** carry three independent fields, not one enum: `slide_function` (opening|agenda|section|content|summary|closing|appendix, after PPTAgent and Google predefined layouts); `unit_type` (claim, premise/evidence, statistic, comparison, process/sequence, definition/background, problem, solution/recommendation, example/elaboration, quote, cause_effect, concession/counterpoint, enumeration, summary, call_to_action, figure, table, chart_data, drawn from Stab and Gurevych argument components, RST relations, Minto SCQA, DOC2PPT and Paper2Poster figure handling); `shape` (text|bullets|number|image|chart|table|diagram|quote). Deck-level knobs `verbosity` (concise|standard|text-heavy) and `content_generation` (preserve|enhance|condense) follow Presenton.
- **Accepts relations** follow Presenton's pattern, the only public system with formal per-layout constraints: each layout ships a JSON Schema in `spec/schema/layouts/<id>.json` with required roles, `minItems`/`maxItems` per repeated role, and char ranges, plus an LLM-facing `description`. `match.mjs` validates a unit-to-layout binding against that schema before scoring. Baseline table: opening (title, optional subtitle/picture) accepts opening; two_column (title + column x2) accepts comparison, cause_effect, problem+solution, concession; big_number (number x1–3 + label) accepts statistic; process (diagram 3–6 steps) accepts process/sequence; title_body (2–5 bullets, ≤6 elements) accepts claim, enumeration, elaboration, summary; closing accepts call_to_action/summary; and so on for every archetype.
- **Decomposition priors** (`spec/rubrics.md`): ~1 slide/min for talks, ~2 min/slide for business decks; DOC2PPT corpus averages 16.8 slides per deck, ~2.4 slides per section, 11.6 words per slide sentence vs 17.3 in source (compression ≈0.67); Paper2Poster 14x text and 2.6x figure reduction; one idea per slide and title as full-sentence takeaway (PLOS rules); section divider inserted at each top-level heading when the section yields ≥2 content slides and the deck has ≥3 sections, agenda when ≥4 sections; slides overlapping ≥80% with their predecessor are merged.
- **Obsidian constraints**: only six property types (text, list, number, checkbox, date, datetime), assigned per property name vault-wide, no enum type. So vocab enforcement is external (`validate`), single-valued vocab fields are text, multi-valued are lists, and Bases filters wrap with `list()` so single and multi values filter alike. `.base` files are plain YAML with `filters`, `formulas`, `views`, so PowerShell can re-evaluate the same filters.
- **PowerShell retrieval**: `powershell-yaml` (`ConvertFrom-Yaml -Ordered`); `ConvertFrom-Markdown` does not expose frontmatter, so `slides.ps1` splits on the first two `---` lines itself; IDs are quoted strings so they never coerce to Int64; list membership uses the `@()` wrap, mirroring Bases `list()`.

## Hybrid MD formats

**Layout** (class), flat frontmatter + `## Elements` table + `## Accepts`, `## Fill rules`, `## Flow`, `## Speaker notes` sections. Example keys shown in the ontology above; element table columns: `n | role | x | y | w | h | font | weight | size | lh | align | maxChars | binds | text`.

**Slide** (instance) in `presentations/<slug>/slides/S07-kpi-grid.md`: frontmatter `slide_no, layout, deck, units: [u12,u13,u14,u15], fill_status (auto|edited|approved), overflow: false, canva_page_id, locators: [], redline_status`. Body: the same element table with `text` filled, plus `## Notes` (speaker notes) and `## Redlines` (synced comments).

**Units** in `units.md`: file frontmatter `deck, extracted_from: [...], unit_count`; one `## u12` section per unit with a flat key/value list (unit_type, shape, items, chars, importance, source) and the unit's text/items below. Human-editable before planning.

**Plan** in `plan.md`: frontmatter `deck, flow_template, target_slides, density, polish, layout_sequence: [...]`; body: table `slide | layout | units | fit | note`, and a fit report (overflow, dropped units, budget math).

## Pipeline for a presentation (the common case)

1. `slides.ps1 new-deck <slug>` scaffolds `presentations/<slug>/` with `brief.md` (you fill dials + brief) and `context/`.
2. `/ingest-context <slug>` (Claude): reads every file in `context/` (MD/TXT/CSV natively, PDFs via Read, images noted as image_refs), writes `context/_index.md` (file, type, summary, key sections).
3. `/extract-units <slug>` (Claude): decomposes the corpus into typed ContentUnits using the vocab; writes `units.md`; `validate` checks vocab and completeness. You may edit or prune.
4. `slides.ps1 plan <slug>` (deterministic `plan.mjs` + `match.mjs`): picks a flow template from `purpose`, computes the slide budget from `length_minutes`/`target_slides`/`density`, scores layouts per unit (`accepts` match, item count, chars vs capacity, `polish_cost ≤` budget, `fonts_native` if required, `follows_well` continuity, variety), merges or splits units to fit, and writes `plan.md` with a fit report. `/plan-deck` lets Claude review and adjust it in one pass.
5. `/fill-slides <slug>` (Claude): instantiates one slide MD per plan row, writes final copy into each element within `maxChars`, writes speaker notes, marks overflow. `slides.ps1 fill-check` verifies budgets and vocab.
6. `slides.ps1 build <slug>` → `build/deck.html` (all pages, markers, notes) + `build/canva-ops/*.json` + PNG previews for your review in Obsidian/browser.
7. Upload (Skill 1, Claude + MCP), route by purpose, within constraints:
   - **Route C, default for filled decks (font-exact)**: `merge-designs create_new_design` pulls the plan's master pages in order (one call, ≤500 ops) → `read-design` with a transaction, `page_indices` in chunks of ≤50, to get locators → per page one `edit-design` call: `find_and_replace_text` per bound element (falls back to `replace_text` + `format_text` re-apply), `delete_element` for unused slots, `replace_speaker_notes` → commit → `move-item-to-folder`. Budget for 40 slides: ≈45 calls, 2–3 minutes at the inferred rates. Fonts, sizes, and geometry come from the masters, so no font work is left.
   - **Route A, for building masters and for previews**: annotated HTML per family → `import-design-from-url` (public repo hosting, placeholder-only content) → verify design type is `presentation` and every page returns text in `read-design` → non-native fonts fixed once per master with the UI's "Change All" (Chrome-assisted) → masters indexed. Also usable for a whole filled deck when its content may be public, at 3–4 calls, accepting font substitution.
   - **Route B, for elements and repairs**: `insert_shape` / `add_text` / `insert_fill` ops from `canva-ops` into an existing page (Skill 2 and Skill 3), never for whole decks (default font, black 16px text, ~100 calls per deck).
   - **Emergency only**: a transitory PPTX generated in the scratchpad and uploaded through Canva's Upload UI by you; never committed or hosted.
   `index` then writes `canva_design_id`, page ids, and locators into `canva.md` and each slide MD.
8. You redline in Canva. `/sync-redlines <slug>` pulls `list-comments`/`list-replies` into each slide's `## Redlines`, Claude applies text fixes via `replace_text` by locator, and marks threads. Brand/style polish stays yours.

## Stack roles (Claude Code · Claude Design · Canva MCP · Canva via Chrome)

Full capability matrix with sources goes in `spec/stack.md`. Division of labor:

| Task | Surface | How |
|---|---|---|
| Author/validate layouts, decompose corpus, plan, fill slides, build HTML and `.dc.html` | **Claude Code** | scripts + repo skills. One layout model, **two render targets**: plain annotated HTML (Canva import, previews) and `.dc.html` decks (Claude Design), via `build-html.mjs` and `build-dc.mjs` |
| Branded custom elements (cards, callouts, KPI tiles, chart frames) | **Claude Design** via Design Sync | Design-system projects store components as `components/<group>/<Name>/{.html card, .jsx, .d.ts, .prompt.md}` plus `_ds_bundle.js/.css`, `styles.css`, `tokens/`, `fonts/`. `/design-sync` expects a **React** component package, so `components/` in this repo is a small React package (one JSX per element) whose build emits the four files; `DesignSync finalize_plan → write_files` pushes only the new `components/slides/**` paths into the alderman.ai Design System. Deck-side, a Claude Design deck embeds the DS and lays slides out as `<section>`s inside `<x-import component-from-global-scope="deck-stage" width="1920" height="1080">`; `build-dc.mjs` emits that shape. Read-back with `get_file` returns refined `.dc.html`/JSX to the repo. No SVG export exists; elements travel as source or PNG |
| Official HTML → editable Canva bridge | **Claude Design "Send to Canva"** | Canva Help guarantees editability only for Claude Design slide decks. Route D: write a `.dc.html` deck into a Claude Design project (DesignSync) → Send to Canva from the Share menu (you, or Chrome on request). Whether Canva keys on markup or on origin is probe question 1 |
| Batch page creation, text fill by locator, speaker notes, folder moves, comments, exports | **Canva MCP** | Routes A/B/C above; `list-comments`/`reply-to-comment` for redlines; `export-design` for review (pdf/png/pptx; `get-export-formats` reveals whether `html_bundle` is offered) |
| UI-only operations: font "Change All", Brand Kit font upload (OTF/TTF/WOFF, ≤10 MB per browser upload), Share → Template link, Brand Template publish when the API refuses on Pro, element locks before publishing, applying Brand Kit styles, Magic Switch, downloads | **Canva via Claude in Chrome** | one local Chrome extension is connected ("Browser 1", Windows). Canva's editor is canvas-rendered, so steps use screenshots plus coordinate clicks rather than DOM refs, the tab stays foregrounded (background tabs throttle the editor), and JS dialogs are avoided. Steps are checklists in `spec/stack.md`, run only on your request with the browser confirmed first, each step screenshotted. Sharing and permission changes may be refused by the extension's policy and then fall to you; credential entry and account or security settings always stay with you |

Handoff formats: MD ↔ HTML (repo); React components → four-file cards → Claude Design project (Design Sync); `.dc.html` deck → Claude Design → Canva (Send to Canva); annotated HTML → Canva (import); Canva → repo via `read-design` JSON dumps, `export-design` PDF/PNG, and comment threads.

Probe questions only a live test answers (all scheduled in library-pipeline step 2): (1) does Canva's Claude Design detection key on markup or origin; (2) do non-native fonts, gradients, and inline SVG survive Send to Canva; (3) does `get-export-formats` offer `html_bundle`; (4) will the Chrome extension perform font "Change All" and Brand Kit apply on the canvas editor; (5) does a hand-authored `.dc.html` deck written by Design Sync render in claude.ai/design and expose Send to Canva.

## Skill specifications (four operator skills; names and one-line descriptions finalized later)

Common conventions: every skill reads and writes only hybrid MD + HTML + JSON in this repo; every Canva side effect is logged to the deck's `canva.md` with the MCP call, ids returned, and a thumbnail; every skill accepts a `--dry-run` that stops after producing the MD artifacts; every skill ends by running `validate` on what it touched.

### Skill 1 (working name `deck-decompose`): context directory + presentation details → upload bundle

- **Inputs**: `presentations/<slug>/brief.md` (dials: audience, purpose, delivery_mode, length_minutes or target_slides, density 1–5 or auto, polish quick|standard|premium, pairing, brand_kit_id, fonts_native_required) and `context/` (md, txt, csv, json, pdf, images, `urls.md`). Sparse form: a one-line brief and a folder. Complex form: per-section instructions, must-include units, forbidden content, a required flow template, per-slide overrides in `brief.md`.
- **Procedure**: (1) index context → `context/_index.md`; (2) extract typed ContentUnits → `units.md` (vocab-checked, importance scored, source anchors); (3) `plan.mjs`: flow template from `purpose`, slide budget from length and density, unit→layout matching against each layout's JSON Schema, merge/split, variety and continuity scoring → `plan.md` with fit report; (4) fill → `slides/S##-*.md` with copy within `maxChars`, speaker notes, `binds` resolved; (5) build → `build/deck.html`, `build/canva-ops/`, previews; (6) **upload bundle** = `build/bundle.json`: ordered pages, per-page ops or HTML, asset list, expected page count, checksum of each slide MD. (7) upload by the probe-chosen route, respecting limits (20 imports/min, one page per `edit-design` call, `merge-designs` ≤500 ops, ≤350 pages), then `index` writes `canva_design_id`, page ids, locators back into every slide MD.
- **Outputs**: the deck in Canva inside the target folder, `canva.md` upload log, `plan.md` fit report, contact sheet PNG. Human touchpoints are optional review gates after steps 3 and 4 (`--gate plan,fill`), off by default so a run can go end to end.
- **Acceptance**: every slide MD has `canva_page_id`; page count in Canva equals bundle count; no unit marked `must_include` is unplaced; fit report has zero unresolved overflow.

### Skill 2 (working name `element-mockup`): branded custom element for a highlighted location in a Canva-rendered slide

- **Location input, any of**: (a) a Canva comment you leave on the slide (read via `list-comments`, thread text carries the request); (b) a screenshot with a marked region (Read the image; region → page coordinates by scaling to 1920x1080); (c) an element `locator_id` or `(role,index)` from the slide MD; (d) live selection in the Canva editor read through Claude in Chrome (only on request, browser confirmed first). The skill resolves any of these to a **target box** `{page_id, x, y, w, h}` plus the neighboring elements from `read-design`.
- **Request input**: sparse ("make this a KPI tile") to complex (element type, data to show, density, copy, iconography, motion none, constraints like "must fit 3 across", reference images, "use our PaperApp chrome"). Missing parameters are filled from the deck's pairing, the design-system tokens in `spec/tokens.md`, and the layout's grid; the skill states the assumptions it made in the element's `.prompt.md`.
- **Procedure**: (1) create `components/slides/<Name>/` with the four-file convention (`.html` preview at the target box size, `.jsx`, `.prompt.md`, `.d.ts`) and a `<!-- @dsCard group="Slides" -->` marker; (2) render preview PNG (Playwright) at 1x and 2x; (3) optionally `/design-sync` it into the alderman.ai Design System project (write set limited to the new path) so Claude Design can refine it; (4) insertion into the slide, two modes: **native** (element decomposed into `insert_shape` + `add_text` ops so it stays editable in Canva) or **asset** (PNG/SVG via `upload-asset-from-url` from the public repo, then `insert_fill` at the target box) when the element is too complex for native ops; (5) update the slide MD: new rows in the element table with `component: <Name>` and the returned locators; register the element in `manifest/components.json` so `element-mockup` can reuse it next time.
- **Outputs**: component files, preview PNGs, updated slide MD, Canva page updated in a transaction you can see in the before/after thumbnails, `canva.md` log.
- **Acceptance**: preview matches the target box within ±4px; the inserted element sits inside the box on the Canva thumbnail; the component is retrievable by `slides.ps1 find -Component`.

### Skill 3 (working name `slide-redline`): plain-language change on a rendered Canva slide → forked variables → re-uploaded version

- **Inputs**: a slide reference (deck + slide no., Canva page url, or a Canva comment thread) and a plain-language request ("tighten the title to one line, move the chart left, drop bullet 3, try the dense variant").
- **Procedure**: (1) resolve to `slides/S##-*.md` and pull the current Canva state (`read-design` for that page, thumbnail before); (2) **fork**: write `slides/S##-*.v<n>.md` with frontmatter `parent`, `version`, `change_request` (verbatim), `changed_keys[]`, `status: candidate`; (3) translate the request into variable edits, in order of preference: frontmatter dials (`variant`, `density`, `pairing`) → element-table cells (x, y, w, size, maxChars, text, binds) → layout swap (a different archetype, re-planned through `match.mjs`); every changed key is listed, nothing else moves; (4) build the forked slide (HTML + ops), preview; (5) **re-upload** in one of two modes chosen by the request or a flag: `replace` (apply ops to the same page by locator: `replace_text`, `position_element`, `resize_element`, `format_text`, `delete_element`, `add_text`) or `variant` (append the forked page right after the original via ops or `merge-designs` so both can be compared; the losing one is deleted only on your explicit approval phrase, per the merge tool's rule); (6) commit the transaction, capture the after thumbnail, log the diff in `canva.md`, and reply on the originating comment thread if one exists; (7) on acceptance, promote the fork to the canonical slide MD (`status: approved`, parent archived).
- **Batch form**: a list of requests across many slides in one `redlines.md` (or all open Canva comment threads) processed in one pass with one transaction per page.
- **Acceptance**: `changed_keys` exactly explains the pixel diff between before/after thumbnails; untouched elements keep their locators and geometry; the request text is stored verbatim with the fork.

### Skill 4 (working name `slide-intake`): image or URL → intake-contract hybrid MD → markup → catalogued layout → upload

- **Inputs**: an image (PNG/JPG/PDF page) of a slide or design, or a URL (a web slide, an HTML deck, a Canva design link, a Figma/Pitch public page), plus optional hints (intended archetype, family, fonts, whether to keep copy or placeholder it).
- **Step 1, intake contract**: create `intake/<yyyymmdd>-<slug>.md`, a hybrid MD whose frontmatter is the contract: `source`, `source_type (image|url|canva|html)`, `detected_archetype`, `confidence`, `canvas_w/h` (source) and target 1920x1080 scale, `fonts_detected[]`, `fonts_native`, `license_note`, `status: draft|confirmed|catalogued|uploaded`, `open_questions[]`. Body: the extracted element table with a `confidence` column and a `## Questions` list. This file is the operator surface: you edit cells or answer questions, then set `status: confirmed`.
- **Extraction**: images → vision read (Read tool) of regions, roles, approximate geometry snapped to the 12-column grid, text transcribed; HTML URLs → `ingest-html.mjs` (absolute px read directly, flex/grid computed via Playwright `getBoundingClientRect` at 1920 wide); Canva links → `read-design` transaction for exact geometry and fonts; other URLs → Claude in Chrome screenshot + DOM read, only on request.
- **Step 2, markup**: on `confirmed`, generate `build/html/intake/<slug>.html` (single `data-document-role="page"`), preview PNG, and a diff overlay against the source image for you to eyeball.
- **Step 3, catalogue**: assign the next layout id, write `layouts/L###-<archetype>.md` with full frontmatter, `accepts` schema (proposed from the element roles), char budgets from measured widths, `origin: intake/<file>`, and copy replaced by placeholders unless you asked to keep it; run `validate`; add to the family master deck queue.
- **Step 4, upload**: `atomic` (a one-page design in the templates folder, indexed like any master page) or `bundle` (queued as a page inside the next `deck-decompose` run or a family master rebuild).
- **Acceptance**: the catalogued layout round-trips (`build-html` → `ingest-html` reproduces its table); `slides.ps1 find` returns it by archetype; if uploaded, it has a `canva_page_id` and locators.

### Skill 5 (working name `bundle-upload`) and the portable bundle format

A decomposed deck must be able to leave this vault as a **self-contained bundle**, live in its own public repo, and be uploaded from another device into a different Canva account with nothing but Claude Code, a Canva MCP connection, node, and git.

- **Export** (`slides.ps1 export-bundle <slug> [-Public]`) writes `bundles/<slug>/` (or a path outside the vault) containing:
  - `bundle.md`: flat frontmatter contract (`bundle_id, title, created, library_version, layout_ids[], slide_count, fonts[], fonts_native, routes_supported[], content_public: true|false, license`) and a human README body (what it is, how to upload, what the operator will still do by hand).
  - `slides/*.md` (filled hybrid MDs), `layouts/*.md` (**vendored copies** of only the layouts used, so the bundle never depends on the full library), `build/deck.html` (annotated, filled), `build/masters.html` (the used master pages, placeholder content, for Route C in a foreign account), `build/canva-ops/*.json`, `assets/` (only referenced assets), `previews/`, `manifest/bundle.json` (ordered pages, per-page ops or HTML refs, asset list, sha256 per file).
  - `.claude/skills/bundle-upload/` plus a pinned copy of `scripts/lib/md.mjs`, `validate.mjs`, `index.mjs`, and `slides.ps1` in bundle mode, so the receiving device has every skill and script it needs without cloning the library; `bundle-manifest.json` records the library commit and script versions.
  - `.gitignore` and `canva/` state kept **per account**: `canva/<account-id>.md` (design ids, page ids, locators, upload log) is written on each device and git-ignored by default, so a public bundle never carries anyone's account state; `bundle.md` stays account-agnostic.
  - Export refuses unless `content_public: true` is set in the deck's `brief.md` or `-Public` is passed, and prints what will become public.
- **Receive** on another device: `git clone <bundle repo>` → open in Claude Code → `/bundle-upload` (or `.\slides.ps1 bundle upload`). The skill: (1) runs `bootstrap` checks (node ≥ 20, git, Canva MCP tools present, `list-brand-kits` succeeds, target folder chosen or created via `create-folder`); (2) validates checksums against `manifest/bundle.json`; (3) chooses the route: **Route A** (`import-design-from-url` on the bundle repo's raw `build/deck.html`, possible because the bundle is public, 3–4 calls) or **Route C** (import `build/masters.html` once into that account, then `merge-designs` + fill by locator, font-exact); (4) `read-design` verification, `move-item-to-folder`; (5) writes `canva/<account-id>.md` and prints the `edit_url`. Redlines and brand polish happen in that account; `slide-redline` works against the bundle's own `slides/*.md` if the library skill is present, and the bundle's pinned `bundle-upload` includes a reduced `replace` mode for text-only fixes.
- **Round trip back**: `slides.ps1 import-bundle <path>` merges a bundle's slide MDs and any new layouts back into the vault, de-duplicating by `layout_id` and `sha256`.
- **Acceptance**: a bundle exported from this machine, pushed to a fresh public repo, cloned into an empty directory on a second device (or a clean temp directory here with the library absent), uploads into a Canva account with page count and text verified by `read-design`, with no reference to files outside the bundle.

## Layout-library pipeline (one-time, then incremental)

1. Scaffold repo, `spec/*` (ontology, schemas, vocab, grid, type scale, fonts registry, flows, rubrics), `lib/md.mjs`, `validate`, `build-html`, `build-canva-ops`, `slides.ps1`, `bases/*.base`.
2. Author 3 probe layouts; push; **probe Route A and Route B** with `read-design` transactions; record element types, drift, fonts; decide route; tune emitters; write `canva-limits.md`.
3. Author the library: ~62 archetypes + variants, expanded by the pending research (additional archetypes, flow templates, density and polish rubrics, harvested repos). Each layout gets `accepts`, `binds`, and rubric-based `density`/`polish_cost`.
4. Push family masters to Canva (`FAFsWyFFv3w`), index locators back into layout MDs; try Brand Template publish; document fallback.
5. `ingest-html.mjs` for bringing harvested/pre-built HTML in as hybrid MD + HTML pairs.

## Specs carried over

- Grid: 96px margins → 1728x888 content box; 12 columns, 32px gutters; footer safe zone 40px.
- Type scale (`spec/type-scale.md`): 1 pt = 2 px at 1920x1080. Ratio 1.333, base 32px, two modes selected by the deck's delivery mode. Read-deck / live-talk px: display 128/160 (lh 1.0, -0.03em); title 76/96 (lh 1.1, -0.02em, ≤2 lines, ≤10 words); subtitle 56/64; lead 42/48; body 32/40 (lh 1.4, 45–60 chars per line, wrap ≈ 900–1000px in Inter); caption 24/28; eyebrow caps 20/24 (+0.08em). ≤4 sizes per slide, 6 per deck. Char budgets: title ≤40, subtitle ≤70, bullet ≤50, card body 60–80, KPI label ≤20, milestone ≤8, big number ≤6. Wrap widths are computed against **Inter metrics**, the fallback for nearly every commercial grotesk, so a Söhne or GT America layout re-renders in Inter with ≤1 line drift.
- Fonts (`spec/fonts.json`): registry, not allowlist (`family, weights_used, category, source, license, canva_native (yes|no|unverified), canva_fallback, fallback_weight_map, optical_size_note`). Seeded with ~30 families from the typography survey: free grotesks (Inter/Inter Display, Geist, Work Sans, DM Sans, Manrope, Space Grotesk, IBM Plex, Plus Jakarta), Fontshare (Satoshi, General Sans, Cabinet Grotesk, Clash Display), commercial (Söhne, GT America, Suisse Int'l, Neue Haas Grotesk, Graphik, Tiempos, Canela, Recoleta), editorial serifs (Instrument Serif, Fraunces, Playfair Display, Newsreader), system/consulting (Georgia, Arial, Trebuchet MS), Canva Sans. Twelve named pairings in `spec/pairings.md` (e.g. Söhne/Söhne → Inter; Instrument Serif italic + Inter; Tiempos + Suisse → Lora + Inter; Georgia + Arial consulting; Space Grotesk + DM Sans). `validate` errors on unregistered families, warns on non-native or unverified. Layouts carry `fonts[]`, `fonts_native`, and `pairing`.
- Canva font facts recorded in `spec/canva-limits.md`: uploads are OTF/TTF/WOFF static files only (no variable fonts, no WOFF2), ≤18 styles per family, 500 per Brand Kit, no faux bold/italic, name-matching on import unverified, so the post-import step is the font picker's "Change All" per family (a Chrome-automation candidate).
- Taxonomy: baseline 62 archetypes in 7 families, extended by ~50 from the design-world survey (Beautiful.ai's 62 smart slides, Pitch's layout categories, Gamma cards, Keynote/Google/PowerPoint presets, think-cell/Infodiagram/StrategyU consulting forms, Duarte Diagrammer families). Notable additions: topic-agenda progress tracker, decisions/ask, definition, chart+insight callout, waterfall, Marimekko, Harvey-ball scorecard, pricing tiers, issue/driver tree, onion, iceberg, stack, hub-and-spoke, chevron sequence, maturity stairs, 3-layer timeline, Gantt, kanban, journey map, flowchart, device frames, logo wall, org chart, map with markers, photo 3-up, icon+label row. Target: ~100 archetypes, each with `min_items/max_items` from the survey (e.g. Harvey scorecard 3–4 options x 6–7 criteria; tree ≤4 branches per level). Live in `spec/taxonomy.md` + `vocab/archetype.json`.
- Flow templates (`spec/flows.md`, `vocab/flow_template.json`), 10 named sequences with target lengths and per-slot archetypes: SCQA/pyramid consulting deck (20–60), Sequoia pitch (10–15), Kawasaki 10/20/30, Slidebean 3-act pitch (15–22), Duarte sparkline talk (18–40), Gagné teaching module (10–20), status update (4–6), workshop (15–30 per 2h), executive-summary-first slidedoc (10–30), Takahashi/Lessig rapid talk (60–200). `purpose` vocab maps to a default flow.
- Density rubric (`spec/rubrics.md`, `vocab/density.json`), levels 1–5 with numeric limits the planner enforces: 1 cinematic (1 idea, ≤6 words, 2–5 slides/min); 2 talk (≤3 chunks, ≤25 words, ≥30pt, 1–2 slides/min); 3 briefing (≤4 bullets x ≤4 units, 40–60 words, ≥20pt body, 1 slide per 1–2 min); 4 consulting (action title ≤15 words + 2–4 support points, 60–100 words, 4–6 tiles, ≤5 steps); 5 slidedoc (100 words target, 250 max, not presented). Sources: Kosslyn 2012, Cowan 2001, Mayer, Duarte, TEDx guide, Kawasaki. Default level from delivery mode: live talk ≤2, briefing/teaching 3, consulting/board 4, read-deck 5. Overflow splits a slide before density rises.
- Polish-cost rubric (`spec/rubrics.md`, `vocab/polish.json`), 1–5 anchored on agency redesign tiers: 1 typography only; 2 type + primitives (icons, rules, cards, RAG dots); 3 needs a chart engine or a supplied photo; 4 needs curated imagery or a multi-element diagram; 5 bespoke illustration, animation, video, or live embed. Per-family defaults recorded; the `polish` dial caps `polish_cost` (quick ≤2, standard ≤3, premium any).
- Pace norms for the length budget: pitch 10–15 slides per 10–20 min; conference talk ~1/min; lecture 20–45 per 45–90 min; workshop 40–80 per 1–4 h; read-deck no pace, governed by page count.

## Harvest sources (→ README "Sources", `ingest-html` targets; structure only, licenses respected)

Clone first, sparse checkouts into the scratchpad, never vendored wholesale:
1. `dreamid27/frontend-slides` (MIT, 2026-07): **88 fixed 1920x1080 layout presets**, each a `layout.md` + `preview.html`, grouped opening/section/list/stats/chart/closing/quote/comparison/timeline/image/agenda/pricing/team/roadmap/risk/spec/gallery/qa/prose/case/definition/process. Closest existing analog to this library; `ingest-html` targets it first.
2. `hugohe3/ppt-master` (MIT): `templates/layouts/*/layouts_index.json`, 60+ structure-only page types across `presentation_core`, `editorial_bleed`, `report_core`, plus 33 chart and 6 table structures. JSON geometry maps straight into element tables.
3. `zcag/tahta` (MIT): 30 typography-forward Slidev layouts (`agenda, bigtype, bleed, chart, compare, define, diagram, feature, logos, metric, panels, showcase, stats, steps, timeline…`); proportional, port by hand.
4. `jxpeng98/slidev-theme-scholarly` (MIT): 34 layouts incl. matrix, pipeline, experiment-grid, result-highlight.
5. `FluidForm-ai/fluiddocs-deck-builder` (MIT): 8 narrative decks (airbnb, anthropic, sequoia-classic, stripe, keynote, launch, sales, all-hands) with typed slide classes; feeds `flows.md`.

Second tier: `presenton/presenton` (Apache-2.0, `layouts.json`), `Jorin1222/html-slides-skill` (MIT, 12 fixed-canvas files), `Akxan/ppt-agent-skill` (MIT, compositional grammars: asymmetric, L-shape, T-shape, waterfall…), `SlideSpeak/slide-design-skill` (MIT, consulting and pitch slot grammars + tokens), `gureckis/slidev-theme-neversink`, `slidevjs/themes` apple-basic and shibainu, WebSlides keynote demos (MIT, archived), `WayneZhon/KingDee-PPT-Skill` (MIT, 29 layouts, PPTX geometry to port), `likaku/Mck-ppt-design-skill` (Apache-2.0, char budgets).

Wire-format evidence: real repos export Canva-bound decks as `<section data-document-role="page" data-label="…">` with a fixed-px page (`hs150521/Endfield-PPT-Template`, `Devlabs-club/website` pitchdeck-canva at 1920px). That is the shape `build-html` emits.

Quarantine (AGPL/GPL or no license; read for ideas, never copy): banana-slides, dashi-ppt-skill, guizang-ppt-skill, modern-ppt, veasion/AiPPT, ai-to-pptx, kalouk. Watchlists: `ToseaAI/awesome-html-slide-skills`, `brycewang-stanford/many-ppt-skills`.

## Brand source of truth: alderman.ai

- **Primary source**: the local codebase `C:\Users\alder\Desktop\Claude Code Website\alderman-ai\` (the only git repo there; `main` pinned at `78f20ed` for external tooling), deployed live at **alderman.ai**. Entry doc for visiting agents: `C:\Users\alder\Desktop\Claude Code Website\EXTERNAL_SKILLS_START_HERE.md`; best orientation: `alderman-ai\LOCAL-AGENTS.md`. Order of authority stated there: **code > deployed site > CLAUDE.md > specs (`toolbox.md`, `desktop-spec.md`, `mobile-order.md`) > briefs > concept docs > archive**. The root also holds `design-system/` and `briefs/` content sources.
- **Visitor rules this project obeys**: read anything under `alderman-ai/`; never write to `main`, never create files under its `components/`, never stage outside it, never touch `.rt/` (a live worktree), never deploy. All brand extraction is **read-only**, done once by a `brand-extract` step that writes `spec/tokens.md` and `spec/brand-sources.md` (file, line, value, retrieved date) in this vault. Nothing brand-related is edited at the source.
- **What gets extracted** (for elements and pairings, since color/brand styling of layouts stays out of scope): font families and weights as loaded by the site (Barlow, JetBrains Mono per the Design System project), type sizes and line-heights, spacing and radius scale, the five component groups `chrome, layout, paper, sections, special` (15 `.tsx`, mirrored one-to-one by the Design System project's `components/` groups), logo assets, and the deployed page structure at alderman.ai as a cross-check when code and site differ.
- Layout frontmatter gains `brand: alderman-ai | neutral`; brand-specific slide components live in `components/slides/` here and never in the site repo. `spec/brand-sources.md` records the site commit the values were read at, so drift is detectable when `main` moves past `78f20ed`.

## Claude Design project

`DesignSync list_projects` shows one writable design-system project: **"alderman.ai Design System"** (`d1228f56-c841-450e-8665-c2d177fb9414`, updated 2026-08-14). Its `list_files` shows the conventions the slide work must follow:

- Components live at `components/<group>/<Name>/` as four files: `<Name>.html` (preview), `<Name>.jsx`, `<Name>.prompt.md`, `<Name>.d.ts`; groups today are `chrome`, `layout`, `paper`, `sections`, `special` (e.g. `PaperApp`, `SectionTile`, `Postit`, `TerminalLine`, `StackedLogo`). Previews compile to `_preview/<Name>.js`; `_ds_manifest.json` is built by the app's self-check.
- Brand fonts are already in the project: **Barlow 300/400/500/600/700** and **JetBrains Mono 400/500** (`fonts/*.woff2`, `fonts/fonts.css`). These two families become the default `pairing` for alderman.ai decks; Canva needs static OTF/TTF/WOFF uploads of the same weights (WOFF2 is not accepted by Canva), which you handle.
- `templates/linkedin-social/LinkedinSocial.dc.html` shows the pattern for a canvas template with `reference/` HTML and shipped PNGs.

Plan: slide elements go in as a new group `components/slides/<Name>/` (e.g. `KpiTile`, `CalloutCard`, `QuoteBlock`, `TimelineRail`, `ChartFrame`, `SectionHeader`), each with the four-file convention and a `<!-- @dsCard group="Slides" -->` marker; a `templates/slides/` area holds a 1920x1080 slide artboard template. Only these new paths enter the `finalize_plan` write set; nothing existing is touched. The repo's `components/` folder is the local source that `/design-sync` pushes; `styles.css` and `fonts/fonts.css` are read once (`get_file`) to lift the exact token values into `spec/tokens.md` so slide layouts and the components share metrics.

## HTML authoring rules confirmed by import evidence (→ `_base.css`, `build-html`, `validate`)

- One `<section data-document-role="page" data-label="…" data-speaker-notes="…">` per slide, `position:relative; width:1920px; height:1080px; overflow:hidden`, never nested; `<meta charset="utf-8">`; inline styles.
- Every text run in its own leaf element (`p`, `h1–h3`, `span`, real `li` items written out); no text in `::before/::after`; no gradient overlays spanning text; no full-page SVG or screenshots; images as hosted PNG/JPG under 50 MB, not data URIs.
- Absolute positioning inside the page (most stable); `font-family` names spelled as Canva's library spells them, with the registry fallback stack.
- Probe checks after import: design type `presentation`, page count equals sections, `read-design` returns text for every text element, fonts reported match the registry name or its recorded fallback.

## Step 0: handover persistence (first action after approval, in this session, before any scaffolding)

Everything gathered in this planning session is written into the repo so a fresh session can execute without this context window.

```
docs/
  PLAN.md                      # verbatim copy of this plan file, with a "status" header and a changelog section
  DECISIONS.md                 # numbered decision log: no vendor files; flat frontmatter; Route C default, A masters, B elements, D via Claude Design; public repo hosting; fonts registry not allowlist; brand read-only; bundle portability
  OPEN-QUESTIONS.md            # the five probe questions + anything unverified (350-page cap, Change-All UI, font name matching), each with "how to test"
  GLOSSARY.md                  # layout, slide, unit, deck, flow template, route A–D, bundle, intake contract, master, locator
research/
  README.md                    # index of reports: date, agent focus, what to trust, gaps each report declared
  01-canva-import-formats.md   # agent report: Connect/MCP import formats, PPTX fidelity, font substitution, brand template plan gating
  02-layout-repos-initial.md   # agent report: first repo sweep + 62-archetype list + grid/type conventions
  03-taxonomy-flows-density.md # agent report: Beautiful.ai catalog, ~50 added archetypes, 10 flow templates, density + polish rubrics with sources
  04-typography-systems.md     # agent report: 30-font table, 12 pairings, type scale, Canva font-upload facts
  05-layout-repos-deep.md      # agent report: ranked harvest list, clone-first five, license quarantine, wire-format evidence
  06-slide-ontology-prior-art.md # agent report: element roles, unit typology, accepts precedents, decomposition priors, Obsidian/PowerShell notes
  07-canva-mcp-limits-and-claude-design-html.md # agent report: assembled HTML spec with confidence, constraint table, route call budgets
  08-stack-interactions.md     # agent report: Claude Design/Design Sync internals, MCP matrix, Chrome caveats, open questions
  09-session-probes.md         # what this session verified directly: page size 1920x1080, brand kits, folders, brand template EAGpdGyNc_Q, Design System project id and file list, Chrome "Browser 1", tooling versions, gh auth, Canva Help answers
  10-brand-source-notes.md     # summary of EXTERNAL_SKILLS_START_HERE.md: paths, visitor rules, order of authority, pinned commit
```

Reports are written **verbatim** as delivered (with a header noting date, agent focus, and the report's own caveats), never summarized away; syntheses live in `spec/*`, which cite `research/NN` by file. The plan file at `~/.claude/plans/…` is then treated as superseded by `docs/PLAN.md`.

**CLAUDE.md** (written in step 0, kept current every step) contains:
- **Identity and rules**: what this repo is; hard rules (no vendor design files; flat frontmatter only; vocab-only values; brand source is read-only; public-repo content rule; Canva side effects logged to `canva.md`; never `git add` outside this repo; `.rt/` and the site repo are untouchable).
- **Boot ritual** (in order, every session): (1) read `docs/PLAN.md` header + status and `docs/DECISIONS.md`; (2) read `docs/OPEN-QUESTIONS.md` and `spec/canva-limits.md` for the current route decisions; (3) run `.\scripts\slides.ps1 validate` and `git status`; (4) check MCP availability (`list-brand-kits`) and note the connected account; (5) read `research/README.md` and open only the reports the current task needs; (6) read the skill's `SKILL.md` for the task at hand; (7) append a dated entry to `docs/WORKLOG.md` when finishing.
- **Read list by task**: authoring layouts → `spec/schema.md`, `spec/grid.md`, `spec/type-scale.md`, `spec/taxonomy.md`, `research/05`, `research/02`; ontology/vocab work → `spec/ontology.md`, `research/06`; upload/Canva → `spec/canva-limits.md`, `spec/stack.md`, `research/07`, `research/08`; fonts/elements → `spec/fonts.json`, `spec/pairings.md`, `spec/tokens.md`, `research/04`, `research/10`; composing decks → `spec/flows.md`, `spec/rubrics.md`, `research/03`; bundles → Skill 5 spec in `docs/PLAN.md`.
- **Commands**: the `slides.ps1` verbs with one-line meanings; the five skills with their triggers.
- **Status block**: current execution step, what is verified vs assumed, next action. Updated at the end of every working session so a fresh session starts from the last known state.

Step 0 ends with an initial commit `docs: handover of planning research` and a `git status` that is clean.

## Execution order

0. **Handover persistence** (above): `research/`, `docs/`, `CLAUDE.md`, initial commit.
1. **Foundation**: scaffold repo (+ `.gitignore` vendor block), `spec/*` (ontology, schemas, vocab, taxonomy, flows, rubrics, grid, type scale, fonts registry, pairings, stack, canva-limits), `lib/md.mjs`, `validate`, `build-html`, `build-dc`, `build-canva-ops`, `slides.ps1`, `bases/*.base`; 3 probe layouts; public repo push.
2. **Probe** (Routes A, B, C, D on the same 3 layouts) → answers to the five probe questions → route decisions written to `spec/canva-limits.md` and `spec/stack.md` → emitters tuned.
3. **Layout library**: harvest (clone-first five, sparse, into scratchpad), `ingest-html` for fixed-canvas sources, hand-port the rest; ~100 archetypes with variants, each with JSON Schema `accepts`; previews; family masters to Canva; non-native fonts fixed per master (Chrome-assisted, on request); index back into MD.
4. **Skill 1 `deck-decompose`** end to end on one real `context/` folder as the acceptance test; `plan.mjs`/`match.mjs`; Bases views for units and decks.
5. **Skills 2–5** (`element-mockup` with the React `components/slides` package and Design Sync, `slide-redline`, `slide-intake`, `bundle-upload` with `export-bundle`), each verified on the acceptance deck; the bundle test runs from a clean directory with the library absent.
6. Assets, README, CLAUDE.md, and the Obsidian vault polish (Bases embeds in `README`, contact sheets linked from layout MDs).

## Verification

- `slides.ps1 validate`: all layout/slide/unit/deck files conform to `spec/schema/*`, use only vocab values, tables in bounds, capacities consistent, no vendor files in repo.
- Round trip: `build-html` → `ingest-html` reproduces the element table.
- Probe: chosen route yields editable text elements with geometry within ±8px; fonts reported for Route A.
- Retrieval: `slides.ps1 find -Accepts stat -Items 5 -MaxPolish 2` and the Obsidian `layouts.base` filters return the same set.
- Acceptance deck: a real `context/` folder → units → plan (no unresolved overflow) → filled slides → `deck.html` preview → Canva design with every slide mapped to `canva_page_id` and locators, and speaker notes present. Your only remaining work is redlines and brand polish.
- Skills: `element-mockup` places an element inside its target box on the Canva thumbnail; `slide-redline` produces a fork whose `changed_keys` explain the before/after diff; `slide-intake` catalogues an image-sourced layout that round-trips; `bundle-upload` succeeds from a clean directory into Canva with checksums verified and no account state committed.
- Repo hygiene: `validate` confirms no vendor design files anywhere, and no `canva/<account>.md` files are tracked in a bundle repo.
