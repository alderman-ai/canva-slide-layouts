# Open questions and unverified claims

Each entry: what is unknown, why it matters, how to test it, status. Close an entry by recording the answer and the date; move settled facts into `spec/canva-limits.md` or `spec/stack.md`.

## Probe questions (execution step 2; all cheap, run on the same 3 probe layouts)

| # | Question | Why it matters | How to test | Status |
|---|---|---|---|---|
| P1 | **ANSWERED 2026-09-02: markup is enough.** Annotated HTML from the public repo imported as an editable `presentation` with exact geometry, fonts, notes and page titles (see `spec/canva-limits.md` §6). Original question: Does Canva's "Claude Design deck" detection key on markup (`data-document-role="page"` sections, or `deck-stage` / `<x-dc>`) or on origin (a Claude Design URL/signature)? | Decides whether Route A HTML import yields editable pages or a Code design | Import `build/html/probe.html` (annotated) via `import-design-from-url` with `intended_design_type: presentation`; `read-design` → check `design_types`, page count, and that `design_content` returns text per page; also try the `.dc.html` deck shape | **answered: yes** |
| P2 | Do non-native fonts, gradients, and inline SVG survive Route A and Route D (Send to Canva)? | Determines how much post-import font work remains and whether SVG shapes stay editable | Probe layouts use Barlow (installed in Brand Kit?) and one non-installed family; one simple gradient; one inline SVG shape; inspect via `read-design` transaction and thumbnails | **partly answered**: Barlow and JetBrains Mono preserved (distinct fontRefs, rendered); gradients and inline SVG not yet probed |
| P3 | Does `get-export-formats` on a presentation offer `html_bundle` / `html_standalone`? | Enables Canva → repo round trips as markup | Call `get-export-formats` on `DAHT4uBPl_o` | **answered: no** (pdf, jpg, png, pptx, gif, mp4 only) |
| P4 | Can Claude in Chrome perform font "Change All" and Brand Kit apply on Canva's canvas-rendered editor, and does its policy refuse Share → Template link? | Decides which last-mile steps can be automated | On operator request only: pick browser, open a master, screenshot-driven steps, record success or refusal | open |
| P5 | Does a hand-authored `.dc.html` deck written by `DesignSync.write_files` render in claude.ai/design and expose "Send to Canva"? | Route D viability | Write a one-slide deck into a **new** regular project (never the DS project), open in claude.ai/design, try Send to Canva | open |
| P6 | Does `publish-brand-template` work on this account? | Decision 7 fallback trigger | After a family master exists: `create-brand-template-draft` then `publish-brand-template` once; record the error text if refused | open |
| P7 | What is the practical ops-per-call ceiling and transaction lifetime for `edit-design`? | Sizing Route B/C batches | On the probe design: 10, 25, 50 ops in one call; leave a transaction open 10 minutes then commit | **partly answered**: field names confirmed for 4 ops; `find_and_replace_text` collapses box width to content; ceiling and lifetime untested |
| P8 | Does `import-design-from-url` auto-split a 15-page family master, and at what size? | Family master sizing | Import a 15-page deck, then a 40-page deck; count resulting designs | **answered: no split at 15 pages** (`DAHT_-_Qmzs`); 40-page test pending |

## Unverified claims carried from research

| Claim | Source | Status |
|---|---|---|
| Max 350 pages per design | research/01 cites Canva Help; research/07 could not re-verify | unverified; stay ≤300 per design |
| Uploaded Brand Kit fonts are matched by name on import | research/04: not stated in docs | unverified; assume "Change All" is needed |
| `replace_text` resets line-height to 1.4 and list markers; `add_text` lands black 16px | community measurement 2026-08-23 (research/07) | assume true; re-measure in P7 |
| Inferred rates: ~20/min open and commit, ~50/min operations for `edit-design` | proxy from classic edit API (research/07) | unverified; pace batches accordingly |
| Canva Help tool's statement that Pro can publish Brand Templates | research/09 (help service answer) | conflicts with pricing page; P6 decides |
| DM Sans, Manrope, Space Grotesk, IBM Plex are in Canva's library | third-party lists (research/04) | verify in the editor before tagging `canva_native: yes` |
| Chrome extension can drive Canva's editor reliably | no field reports (research/08) | P4 |

## Added during execution step 1 (2026-09-02)

| # | Item | Why it matters | How to test / resolve | Status |
|---|---|---|---|---|
| S1 | The site repo `alderman-ai` at `78f20ed` has a **dirty tree**: six staged deletions under `public/brand-assets/` (`alderman-ai-wordmark-v2.svg`, `alderman-ai-mark-transparent-v1.svg`, `alex-portrait-still-human-v1.png`, `scribbles/*`). The site's own check #2 treats this as a stop condition. | Logo assets referenced by tokens are not on disk; this project must not restore them | Operator decides in the site repo; re-run `brand-extract` afterwards | **operator** |
| S2 | Twelve conflicts between the site's design docs and its code (e.g. h2 weight 600 vs 700, mark PNG 1000 vs 1181 px, three breakpoint systems, `tailwind.config.js` pointing at a missing `lib/tokens.ts`). | Which value elements should follow | Code wins per order of authority; listed in `spec/tokens.md` "Notes on drift" | recorded |
| S3 | `move-item-to-folder` and `create-folder` parameter shapes were never schema-loaded in-session. | Upload step uses them | Load with ToolSearch before first use and append to `spec/canva-edit-ops.md` | open |
| S4 | Locator stability across a transaction commit (do `locator_id`s survive commit and re-open?). | `slide-redline` relies on stored locators | Probe P7 extension: read → commit → re-open → compare ids | open |
| S5 | Whether Canva's font picker has a "Change All" affordance at all (no help page found). | Post-import font fix for masters | P4 state 5 | open |
| S6 | Whether applying Brand Kit Styles in Canva is destructive to layout geometry. | Chrome checklist 6.3 in `spec/stack.md` | Try on a copy of a probe design | open |
| S7 | The `maxChars` constant k = 0.55 em for Inter is derived, not published. | Wrap-width accuracy | Re-derive from the rendered probe deck (measure actual line breaks) | open |
| S8 | Six archetypes have no published item range; density level 5 has no published min body px. | Rubric completeness | Set from probe rendering; mark as project values | open |

Resolved in step 1: the 27 `edit-design` operation parameter shapes are now fully recorded in `spec/canva-edit-ops.md` (was: only names captured for 19 of them).

Added in step 2: **S9** `find_and_replace_text` (and presumably `replace_text`) resets an imported text box to natural width; Route C must re-apply `resize_element {width}` after every fill. **S10** Whether Barlow / JetBrains Mono were preserved because they are library fonts or because they exist in the Brand Kit; operator confirms in the editor.

## Product questions for the operator (non-blocking; defaults in force)

| Question | Default in force |
|---|---|
| Should the vault root be this directory or a folder inside the main Obsidian vault? | This directory is the vault root; can be moved later |
| Public repo name | `alderman-ai/canva-slide-layouts` |
| Default pairing for neutral (non-alderman) layouts | Inter Display 600 / Inter 400 (research/04 pairing #2) |
| Final names and one-line descriptions for the five skills | Working names in docs/PLAN.md until the operator renames them |
