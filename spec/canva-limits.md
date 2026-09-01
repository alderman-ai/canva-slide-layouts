# spec/canva-limits.md — the operational contract for talking to Canva

> Status: written in execution step 1 from research only. **No probe has been run yet**; every row marked
> `probe` is a hypothesis with a test attached in §4. Update this file at the end of execution step 2.
> Companion: `spec/stack.md` (which surface performs which step). Rules that outrank this file:
> `CLAUDE.md` hard rules and `docs/DECISIONS.md`.

## Confidence legend (used on every claim in this file)

| Tag | Meaning |
|---|---|
| **official** | Canva docs (canva.dev / canva.com/help) or the Canva Help service |
| **schema-read** | Read directly off the live connector's tool schema in this account's session (`research/09`) — highest trust |
| **community** | Third-party hands-on report, measured but not by us |
| **inferred** | Our reasoning from the above; nothing observed |

A row can carry two tags when the value is official but its applicability to this connector is inferred.

---

## 1. Constraint table

### 1.1 Import

| # | Constraint | Value | Confidence | Source | What we do about it |
|---|---|---|---|---|---|
| C1 | `import-design-from-url` rate | 20 req/min per user; async job; result URLs temporary (30 days) | official | research/07 §b | Never more than one import per family master build; batch uploads use Route C, not repeated imports |
| C2 | Import auto-split | "Imports with a large number of pages or assets are split into multiple designs"; **threshold undocumented** | official (statement) / probe (threshold) | research/07 §b, research/01 §1 | Cap family masters at 12–15 pages; after every import assert `design_count == 1`, else `merge-designs` the parts. Threshold measured in **P8** |
| C3 | Import URL rules | Must be a **public HTTPS** URL, 1–2048 chars | official | research/01 §1 | Route A hosts only placeholder-content HTML on `alderman-ai/canva-slide-layouts` raw URLs (Decision 4) |
| C4 | Blocked hosts | `canva.com/design/*` and OpenAI file hosts are **regex-blocked** by the tool | schema-read | research/09 | Never pass a Canva edit URL to import; to duplicate a design use `copy-design` |
| C5 | Import title length | ≤50 chars (Connect design import); the URL-import doc says 255 | official (conflicting) | research/07 §b vs research/01 §1 | Always ≤50 chars. Title = `<deck-slug> <YYYY-MM-DD>`, truncated |
| C6 | Accepted formats by URL | PDF, PPTX, DOCX, XLSX, CSV, HTML, Markdown, PSD, AI, Keynote, Pages, Numbers, and `.zip` bundles (HTML + assets) | schema-read | research/09, research/07 §a | HTML and `.zip` are our only two; everything else is out of scope by Decision 1 |
| C7 | HTML is **not** in the Connect import format table | Connect lists only AI/PSD/Affinity/PDF/KEY/PPT(X)/DOC(X)/ODx/Numbers/Pages | official | research/01 §1, research/08 §2 | Treat HTML import as an MCP/Uploads-path feature Canva may change without notice; keep Route C independent of it |
| C8 | Import errors | `design_import_throttled`, `invalid_file`, `fetch_failed`, `duplicate_import` | official | research/07 §b | Distinct recovery per error — see §2.1 failure signatures |
| C9 | HTML→Presentation is officially gated to Claude-Design origin | "This feature only works with Claude Design slide deck presentations. Other HTML files import as Code designs" | official | research/08 §1, research/01 §1 | The single largest risk in Route A. **P1** decides whether markup alone suffices; Route C is the default precisely because it does not depend on this |
| C10 | Markdown import | Docs-only, 5 MB cap, "importing to other design types isn't supported yet" | official | research/01 §1 | Never import MD |

### 1.2 Page geometry and caps

| # | Constraint | Value | Confidence | Source | What we do about it |
|---|---|---|---|---|---|
| C11 | Presentation page size | **1920 x 1080 px**, confirmed on this account via `read-design` `page_metadata` on `DAHT4uBPl_o` | schema-read | research/09 | `spec/grid.md` and every layout are authored at exactly 1920x1080; `build-html` emits that box |
| C12 | Max pages per design | Canva Help states **350**; research/07 could not re-verify it anywhere reachable | official (unverified) | research/01 §5, research/07 §b | **Hard budget 300 pages per design.** `validate` errors above 300, warns above 250. 350 stays an unverified claim in `docs/OPEN-QUESTIONS.md` |
| C13 | `add_page` bounds | width/height **40–8000 px** | schema-read | research/09 | Programmatic page creation always uses 1920x1080; the bound is only a guard in `build-canva-ops` |
| C14 | Resize bounds | 40x40 to 8000x3125 px | official | research/01 §5 | Not used; `resize-design` is Pro+ and outside the pipeline |
| C15 | Import caps by format | PPTX ≤300 slides / ≤300 MB; PDF ≤500 pages; both ≤1,400 elements+images per file | official | research/01 §2, §5 | Only relevant to the emergency PPTX path (§2.5) |
| C16 | Export-to-cloud cap | 100 pages per PDF/PPTX download to Dropbox/Drive/Microsoft | official | research/01 §5 | Review exports of >100-page decks are split by page range |

### 1.3 Reading a design

| # | Constraint | Value | Confidence | Source | What we do about it |
|---|---|---|---|---|---|
| C17 | `read-design` fields | `design_metadata`, `page_metadata`, `design_content`, `thumbnails`, `presenter_notes` | schema-read | research/09 | `index` writes `page_metadata` + `presenter_notes` into `canva.md`; `design_content` is a flattened text blob and is **not** for targeting edits (official, research/08 §2) |
| C18 | **50-page window** | `page_metadata` returns the **first 50 pages** unless `filter.page_indices` is set | schema-read | research/09, research/07 §b | Every `read-design` over a deck loops `page_indices` in chunks of 50: `[0..49]`, `[50..99]`, … Budget `ceil(N/50)` calls |
| C19 | Locators | `open_transaction: true` returns full element JSON with `locator_id` of the form `PBxxx-LByyy` | schema-read | research/09 | Locators are the only targeting key; written back into each slide MD (`locators[]`) and `manifest/canva-index.json` |
| C20 | Locator stability across edits | Unknown | inferred | — | Never cache locators across a commit boundary without re-reading; `slide-redline` re-reads before every edit pass |

### 1.4 `edit-design`

