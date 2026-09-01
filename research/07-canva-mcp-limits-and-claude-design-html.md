# 07 · Canva MCP batch constraints and the Claude-Design-style HTML import spec

- Date: 2026-09-02
- Source: research agent (web, GitHub code search, live connector tool schemas read-only), planning session
- Focus: most reliable path from Claude Code to editable Canva slides; exact constraints; assembled HTML spec with confidence levels; route call budgets
- Caveats declared by the report: WebSearch budget was exhausted midway; the recommended "PPTX primary" route conflicts with this project's rule that no vendor design files enter the repo (see docs/DECISIONS.md); HTML route evidence is community-reported
- Legend: **[O]** officially documented · **[C]** community-reported · **[I]** inferred

---

## Report: reliable path from Claude Code → editable Canva slides

Legend: **[O]** officially documented (Canva docs / tool schema / Canva Help), **[C]** community‑reported, **[I]** inferred.

### (a) Assembled "Claude‑Design‑style HTML" import spec

The authoritative source turned out to be the `import-design-from-url` tool description itself (identical in the live connector schema and in GitHub dumps of the Canva MCP), not any Anthropic doc. Anthropic publishes nothing about the HTML format; the leaked Claude Design system prompt has no Canva skill (README notes "Send to Canva" was dropped from the built‑in skill list; it survives only as a Share‑menu action).

| Rule | Confidence |
|---|---|
| Put `data-document-role="page"` on every element that should become a Canva page, "even if there is only one". Pages must not be nested inside another page. | **[O]** tool description |
| Optional `data-label="..."` = page title; optional `data-speaker-notes="..."` = presenter notes, both plain strings. | **[O]** tool description |
| Annotate only non‑interactive content (presentation, social). Unannotated HTML (app/website) is imported as an interactive **Code design**. Conversion failure also falls back to a Code design. | **[O]** tool description + Canva Help "Import HTMLs" |
| Formats accepted by URL import: PDF, PPTX, DOCX, XLSX, CSV, HTML, Markdown, PSD, AI, Keynote, Pages, Numbers, and `.zip` bundles (HTML + assets). Must be a public HTTPS URL; `canva.com/design/*` and OpenAI file hosts are regex‑blocked. | **[O]** tool schema |
| Text → editable text boxes; images → separate movable elements; layout "preserved as closely as possible"; JS ignored; links may be lost; externally hosted fonts/images "may not import". | **[O]** Canva Help |
| Set `intended_design_type: "presentation"`. | **[O]** schema; [I] that it matters for Code‑vs‑presentation classification |
| Fixed pixel page box: `position:relative; width:1920px; height:1080px; overflow:hidden` (1280×720 also imported fine). Claude Design's own decks are 1920×1080 `<section data-label>` children of `<deck-stage>`, which absolutely positions each section. | **[C]** Endfield, Devlabs, costadev00, classpulse repos; **[C]** leaked make‑a‑deck skill |
| Each text run in its own leaf element (`<span>`/`<p>`/`<h2>`), repeated structure written out (three real `<li>`s). This is Claude Design's stated rule for "directly editable" slides and matches what Canva reads back as separate text boxes. | **[C]** leaked skill; **[I]** for Canva |
| No text in `::before/::after`; avoid gradient overlays spanning text; no full‑page SVG/screenshots; UTF‑8 with `<meta charset>`; inline styles are fine. Absolute positioning inside the page is "more stable" than flex/grid, though flex/grid decks did import as 12‑page presentations with titles readable via API (i.e., not rasterized). | **[C]** Endfield audit + import report (DAHQy3OxY38, 12 pages recognised as `presentation`) |
| Fonts: Canva doesn't fetch webfonts reliably. Use `font-family` names that exist in Canva's library (Google Fonts are built in) and give real fallbacks; expect substitution and width drift. `<link>`/`@import` Google Fonts appear harmless but unproven. | **[O]** Help ("external fonts may not import"); **[C]** scriblit README; **[I]** name mapping |
| Images: absolute public URLs work; base64 data URIs were used by one repo (unknown result; they also produced a "small" variant, suggesting size trouble). Prefer hosted PNG/JPG < 50 MB. | **[C]/[I]** |
| Speaker notes via `data-speaker-notes` is the only import path for notes; the leaked Claude Design deck contract also uses `data-speaker-notes` + `data-label`, so "Send to Canva" almost certainly injects `data-document-role="page"` on those sections and bundles assets into a zip at a public URL. | **[I]** medium |
| Fidelity caveats: even Anthropic‑generated HTML gets mixed reports — one Japanese tester (Apr 26 2026) found Send‑to‑Canva output hard to edit vs PPTX; a May 29 2026 XDA review found every element individually editable; Ruben Hassid: "Send to Canva does not work". | **[C]** |

