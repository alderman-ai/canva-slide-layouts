# Work log

Append one dated entry per working session: what was done, what was verified, what is next, and any deviation from `docs/PLAN.md` or the model policy. Newest at the bottom.

## 2026-09-01 → 2026-09-02 · Planning session (orchestrator: Fable 5.1)

- Researched the Canva MCP surface, Canva import behavior, layout sources, typography, taxonomy and rubrics, slide ontology prior art, Canva batch limits, the Claude Design / Design Sync / Chrome stack; probed the Canva account, the Design System project, Chrome connection, and local tooling (all read-only). Reports persisted verbatim in `research/01`–`10`.
- Plan approved in five revisions: Markdown-first library, ontology, per-presentation projects, four upload routes, five skills, portable bundles, brand source, model policy, handover step.
- Step 0 executed: `git init`, tree, `.gitignore`, `docs/PLAN.md`, `docs/DECISIONS.md`, `docs/OPEN-QUESTIONS.md`, `docs/GLOSSARY.md`, this log, `CLAUDE.md`, `INDEX.md`, `research/README.md`.
- Deviations: none. The operator saw an API error mid-response during the research dump; all 20 written files were tail-checked afterwards (line and byte counts plus final lines) and every file ends at its intended last line. No truncation found.
- Next: execution step 1 (foundation) per `docs/PLAN.md`.

## 2026-09-02 · Execution step 1, foundation (orchestrator: Fable 5.1 medium; subagents: Opus 5 high)

- Specs written by four parallel subagents and one reconciliation pass: `spec/ontology.md`, `schema.md`, `schema/*.json` (8 entity schemas + accepts template), `vocab/` (19 vocabularies, 104 archetypes, `check-vocab.mjs`), `taxonomy.md` (104 archetypes / 7 families), `flows.md` (10 flow templates), `rubrics.md`, `grid.md`, `type-scale.md`, `fonts.json` (60 families), `pairings.md` (13), `canva-limits.md` (53 constraints, routes A-D, probe protocol P1-P8), `stack.md` (capability matrix, Design System contract, Chrome checklists), `tokens.md` + `brand-sources.md` (read-only extraction from the alderman.ai codebase at `78f20ed`). Orchestrator added `spec/canva-edit-ops.md` (all 27 `edit-design` operations with parameters, from the live schema).
- Tooling by one subagent: `package.json` (gray-matter, cheerio, ajv, ajv-formats, yaml, playwright), `scripts/lib/md.mjs`, `validate.mjs`, `build-html.mjs`, `build-dc.mjs`, `build-canva-ops.mjs`, `manifest.mjs`, `preview.mjs`, `slides.ps1` (validate build build-dc ops manifest preview find show new-deck hygiene help), `templates/_base.css` + `_page.html.tpl`, 25 node tests. Orchestrator corrected `build-canva-ops.mjs` to the live schema (`insert_shape` path/view_box_width/height, `insert_fill` asset_type/alt_text, `format_text.formatting{}` with start|center|end, `replace_speaker_notes.notes`) and updated the test.
- Reconciliation: archetype ids unified to the taxonomy's 104 kebab-case ids (old snake ids kept as altLabels), `purpose.perform` added, all 31 schema enums regenerated from vocab, `title` restored on layouts (Decision 15).
- Probe layouts authored: `layouts/L001-title-cover.md`, `L046-three-column.md` (alderman-ai pairing, Barlow + JetBrains Mono, `fonts_native: false`), `L037-table-insight.md`, with accepts files under `spec/schema/layouts/`. Obsidian views `bases/layouts.base`, `bases/decks.base`.
- Verified: `validate` -> 3 layouts, 0 errors, 1 warning (JetBrains Mono unverified); `check-vocab` OK; `npm test` 25/25; builds produced `build/html/*` (exactly one `data-document-role="page"` per page), `build/canva-ops/*`, `build/dc/library/Main.dc.html`, `manifest/layouts.json`, previews (visually checked L046 and L037).
- Public repo created: https://github.com/alderman-ai/canva-slide-layouts (origin), pushed at the end of this step.
- Flagged to operator: the site repo has six staged deletions under `public/brand-assets/` (OPEN-QUESTIONS S1).
- Deviations: none from the plan; model policy followed (all subagents `model: opus`, high effort).
- Next: **step 2, probe** per `spec/canva-limits.md` section 4 (P1-P8) using the three probe layouts; Route A needs the pushed raw URLs, Route B/C use the ops files, Route D needs a `.dc.html` deck written to a new Claude Design project.
- Post-commit fix: the `an empty repo scan is clean` test scanned the real layouts against the fixture spec once layouts existed; it now scans a temporary empty root. Suite back to 25/25.