| # | Constraint | Value | Confidence | Source | What we do about it |
|---|---|---|---|---|---|
| C21 | **One page per call** | All operations in one `edit-design` call must target a single `page_index` | schema-read | research/09, research/07 §b | `build-canva-ops` emits one JSON file per page: `build/canva-ops/<slug>/p<NN>.json` |
| C22 | **Commit is a separate call** | `operations` cannot be combined with `finalize`; `finalize: commit｜cancel` is sent with an **empty** operations array | schema-read | research/09 | Every route ends with one explicit finalize call; a run that errors mid-way finalizes `cancel` |
| C23 | Transaction scope and lifetime | Undocumented: whether one transaction spans a whole design or one page, and how long it lives | inferred | research/07 §b | Budgets in §2 assume **one transaction per design**. Measured in **P7**. If P7 shows per-page transactions, Routes B and C each grow by `N` calls |
| C24 | Max ops per call | No documented maximum | official (absence) | research/07 §b | Assume 25 ops/call until **P7**; `build-canva-ops` splits a page's ops at 25 into `p<NN>-a.json`, `p<NN>-b.json` |
| C25 | Responsive-page allowlist | On responsive pages only `update_title, replace_text, update_fill, delete_element, find_and_replace_text` are accepted; **the whole batch is rejected** if any page is non-editable | schema-read | research/07 §b, research/09 | Before any edit pass, check the `is_responsive` / `is_editable` / `is_empty` flags from `read-design`; skip and report non-editable pages rather than sending the batch |
| C26 | Tables (`sheet` elements) | Opaque: no cell read or write (`not_supported`) | community | research/07 §b | No layout may bind content into a Canva table. Table-shaped archetypes render as positioned text + rules (priced into `polish_cost`) |
| C27 | Rates | Editing transactions 20/min (open), perform-ops 50/min, commit 20/min — documented for the classic edit API and **inferred** to apply here | official (classic) / inferred (this tool) | research/07 §b, research/08 §2 | Pace ≤20 opens/min and ≤50 ops-calls/min; a 100-page fill sleeps ~1.2 s between ops calls |

#### The 27 `edit-design` operations (schema-read, research/09)

Every name below was read off the live schema. Where the parameter column says *not captured*, `research/09`
recorded the operation name but not its fields: **re-read the tool schema before first use** and record the
result here.

| Op | Key parameters | Notes | Confidence |
|---|---|---|---|
| `update_title` | design title | Design-level, not element-level | schema-read (name) / inferred (params) |
| `replace_text` | target locator + new text | **Side effects**: resets `lineHeight`→1.4, `listMarker`→disc, `listLevel`→1 | schema-read (name) / community (side effects, measured 2026-08-23) |
| `find_and_replace_text` | find string, replace string | Works on responsive pages; **preferred over `replace_text`** because it has no recorded reset behaviour | schema-read / official (responsive) |
| `format_text` | `color`, `decoration`, `font_size` **1–800**, `font_style` `normal｜italic`, `font_weight` **`normal｜bold` only**, `line_height` **0.5–2.5**, `link`, `list_level`, `list_marker`, `strikethrough`, `text_align` | **No font-family field.** Styles the **whole text box**, never a substring | schema-read; whole-box scope community (research/07 §b) |
| `add_text` | text; optional `width` → block reflow with word wrap, omitted → natural reflow | Lands as **black 16 px** default font; needs a following `format_text` | schema-read (reflow) / community (black 16px) |
| `insert_shape` | SVG path, commands **M, L, H, V, C, S, A, Z only** | No other path commands; `build-canva-ops` normalises paths to this set | schema-read |
| `replace_shape` | target locator + shape/path | *params not captured* | schema-read (name) |
| `insert_fill` | fill source; image fills need a prior `upload-asset-from-url` → `asset_id` | The asset route for elements too complex for native ops (Skill 2) | schema-read / official (asset prerequisite) |
| `update_fill` | target locator + fill | Allowed on responsive pages | schema-read |
| `delete_element` | target locator | Removes unused master slots in Route C | schema-read |
| `position_element` | target locator + x, y | *exact field names not captured* | schema-read (name) |
| `resize_element` | target locator + w, h | *exact field names not captured* | schema-read (name) |
| `add_page` | width/height **40–8000** | Route B only; the page lands empty | schema-read |
| `reorder_page` | page index → new index | *params not captured* | schema-read (name) |
| `replace_speaker_notes` | notes text, **≤5000 chars** | The **only** write path for notes on this connector. Corrects research/08's "read only" matrix cell | schema-read |
| `update_opacity` | target locator + opacity | *params not captured* | schema-read (name) |
| `layer_element` | target locator + z-order intent | *params not captured* | schema-read (name) |
| `recolor_element` | target locator + colour | *params not captured* | schema-read (name) |
| `rotate_element` | target locator + angle | *params not captured* | schema-read (name) |
| `group_elements` | locator list | *params not captured* | schema-read (name) |
| `ungroup_elements` | group locator | *params not captured* | schema-read (name) |
| `flip_media` | target locator + axis | *params not captured* | schema-read (name) |
| `crop_media` | target locator + crop box | *params not captured* | schema-read (name) |
| `update_text_anchoring` | target locator + anchor | *params not captured* | schema-read (name) |
| `update_stroke_properties` | target locator + stroke | *params not captured* | schema-read (name) |
| `update_line_properties` | target locator + line | *params not captured* | schema-read (name) |
| `update_autofill_field` | autofill field | Only meaningful on autofill-enabled designs; `autofill-design` is absent from this connector (C40) | schema-read |

**Consequences the pipeline is built around:**

1. **No font family can be set through the API** (schema-read). Canva's own agent skill states "Change font
   family/typeface — CANNOT" (community, research/07 §b). Fonts must therefore be **inherited from a master**
   (Route C) or set once in the UI ("Change All", Chrome-assisted). This is why Decision 3 makes Route C the default.
2. **`format_text` is whole-box** — a differently styled run needs its own text element. `build-html` already
   puts every run in its own leaf (§3 H6), so master pages carry one box per run.
3. **`replace_text` has resets** — use `find_and_replace_text` first; only if the master string is ambiguous
   fall back to `replace_text`, and then re-apply `format_text` for `line_height` / `list_marker` / `list_level`
   **in the same ops call**.
4. **`add_text` defaults to black 16 px** — never used for whole-deck construction (Decision 3); every
   `add_text` emitted by `build-canva-ops` is immediately followed by its paired `format_text`.

### 1.5 Assembly, assets, export

| # | Constraint | Value | Confidence | Source | What we do about it |
|---|---|---|---|---|---|
| C28 | `merge-designs` modes | `create_new_design` accepts **only** `insert_pages`; `modify_existing_design` accepts insert/move/delete | schema-read | research/09 | Route C always uses `create_new_design`; page order is the plan order |
| C29 | `merge-designs` op cap | **1–500 operations** per call | schema-read | research/09 | One call covers any deck inside the 300-page budget (C12) |
| C30 | **Deletion phrase** | A `merge-designs` delete requires the exact user phrase **"I approve the deletion"** | schema-read | research/09 | Never issued by an agent on its own initiative. `slide-redline` variant mode asks the operator for the phrase verbatim and logs it in `canva.md` (CLAUDE.md hard rule 6) |
| C31 | `merge-designs` job | Auto-polls; duration undocumented | schema-read / official (absence) | research/07 §b | Log the returned design id; verify page count with `read-design` before filling |
| C32 | `upload-asset-from-url` | 30 req/min; images **<50 MB** (JPEG/PNG/HEIC/GIF/TIFF/WEBP); video <500 MB | official | research/07 §b | Placeholder assets in `assets/` are far under the cap; **SVG is not an accepted upload type** — rasterise to PNG first |
| C33 | `export-design` | 20 req/min (MCP); Connect caps 75 exports/5 min and 500/24 h per user; formats pptx, pdf, png, jpg, gif, mp4, csv | official | research/07 §b, research/08 §2 | Reviews export one PDF per revision, not one per slide |
| C34 | `get-export-formats` first | Must be called before `export-design` | official | research/07 §b | Mandatory first call in the export sequence; also the P3 probe |
| C35 | `html_bundle` / `html_standalone` | Present in the **Connect** export list; unknown for the MCP tool | official (Connect) / probe (MCP) | research/08 §2 | **P3** decides whether a Canva→repo markup round trip exists. Until then round trips use `read-design` JSON + PDF/PNG |
| C36 | No SVG export | The Connect export list has no SVG | official | research/08 §2 | Elements travel back as source (`.dc.html`/JSX via DesignSync) or PNG, never SVG (research/08 §1) |
| C37 | Export is "a delivery mechanism, not a handoff" | Canva's own workflow guidance: always return the `edit_url` | official | research/08 §2 | Every skill prints the `edit_url` in `canva.md` and in its final message |

