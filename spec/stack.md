# spec/stack.md — capability matrix, division of labor, handoffs, Chrome checklists

> Status: written in execution step 1 from research only. Everything in the **Claude in Chrome** column and
> every step of every Chrome checklist is **unverified** — no field report of Claude in Chrome driving Canva's
> editor exists (research/08 §3). **P4** is the probe that changes that. Companion:
> `spec/canva-limits.md` (the Canva-side contract, routes, probe protocol). Rules that outrank this file:
> `CLAUDE.md` hard rules and `docs/DECISIONS.md`.

## Confidence legend

| Tag | Meaning |
|---|---|
| **official** | Vendor docs (canva.dev, canva.com/help, support.claude.com, code.claude.com) or a vendor announcement |
| **schema-read** | Read directly off a live tool schema in this account's session (`research/09`) — highest trust |
| **community** | Third-party hands-on report |
| **inferred** | Our reasoning; nothing observed |

---

## 1. Capability matrix

Rows are the pipeline tasks from research/08 §(a), plus five rows that section did not cover: write speaker
notes, move to folder, create folder, read comments / reply, export for review.

Cells: **yes** / **partial** / **no**, with the note and the source. `n/a` means the surface has no role in
that task.

| Pipeline task | Claude Code scripts | Claude Design via Design Sync | Canva MCP | Canva via Claude in Chrome |
|---|---|---|---|---|
| **Author layout HTML (MD → HTML)** | **yes** — `build-html.mjs` is our renderer; `build-dc.mjs` emits the `.dc.html` target from the same layout model (official, research/08 §a) | **yes** — prompt-driven; output is `.dc.html` (official, research/08 §1) | **no** — `generate-design` is prompt → Canva-native, not markup in (official, research/08 §a) | n/a |
| **Create branded custom elements** (cards, callouts, KPI tiles, chart frames) | **yes** — HTML/SVG/React source in `components/slides/**`; pushed via `/design-sync` (React) or `DesignSync.write_files` (`.dc.html`) (official, research/08 §1) | **yes** — stored as `.dc.html` / JSX; **no SVG export** exists, so the "export" is source or a PNG artboard (official + inferred, research/08 §1) | **partial** — only as an uploaded PNG asset via `upload-asset-from-url` + `insert_fill`, or decomposed into `insert_shape` / `add_text` ops (official, research/08 §a; `spec/canva-limits.md` §1.4). SVG is not an accepted upload type | n/a |
| **Apply brand tokens** | **yes** — CSS custom properties in our HTML, values from `spec/tokens.md` (official) | **yes** — via the published Design System (`tokens/`, `fonts/`, `styles.css`) (official, research/08 §1) | **partial** — Brand Kit applies only at generation (`generate-design` with a brand kit, `create-design-from-brand-template`, Pro+); **no "apply kit to an existing design"** (official + inferred, research/08 §a) | **partial** — Styles / Brand Kit apply in the editor (**inferred**, research/08 §a; checklist §5.3, **unverified**) |
| **Batch-create pages** | **yes** — orchestrates the MCP in loops within the rate limits (official) | **partial** — chat-driven, not batch (research/08 §a) | **yes** — `import-design-from-url` per deck, `merge-designs` (≤500 ops), `add_page` op (official + schema-read, research/09) | **partial** — Bulk Create UI (**inferred**, research/08 §a) |
| **Set font family design-wide** | **partial** — only upstream, in the HTML we author; the family still has to exist in Canva (official) | **yes** — in the DS / `.dc.html` (official, research/08 §a) | **no** — **no `edit-design` operation carries a font-family field** (schema-read, research/09); Canva's own skill says "CANNOT" (community, research/07 §b) | **yes-ish** — the font picker's "Change All" via screenshots + coordinate clicks (**inferred**, research/08 §a; checklist §5.2, **unverified**, **P4**) |
| **Upload Brand Kit fonts** | **no** | **no** | **no** (official, research/08 §a) | **yes** — extension `file_upload` ≤10 MB; Canva accepts OTF/TTF/WOFF <15 MB, Pro+, owner/admin/brand-designer role (official for both halves; the **combination is inferred**, research/08 §3, research/04 §d; checklist §5.1, **unverified**) |
| **Publish reusable template** | **no** | **no** | **yes, gated** — `create-brand-template-draft` + `publish-brand-template` (Pro/Teams/Enterprise, admin or brand-designer role, preview API, 20/min) (official, research/08 §2); a Pro user was refused (community, research/07 §b). Template **link**: no tool | **yes** — Share → Brand Template / Template link; the extension may refuse it as an access-control change (official + **inferred**, research/08 §3; checklists §5.4, §5.5, **unverified**) |
| **Assemble deck from masters** | **yes** — orchestrates and computes the page order (official) | **partial** — prompt-driven (research/08 §a) | **yes** — `copy-design` + `merge-designs` + `edit-design`; `create_new_design` accepts only `insert_pages` (schema-read, research/09) | **partial** — manual page duplication (**inferred**) |
| **Fill text by locator** | **yes** — in our own HTML, before upload (official) | **yes** — in `.dc.html` (official) | **yes** — `find_and_replace_text` / `replace_text` against `locator_id`s from a `read-design` transaction (schema-read, research/09) | **partial** — possible but slow, one box at a time (**inferred**) |
| **Write speaker notes** *(corrects research/08, which said MCP was read-only)* | **yes** — `data-speaker-notes` in the emitted HTML (official, tool description) | **yes** — `data-speaker-notes` on the deck `<section>`s (**inferred** from the Claude Design deck contract, research/07 §a) | **yes** — **`replace_speaker_notes` is an `edit-design` operation on this connector, ≤5000 chars** (schema-read, research/09). Read back via `read-design` `presenter_notes` | **yes** — the Notes panel (**inferred**, research/08 §a, **unverified**) |
| **Move to folder** | **yes** — orchestrates the call (inferred) | **no** | **yes** — `move-item-to-folder` (schema-read tool list, research/09; not schema-loaded in-session, so the parameter shape is **inferred**) | **yes** — drag in Projects (**inferred**, **unverified**) |
| **Create folder** | **yes** — orchestrates the call (inferred) | **no** | **yes** — `create-folder` (schema-read tool list, research/09; parameter shape **inferred**) | **yes** — New folder in Projects (**inferred**, **unverified**) |
| **Read comments / reply** | **yes** — orchestrates and files threads into each slide's `## Redlines` (inferred) | **partial** — inline comments on its own designs only (official, research/08 §a) | **yes** — `list-comments`, `list-replies`, `reply-to-comment`, `comment-on-design`; 100 req/min (official + schema-read tool list, research/08 §2, research/09) | **yes** — the comment sidebar (**inferred**, **unverified**) |
| **Export for review** | **partial** — local PNG previews via Playwright; no Canva render (inferred) | **yes** — PDF / PPTX / standalone HTML / .zip (official, research/08 §1) | **yes** — `export-design` (pptx, pdf, png, jpg, gif, mp4, csv), `get-export-formats` **first**; 20/min; signed URLs expire; **no SVG**; `html_bundle` presence unknown (official, research/07 §b, research/08 §2; **P3**) | **yes** — the Download dialog; **every download needs explicit per-action confirmation** (official, research/08 §3; checklist §5.6, **unverified**) |
| **Convert a Code design → editable presentation** | **partial** — only by making the HTML *be* a Claude Design deck (**inferred**, research/08 §a) | **yes** — Send to Canva on a slide-deck project (official, research/08 §1) | **no** documented tool (official absence, research/08 §a) | **partial** — "Use in a design" embeds a Code element; there is no full conversion in the UI (official + **inferred**, research/08 §3) |