## 2026-09-02 · Execution step 2, probe (first pass)

- Imported `L046` and `L037` from the public raw URLs (`DAHT_1qMeZ4`, `DAHT_w99T-8`): both `presentation`, fixed 1920x1080 pages, all text editable at exact authored geometry, weights incl. semibold preserved, shapes and rounded panels native, notes and page titles imported. Barlow and JetBrains Mono preserved (distinct fontRefs).
- `get-export-formats` → no HTML export (P3 answered no).
- `edit-design` field names confirmed live for `find_and_replace_text`, `insert_shape`, `add_text`, `replace_speaker_notes`; observed width collapse after text replacement (S9). Transactions cancelled; no probe edits committed.
- Decision 16 recorded (Route A primary where content may be public). Results in `spec/canva-limits.md` §6; questions updated in `docs/OPEN-QUESTIONS.md`.
- Not run yet: P4 (needs operator to pick the browser), P5 (new Claude Design project), P6 (needs a family master), P8 (15-page file), P2 gradient/SVG pass, P7 ceiling/lifetime.
- Next: finish P7/P8 with a multi-page probe file; add `resize_element` after fills in `build-canva-ops.mjs`; then step 3 (library authoring and harvest).

## 2026-09-02 · Handover checkpoint (session ended by operator; execution continues in a fresh session)

- P8 run: `build/html/probe-15.html` (15 pages, committed and pushed) imported as one design `DAHT_-_Qmzs` (15 pages). No auto-split at 15.
- All Canva transactions opened in this session were **cancelled** (`6772802510490213265`, `2270328783015487126`, `6762669409337356517`); nothing was committed to any probe design. Probe designs left in the account, not in any folder: `DAHT_1qMeZ4`, `DAHT_w99T-8`, `DAHT_-_Qmzs`.
- `scripts/build-canva-ops.mjs`: Route C `find_and_replace` replacements now carry `after_ops` (`resize_element {width}` + `format_text {line_height, text_align}`) per S9; the corresponding test was updated to expect `after_ops`.
- State of the plan: step 0 done, step 1 done, step 2 partly done (P1 yes, P3 no, P8 no-split-at-15, P2 and P7 partial; P4/P5/P6 not run).
- **Resume here (fresh session)**: run the CLAUDE.md boot ritual; then (a) finish P7 (batch ceiling on `DAHT_-_Qmzs`: 10/25/50 `update_opacity` ops on page 1, cancel), (b) P2 second pass with one probe layout carrying a linear gradient and an inline SVG shape, (c) P5 only if Route D is still wanted (Route A already works), (d) P6 after the first family master exists; then start step 3 (harvest clone-first five from `research/05` into the scratchpad, `ingest-html.mjs`, author layouts family by family with `validate` green), following `docs/PLAN.md` § Execution order.

## 2026-09-02 · Session wrap-up (operator answers)

- Operator answers: S1 deferred (do not act); S10 answered, Barlow and JetBrains Mono accessible in Canva → `spec/fonts.json` both `canva_native: yes`, `L046` now `fonts_native: true`, validate has 0 warnings; Chrome automation deferred as a last resort (Decision 17; poor past experience: hundreds of screenshots, tens of hours); defaults confirmed (Decision 18) with a pointer table added to `CLAUDE.md`; skill names remain provisional.
- Rebuilt `build/` and `manifest/` after the font change; all checks green; committed and pushed.
- Session ends here; execution continues in a fresh session from the CLAUDE.md status block and the "Resume here" list above.