### 1.6 Plan gating: brand kits, brand templates, autofill

| # | Constraint | Value | Confidence | Source | What we do about it |
|---|---|---|---|---|---|
| C38 | Pro+ tools | `resize-design`, `search-brand-templates`, `list-brand-kits`, `create-design-from-brand-template` | official | research/08 §2 | `list-brand-kits` is the boot-ritual connectivity check (CLAUDE.md); it works on this account (research/09) |
| C39 | Enterprise-only tools | `autofill-design`, `get-brand-template-dataset` (60/min) | official | research/07 §b, research/08 §2 | Out of reach |
| C40 | `autofill-design` is **absent** from this connector's tool list | — | schema-read | research/09 | Dataset-based batch fill does not exist for us **at any plan**. Fill is always `find_and_replace_text` by locator |
| C41 | `publish-brand-template` gating | Needs scope `brandtemplate:content:write` and a Team admin / Brand designer / Org admin / Org designer role; preview API, 20/min. A Pro user was refused with "Not allowed to access brand template" | official (gating) / community (refusal) | research/07 §b, research/01 §4, research/08 §2 | Decision 7: **try once, then fall back**. The attempt is **P6** |
| C42 | Conflicting evidence on Pro | The Canva pricing page leaves the Brand Templates row blank for Pro; the Canva Help service claimed Pro can publish; this account already holds one presentation brand template `EAGpdGyNc_Q` "Red Border" | official (pricing) vs official-service (help) vs schema-read (the template exists) | research/01 §4, research/09 | Do not resolve by argument. **P6** resolves it empirically; record the exact error text |
| C43 | Account facts | brand kit **`kAHHTmdCWzo` "alderman.ai"**; folder **`FAFsWyFFv3w` "Presentation templates"** (empty, reserved for masters); `user_id oUY6w-hxkfq-xcz37QJWh8`, `team_id oBY6wjpR4xcGJHwHvy0mNI` | schema-read | research/09 | Every master `move-item-to-folder` targets `FAFsWyFFv3w`; every generate/brand call names `kAHHTmdCWzo` |
| C44 | Template links | Share → Template link (Pro+) is **UI-only**; there is no MCP tool | official | research/01 §4, research/08 §3 | Chrome checklist in `spec/stack.md`; may be refused as an access-control change (**P4**) |

### 1.7 Fonts

| # | Constraint | Value | Confidence | Source | What we do about it |
|---|---|---|---|---|---|
| C45 | Brand Kit font upload formats | **OTF, TTF, WOFF only** — no WOFF2, EOT, SVG, ZIP; **no variable fonts**; <15 MB per file | official | research/04 §d | The Design System project ships `.woff2` (research/09), which **cannot** be uploaded to Canva. The operator supplies static OTF/TTF per weight |
| C46 | Brand Kit font limits | 500 fonts per kit; **≤18 styles per family**; each weight/italic is a separate static file; styles group only when the internal family-name metadata matches | official | research/04 §d | Barlow 300/400/500/600/700 + JetBrains Mono 400/500 = 7 styles, well inside the cap |
| C47 | Browser upload size (Chrome extension) | `file_upload` ≤10 MB per upload | official | research/08 §3 | Stricter than Canva's 15 MB; the Chrome checklist uses ≤10 MB files |
| C48 | No faux bold/italic | B/I stay greyed unless that style file exists | official | research/04 §d | `spec/fonts.json` records `weights_used`; `validate` warns when a layout asks for a weight with no uploaded file |
| C49 | Substitution on import | Canva "tries to identify and match"; otherwise substitutes the nearest library font. **No doc states that uploaded Brand Kit fonts are matched by name** | official (substitution) / unverified (name matching) | research/04 §d, research/01 §3 | Assume the post-import step is the font picker's **"Change All"** per family (Chrome-assisted, **P4**). `spec/fonts.json` carries `canva_fallback` so drift is predictable; wrap widths are computed against Inter metrics |
| C50 | No public Canva font list | The Free/Pro split is community-sourced only | official (absence) | research/01 §3 | `canva_native` is `yes｜no｜unverified`; `validate` warns, never fails (Decision 5) |

### 1.8 The Code-design failure mode

| # | Constraint | Value | Confidence | Source | What we do about it |
|---|---|---|---|---|---|
| C51 | Unannotated or failed HTML imports become an interactive **Code design** | Also the fallback when conversion fails | official | research/07 §a, research/09 | Every HTML import is followed immediately by a verification `read-design` (§2.1 steps 2–4) |
| C52 | **No conversion path back** | A Code design cannot be turned into a presentation; it can only be embedded as an interactive element in another design and "can't be exported as a file" | official | research/07 §b, research/08 §3 | **Irreversible.** On detection: stop, do not retry the same HTML, log it, delete the design, fall back to Route C or D |
| C53 | Magic Layers | UI-only; converts flat images to layers; costs AI credits; PNG/JPG ≤5000 px; single page; monthly quota; known blank-region failure on dense tables | official / community | research/07 §b | Last-resort rescue for a rasterised master only, driven by the operator, never by an agent |

---

## 2. Routes

Four routes plus one emergency path. Decision 3 fixes their roles: **C is the default for filled decks, A
builds masters and previews, B is elements and repairs only, D is the officially-supported HTML path under
probe.** Every route logs to `presentations/<slug>/canva.md` in the format of §5.

Call budgets count **MCP tool calls** (DesignSync calls are counted separately where they occur) and assume
one transaction per design (C23). If **P7** shows per-page transactions, add `N` calls to Routes B and C.

### 2.1 Route A — annotated HTML import (masters, previews, public-content decks)

**Preconditions**
- `build/html/<name>.html` passes the §3 checklist and `validate`.
- The file is committed and pushed to `alderman-ai/canva-slide-layouts` (public) and reachable at a raw HTTPS URL (C3, Decision 4).
- Content is placeholder-only, **or** the deck's `brief.md` sets `content_public: true` **and** the operator gave explicit go-ahead for this upload (CLAUDE.md hard rule 6).
- Page count ≤15 for a family master (C2).

