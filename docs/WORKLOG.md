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