**Two corrections to research/08 recorded here** (research/08 declares the first itself, in its own header):

1. Its matrix says speaker notes are **read-only** via MCP. **False for this connector**: `replace_speaker_notes` is one of the 27 `edit-design` operations (schema-read, research/09), capped at 5000 chars.
2. Its matrix row "Publish reusable template → Canva MCP: **Yes**" reads more confidently than the evidence supports. It is **yes-but-gated**: a Pro user was refused (research/07 §b) and the pricing page leaves the row blank for Pro (research/01 §4). Decision 7 makes it try-then-fallback; **P6** settles it.

---

## 2. Division of labor per pipeline step

The pipeline is `docs/PLAN.md` § "Pipeline for a presentation". One row per step: who does it, why that
surface, and what it emits.

| # | Pipeline step | Surface | Why | Emits |
|---|---|---|---|---|
| 1 | `new-deck <slug>` scaffold | **Claude Code** (`slides.ps1`) | Deterministic file creation | `presentations/<slug>/brief.md`, `context/` |
| 2 | Ingest context | **Claude Code** (semantic) | Reads MD/TXT/CSV natively, PDFs via Read, images noted as `image_ref` | `context/_index.md` |
| 3 | Extract content units | **Claude Code** (semantic) | Vocabulary-constrained decomposition; needs the repo's ontology | `units.md` |
| 4 | Plan (`plan.mjs` + `match.mjs`) | **Claude Code** (deterministic) | Scoring and budgeting must be reproducible | `plan.md` + fit report |
| 5 | Fill slides | **Claude Code** (semantic) | Copy within `maxChars`, speaker notes | `slides/S##-*.md` |
| 6 | Build | **Claude Code** (deterministic) | Two render targets from one layout model | `build/deck.html`, `build/deck.dc.html`, `build/canva-ops/*.json`, PNG previews |
| 7a | Build family masters | **Canva MCP** Route A, or **Claude Design** Route D if P1 says origin | Masters are the only way to get exact fonts through the API (`spec/canva-limits.md` §1.4 consequence 1) | Master designs in folder `FAFsWyFFv3w`; `manifest/canva-index.json` |
| 7b | Fix master fonts once per family | **Canva via Chrome** (font "Change All"), on operator request only | No API op sets a font family | `fonts_fixed: true` on the master's index entry; screenshots |
| 7c | Upload the filled deck | **Canva MCP** Route C | Fonts, sizes and geometry inherit from the master; ≈46 calls for 40 slides | Canva design + `canva.md` log |
| 7d | Insert a custom element | **Claude Design** (author/refine) → **Canva MCP** Route B (insert) | Design Sync stores the component; MCP places it natively or as an asset | `components/slides/<Name>/`, updated slide MD, `manifest/components.json` |
| 8 | Redlines | **Canva MCP** (`list-comments` → `reply-to-comment`) + **Claude Code** (apply) | Comments are fully MCP-readable and writable | `## Redlines` per slide MD; text fixes by locator |
| 9 | Brand / style polish | **Operator**, optionally **Chrome**-assisted | Out of scope for the library (`docs/PLAN.md` § Context) | — |
| 10 | Export for review | **Canva MCP** (`get-export-formats` → `export-design`) | Signed URLs; always return the `edit_url` too | PDF/PNG in the review thread |
| 11 | Bundle export / receive | **Claude Code** (`export-bundle`, Skill 5) | Self-contained, account-agnostic | `bundles/<slug>/`, `canva/<account-id>.md` on the receiving device |