**Call sequence**

| # | Call | Payload notes |
|---|---|---|
| 1 | `import-design-from-url` | `url` = raw HTTPS; `title` ≤50 chars (C5); **`intended_design_type: "presentation"`** (C6) |
| 2 | `read-design` | `design_metadata` + `page_metadata`. **Assert**: design type is `presentation`, not a Code design (C51); page count == number of `data-document-role="page"` sections |
| 3 | `read-design` | `design_content` + `presenter_notes`. **Assert**: text is returned for every page (proves it was not rasterised); notes match the `data-speaker-notes` strings |
| 4 | `read-design` `open_transaction: true` | Harvest `locator_id`s and geometry; compare geometry with the layout element table (acceptance ±8 px, `docs/PLAN.md` § Verification) |
| 5 | `merge-designs` | **Only if step 2 revealed an auto-split** (C2): `create_new_design`, `insert_pages` in order |
| 6 | `move-item-to-folder` | Target `FAFsWyFFv3w` (C43) |

**Call budget** — independent of slide count, because one import carries the whole file:

| Deck size | Calls | Notes |
|---|---|---|
| 12 slides | 5 (1 import + 3 read + 1 move) | +1 if auto-split |
| 40 slides | 6 (step 4 needs `ceil(40/50)` = 1 chunk; auto-split likely) | +1 merge |
| 100 slides | 8 (step 4 needs 2 chunks; split near-certain) | Prefer splitting the source into ≤15-page masters instead |

Wall clock is dominated by the async import job, not by the rate limits.

**Failure signatures and recovery**

| Signature | Meaning | Recovery |
|---|---|---|
| Step 2 returns a Code design | C9/C51 fired — markup alone did not trigger the presentation converter | **Irreversible (C52).** Stop. Log the design id and the HTML sha256 in `canva.md`. Delete the design in the UI. Fall back to Route C (if masters exist) or Route D. Record the outcome against **P1** |
| Page count < section count | Nested or malformed page elements (§3 H1) | Fix the HTML and re-import under a **new** title (`duplicate_import` fires otherwise) |
| More than one design returned | Auto-split (C2) | `merge-designs create_new_design` with `insert_pages` in order; record the page count at which it split → **P8** |
| `design_content` empty for a page | That page rasterised | Simplify: remove gradient overlays spanning text, full-page SVG, `::before/::after` text (§3 H7–H9) and re-import |
| `fetch_failed` | URL not yet public (push not propagated) or wrong host | Re-check the raw URL in a browser; wait for the CDN. **Never** work around it by hosting private content (CLAUDE.md hard rule 6) |
| `invalid_file` | Wrong content type served | Ensure the raw URL serves `text/html`; try the `.zip` bundle form |
| `duplicate_import` | Same URL+title imported recently | Change the title (append a timestamp) |
| `design_import_throttled` | >20/min (C1) | Back off 60 s; a single build should never reach this |
| Fonts reported are neither the registry family nor its recorded `canva_fallback` | Substitution (C49) | Fix once per master with the UI "Change All" (Chrome checklist in `spec/stack.md`), then re-index |

### 2.2 Route B — `edit-design` operations (elements and repairs only)

**Preconditions**
- The target design exists and its pages are **not** responsive and **are** editable (C25) — check the `is_responsive` / `is_editable` / `is_empty` flags from `read-design`.
- Locators harvested in the same session (C20).
- Decision 3: **never** used to build a whole deck.

**Call sequence**

| # | Call | Payload notes |
|---|---|---|
| 1 | `read-design` `open_transaction: true`, `filter.page_indices` = pages to touch | Harvest locators; verify editability flags |
| 2 | `upload-asset-from-url` (0..k) | Only for `insert_fill` image elements; PNG/JPG <50 MB (C32); source is a public repo raw URL |
| 3 | `edit-design` per page | One call per page (C21); ops from `build/canva-ops/<slug>/p<NN>.json`, ≤25 ops per call until P7 (C24). Every `add_text` is immediately followed by its `format_text`. `insert_shape` paths use M/L/H/V/C/S/A/Z only |
| 4 | `edit-design` `finalize: commit` | Empty operations array (C22) |
| 5 | `read-design` (thumbnails) | Before/after thumbnail pair for `canva.md` |

**Call budget** — `k` = pages actually touched, not deck size:

| Scope | Calls |
|---|---|
| 1 element on 1 page (Skill 2) | 4–5 (1 read + 0–1 upload + 1 ops + 1 commit + 1 thumbnail) |
| Repair pass over 12 pages | 15 |
| Repair pass over 40 pages | 43 |
| Repair pass over 100 pages | 104 (2 read chunks, C18) |
| Whole deck from blank (**not allowed**) | ≈80–120 for 40 slides, all in default black 16 px (research/07 §c) |

**Failure signatures and recovery**

| Signature | Recovery |
|---|---|
| Whole batch rejected, page is responsive | C25: re-send using only the five allowlisted ops, or skip the page and report it |
| `find_and_replace_text` matched nothing | Master text drifted. Fall back to `replace_text` by locator **plus** `format_text` re-applying `line_height` / `list_marker` / `list_level` in the same call |
| Text style wrong after a replace | The `replace_text` reset fired; re-apply `format_text` (whole box) |
| Only part of a text box needs restyling | Impossible — `format_text` is whole-box. Split the run into its own element in the layout and rebuild the master |
| Shape path rejected | A path command outside M/L/H/V/C/S/A/Z. Re-emit through `build-canva-ops`' path normaliser |
| Transaction appears stale on commit | C23 unknown. Re-open, re-read locators, re-apply; record the elapsed time → **P7** |
| Ops call errors mid-deck | `finalize: cancel`, log, restart from the last committed page |

### 2.3 Route C — masters + `merge-designs` + fill by locator (**default for filled decks**)

**Preconditions**
- Family masters exist in Canva (built by Route A or by hand) with fonts already correct, indexed in `manifest/canva-index.json` as `(layout_id → design_id, page_index)`.
- `presentations/<slug>/plan.md` is complete and `fill-check` passes.
- `build/canva-ops/<slug>/*.json` emitted, one file per page.
- Slide count ≤300 (C12) and ≤500 merge ops (C29).

**Call sequence**

| # | Call | Payload notes |
|---|---|---|
| 1 | `merge-designs` | `create_new_design`, **only `insert_pages`** (C28); one op per slide in plan order; ≤500 (C29). Title ≤50 chars |
| 2 | `read-design` | `page_metadata` — confirm page count == slide count; check `is_editable` / `is_responsive` per page (C25) |
| 3 .. 3+m | `read-design` `open_transaction: true` | `filter.page_indices` in chunks of **50** (C18); `m = ceil(N/50)`. Harvest `locator_id`s |
| 4 .. 4+N | `edit-design` × N | One per page (C21). Op order: `find_and_replace_text` per bound element → `delete_element` per unused master slot → `replace_speaker_notes` (≤5000 chars). Fall back to `replace_text` + `format_text` only where the find string is ambiguous |
| last-2 | `edit-design` `finalize: commit` | Empty operations (C22) |
| last-1 | `move-item-to-folder` | Deck folder, or `FAFsWyFFv3w` for masters (C43) |
| last | `read-design` | Verification: page count, `design_content` text per page, `presenter_notes` present; thumbnails for `canva.md` |

