# CLAUDE.md — Canva Slide System (Markdown-first)

## What this repo is

A Markdown-first slide system: a **layout library** (one hybrid MD per slide layout, HTML generated from it), a **formal ontology and controlled vocabulary** for machine retrieval, **per-presentation projects** that decompose local context into fully filled slides, and a **batch upload** into Canva via the Canva MCP so the operator only redlines and polishes brand/style. It is also an Obsidian vault (Bases views over the frontmatter) and a PowerShell-driven toolchain (`scripts/slides.ps1`).

The approved plan is `docs/PLAN.md`. Decisions are numbered in `docs/DECISIONS.md`. Nothing in this file overrides those; this file tells you how to start and where to look.

## Model policy (Decision 12)

- **Orchestrator**: Fable 5.1 at **medium** effort (this session).
- **Subagents**: **Opus 5 at high effort**. On every `Agent` call pass `model: "opus"` and state "reasoning effort: high" in the prompt. Record any deviation in `docs/WORKLOG.md`.

## Hard rules (Decisions 1, 2, 4, 6)

1. **No vendor design files in the repo**: no `.pptx .ppt .potx .ppsx .key .odp .psd .ai .sketch .fig .indd`. `.gitignore` blocks them; `validate` must fail if one exists. A vendor file may exist only transitorily in the scratchpad during a conversion, then is deleted.
2. **Flat frontmatter only**: scalars and flat lists, no maps. Structured per-element data goes in body tables. Every file of a schema carries the full key set.
3. **Vocabulary only**: frontmatter values must come from `spec/vocab/*.json`. Unknown terms are validation errors; propose new terms by editing the vocab file first.
4. **Public repo hygiene**: `presentations/*` is git-ignored (private context and filled decks). Only placeholder-content layout HTML is pushed publicly. Bundles publish only when `content_public: true` is explicit.
5. **Brand source is read-only**: `C:\Users\alder\Desktop\Claude Code Website\alderman-ai\` (pinned `78f20ed`) and alderman.ai. Never write there, never `git add` outside this repo, never touch its `.rt/` worktree, never create files under its `components/`. Extract values into `spec/tokens.md` with citations.
6. **Canva side effects are logged**: every MCP call that changes Canva is recorded in the deck's `canva.md` (call, ids returned, thumbnail). `merge-designs` deletions require the operator's exact phrase "I approve the deletion". Never publish private files to a public host to satisfy an import; ask.
7. **Chrome automation is a deferred last resort (Decision 17)**: the operator has had poor results driving Canva through Claude in Chrome. Never plan on it; treat `spec/stack.md` Chrome checklists as operator procedures; attempt one only when explicitly asked in that session, after the operator picks the browser. Credential entry and account or security settings always stay with the operator.
8. **Repo indexing**: every new file gets a routing line in `INDEX.md` (and the folder README if one exists) saying what it is and when to read it (Decision 14).

## Boot ritual (every session, in order)

1. Read `docs/PLAN.md` header (status line) and the **Status block** at the bottom of this file.
2. Read `docs/DECISIONS.md` (all rows; it is short) and `docs/OPEN-QUESTIONS.md` (probe status).
3. Run `git status --short`, `.\scripts\slides.ps1 validate`, `node spec/vocab/check-vocab.mjs`, and `npm test`.
4. Check the Canva MCP is connected: call `list-brand-kits`; note which account you are in (expected brand kit `kAHHTmdCWzo` "alderman.ai").
5. Read `INDEX.md`, then `research/README.md`, and open only the research files your task needs.
6. If the task uses a skill, read its `SKILL.md` under `.claude/skills/`.
7. Before ending: append a dated entry to `docs/WORKLOG.md` and update the Status block below. Commit with a message that names the execution step.

## Read list by task

| Task | Read first | Then |
|---|---|---|
| Authoring or porting layouts | `spec/schema.md`, `spec/grid.md`, `spec/type-scale.md`, `spec/taxonomy.md` | `research/05`, `research/02`, `research/03` |
| Ontology, vocab, JSON Schemas, planner rules | `spec/ontology.md`, `spec/rubrics.md` | `research/06`, `research/03` |
| Anything touching Canva upload or edit | `spec/canva-limits.md`, `spec/stack.md` | `research/07`, `research/09`, `research/08` |
| Fonts, pairings, custom elements, Design Sync | `spec/fonts.json`, `spec/pairings.md`, `spec/tokens.md` | `research/04`, `research/10`, `research/09` |
| Composing a deck from a context folder | `.claude/skills/deck-decompose/SKILL.md`, `spec/flows.md`, `spec/rubrics.md` | `presentations/README.md` |
| Redlines, element mockups, intake, bundles | the matching `SKILL.md` | `docs/PLAN.md` § Skill specifications |
| Brand work | `research/10`, `spec/brand-sources.md` | the site's `LOCAL-AGENTS.md` (read-only) |

Files listed under `spec/` that do not exist yet are created in execution step 1; until then the research file is the source.

## Commands (`scripts/slides.ps1`, created in step 1)

`validate` · `build [<slug>]` · `find -Shape … -Items … -MaxPolish … -Component …` · `show <layout-id>` · `new-deck <slug>` · `plan <slug>` · `fill-check <slug>` · `ops <slug>` · `index [<slug>]` · `sync <slug>` · `export-bundle <slug> [-Public]` · `import-bundle <path>` · `bundle upload` (inside a bundle). One-line meanings are in `docs/PLAN.md` § Repository layout and § Skills.

Skills (repo-local, names provisional): `deck-decompose`, `element-mockup`, `slide-redline`, `slide-intake`, `bundle-upload`.

## Confirmed defaults and deferred items (pointers for operator and agents)

| Item | Status | Where it is recorded |
|---|---|---|
| Vault root is this directory | confirmed | `docs/DECISIONS.md` #18 |
| Public repo `alderman-ai/canva-slide-layouts` | confirmed | `docs/DECISIONS.md` #18, `INDEX.md` |
| Neutral pairing `neutral-default` (Inter Display 600 / Inter 400) | confirmed | `spec/pairings.md`, `docs/DECISIONS.md` #18 |
| Brand pairing `alderman-ai` (Barlow / JetBrains Mono), both accessible in Canva | confirmed | `spec/pairings.md`, `spec/fonts.json`, OPEN-QUESTIONS S10 |
| Chrome automation of Canva | deferred, last resort | `docs/DECISIONS.md` #17, `spec/stack.md` banner, OPEN-QUESTIONS P4 |
| Site repo staged deletions under `public/brand-assets/` | deferred by operator; do not act | OPEN-QUESTIONS S1 |
| Skill names (`deck-decompose`, `element-mockup`, `slide-redline`, `slide-intake`, `bundle-upload`) | provisional | `docs/PLAN.md` § Skill specifications |

## Environment facts (verified 2026-09-02, see `research/09`)

node 24.15 · npm 11 · python 3.14 · git 2.54 · gh 2.91 (logged in as `alderman-ai`) · Windows PowerShell 5.1 (no pwsh) · one Chrome extension connected ("Browser 1") · Canva presentation pages are 1920x1080 · folder `FAFsWyFFv3w` "Presentation templates" is empty and reserved for masters · Design System project `d1228f56-c841-450e-8665-c2d177fb9414`.

## Status block

- **Execution step**: 2 partly done (probe). Answered: P1 yes (HTML imports editable, exact geometry, fonts, notes), P3 no HTML export, P8 no auto-split at 15 pages, S10 fonts native. Partial: P2 (gradient/SVG untested), P7 (field names confirmed; ceiling/lifetime untested). Deferred by operator: P4 (Chrome), S1 (site repo). Not run: P5 (optional; Route A works), P6 (needs a family master). Details: `spec/canva-limits.md` §6.
- **Next action (fresh session)**: boot ritual, then finish P7 on `DAHT_-_Qmzs` (10/25/50 `update_opacity` ops on page 1, cancel), P2 gradient/SVG pass with one extra probe layout, then **step 3**: harvest the clone-first five (`research/05`) into the scratchpad, write `scripts/ingest-html.mjs`, author layouts family by family with `validate` green, push family masters via Route A. See `docs/WORKLOG.md` "Resume here".
- **Route decision**: Route A primary for masters and public-content decks (Decision 16); Route C for private content with `after_ops` after each fill (S9); Chrome never required (Decision 17).
- **Clean state**: no open Canva transactions; working tree clean at the last commit; `npm test` 25/25; `validate` 0 errors, 0 warnings; `check-vocab` OK.
- **Public repo**: https://github.com/alderman-ai/canva-slide-layouts (origin, `main`). Probe designs in Canva (no folder): `DAHT_1qMeZ4`, `DAHT_w99T-8`, `DAHT_-_Qmzs`.
- **Last session**: 2026-09-02, planning + steps 0-2 (partial); operator answers recorded (Decisions 17-18). See `docs/WORKLOG.md`.