### (b) Constraint table

| Item | Value | Source |
|---|---|---|
| `import-design-from-url` rate | 20 req/min/user; async job; 30‑day temp URLs; errors `design_import_throttled`, `invalid_file`, `fetch_failed`, `duplicate_import` | **[O]** canva.dev MCP tools + Connect URL‑import docs |
| Import auto‑split | "Imports with a large number of pages or assets are split into multiple designs" — threshold undocumented; recombine with `merge-designs` | **[O]** Connect docs |
| Design title | ≤50 chars (Connect import) | **[O]** |
| `read-design` | `page_metadata` returns first **50 pages** unless `filter.page_indices` set; `open_transaction:true` returns full element JSON with `locator_id`s; `presenter_notes` readable | **[O]** schema |
| `edit-design` | **All ops in one call must target one page**; `operations` cannot be combined with `finalize: commit/cancel`; no documented max ops per call or transaction lifetime | **[O]** schema; lifetime **unknown** |
| `edit-design` operations (27) | `add_text`, `format_text`, `replace_text`, `find_and_replace_text`, `insert_fill`, `update_fill`, `insert_shape` (SVG path M/L/H/V/C/S/A/Z only), `add_page` (40–8000 px), `reorder_page`, `replace_speaker_notes` (≤5000 chars), `group_elements`, `recolor_element`, `update_opacity`, `crop_media`, etc. | **[O]** schema |
| Font family | **Cannot be set by any op**; `format_text.font_weight` is only `normal|bold`, `font_style` `normal|italic`, `font_size` 1–800 px, `line_height` 0.5–2.5 | **[O]** schema; **[C]** Canva's own skill: "Change font family/typeface — CANNOT" |
| `format_text` scope | Styles the whole text box, not substrings → one `add_text` per differently styled run | **[C]** scriblit README |
| `replace_text` side effect | Resets `lineHeight`→1.4, `listMarker`→disc, `listLevel`→1; use `find_and_replace_text` or re‑apply `format_text`. `add_text` lands as black 16 px. | **[C]** fercosnt contract (measured 2026‑08‑23) |
| Responsive pages | Restricted allowlist (`update_title, replace_text, update_fill, delete_element, find_and_replace_text`); whole batch rejected on non‑editable page | **[O]** schema |
| Tables | `sheet` elements are opaque: no cell read/write (`not_supported`) | **[C]** |
| Classic edit rates (proxy for edit‑design) | start 20/min, perform 50/min, commit 20/min | **[O]** canva.dev; **[I]** applies to `read-design`/`edit-design` |
| `merge-designs` | ≤**500** operations per call; `create_new_design` allows only `insert_pages`; auto‑polls job; no documented duration | **[O]** schema |
| `upload-asset-from-url` | 30 req/min; images < 50 MB (JPEG/PNG/HEIC/GIF/TIFF/WEBP), video < 500 MB | **[O]** |
| `export-design` | 20 req/min; must call `get-export-formats` first; pptx/pdf/png/jpg/gif/mp4/csv | **[O]** |
| Max pages per design | Not verified anywhere I could reach (the "350" figure remains unconfirmed). PDF import cap 500 pages, PPTX 300 MB. | **[O]** for PDF/PPTX; 350 **unverified** |
| Text length per element | Undocumented for editing; autofill text cells max 10,000 chars | **[O]** Connect autofill |
| Brand templates / autofill | `search-brand-templates`, `create-design-from-brand-template`, `resize-design`: Pro+; `get-brand-template-dataset` and `autofill-design`: **Enterprise only** (60/min). **`autofill-design` is not in your connector's tool list**, so dataset‑based batch fill is not available to you regardless of plan. `publish-brand-template` needs `brandtemplate:content:write` scope and Teams/Enterprise; a Pro user got "Not allowed to access brand template". Autofill fields per template: undocumented; chart data ≤100 rows × 20 cols. | **[O]** canva.dev; **[C]** fercosnt |
| Code design rescue | **No conversion path** from Code design to presentation; Code pages can only be embedded as an interactive element in a design and "can't be exported as a file". Magic Layers (AI credits, PNG/JPG ≤5000 px, single page, monthly quota, UI‑only, no API) converts flat images to layers — a fallback for rasterized slides, with a known blank‑region failure on dense tables. | **[O]** Canva Help; **[C]** Romanch001 pipeline |

### (c) Recommended route for a 40‑slide filled deck (with notes)