**Call budget**

| Deck size | merge | read (meta) | read (txn chunks) | edit ops | commit | move | verify | **Total** | Wall clock at inferred rates (C27) |
|---|---|---|---|---|---|---|---|---|---|
| 12 slides | 1 | 1 | 1 | 12 | 1 | 1 | 1 | **18** | ~30 s |
| 40 slides | 1 | 1 | 1 | 40 | 1 | 1 | 1 | **46** | ~1.5 min |
| 100 slides | 1 | 1 | 2 | 100 | 1 | 1 | 2 | **108** | ~3 min |

(Consistent with the ≈45-call / 40-slide figure in `docs/PLAN.md` § Canva pipeline.) Add `N` calls if P7 shows
per-page transactions; add splitting calls where a page needs >25 ops (C24).

**Why this is the default**: fonts, sizes and geometry are inherited from the master, and **no API operation
sets a font family** (§1.4 consequence 1). Route C is the only route that leaves zero font work.

**Failure signatures and recovery**

| Signature | Recovery |
|---|---|
| Merged page count ≠ slide count | A master page index moved. Re-read the master with `read-design`, refresh `manifest/canva-index.json`, re-merge into a **new** design (never patch by deleting — C30) |
| A page comes back `is_responsive` | C25: restrict that page's ops to the allowlist (both `replace_text` and `find_and_replace_text` are in it) |
| `find_and_replace_text` no-op on a slot | The master placeholder string differs from the layout MD. Fix the layout MD's placeholder text and rebuild the master, or use `replace_text` by locator + `format_text` |
| Speaker notes truncated | >5000 chars; `fill-check` should have caught it. Truncate at a sentence boundary and log |
| An unused slot survives | The `delete_element` locator was stale. Re-read the page transaction and re-issue |
| Merge deletes anything | Should be impossible — `create_new_design` offers only `insert_pages` (C28). Any proposed delete requires the operator's exact phrase "I approve the deletion" (C30) |

### 2.4 Route D — `.dc.html` → Claude Design → Send to Canva (**under probe**)

This is the only path Canva **officially** guarantees produces a fully editable presentation from HTML (C9).
Its viability for hand-authored decks is **P5** plus **P1**.

**Preconditions**
- A `.dc.html` deck built by `build-dc.mjs` in the shape documented in `spec/stack.md` § `.dc.html` deck shape.
- A **new regular Claude Design project** — never the "alderman.ai Design System" project `d1228f56-c841-450e-8665-c2d177fb9414` (Decision 9 limits the DS write set to new `components/slides/**` and `templates/slides/**` paths).
- The operator is present for the Share-menu action, or has asked for Chrome assistance (CLAUDE.md hard rule 7).

**Call sequence**

| # | Surface | Call | Notes |
|---|---|---|---|
| 1 | DesignSync | `create_project` | Raises a permission prompt |
| 2 | DesignSync | `finalize_plan` | Locks the write path globs; raises a permission prompt; all writes need the returned `planId` |
| 3 | DesignSync | `write_files` | ≤256 files per call; one `.dc.html` deck file carries all slides as `<section>` children |
| 4 | Human / Chrome | Open `claude.ai/design`, confirm the deck renders | **P5** |
| 5 | Human / Chrome | Share → **Send to Canva** | Not an MCP call; Chrome only on operator request |
| 6 | Canva MCP | `search-designs` (`design_types: ["presentation"]`) | Find the design Canva just created |
| 7 | Canva MCP | `read-design` | Same assertions as Route A steps 2–4 |
| 8 | Canva MCP | `move-item-to-folder` | Target folder |

**Call budget** — flat in slide count, because the deck is one file:

| Deck size | DesignSync calls | Manual steps | Canva MCP calls | Total automated |
|---|---|---|---|---|
| 12 / 40 / 100 slides | 3 | 2 | 3–4 | **6–7** |

**Failure signatures and recovery**

| Signature | Recovery |
|---|---|
| The `.dc.html` does not render at claude.ai/design | P5 negative. Compare against `templates/linkedin-social/LinkedinSocial.dc.html` (research/09) for the exact wrapper shape; retry once; then abandon Route D |
| No "Send to Canva" in the Share menu | Feature gated, or the project type is wrong. Record and abandon; Route C is unaffected |
| Canva produces a Code design | Detection keys on **origin**, not markup → **P1 answered "origin"**. Route A is then dead for editable output; only Routes C and D remain. Record here and in `docs/OPEN-QUESTIONS.md` |
| Fonts substituted, gradients flattened, inline SVG rasterised | **P2**. Record which of the three survived; feed into `spec/fonts.json` and the §3 rules |
| `write_files` refused | The `finalize_plan` glob did not cover the path. Re-plan with the correct glob |

### 2.5 Emergency PPTX rule

**A PPTX may be generated only when Routes A, C and D have all failed for a specific deck, and only with the
operator's explicit go-ahead for that deck.**

- It is generated **in the scratchpad only**, never inside this repo (CLAUDE.md hard rule 1, Decision 1).
- It is **never hosted** and **never committed**; `import-design-from-url` is therefore **not** used for it.
- The operator uploads it through Canva's Upload UI themselves.
- The scratchpad file is deleted in the same session; `validate` fails if any vendor design file exists in the repo.
- Constraints if it happens: ≤300 slides, ≤300 MB, ≤1,400 elements+images, no charts/SmartArt/3D/WordArt (silently ignored), Canva-library font names, 13.333 x 7.5 in = 1920 x 1080 (C15, official, research/01 §2).
- Log it in `canva.md` as `tool: "manual-upload-pptx"` with the reason each route failed.

### 2.6 Route selection

```
filled deck?  --yes--> masters exist for every layout in the plan? --yes--> Route C   (default, Decision 3)
     |                                    |
     |                                    +--no--> build the missing masters via Route A (or D) first
     |
     +--no  (building a master, a preview, or public placeholder content)
                    |
                    +-- P1 says markup is enough --> Route A
                    +-- P1 says origin matters    --> Route D
                    +-- single element or repair  --> Route B
```

---

## 3. HTML import authoring rules — the `build-html` / `validate` checklist

Sources: `docs/PLAN.md` § "HTML authoring rules confirmed by import evidence" and research/07 §a. Each rule is
emitted by `build-html.mjs` and re-checked by `validate` against `build/html/**`.