**Standing rules**

- Anything that changes Canva is logged to `canva.md` in the `spec/canva-limits.md` §5 format (CLAUDE.md hard rule 6).
- Chrome runs **only** when the operator asks, and only after they pick the browser (CLAUDE.md hard rule 7).
- Design Sync writes are limited to **new** `components/slides/**` and `templates/slides/**` paths (§4).
- Nothing is written to the alderman.ai site repo, ever (Decision 6).

---

## 3. Handoff formats

| From | To | Format | Tool | Notes |
|---|---|---|---|---|
| Layout / slide MD | Canva-import HTML | Annotated HTML: `<section data-document-role="page" data-label data-speaker-notes>`, fixed 1920x1080, inline styles | `build-html.mjs` | Rules and confidences: `spec/canva-limits.md` §3 |
| Layout / slide MD | Claude Design deck | `.dc.html` — `<x-import component-from-global-scope="deck-stage" width="1920" height="1080">` with `<section>` children | `build-dc.mjs` | Shape in §5 below (research/08 §1) |
| Layout / slide MD | Canva edit operations | JSON, one file per page, ≤25 ops per file | `build-canva-ops.mjs` | One page per `edit-design` call (`spec/canva-limits.md` C21/C24) |
| React component (`components/slides/<Name>/`) | Design System project | Four-file card: `<Name>.html`, `<Name>.jsx`, `<Name>.prompt.md`, `<Name>.d.ts` (+ `_preview/<Name>.js` built by the app) | `/design-sync` (converter + verifier + uploader; first sync "can take up to a few hours") | React package expected; official, research/08 §1 |
| Hand-authored `.dc.html` | Claude Design project | `.dc.html` file(s) | `DesignSync.create_project` → `finalize_plan` → `write_files` (≤256 files/call) | `finalize_plan` locks the write/delete globs; every write needs its `planId` (official, research/08 §1) |
| Claude Design | Repo | Refined `.dc.html` / JSX source | `DesignSync.get_file` (≤256 KiB) | The only "export" of a component; **no SVG export exists** (research/08 §1) |
| Claude Design | Canva | Bundled HTML + assets at a public URL, converted by Canva | Share → **Send to Canva** (UI) | The only officially guaranteed HTML→editable-presentation path (official, research/08 §1). Route D |
| Repo (public raw URL) | Canva | Annotated HTML or a `.zip` of HTML + assets | `import-design-from-url` | Public HTTPS only; placeholder content only unless the operator approves (Decision 4) |
| Repo | Canva assets | PNG/JPG at a public URL | `upload-asset-from-url` → `asset_id` → `insert_fill` | <50 MB; SVG is not an accepted upload type |
| Canva | Repo (structure) | Element JSON with `locator_id`s and geometry | `read-design` `open_transaction: true`, `page_indices` in chunks of 50 | The only source of locators (`spec/canva-limits.md` C18/C19) |
| Canva | Repo (visual) | PDF / PNG (and `html_bundle`, pending **P3**) | `get-export-formats` → `export-design` | Signed URLs expire; export is a delivery mechanism, always return the `edit_url` |
| Canva | Repo (feedback) | Comment threads | `list-comments`, `list-replies` | Filed into each slide MD's `## Redlines` |
| Repo | Another device / account | Portable bundle directory with checksums and pinned scripts | `slides.ps1 export-bundle` (Skill 5) | Account state stays in a git-ignored `canva/<account-id>.md` (Decision 11) |
| Scratchpad | Canva (emergency only) | PPTX, hand-uploaded by the operator | Canva Upload UI | Never hosted, never committed, deleted the same session (`spec/canva-limits.md` §2.5) |

