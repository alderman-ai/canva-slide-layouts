# research/ — verbatim reports from the planning phase

Each file is a research report as delivered (headers added; nothing summarized away). Syntheses live in `spec/*` and cite these files by number. Read the one that matches your task; do not read all ten by default.

| # | File | Read when you are… | Trust | Declared gaps |
|---|---|---|---|---|
| 01 | `01-canva-import-formats.md` | choosing an import path, checking PPTX/HTML/Markdown limits, brand-template plan gating, Canva font substitution behavior | official + inferred, dated 2026-09-01 | fonts are community lists; `data-*` attributes were "not found" at the time (see 07) |
| 02 | `02-layout-repos-initial.md` | starting the layout library; need the 62-archetype baseline, 12-column grid numbers, char budgets, first repo list | web survey | Canva-import paragraph superseded by 07 |
| 03 | `03-taxonomy-flows-density.md` | extending the taxonomy (~50 more archetypes with item ranges), writing `spec/flows.md` (10 flow templates), `spec/rubrics.md` (density 1–5, polish 1–5), or the planner's length budget | sourced, numeric | Beautiful.ai item limits unpublished; 6x6 rules are folklore |
| 04 | `04-typography-systems.md` | seeding `spec/fonts.json` and `spec/pairings.md`, setting the type scale (1pt = 2px; read-deck vs live-talk), planning Canva font uploads | sourced; "in Canva" claims third-party | verify DM Sans/Manrope/Space Grotesk/IBM Plex in the editor |
| 05 | `05-layout-repos-deep.md` | harvesting layouts: ranked top-15 repos, clone-first five, license quarantine, Slidev theme layout names, the `data-document-role` wire-format examples | GitHub API + web, stars as of 2026-09-01 | some repos unlicensed |
| 06 | `06-slide-ontology-prior-art.md` | writing `spec/ontology.md`, `spec/vocab/*.json`, per-layout JSON Schema `accepts`, `plan.mjs` heuristics, Obsidian Bases views, PowerShell YAML parsing | academic + product docs | Keynote master names, Duarte taxonomy book-only |
| 07 | `07-canva-mcp-limits-and-claude-design-html.md` | authoring HTML for import, budgeting MCP calls, understanding `edit-design` limits (no font family; `replace_text` resets line-height), merge limits, Code-design failure mode | official schema + community measurements | recommends PPTX-primary, which this project rejects (see docs/DECISIONS.md) |
| 08 | `08-stack-interactions.md` | deciding which surface does a step (Claude Code / Claude Design / Canva MCP / Chrome), Design Sync internals, `.dc.html` deck shape, Chrome caveats, open live-test questions | official + inference; Chrome column unverified | speaker-notes row is wrong: our connector has `replace_speaker_notes` |
| 09 | `09-session-probes.md` | you need account ids (brand kit, folder, brand template, Design System project), the exact MCP tool surface and schema facts, local tool versions | **direct observation**, highest trust | re-verify if older than a few weeks |
| 10 | `10-brand-source-notes.md` | touching anything brand-related: where the alderman.ai code lives, visitor rules, order of authority, what to extract read-only | operator-designated source | values not yet extracted (execution step 1) |

Conventions: reports are immutable except for the header block and clearly marked `> Project note` callouts. New research goes in a new numbered file and a new row here.