1. **Primary: PPTX via `import-design-from-url`** — generate with python‑pptx/pptxgenjs (real text boxes, notes slides, fonts named as Canva‑library fonts), host at a public HTTPS URL you control (GitHub raw / Vercel), 1 import call, 1 `read-design` (`presenter_notes` + `page_metadata`) to verify, optional `merge-designs` if the import auto‑splits. **≈3–4 calls.** This is the path every community source agrees yields freely editable text/fonts; it is also the only Canva‑documented office format with size limits published (300 MB).
2. **Parallel test: annotated HTML** (spec above) — same 3–4 calls. Advantage: exact CSS layout, `data-speaker-notes` per page. Risk: silent Code‑design fallback (irreversible) and font substitution. Run one 3‑slide probe first; check `read-design` returns `design_content` text for every page and the design type is `presentation`.
3. **Font‑exact variant (if template fonts matter): "layout master" + edit‑design.** Build one Canva design with the 6–8 slide archetypes in the right fonts once (manually or via PPTX import), then per deck: `copy-design` (1) → `read-design open_transaction` (1) → `edit-design` per page (40, batched ops, using `find_and_replace_text` or `replace_text`+`format_text`, plus `replace_speaker_notes`) → commit (1). **≈43 calls; ≈2–3 min at the inferred 50/min ceiling**, and fonts are inherited since the API can't set them.
4. **Not viable:** brand‑template autofill (Enterprise + missing `autofill-design`), and building from blank with `add_page`/`add_text` (≈80–120 calls, everything lands in the default font, no substring styling).

> Project note (2026-09-02): route 1 (PPTX) is ruled out as a repo artifact by the operator; this project uses route 3 as the default for filled decks (Route C in docs/PLAN.md), route 2 for masters (Route A), and keeps PPTX only as a transitory, never-committed emergency path. See docs/DECISIONS.md.

### (d) Links

- Canva Help, Import HTMLs: https://www.canva.com/help/import-html/
- Canva MCP tools & rate limits: https://www.canva.dev/docs/mcp/tools/ (index: https://www.canva.dev/docs/mcp/llms.txt)
- Connect: URL import job: https://www.canva.dev/docs/connect/api-reference/design-imports/create-url-import-job.md ; autofill job: https://www.canva.dev/docs/connect/api-reference/autofills/create-design-autofill-job/ ; autofill guide: https://www.canva.dev/docs/connect/autofill-guide/ ; dataset: https://www.canva.dev/docs/connect/api-reference/brand-templates/get-brand-template-dataset/ ; assets: https://www.canva.dev/docs/connect/api-reference/assets.md
- Canva Help: Canva Code: https://www.canva.com/help/canva-code/ ; Code elements: https://www.canva.com/help/canva-code-generated-interactive-elements/ ; Magic Layers: https://www.canva.com/help/editable-magic-layers/ ; upload limits: https://www.canva.com/help/upload-formats-requirements/
- Canva newsroom (Claude Design): https://www.canva.com/newsroom/news/canva-claude-design/ ; Anthropic: https://www.anthropic.com/news/claude-design-anthropic-labs ; https://claude.com/design
- Canva official agent skills (edit‑design CAN/CANNOT list): https://github.com/canva-sdks/canva-skills/blob/main/plugins/canva/skills/edit-design/SKILL.md
- Tool description dumps: https://github.com/coldshalamov/SpaceFace/tree/main/mcps/canva/tools
- Leaked Claude Design prompt/skills: https://github.com/asgeirtj/system_prompts_leaks/tree/main/Anthropic/claude-design
- Community HTML examples: https://github.com/hs150521/Endfield-PPT-Template (AUDIT_REPORT.md, CANVA_IMPORT_REPORT.md), https://github.com/Devlabs-club/website/blob/main/public/pitchdeck-canva/editable.html, https://github.com/keiji0711/classpulse/blob/main/CLASSPULSE_CANVA_PITCH.html, https://github.com/mini531/insta_toon/blob/main/ep01/build_canva_html.js
- Community edit‑API findings: https://github.com/fercosnt/fernando-claude-marketplace/blob/main/deck-builder/shared/canva-render-contract.md ; https://github.com/rmorgan15/scriblit-carousel-assets ; https://github.com/Romanch001/AI-Slide-Deck-Automation
- Testimonials: https://note.com/chinanezu/n/n6056061d9ca1 ; https://www.xda-developers.com/claude-designs-canva-integration-just-saved-me-hours-of-editing-and-thats-why-im-ditching-my-old-workflow/ ; https://ruben.substack.com/p/claude-design

Note: the session's WebSearch budget was exhausted midway; remaining research used WebFetch, `gh search`, and the live connector's tool schemas (read‑only). No files were created or edited.