---

## 4. The Design System project contract

Project: **"alderman.ai Design System"**, `projectId d1228f56-c841-450e-8665-c2d177fb9414`, owner "Alex",
updated 2026-08-14. It is the **only** writable design-system project on this account. All facts below are
**schema-read** from `DesignSync.list_files` in-session (research/09).

### File conventions (observed, must be matched exactly)

| Convention | Detail |
|---|---|
| **Component path** | `components/<group>/<Name>/` |
| **Four files per component** | `<Name>.html` (preview card), `<Name>.jsx`, `<Name>.prompt.md`, `<Name>.d.ts` — all four, always |
| **`_preview/`** | Previews compile to `_preview/<Name>.js`; generated by the app, **never hand-written** |
| **Existing groups** | `chrome` (`FloatingNav`, `Footer`, `SideNav`, `StackedLogo`, `UrlWordmark`), `layout` (`PageFrame`), `paper` (`PaperApp`), `sections` (`HeroSection`, `TrialCTASection`, `WhatYouGetSection`), `special` (`FaqChat`, `Postit`, `SectionTile`, `TerminalLine`) |
| **Build artefacts** | `_ds_bundle.js` (compiled React lib on a window global), `_ds_bundle.css`, `_ds_manifest.json` (built by the app's self-check), `_ds_sync.json`, `_ds_needs_recompile`, `_adherence.oxlintrc.json`, `_vendor/react.js`, `_vendor/react-dom.js` — **never hand-edited** |
| **Styles** | `styles.css` — the `@import` closure; designs receive only this file (research/08 §1) |
| **Fonts** | `fonts/fonts.css` plus `barlow-{300,400,500,600,700}-latin{,-ext}.woff2` and `jetbrains-mono-{400,500}-latin{,-ext}.woff2`. **Barlow 300–700 and JetBrains Mono 400/500 are the brand pairing.** These are `.woff2`, which **Canva cannot ingest** (`spec/canva-limits.md` C45) — the operator supplies static OTF/TTF for Canva |
| **`templates/`** | Already holds `templates/linkedin-social/{LinkedinSocial.dc.html, ds-base.js, support.js, .thumbnail, reference/…, shipped/*.png}` — the pattern a canvas template follows: one `.dc.html`, a `reference/` folder of HTML, and shipped PNGs |
| **Group marker** | A new slide component carries `<!-- @dsCard group="Slides" -->` in its `.html` card (`docs/PLAN.md` § Claude Design project) |
| **Screenshots** | `screenshots/*.png` at project root |

### The write rule

**Only `components/slides/**` and `templates/slides/**` may be written.** Nothing that already exists in the
project is touched — not a component, not `styles.css`, not `fonts/`, not any `_ds_*` artefact (Decision 9).

- `finalize_plan` must lock exactly those two globs and nothing wider; a plan with a broader glob is re-planned, not used.
- `styles.css` and `fonts/fonts.css` are read **once**, with `get_file`, to lift exact token values into `spec/tokens.md` so slide layouts and components share metrics. Reads are prompt-free after the initial grant; `create_project` and `finalize_plan` each raise a permission prompt (official, research/08 §1).
- New slide components go in as group `Slides`: `components/slides/<Name>/` with the four-file convention (`KpiTile`, `CalloutCard`, `QuoteBlock`, `TimelineRail`, `ChartFrame`, `SectionHeader`, …).
- A 1920x1080 slide artboard template goes in `templates/slides/`.
- `/design-sync` expects a **React** package (Decision 9), so `components/` in this repo is a small React package whose build emits the four files per component.

---

## 5. The `.dc.html` deck shape

Source: research/08 §1 (O-adjacent — the `/design` and `/design-sync` skill texts plus community
`.design-sync/NOTES.md` files), cross-checked against the `templates/linkedin-social/LinkedinSocial.dc.html`
pattern actually present in the project (schema-read, research/09). Treat the exact attribute set as
**community/inferred** until **P5** renders one.

- Native format is **`.dc.html`** — plain HTML plus `<x-dc>`, `<x-import>`, `<dc-import>`, `{{tokens}}`, and a `support.js` runtime. One `.dc.html` = one artboard; `canvas.json` lays multiple artboards out.
- A **deck** is one artboard whose slides are `<section>` children of the deck stage:

```html
<x-import component-from-global-scope="deck-stage" width="1920" height="1080">
  <section data-label="Title" data-speaker-notes="…">…</section>
  <section data-label="Agenda" data-speaker-notes="…">…</section>
  <!-- one <section> per slide, in order -->
</x-import>
```

- The deck stage absolutely positions each `<section>`; each section is a full 1920x1080 slide.
- A deck project embeds the Design System under `_ds/<ds-name-id>/`; components are mounted with `<dc-import name="…">` or as real React components from the DS bundle.
- Images are stored as base64 file entries; icons are expected as inline SVG.
- `data-label` and `data-speaker-notes` are the same attributes the Canva importer reads, which is why "Send to Canva" is believed to inject `data-document-role="page"` onto these sections (inferred, research/07 §a).
- `build-dc.mjs` emits exactly this shape from the same layout model that feeds `build-html.mjs`.

---

## 6. Chrome operating checklists

> **Every step in every checklist below is `unverified` (research/08 §3).** No published hands-on report of
> Claude in Chrome driving Canva's editor was found; the whole Chrome column rests on official constraints
> plus inference. **P4** is the probe. Until P4 passes, treat each checklist as a proposal, run it once under
> observation, and record what actually happened in `spec/canva-limits.md` §4.

### Universal preconditions (all six checklists)

1. **The operator asked for this specific browser step** (CLAUDE.md hard rule 7). An agent never opens Chrome on its own initiative.
2. **The operator picked the browser** via the AskUserQuestion flow the tool requires. This account has exactly one: `deviceId b72545d0-f876-4373-b8d7-8489472c2d55`, "Browser 1", Windows, local (schema-read, research/09).
3. **The Canva tab is foregrounded.** Background MCP tabs get `visibilityState: hidden`, which throttles rAF/setTimeout and can stall a canvas-rendered editor (community, research/08 §3).
4. **No JS modal dialog is open.** A modal blocks *all* extension commands and must be dismissed by hand (official, research/08 §3).
5. **Use visual tools, not DOM refs.** The extension's own operating prompt names Canva as an app that is "easier to use with visual tools": `read_page` will usually find nothing on the canvas. Work from `computer` screenshots plus coordinate clicks (official-adjacent, research/08 §3).
6. **Screenshot at every numbered state below**, before and after the action, and attach them to the `canva.md` line (`tool: "chrome:<step>"`, `spec/canva-limits.md` §5 rule 5).

### Universal stop conditions — hand back to the operator, do not work around

| Condition | Why |
|---|---|
| A login screen or SSO prompt | Credential entry always stays with the operator (CLAUDE.md hard rule 7); the extension pauses on login by design (official) |
| A CAPTCHA | The extension pauses on CAPTCHA (official) |
| Any permission, sharing, or access-control dialog | Sharing and permission changes are **prohibited actions** in the extension's policy (official, research/08 §3) |
| Any account or security setting | Operator-only (CLAUDE.md hard rule 7) |
| A payment or plan-upgrade prompt | Operator-only |
| The service worker has idled out | `/chrome` → Reconnect, then ask the operator whether to resume |
| Two consecutive screenshots show no state change after a click | Stop; the canvas coordinate model has drifted. Report with both screenshots |
| A download confirmation | Downloads require explicit per-action confirmation (official); ask the operator |

### 6.1 Brand Kit font upload

- **Extra preconditions**: static **OTF/TTF/WOFF** files exist (never `.woff2` — Canva rejects it, C45), each **≤10 MB** (the extension's `file_upload` cap, stricter than Canva's 15 MB, C47); `Read` is not denied for the agent (denying `Read` denies `file_upload`, official); the account role is owner / admin / brand designer (official, research/04 §d); the target Brand Kit is `kAHHTmdCWzo` "alderman.ai" (C43).
- **Steps** (observable UI states):
  1. Canva home is visible → open **Brand** (Brand Hub) in the left rail.
  2. Brand Hub is visible → select Brand Kit **"alderman.ai"**.
  3. The kit page is visible → open the **Fonts** section.
  4. The Fonts section shows an **Upload a font** control → click it.
  5. The OS file picker opens → `file_upload` the font file (one call per file).
  6. The font appears in the kit's font list with the expected family name.
  7. Repeat 4–6 per weight. Barlow 300/400/500/600/700 and JetBrains Mono 400/500 = 7 files.
  8. All seven appear, **grouped under two family names**. If they do not group, the internal family-name metadata does not match: stop and report — the fix is renaming the files' internal metadata, which is operator work (official, research/04 §d).
- **Stop conditions**: the universal set, plus a licence-rejection message ("not licensed for embedding") — report verbatim, do not retry.
- **Screenshot**: states 2, 3, 4, 6 and the final 8 (all families grouped).

### 6.2 Font "Change All" on an imported master

- **Extra preconditions**: the master exists and has been imported; `spec/fonts.json` says which family was requested and which `canva_fallback` Canva substituted (from `read-design`, V6 in `spec/canva-limits.md` §3); the fonts from §6.1 are already in the Brand Kit. **Work on a `copy-design` of the master, not the master itself, until P4 passes.**
- **Steps**:
  1. The editor is open on page 1 of the master, canvas fully rendered.
  2. Click a text element that carries the substituted family → its bounding box and the toolbar appear.
  3. The top toolbar shows the current font name → click the font name to open the picker.
  4. The font picker panel is open → locate the target family (Brand Kit fonts appear in their own section).
  5. Hover / open the family's row menu → the **"Change all"** affordance appears. **This affordance has no Canva help page; several URL guesses 404'd (research/08 §3) — it is a community/inferred claim. If it is not present, stop and report.**
  6. Click "Change all" → the canvas re-renders; every element that used the old family now shows the new one.
  7. Page through every page; confirm no element still shows the old family.
  8. Repeat 2–7 per substituted family (typically 2: one display, one text).
- **Stop conditions**: the universal set, plus "Change all" not present (state 5) — then font correction reverts to the operator and the master is indexed with `fonts_fixed: false`.
- **Screenshot**: states 1, 3, 4, 5 (the affordance itself — this is the P4 evidence), 6 and the last page of 7.

### 6.3 Apply Brand Kit styles to a design

- **Extra preconditions**: the design is a copy, not a master; the Brand Kit is `kAHHTmdCWzo`. Note that applying a Brand Kit to an **existing** design has **no MCP path at all** (research/08 §a) — this is the only route.
- **Steps**:
  1. The editor is open, canvas rendered.
  2. Open the **Design** / **Styles** panel in the left rail.
  3. The panel shows the Brand Kit's colour and font sets → select the "alderman.ai" set.
  4. Apply → the canvas re-renders. Canva's Styles apply is a *shuffle*, not a deterministic mapping: it may recolour elements you did not intend.
  5. Compare with the before screenshot. **If anything moved or any text changed size, undo (Ctrl+Z) and report** — brand polish is the operator's, and the library's contract is that only text content changes after upload.
- **Stop conditions**: the universal set, plus any layout change at state 5.
- **Screenshot**: states 1 (before), 3, 4 (after) and, if used, the post-undo state.

### 6.4 Share → Template link

- **Extra preconditions**: Pro+ (official, research/01 §4); the design is finished. **This step is the most likely to be refused**: the extension's policy prohibits modifying access controls, and a Template link is exactly that (official + inferred, research/08 §3). Attempt once; expect a refusal; that refusal is a P4 result, not a failure to work around.
- **Steps**:
  1. The editor is open on the finished design.
  2. Click **Share** (top right) → the share panel opens.
  3. The panel lists sharing options → locate **Template link**.
  4. Click **Create template link** → a URL appears.
  5. Copy the URL and report it to the operator; write it into the deck's `canva.md` frontmatter.
- **Stop conditions**: the universal set, plus **any** refusal at states 2–4 — record the extension's exact refusal text verbatim (this is the P4 evidence) and hand the step to the operator.
- **Screenshot**: states 2, 3, and either 4 (the link) or the refusal message.

### 6.5 Brand Template publish + element locks

- **Extra preconditions**: `publish-brand-template` via MCP was **already attempted once** and refused (Decision 7, **P6**) — this checklist is the fallback, not the first attempt. Element locks must be set **before** publishing (official, research/08 §3). Role: team admin or brand designer (official).
- **Steps**:
  1. The editor is open on the master.
  2. For each element that must not move: select it → the element toolbar appears → open the ⋯ menu → **Lock**. The element shows a lock badge.
  3. Repeat across every page; confirm every structural element is locked and every content slot is **not**.
  4. Click **Share** → the panel opens.
  5. Locate **Brand Template** / "Publish as brand template" → click it.
  6. A destination / folder prompt appears → choose "Presentation templates" (`FAFsWyFFv3w`).
  7. Confirm → the design appears in the Brand Templates list.
- **Stop conditions**: the universal set, plus a "Not allowed to access brand template" style message (record verbatim against C41/C42), plus a permissions dialog at states 5–7 (prohibited action → operator).
- **Screenshot**: a locked element at state 2, the full page at state 3, the Share panel at state 4, the publish affordance at state 5, and the result at state 7 (or the refusal).

### 6.6 Download an export

- **Extra preconditions**: try **`export-design` via MCP first** — it is faster, logged, and needs no browser (`get-export-formats` → `export-design`, C33/C34). Use this checklist only when the format is not offered by the MCP tool (e.g. if **P3** shows `html_bundle` is missing from the MCP list but present in the UI).
- **Steps**:
  1. The editor is open on the design.
  2. Click **Share** → **Download**.
  3. The download panel opens → choose the file type and page range (≤100 pages for a PDF/PPTX to cloud, C16).
  4. Click **Download** → a confirmation is required. **Downloads require explicit per-action confirmation** (official, research/08 §3) → ask the operator and wait for their answer.
  5. On operator approval, confirm → the file lands in the browser's download directory.
  6. Report the path to the operator. **Do not move a vendor design file (`.pptx`, `.key`, …) into this repo** — `.gitignore` blocks it and `validate` fails on it (CLAUDE.md hard rule 1, Decision 1).
- **Stop conditions**: the universal set, plus the operator declining at state 4.
- **Screenshot**: states 3, 4 (the confirmation prompt) and 5.