| # | Rule | Enforced by | Confidence |
|---|---|---|---|
| H1 | One `<section data-document-role="page">` per slide. **Never nested** — a page element must not contain another page element | build-html emits; validate errors on nesting or on a `data-document-role` count ≠ slide count | **official** (tool description, research/07 §a; schema-read research/09) |
| H2 | `data-label="…"` = page title; `data-speaker-notes="…"` = presenter notes; both plain strings | build-html; validate warns on a missing label, errors on notes >5000 chars | **official** (tool description) |
| H3 | `intended_design_type: "presentation"` on the import call (not markup, but part of the same contract) | the upload skill | **schema-read**; that it affects Code-vs-presentation classification is **inferred** |
| H4 | Page box exactly `position:relative; width:1920px; height:1080px; overflow:hidden` | build-html; validate errors on any other page dimension | **community** (Endfield, Devlabs, costadev00, classpulse repos) + **schema-read** for 1920x1080 on this account |
| H5 | `<meta charset="utf-8">` present; file is UTF-8 with LF | build-html; validate errors | **community** |
| H6 | Every text run in its own leaf element (`p`, `h1`–`h3`, `span`); repeated structure written out (three real `<li>`s) | build-html emits one element per layout element-table row; validate errors on a text node with element children | **community** (leaked Claude Design skill) / **inferred** for Canva. Reinforced by §1.4 consequence 2: `format_text` is whole-box, so one box per style |
| H7 | No text in `::before` / `::after` | validate greps inline CSS for `content:` with non-empty strings | **community** |
| H8 | No gradient overlay spanning text | validate warns on a `linear-gradient` set on an ancestor of a text leaf | **community** |
| H9 | No full-page SVG, no page screenshots | validate errors on an `<svg>` or `<img>` whose box is ≥90% of the page area | **community** |
| H10 | Images are hosted PNG/JPG under 50 MB at absolute public URLs; **not** data URIs | build-html rewrites `assets/` refs to raw repo URLs; validate errors on `src="data:"` | **community/inferred** (research/07 §a); the 50 MB figure is **official** (C32) |
| H11 | Absolute positioning inside the page (`position:absolute; left/top/width/height` in px) | build-html emits from the element table's x/y/w/h | **community** — flex/grid decks *did* import as multi-page presentations with readable text, so this is "more stable", not "required" (research/07 §a) |
| H12 | Inline styles only; no external stylesheet, no JS | build-html; validate errors on `<link rel="stylesheet">` and `<script>` | **official** ("JavaScript functionality isn't supported") + **community** (inline styles fine) |
| H13 | `font-family` spelled exactly as Canva's library spells it, followed by the registry fallback stack | build-html reads `spec/fonts.json`; validate errors on a family absent from the registry, warns when `canva_native` is `no` or `unverified` (Decision 5) | **official** ("external resources… may not import") + **inferred** (name mapping) |
| H14 | No `@font-face`; do not rely on a Google Fonts `<link>` / `@import` | validate warns | **official** (Canva does not fetch webfonts reliably); `<link>` appearing harmless is **community, unproven** |
| H15 | Links may be dropped — never make meaning depend on a hyperlink | authoring rule; validate warns on `<a>` | **official** |

