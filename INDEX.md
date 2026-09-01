# INDEX — every file in this repo, with when to read it

Routing index for agents and the operator. One line per file: what it is → when to open it. Keep it current: adding a file without an entry here fails review (Decision 14). Folders that grow large get their own README with the same format; this file then points at the README.

## Root

| File | What | Read when |
|---|---|---|
| `CLAUDE.md` | Rules, model policy, boot ritual, read list, commands, status block | Every session start; before any Canva or brand action |
| `INDEX.md` | This routing index | Looking for where something lives |
| `.gitignore` | Blocks vendor design files, `presentations/*`, bundle account state, `node_modules` | Adding a new file type or folder |
| `.gitattributes` | LF line endings, binary font/image types | Line-ending or diff oddities |

## docs/ — plan, decisions, questions, glossary, log

| File | What | Read when |
|---|---|---|
| `docs/PLAN.md` | The approved plan, verbatim, with a status header and changelog | Starting any execution step; scoping a skill; checking acceptance criteria |
| `docs/DECISIONS.md` | Numbered decision log (14 entries) with reasons and what each rules out | Before proposing an approach; when something feels arbitrary |
| `docs/OPEN-QUESTIONS.md` | Probe questions P1–P8, unverified claims, operator questions with defaults | Before the step-2 probe; whenever relying on a limit or capability |
| `docs/GLOSSARY.md` | Entities and mechanisms (layout, slide, unit, accepts, routes A–D, bundle, intake contract…) | A term is unclear; writing docs or skill text |
| `docs/WORKLOG.md` | Dated session entries: done, verified, next, deviations | Session start (last entry) and session end (append) |

## research/ — verbatim research reports (immutable)

See `research/README.md` for the per-report routing table. Short form:

| File | Read when |
|---|---|
| `research/README.md` | Choosing which report to open |
| `research/01-canva-import-formats.md` | Import formats and limits, PPTX fidelity, font substitution, brand-template plan gating |
| `research/02-layout-repos-initial.md` | 62-archetype baseline, grid and type numbers, first repo sweep |
| `research/03-taxonomy-flows-density.md` | Extra archetypes with item ranges, 10 flow templates, density and polish rubrics |
| `research/04-typography-systems.md` | Font registry seed, pairings, 1pt = 2px type scale, Canva font-upload rules |
| `research/05-layout-repos-deep.md` | Harvest ranking, clone-first five, licenses, `data-document-role` wire format |
| `research/06-slide-ontology-prior-art.md` | Element roles, unit typology, accepts precedents, decomposition numbers, Obsidian and PowerShell retrieval |
| `research/07-canva-mcp-limits-and-claude-design-html.md` | HTML import spec with confidence, MCP constraint table, route call budgets |
| `research/08-stack-interactions.md` | Which surface does what; Design Sync internals; Chrome caveats; live-test questions |
| `research/09-session-probes.md` | Account ids, exact MCP tool surface and schema facts, local tool versions (highest trust) |
| `research/10-brand-source-notes.md` | alderman.ai codebase location, visitor rules, order of authority, extraction targets |

## spec/ — the system's contracts

| File | What | Read when |
|---|---|---|
| `spec/ontology.md` | 12 entities, relations with cardinalities, 10 invariants, planner rules, ER diagram, how retrieval works | Designing or changing any schema, vocab, or planner rule |
| `spec/schema.md` | Authoritative frontmatter key sets per entity, element-table columns and `binds` grammar, required body headings, validate invariants | Authoring or parsing any hybrid MD |
| `spec/schema/*.schema.json` | JSON Schema 2020-12 for layout, slide, unit, deck (brief+plan), intake, bundle, font, asset; `accepts.template.json` with worked examples | Writing or extending `validate`/`match`; adding a layout's accepts file |
| `spec/schema/layouts/L###.json` | Per-layout accepts files (roles with min/max, unit types, item and char ranges) | Adding or planning against a layout |
| `spec/vocab/*.json`, `spec/vocab/README.md` | 19 controlled vocabularies (SKOS-style flat JSON): family, archetype, content_shape, unit_type, slide_function, shape, element_role, flow_role, flow_template, density, polish, audience, purpose, delivery_mode, evidence_kind, status, variant, brand, route; README routes each to its keys; `check-vocab.mjs` cross-checks prose and schemas | Choosing any frontmatter value; adding a term |
| `spec/taxonomy.md` | Archetype tree: 7 families, 104 archetypes with id, items, density, polish, flow role, shapes, accepts, follows/precedes, variants; conflicts resolved | Picking, naming, authoring, or substituting a layout |
| `spec/flows.md` | 10 flow templates as slot tables, budgeting algorithm, purpose → flow map | Planning a deck |
| `spec/rubrics.md` | Density 1–5 with numeric limits, delivery-mode defaults, polish 1–5 with family defaults, pace norms, decomposition priors, overflow rule | Planner rules; setting a layout's density or polish |
| `spec/grid.md` | 1920x1080 geometry: margins, 12-column span and offset tables, standard splits, safe zones, 8px rhythm | Any layout geometry; `build-html` |
| `spec/type-scale.md` | 1pt = 2px; ratio 1.333 base 32; two-mode token table; char budgets; `maxChars` formula (derived k for Inter) | Filling size and maxChars columns |
| `spec/fonts.json` | 60-family font registry (weights, source, license, canva_native, canva_fallback, weight map) | Setting `fonts[]`; resolving Canva fallbacks; validate warnings |
| `spec/pairings.md` | 13 named pairings incl. `alderman-ai` and `neutral-default`, with Canva degrade and per-weight roles | Setting `pairing`; planning Brand Kit font uploads |
| `spec/tokens.md` | alderman.ai brand tokens extracted read-only with `path:line` citations at commit `78f20ed`, ending in a machine-readable JSON block | Element work, pairings, anything brand-specific |
| `spec/brand-sources.md` | Provenance table, order of authority, drift rule, visitor rules for the site repo | Before trusting any token; before any brand work |
| `spec/canva-limits.md` | 53-row constraint table with confidence and source, Routes A–D with call budgets and recovery, the 15-rule HTML checklist, probe protocol P1–P8, `canva.md` call-log schema | Before any Canva call; running the step-2 probe |
| `spec/canva-edit-ops.md` | Full parameter reference for all 27 `edit-design` operations plus the other tool shapes, read from the live schema | Authoring Route B/C operation batches; Skills 2 and 3 |
| `spec/stack.md` | Capability matrix across Claude Code, Claude Design, Canva MCP, Chrome; division of labor; handoff formats; Design System project contract; `.dc.html` deck shape; six Chrome checklists (unverified) | Deciding which surface performs a step |

