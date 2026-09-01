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

## spec/ — the system's contracts (created in execution step 1)

| File | What | Read when |
|---|---|---|
| `spec/ontology.md` | Entities, relations, cardinalities; cites research/06 | Designing or changing any schema |
| `spec/schema.md` | Frontmatter key sets per entity and element-table columns | Authoring any hybrid MD |
| `spec/schema/*.json` | JSON Schemas per entity and per-layout `accepts` | Writing `validate`/`match`; adding a layout |
| `spec/vocab/*.json` | Controlled vocabularies (SKOS-style flat JSON) | Choosing any frontmatter value |
| `spec/taxonomy.md` | Archetype tree with families, item ranges, accepts summaries | Picking or naming a layout |
| `spec/flows.md` | Flow templates with slots and target lengths | Planning a deck |
| `spec/rubrics.md` | Density 1–5, polish 1–5, pace norms, decomposition priors | Planner rules; setting a layout's density/polish |
| `spec/grid.md`, `spec/type-scale.md` | 1920x1080 grid; type scale in two modes; char budgets | Authoring layouts |
| `spec/fonts.json`, `spec/pairings.md` | Font registry; named pairings | Any font choice; validate warnings |
| `spec/tokens.md`, `spec/brand-sources.md` | Brand values extracted read-only with citations | Element work for alderman.ai |
| `spec/canva-limits.md` | Limits, probe results, route decisions | Before any upload |
| `spec/stack.md` | Capability matrix and Chrome checklists | Deciding which surface performs a step |

## layouts/ · presentations/ · bundles/ · intake/ · components/

| Path | What | Read when |
|---|---|---|
| `layouts/L###-<archetype>.md` | Layout classes (source of truth) | Retrieval, authoring, porting |
| `presentations/README.md` | Deck directory contract; privacy rule | Creating or working a deck |
| `presentations/<slug>/` | Private deck projects (git-ignored) | Working that deck |
| `bundles/<slug>/` | Portable bundles (Skill 5) | Exporting or receiving a deck |
| `intake/<date>-<slug>.md` | Intake contracts from images/URLs (Skill 4) | Cataloguing an external slide |
| `components/slides/<Name>/` | React slide elements → four-file cards for Design Sync (Skill 2) | Element mockups |

## build/ · manifest/ · assets/ · bases/ · scripts/ · .claude/skills/

| Path | What | Read when |
|---|---|---|
| `build/html/`, `build/canva-ops/`, `build/previews/` | Generated HTML, edit-operation batches, PNG previews (committed; markup and images only) | Reviewing output; Route A/B inputs |
| `manifest/layouts.json`, `manifest/canva-index.json`, `manifest/assets.json`, `manifest/components.json` | Derived caches from frontmatter and Canva dumps | Scripted retrieval; never hand-edit |
| `assets/` | Gray placeholder images and icons (SVG/PNG) | Asset uploads |
| `bases/*.base` | Obsidian Bases views (layouts, units, decks, redlines) | Browsing in Obsidian |
| `scripts/slides.ps1`, `scripts/*.mjs`, `scripts/lib/md.mjs` | PowerShell front door and node tooling | Running or extending the toolchain |
| `.claude/skills/<name>/SKILL.md` | Operator skills: deck-decompose, element-mockup, slide-redline, slide-intake, bundle-upload | Running that skill |

Entries for files not yet created describe their intended content; `docs/PLAN.md` is authoritative until they exist.