**Post-import verification (the same checklist from Canva's side)** — Route A steps 2–4:

| # | Check | Fails → |
|---|---|---|
| V1 | `design_metadata` type is `presentation` | Code design (C51/C52): irreversible, stop |
| V2 | page count == number of `data-document-role="page"` sections | H1 violation, or auto-split (C2) |
| V3 | `design_content` returns text for **every** page | that page rasterised: H6/H8/H9 |
| V4 | `presenter_notes` match the `data-speaker-notes` strings | H2 not honoured |
| V5 | element geometry within **±8 px** of the layout element table | emitter drift; tune `build-html` |
| V6 | reported fonts match the registry family **or** its recorded `canva_fallback` | substitution (C49): "Change All" per family |

---

## 4. Probe protocol (execution step 2)

Run all eight on the same three probe layouts, in the order **P3 → P1 → P2 → P8 → P7 → P6 → P5 → P4**
(cheapest and most decision-bearing first; P4 and P5 need the operator). Every call is logged in the §5 format
to `build/probe/canva.md`. Nothing here writes to an existing master or deck.

### P1 — Does the Claude-Design detection key on markup or on origin?

- **Calls**: (1) `import-design-from-url` with `url` = the raw URL of `build/html/probe.html` (3 annotated sections), `title` = `probe-html-YYYYMMDD`, `intended_design_type: "presentation"`. (2) `read-design` `design_metadata` + `page_metadata`. (3) `read-design` `design_content` + `presenter_notes`. (4) `read-design` `open_transaction: true`. (5) Repeat (1)–(4) with `build/dc/probe.dc.html` served as plain HTML at a raw URL.
- **Record**: design id; reported design type; page count; whether text came back per page; element count and types; whether `locator_id`s were returned; any raw error text; the sha256 of both HTML files.
- **Decisions**:
  - Annotated HTML → `presentation` with text per page ⇒ **markup is sufficient**. Route A is live for masters and public-content decks. Write "P1: markup" here and in `docs/OPEN-QUESTIONS.md`.
  - Annotated HTML → Code design **and** `.dc.html`-as-plain-HTML → Code design ⇒ **origin matters**. Route A is dead for editable output; masters must be built by hand or via Route D; Route C becomes the only production path. Delete both probe designs.
  - The `.dc.html` shape converts but annotated HTML does not ⇒ `build-html` must emit the `deck-stage` wrapper; re-tune the emitter and re-probe once.

### P2 — Do non-native fonts, gradients and inline SVG survive Route A / Route D?

- **Calls**: on the P1 probe design (and, if P5 succeeds, on the Route D design) — `read-design` `open_transaction: true` on all three pages; `read-design` `thumbnails`.
- **Probe content required** (built into the three probe layouts): page 1 uses **Barlow** (a brand family, possibly Canva-native) plus one deliberately non-native family from `spec/fonts.json`; page 2 carries one simple `linear-gradient` panel that does **not** sit under text; page 3 carries one simple inline `<svg>` shape (a rounded rect + a chevron path using only M/L/H/V/C/S/A/Z).
- **Record**: the font name reported per text element; whether the gradient element came back as a fill/rect or as a raster image; whether the SVG came back as a shape element or as a raster image; a thumbnail visual diff against the local PNG preview.
- **Decisions**: font reported ≠ requested ⇒ set `canva_native: no` in `spec/fonts.json` and mandate the "Change All" step per master (feeds P4). Gradient rasterised ⇒ `build-html` stops emitting gradients; layouts use flat fills. SVG rasterised ⇒ shapes are emitted as `insert_shape` ops (Route B) onto masters rather than as import markup.

### P3 — Does `get-export-formats` offer `html_bundle` / `html_standalone`?

- **Calls**: `get-export-formats` on `DAHT4uBPl_o` (a known 3-page presentation, research/09).
- **Record**: the full format list, verbatim.
- **Decisions**: `html_bundle` or `html_standalone` present ⇒ a Canva→repo markup round trip exists; add an `ingest-html` path that consumes it and update C35. Absent ⇒ round trips stay `read-design` JSON + PDF/PNG (research/08 §4), and `slide-intake` keeps using the `read-design` transaction for Canva-sourced layouts.

### P4 — Can Chrome drive font "Change All" and Brand Kit apply, and is Share → Template link refused?

- **Preconditions**: the operator asked for it; the operator picked the browser (AskUserQuestion flow); the Canva tab is foregrounded; no open dialogs (CLAUDE.md hard rule 7).
- **Calls**: `list_connected_browsers` → `select_browser` → `tabs_create_mcp` on a **copy** of a master → `computer` screenshot → coordinate clicks through the font picker → "Change All" → screenshot → Brand Kit / Styles apply → screenshot → Share menu → Template link → screenshot.
- **Record**: a screenshot at each numbered UI state (see the checklists in `spec/stack.md`); whether `read_page` returned any usable refs on the canvas (expected: none); the exact refusal text if the extension declines; elapsed time per step.
- **Decisions**: "Change All" works ⇒ it becomes the documented post-import font step for every master, and the Route A font risk drops to one pass per family. It fails or is unreliable ⇒ masters must be font-corrected by the operator by hand before being indexed, and Route A masters carry `fonts_fixed: false` until they are. Template link refused as an access-control change ⇒ record it; that step stays with the operator permanently.

### P5 — Does a hand-authored `.dc.html` render in claude.ai/design and expose Send to Canva?

- **Calls**: `DesignSync.create_project` (a **new regular project**, never `d1228f56-…`) → `finalize_plan` with a glob covering only that project's `deck.dc.html` → `write_files` with a one-slide deck → the operator opens claude.ai/design.
- **Record**: whether the artboard renders; whether the Share menu lists "Send to Canva"; if used, the resulting Canva design id and its type.
- **Decisions**: renders + Send to Canva present + result is a `presentation` ⇒ **Route D is live**, and it becomes the preferred path for masters when P1 says "origin". Renders but no Send to Canva ⇒ Route D is dead; rely on Route C. `write_files` refused ⇒ fix the `finalize_plan` glob and retry once only.

### P6 — Does `publish-brand-template` work on this account?

- **Preconditions**: at least one family master exists in `FAFsWyFFv3w`.
- **Calls**: `create-brand-template-draft` on that master → `publish-brand-template` **once**.
- **Record**: both responses verbatim, including the exact error text and any role or scope name it mentions.
- **Decisions**: succeeds ⇒ Decision 7's fallback is not needed, and brand templates become an additional reuse mechanism (still not autofill — C40). Refused ⇒ record the error text against C41/C42, resolve the pricing-page vs Help-service conflict in favour of the pricing page, and reuse stays `copy-design` / `merge-designs` + UI Template links. **Do not retry** (20/min, preview API).

### P7 — Ops-per-call ceiling and transaction lifetime for `edit-design`

- **Calls**, all on a throwaway copy of the probe design: (1) `read-design` `open_transaction: true`; (2) `edit-design` with **10** trivial ops on page 0; (3) with **25**; (4) with **50**; (5) open a fresh transaction, wait **10 minutes**, then `edit-design` `finalize: commit`; (6) open a transaction, run ops on page 0, then run ops on page 1 **in the same transaction** to test whether a transaction spans pages or one page.
- **Record**: the highest op count accepted; any error text; whether the 10-minute commit succeeded; whether a second page could be edited in the same transaction; measured wall clock per ops call (validates the 50/min inference, C27). Also re-measure the community claims that `replace_text` resets line-height and list markers and that `add_text` lands black 16 px.
- **Decisions**: ceiling <25 ⇒ lower the `build-canva-ops` split threshold (C24) and add the extra calls to every Route B/C budget. Transaction is per-page ⇒ add `N` commit calls to Routes B and C and update the §2 budgets. Transaction expires before 10 min ⇒ chunk Route C into batches sized to the measured lifetime. Community resets confirmed ⇒ keep the `find_and_replace_text` preference; refuted ⇒ relax it and note the measurement date.

### P8 — Does `import-design-from-url` auto-split, and at what size?

- **Calls**: (1) import a **15-page** annotated HTML file; `read-design` / `search-designs` to count the resulting designs. (2) Import a **40-page** file; same. (3) If 40 splits, bisect once at the midpoint of the last known-good and the first known-split size.
- **Record**: pages in, number of designs out, pages per resulting design, total asset count in the file.
- **Decisions**: threshold found ⇒ write it into C2 and cap family masters one step below it; `validate` warns above the cap. No split at 40 ⇒ record "no split observed ≤40 pages" and keep the 15-page master convention anyway (it keeps `read-design` inside one 50-page window and keeps rebuilds cheap).

### Results table (fill in during execution step 2)

| Probe | Date run | Outcome (one line) | Evidence (design id / call-log ref) | Decision taken | Where recorded |
|---|---|---|---|---|---|
| P1 | | | | | §1.1 C9, §2.1, `docs/OPEN-QUESTIONS.md` |
| P2 | | | | | §3 H8/H9/H13, `spec/fonts.json` |
| P3 | | | | | §1.5 C35 |
| P4 | | | | | `spec/stack.md` Chrome checklists |
| P5 | | | | | §2.4 |
| P6 | | | | | §1.6 C41/C42, `docs/DECISIONS.md` #7 |
| P7 | | | | | §1.4 C23/C24/C27, §2 budgets |
| P8 | | | | | §1.1 C2 |

---

## 5. Call log format (`canva.md`)

Every MCP call that **changes** Canva is logged (CLAUDE.md hard rule 6). Read-only calls are logged too when
they belong to a route's verification steps, so a run can be replayed.

Location: `presentations/<slug>/canva.md` for decks, `build/probe/canva.md` for probes,
`bundles/<slug>/canva/<account-id>.md` for bundles (Decision 11 — git-ignored, so a public bundle never
carries account state).

The file is a hybrid MD: flat frontmatter (`deck`, `canva_design_id`, `edit_url`, `account_id`, `folder_id`,
`route`, `page_count`, `last_upload`) followed by `## Call log`, a fenced `jsonl` block with **one JSON object
per line**, newest last. One line per call.

### Schema

| Field | Type | Required | Meaning |
|---|---|---|---|
| `ts` | string, ISO 8601 UTC with `Z` | yes | When the call returned |
| `tool` | string | yes | The exact MCP tool name (`import-design-from-url`, `edit-design`, …), or `manual-upload-pptx` / `chrome:<step>` for non-MCP actions |
| `route` | `"A"｜"B"｜"C"｜"D"｜"emergency"｜"probe"` | yes | Which route the call belongs to |
| `step` | integer | yes | Position in that route's call sequence (§2) |
| `args` | object | yes | **Summary, not the payload**: e.g. `{"page_index":7,"ops":["find_and_replace_text x4","delete_element x1","replace_speaker_notes"],"op_count":6}`. Never include private slide copy; never include credentials or the operator's email |
| `ids` | object | yes | Ids returned: `{"design_id":"DAH…","job_id":"…","page_ids":[…],"asset_id":"…","locator_count":37}`. Omit keys that do not apply |
| `thumbnail` | string (URL) or null | yes | The thumbnail URL returned by `read-design`, or null. Signed Canva URLs expire — a receipt, not storage |
| `result` | `"ok"｜"error"` | yes | |
| `error` | string or null | yes | Verbatim error code and message when `result` is `"error"` (e.g. `design_import_throttled`) |
| `duration_ms` | integer or null | no | Wall clock; used to validate the inferred rate limits (C27) |
| `approval` | string or null | no | The operator's verbatim phrase when one was required — the only place `"I approve the deletion"` (C30) or a public-hosting go-ahead is recorded |
| `notes` | string or null | yes | One line of human context: what changed, which slide, which assertion passed or failed |

### Example

```jsonl
{"ts":"2026-09-05T09:14:02Z","tool":"merge-designs","route":"C","step":1,"args":{"mode":"create_new_design","operations":"insert_pages x12","title":"acme-qbr 2026-09-05"},"ids":{"design_id":"DAHxxxxxxx","job_id":"jobs:abc123"},"thumbnail":null,"result":"ok","error":null,"duration_ms":8140,"notes":"12 master pages merged in plan order"}
{"ts":"2026-09-05T09:14:06Z","tool":"read-design","route":"C","step":2,"args":{"fields":["design_metadata","page_metadata"],"page_indices":"0-11"},"ids":{"design_id":"DAHxxxxxxx","locator_count":0},"thumbnail":null,"result":"ok","error":null,"duration_ms":900,"notes":"page_count=12 == slide_count; all pages is_editable=true, is_responsive=false"}
{"ts":"2026-09-05T09:14:19Z","tool":"edit-design","route":"C","step":7,"args":{"page_index":4,"ops":["find_and_replace_text x5","delete_element x1","replace_speaker_notes"],"op_count":7},"ids":{"design_id":"DAHxxxxxxx"},"thumbnail":null,"result":"ok","error":null,"duration_ms":1120,"notes":"S05 kpi-grid filled; slot 6 deleted (4 stats bound)"}
{"ts":"2026-09-05T09:15:31Z","tool":"edit-design","route":"C","step":14,"args":{"finalize":"commit","op_count":0},"ids":{"design_id":"DAHxxxxxxx"},"thumbnail":"https://…/thumb.png","result":"ok","error":null,"duration_ms":2300,"notes":"transaction committed; 12/12 pages filled"}
```

### Rules

1. **Append-only.** Never rewrite a line; a correction is a new line whose `notes` references the earlier `ts`.
2. `args` carries a **summary**. Full op payloads live in `build/canva-ops/<slug>/p<NN>.json`, committed for placeholder content and git-ignored for filled decks (Decision 4).
3. A call requiring the operator's approval is logged **with** the `approval` field holding their verbatim words, on the same line as the call it authorised.
4. `index` reads this file to reconstruct `canva_design_id`, page ids and locators into each slide MD, so it must stay machine-parseable: one object per line, no trailing commas, no comments.
5. Non-MCP actions (a Chrome checklist step, the emergency PPTX hand-off) get a line too, with `tool` prefixed `chrome:` or set to `manual-upload-pptx`, so the log tells the whole story of how a design reached its current state.


## 6. Probe results (2026-09-02, first pass)

Probe designs created in the operator's Canva account (kept for inspection; no edits committed):

| Layout | Design id | edit_url | Import |
|---|---|---|---|
| `L046-three-column` (Barlow + JetBrains Mono) | `DAHT_1qMeZ4` | https://www.canva.com/d/sQkkkv3ufv6Qj2g | `import-design-from-url` from `raw.githubusercontent.com/.../build/html/L046.html`, `intended_design_type: presentation`, job success, 1 page |
| `L037-table-insight` (Inter) | `DAHT_w99T-8` | https://www.canva.com/d/ZM5sYvB39gRSzmi | same, 1 page |

| Q | Result | Evidence | Decision |
|---|---|---|---|
| **P1** Does annotated HTML import as an editable presentation? | **Yes.** `design_types: ["presentation"]`, page `type: "fixed"`, 1920x1080. Every text run became a `text` element with `left/top/width` **exactly** as authored (96 / 683 / 1269; widths 1728 / 555 / 491), `fontSize` exact, `lineHeight` exact, `textAlign: start`, weight mapped 700→`bold`, 600→`semibold`, 400→`normal`, 500→`medium`. `div` with fill → `rect`; `div` with `border-radius` → `shape` with a rounded path; `data-label` → page `title`; `data-speaker-notes` → page `notes`. A full-page white `rect` is added as background. Heights are recomputed by Canva (83.59 for a 76px title). | `read-design` transactions on both designs | **Route A is the primary import route for masters AND for filled decks whose content may be hosted publicly.** Route C remains the path for private content (Decision 16). |
| **P2** Do non-native fonts survive? | **Preserved in this account.** Distinct `fontRef`s per family (`YAFdJsyuOPM` Barlow, `YAFdJksXcAk` JetBrains Mono, `YAFdJvSyp_k` Inter); thumbnail renders Barlow headings and a monospace source line. Whether these are Canva-library fonts or Brand-Kit uploads is not distinguishable via the API; the operator can confirm in the editor. Gradients and inline SVG were not in this pass. | `read-design` formatting.fontRef; thumbnails | Tag Barlow `canva_native: yes` (already), JetBrains Mono → `yes (observed)` pending editor confirmation. Add a gradient + inline-SVG probe layout in the next pass. |
| **P3** HTML export? | **No.** `get-export-formats` on `DAHT4uBPl_o` → pdf, jpg, png, pptx, gif, mp4 only. | tool output | Canva → repo round trip is `read-design` JSON + PNG/PDF only. |
| **P7** (partial) `edit-design` field names and behaviour | All four applied: `find_and_replace_text`, `insert_shape` (`path`, `view_box_width/height`, `color`, `corner_rounding`), `add_text` (`page_id, text, top, left, width`), `replace_speaker_notes` (`notes`). Observed: **`find_and_replace_text` shrank the text box to the new text's natural width** (555 → 150.45 for "Option A"); `add_text` landed as 16px black in the default font (`YACgEZ1cb1Q`) with lineHeight 1.4; `insert_shape` produced a `shape` with `cornerRounding: 16`. Transaction was cancelled; nothing committed. | `edit-design` response document | Route C fill sequence must follow every text replacement with `resize_element {width}` (text: width only) and, when needed, `format_text`; `build-canva-ops.mjs` to emit that pair. Ops-per-call ceiling and transaction lifetime still untested. |
| **P8** Auto-split threshold | **15 pages import as ONE design** (`DAHT_-_Qmzs` "PROBE 15 pages", `page_count: 15`, from `build/html/probe-15.html`, 26 KB). Threshold for splitting is above 15 pages; a 40-page test is still pending. | import job result; `read-design` total_pages 15 | Family masters of ≤15 pages are safe. |
| **P7** ops-per-call ceiling and transaction lifetime | Not measured. A transaction on `DAHT_-_Qmzs` was opened and cancelled without running the 25/50-op batches (session handed over). | — | Run: 10, 25, 50 harmless `update_opacity` ops on page 1 of `DAHT_-_Qmzs`, then cancel. |
| P4, P5, P6 | not run | — | P4 needs the operator to select the browser; P5 needs a new Claude Design project; P6 needs a family master. |

Hosting note: the probe files are placeholder layouts in the public repo, so Route A was possible without exposing content. Filled decks may use Route A only when `content_public: true` (Decision 4).