## layouts/ · presentations/ · bundles/ · intake/ · components/

| Path | What | Read when |
|---|---|---|
| `layouts/L###-<archetype>.md` | Layout classes (source of truth). Present: `L001-title-cover`, `L037-table-insight`, `L046-three-column` (the step-2 probe set) | Retrieval, authoring, porting |
| `presentations/README.md` | Deck directory contract; privacy rule | Creating or working a deck |
| `presentations/<slug>/` | Private deck projects (git-ignored) | Working that deck |
| `bundles/<slug>/` | Portable bundles (Skill 5) | Exporting or receiving a deck |
| `intake/<date>-<slug>.md` | Intake contracts from images/URLs (Skill 4) | Cataloguing an external slide |
| `components/slides/<Name>/` | React slide elements → four-file cards for Design Sync (Skill 2) | Element mockups |

## build/ · manifest/ · assets/ · bases/ · scripts/ · .claude/skills/

| Path | What | Read when |
|---|---|---|
| `build/html/`, `build/canva-ops/`, `build/dc/`, `build/previews/` | Generated import HTML (per layout, per family, contact-sheet `index.html`), edit-operation batches, Claude Design `.dc.html` deck, PNG previews (committed; markup and images only) | Reviewing output; Route A/B/D inputs |
| `manifest/layouts.json`, `manifest/canva-index.json`, `manifest/assets.json`, `manifest/components.json` | Derived caches from frontmatter and Canva dumps | Scripted retrieval; never hand-edit |
| `assets/` | Gray placeholder images and icons (SVG/PNG) | Asset uploads |
| `bases/layouts.base`, `bases/decks.base`, `bases/README.md` | Obsidian Bases views: layouts (8 views incl. family board, quick polish, needs font install) and decks/plans | Browsing or picking layouts in Obsidian |
| `scripts/README.md` | Per-script routing table, `slides.ps1` verb table, authoring conventions, how to test | Running or changing the toolchain |
| `scripts/slides.ps1` | Operator front door (Windows PowerShell 5.1): `validate build build-dc ops manifest preview find show new-deck hygiene help` | Every operator action |
| `scripts/lib/md.mjs` | Hybrid-MD library: `parseHybrid`/`serializeHybrid`, tolerant GFM tables, `loadVocab`/`loadSchemas`/`loadFonts`, element helpers | Before changing the MD contract or writing a script |
| `scripts/validate.mjs` | The gate: hygiene, flat frontmatter, Ajv schemas with vocab enums, geometry, capacity, fonts, unique ids; `--json --hygiene-only --type --spec` | Session start; after editing any MD |
| `scripts/build-html.mjs` | MD → annotated import HTML per layout, family, or deck, plus a 25% contact sheet | Before an HTML import or previews |
| `scripts/build-dc.mjs` | MD → `build/dc/<name>/Main.dc.html` + `canvas.json` in the Claude Design deck shape (experimental) | Before a Design Sync push (Route D) |
| `scripts/build-canva-ops.mjs` | MD → `edit-design` operation batches (≤25 ops per chunk) and Route C find-and-replace blocks | Before a Route B/C upload |
| `scripts/manifest.mjs` | Builds `manifest/layouts.json` and `manifest/components.json` | After editing layouts |
| `scripts/preview.mjs` | Playwright PNG previews and per-family contact sheets | After `build` |
| `scripts/test/*.test.mjs`, `scripts/test/fixtures/` | 25 node tests and fixtures (valid `L999`, broken `L998`) | Before committing a script change |
| `templates/_base.css`, `templates/_page.html.tpl` | Reset plus grid and type tokens; the page wrapper | When the page shell changes |
| `package.json`, `package-lock.json` | Private ESM package; npm scripts `validate build build:dc build:ops preview manifest test` | Adding a script or dependency |
| `.claude/skills/<name>/SKILL.md` | Operator skills: deck-decompose, element-mockup, slide-redline, slide-intake, bundle-upload | Running that skill |

Entries for files not yet created describe their intended content; `docs/PLAN.md` is authoritative until they exist.
