# 08 · Stack interactions: Claude Code, Claude Design (Design Sync), Canva MCP, Canva via Claude in Chrome

- Date: 2026-09-02
- Source: research agent (web + GitHub), planning session
- Focus: which surface does which step; Claude Design internals and Design Sync; Canva MCP plan gating; Chrome feasibility; handoff formats; open questions for live tests
- Caveats declared by the report: WebSearch budget ran out mid-task; several Canva help slugs 404'd (Magic Switch, Styles, Change-All); Reddit unreachable; the Chrome column rests on official constraints plus inference, no field reports found
- Legend: **[O]** official docs/announcements · **[C]** community/hands-on · **[I]** inference (needs a live test)
- Corrections from this session: the connected Canva MCP server exposes `replace_speaker_notes` as an `edit-design` operation (schema read in-session), so speaker notes are writable, contrary to the "read only" cell in the matrix below

---

## Research report: Claude Code × Claude Design × Canva MCP × Claude in Chrome

Legend for source class: **[O]** official docs/announcements · **[C]** community/hands-on reports · **[I]** my inference (needs a live test).

---

### 1. Claude Design

**What it is / produces [O]**
- Launched 17 Apr 2026 (Anthropic Labs, Opus 4.7); beta on Pro/Max/Team/Enterprise; shares usage limits with chat/Code/Cowork. ([Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs), [Get started](https://support.claude.com/en/articles/14604416-get-started-with-claude-design))
- Export menu: **Download as .zip, Export as PDF, Export as PPTX, Send to Canva, Export as standalone HTML, Send to local coding agent / Claude Code Web**; connectors: Adobe, Base44, Canva, Gamma, Lovable, Miro, Replit, Vercel, Wix. ([Get started](https://support.claude.com/en/articles/14604416-get-started-with-claude-design), [claude.com/design](https://claude.com/design))
- Native document format is **`.dc.html`** ("Design Components": plain HTML + `<x-dc>`, `<x-import>`, `<dc-import>`, `{{tokens}}`, a `support.js` runtime). Each `.dc.html` is one artboard; `canvas.json` lays them out. Images stored as base64 file entries; icons expected as inline SVG. This is stated in the Claude Code `/design` skill text, which ships a precompiled copy of Claude Design's editor. [O-adjacent: leaked skill text on GitHub, consistent with code.claude.com w34 notes] ([w34 digest](https://code.claude.com/docs/en/whats-new/2026-w34.md), [skill text](https://github.com/asgeirtj/system_prompts_leaks/blob/main/Anthropic/claude-code/skills/design/SKILL.md))
- PPTX fidelity [C]: font substitution (webfonts), gradient flattening, text-box drift; budget 10–15 min cleanup. Direct edits inside Claude Design were limited at review time (no add/remove text boxes, no drag, no slide reorder). ([Alai](https://getalai.com/blog/claude-design)) The June update added WYSIWYG drag/resize/align, so the drag limitation is likely stale. ([claude.com blog, 17 Jun 2026](https://claude.com/blog/claude-design-stays-on-brand-for-daily-work))

**Design systems [O]**
- Two-layer model: **Design System projects** (`PROJECT_TYPE_DESIGN_SYSTEM`) and regular **Projects** (`PROJECT_TYPE_PROJECT`). Sources: GitHub repo, local codebase, design files, screenshots, "even a well-designed PowerPoint or PDF", logos/palettes/type specimens. Extracted: palette, typography (families/sizes/weights), components, layout/spacing. Published DS becomes the org default; Enterprise "Claude Design Admin" can publish/lock. ([Set up DS](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design), [Admin guide](https://support.claude.com/en/articles/14604406-claude-design-admin-guide-for-team-and-enterprise-plans))
- On-disk representation of a DS project (from the `/design-sync` skill text and community `.design-sync/NOTES.md` files): `_ds_bundle.js` (compiled React lib on `window.<Global>`), `_ds_bundle.css`, `styles.css` (`@import` closure — designs receive only this), `tokens/`, `fonts/`, `components/<group>/<Name>/{.html card,.jsx,.d.ts,.prompt.md}`, `guidelines/`, `_vendor/`, `_ds_sync.json`, `README.md` (conventions header inlined into the design agent's prompt). A deck project embeds the DS under `_ds/<ds-name-id>/` and slides are `<section>`s inside `<x-import component-from-global-scope="deck-stage" width="1920" height="1080">`. **So yes: fonts (files), tokens (CSS), components (compiled JS + cards + typed API + usage prompt) all sync; logos travel as ordinary assets.** [O-adjacent + C] ([design-sync skill](https://github.com/asgeirtj/system_prompts_leaks/tree/main/Anthropic/claude-code/skills/design-sync), [az9713 round-trip](https://github.com/az9713/claude-design-sync/blob/main/DESIGN-SYNC-JOURNEY.md), [chronicle notes](https://github.com/SimpleOpenSoftware/chronicle))

**Design Sync — what it exactly is [O]**
- Not an MCP server; it is a **built-in Claude Code tool `DesignSync`** (ops: `list_projects`, `get_project`, `list_files`, `get_file` ≤256 KiB, `create_project`, `finalize_plan`, `write_files` ≤256 files/call, `delete_files`) authenticated via your claude.ai login or `/design-login`. Consent model: reads are prompt-free after initial grant; `create_project` and `finalize_plan` (which locks the exact write/delete path globs) each raise a permission prompt; all writes require a `planId`. ([tool description](https://github.com/Piebald-AI/claude-code-system-prompts/blob/main/system-prompts/tool-description-designsync.md))
- `/design-sync` (Claude Code ≥ v2.1.181) is a **converter + verifier + uploader** for a *React* design-system repo (Storybook or bare package): builds `dist/` → bundle, generates card/d.ts/prompt.md per component, render-checks in Playwright/Chromium, uploads behind a sentinel. First sync "can take up to a few hours". Design→Code direction is: Claude Design "Share → copy sync prompt" or read the project's `.dc.html` with `DesignSync.get_file` and reimplement. It does not watch the repo. ([claude.com blog](https://claude.com/blog/claude-design-stays-on-brand-for-daily-work), [Serverworks hands-on](https://blog.serverworks.co.jp/claude-design-sync), [vibecoder](https://blog.vibecoder.me/claude-design-system-sync-code-handoff))
- `/design` in Claude Code (≥ v2.1.234, research preview): drafts `.dc.html` artboards, publishes an Artifact running the canvas editor; **PNG/PDF export only; Google Fonts are not embedded in export (fallback face shows); DS color tokens and "request tweaks" loop unavailable in this preview**; `import/export/status` verbs not available. ([w34](https://code.claude.com/docs/en/whats-new/2026-w34.md), skill text)

**Custom reusable elements [I from O]**: a branded card/chart/callout is just a sibling `.dc.html` component mounted via `<dc-import name="Card">`, or a real React component synced into the DS bundle. Both are readable back as HTML/JS source via `DesignSync.get_file`. There is **no documented SVG export of components**; the practical "export" is the `.dc.html`/JSX source or a PNG artboard export.

**Send to Canva [O]**: Claude Design bundles HTML + assets to a public URL; Canva imports it. Canva Help: "When you import HTML presentations created in Claude Design, Canva automatically converts them into fully editable Canva Presentations… **This feature only works with Claude Design slide deck presentations. Other HTML files import as Code designs**" (view + basic edits, no presentation features). Text → editable text boxes, images → separate elements, layout "as closely as possible"; complex CSS may not convert; JS unsupported; "external resources (fonts, images hosted elsewhere) may not import"; links may drop. ([Canva Help: Import HTMLs](https://www.canva.com/help/import-html/), [Canva newsroom](https://www.canva.com/newsroom/news/canva-claude-design/)) Hands-on [C]: typography, layout, colours and logos arrived as individually editable elements. ([XDA](https://www.xda-developers.com/claude-designs-canva-integration-just-saved-me-hours-of-editing-and-thats-why-im-ditching-my-old-workflow/))

---

### 2. Canva MCP

**Auth/plans/limits [O]** ([canva.dev/docs/mcp](https://www.canva.dev/docs/mcp/), [tools & rate limits](https://www.canva.dev/docs/mcp/tools/), [help: AI connector](https://www.canva.com/help/mcp-agent-setup/))
- OAuth per user (CIMD recommended, DCR legacy); "same permissions as the Connect API"; no org service accounts; domains `canva.com` + `canva.ai`. Canva plan: Pro/Teams/Business/Nonprofit (Free can generate but not edit existing per one tutorial [C]).
- Per-tool limits (req/min): generate-design 20, import-design-from-url 20, export-design 20, copy-design 20, editing transactions 20 (perform-ops 50), search/get/comments 100, upload-asset-from-url 30. **Pro+**: resize-design, search-brand-templates, list-brand-kits, create-design-from-brand-template. **Enterprise only**: autofill-design, get-brand-template-dataset.
- Connect API export limits: 75 exports/5 min and 500/24 h per user. ([Connect exports](https://www.canva.dev/docs/connect/api-reference/exports/create-design-export-job/))

**Tool surface [O]**: the public docs list the generic tool set (editing transactions, get-design-content, get-presenter-notes, etc.). Canva Help notes that **in Claude the 9 design tools are consolidated into `read_design` and `edit_design`**; `edit_design` "replaces perform-editing-operations, commit…, cancel…, get-design-thumbnail. It also now supports text insertion and page insertion"; `read_design` "also reads geometry, element types, backgrounds, strokes, and opacity"; "Some tools may only appear in Agent mode (Claude, Cursor, VS Code)". ([Canva Help: actions in AI assistants](https://www.canva.com/help/mcp-canva-usage/)) Your connected server additionally exposes `merge-designs`, `create-brand-template-draft`, `publish-brand-template`, `generate-design-structured`, `request-outline-review`, `get-design-candidates` — none of these have public doc pages (404), so treat their exact semantics as **live-test only**.

**Explicitly documented editing ops [O]**: `replace_text` (standard pages), `find_and_replace_text` (responsive pages), image ops require a prior `upload-asset-from-url` → `asset_id`. ([perform-editing-operations](https://www.canva.dev/docs/mcp/tools/perform-editing-operations.md)) `get-design-content` returns one flattened `text` field, "not for targeting edits"; element IDs come only from an open editing transaction. ([get-design-content](https://www.canva.dev/docs/mcp/tools/get-design-content.md))

**Not possible via MCP (documented absence, i.e. [I] from [O])**: font-family changes / font uploads, applying a Brand Kit to an existing design, page background/gradient changes, Magic Switch, Styles, template *links*. Brand Template **publishing is possible on Pro/Teams/Enterprise** via the Connect API `publish-brand-template` (scope `brandtemplate:content:write`, roles: team admin / brand designer / org admin / org designer, preview API, 20/min) — and your MCP exposes a matching tool. ([Connect: publish brand template](https://www.canva.dev/docs/connect/api-reference/brand-templates/publish-brand-template/))

**Import/export formats [O]**: Connect import accepts AI, PSD, Affinity, ODG, PDF, KEY, PPT/PPTX, ODP, Numbers/XLS(X)/ODS, Pages/DOC(X)/ODT — **HTML is not in the Connect import list**; the HTML path is Canva's Uploads/Claude-Design conversion. ([design imports](https://www.canva.dev/docs/connect/api-reference/design-imports/)) Connect export formats: jpg, png, gif, pdf, mp4, pptx, csv (Sheets), **html_bundle, html_standalone** — **no SVG**. Whether the MCP `export-design` exposes `html_*` is not documented; `get-export-formats` per design will tell you. Canva's own guidance: export is "a delivery mechanism, not a handoff" — always return the `edit_url`. ([design-edit workflow](https://www.canva.dev/docs/mcp/workflows/design-edit.md))

---

### 3. Claude in Chrome + Canva

**Official [O]** ([Claude Code + Chrome](https://code.claude.com/docs/en/chrome.md), [Chrome help](https://support.claude.com/en/articles/12012173-getting-started-with-claude-in-chrome))
- Shares your logged-in session; pauses on login/CAPTCHA; site permissions from the extension; plan mode allows read-only calls without prompts. **File upload** from disk works (v2.1.211+, ≤10 MB per upload, denied if `Read` is denied). **JS modal dialogs block all commands** (dismiss manually). Service worker idles on long sessions → `/chrome` → Reconnect. Not on WSL. Downloads require explicit confirmation per action; sharing/permission changes are *prohibited* actions in the extension's policy (relevant: "Share → Template link" and Brand Template sharing settings may be refused as "modifying access controls").
- The extension's own operating prompt says: "Some complicated web applications like Google Docs, Figma, **Canva** and Google Slides are easier to use with visual tools" — i.e. `read_page` refs often find nothing on the canvas; fall back to screenshots + coordinate clicks. [O-adjacent, leaked prompt] ([mirror](https://github.com/thedixitjain/the-mega-skill-library/blob/main/prompts/mobile-and-platform/claude-in-chrome-20260328.md))
- Community [C]: background MCP tabs get `visibilityState: hidden` → rAF/setTimeout throttled, which can stall canvas-rendered editors; keep the Canva tab foregrounded. ([waveform-playlist CLAUDE.md](https://github.com/naomiaro/waveform-playlist))
- **No published hands-on report of Claude in Chrome driving Canva's editor was found** (search budget exhausted before Reddit/X could be probed). Everything in the matrix's Chrome column is therefore [I].

**UI-only Canva features that matter [O]**: Brand Kit font upload (OTF/TTF/WOFF, 500/kit, Pro+; Brand → Fonts → Upload) ([help](https://www.canva.com/help/upload-fonts/)); Template link (Share → Template link; Pro+) ([help](https://www.canva.com/help/share-template-link/)); Brand Template publish + element locks set *before* publishing ([publish](https://www.canva.com/help/publish-team-template/), [locks](https://www.canva.com/help/brand-template-locks/)); Code designs "can be copied and reused externally, but can't be exported as a file or directly edited within Canva"; a Code *element* can be embedded in a Presentation via "Use in a design" ([Canva Code help](https://www.canva.com/help/canva-code/)). I could not locate a help page for the font "Change all" affordance (several URL guesses 404'd) — treat as [C]/[I].

---

### 4. Interactions and handoffs

- **Claude Design importing a deck authored elsewhere**: no documented "import HTML" path; the June blog mentions `/design` "importing designs", but the Claude Code `/design` preview explicitly refuses `import`. The real route is **`DesignSync.write_files`** of your own `.dc.html` into a project (BeePEE notes describe hand-authored `.dc.html` templates uploaded to `templates/` with a separate `finalize_plan`). [O-adjacent/C]
- **Claude Design → Canva editable**: yes for slide decks; what survives: text/images/layout; fonts/gradients/custom SVG undocumented — XDA saw typography intact; PPTX export elsewhere flattens gradients, so expect similar risk. [O+C]
- **Canva → Claude Code redline**: `export-design` (pdf/png/pptx; possibly `html_bundle`) + `read_design` (geometry/element types/backgrounds) + `get-presenter-notes` + `list-comments` are all MCP-readable. [O]
- **Official combined workflow**: Canva's newsroom + Anthropic's Canva connector page describe MCP-based generate/autofill/export and the Claude Design → Canva conversion; no Anthropic doc combines Design Sync with Canva. ([Canva connector](https://claude.com/connectors/canva), [Canva Jan 2026 on-brand](https://www.canva.com/newsroom/news/claude-ai-connector/))

---

### (a) Capability matrix

| Pipeline task | Claude Code scripts | Claude Design | Canva MCP | Claude in Chrome |
|---|---|---|---|---|
| Author layout HTML (MD→HTML) | **Yes** — your renderer; can also emit `.dc.html` for `/design` or DesignSync [O] | Yes, via prompt; output is `.dc.html` [O] | No (generate-design is prompt→Canva-native) [O] | n/a |
| Create branded custom elements (cards/charts/callouts) | **Yes** — HTML/SVG/React; sync into DS via `/design-sync` (React) or `DesignSync.write_files` (`.dc.html`) [O] | Yes; stored as `.dc.html`/JSX; no SVG export [O/I] | Partial — only as uploaded PNG/SVG assets via `upload-asset-from-url` [O] | n/a |
| Apply brand tokens | **Yes** (CSS vars in your HTML) [O] | Yes via published DS (`tokens/`, `fonts/`, `styles.css`) [O] | Partial — Brand Kit only at generation (`generate-design` w/ brand kit, `create-design-from-brand-template`, Pro+) [O]; no "apply kit to existing" [I] | Partial — Styles / Brand Kit apply in editor [I] |
| Batch-create pages | Yes — drive MCP in loops (20 req/min imports) [O] | Partial (chat-driven) | **Yes** — `import-design-from-url` per deck, `edit_design` page insertion, `merge-designs`, Enterprise `autofill` [O] | Partial — Bulk Create UI [I] |
| Set font family design-wide | Only upstream in HTML [O] | Yes in DS/`.dc.html` [O] | **No** (text replace only) [O] | **Yes-ish** — font picker / "Change all" via screenshots+clicks; unverified [I] |
| Upload Brand Kit fonts | No | No | **No** [O] | **Yes** — `file_upload` ≤10 MB, OTF/TTF/WOFF, Pro+ [O for both halves; combination I] |
| Publish reusable template | No | No | **Yes** — `create-brand-template-draft`/`publish-brand-template` (Pro/Teams/Enterprise, admin/brand-designer role, preview API) [O]; Template *link*: No | Yes (Share → Brand Template / Template link); extension may refuse sharing-permission changes [O/I] |
| Assemble deck from masters | Yes (orchestrate) | Partial (prompt) | **Yes** — `copy-design` + `merge-designs` + `edit_design` [O; merge semantics undocumented] | Partial |
| Fill text by locator | Yes (in HTML) | Yes | **Yes** — `replace_text`/`find_and_replace_text` by `element_id` from `read_design` transaction [O] | Partial (slow) |
| Add speaker notes | Yes in PPTX (python-pptx) → import [I] | Unknown | **Read** only (`get-presenter-notes`); write undocumented [O/I] | Yes (Notes panel) [I] |
| Read comments | — | Inline comments (own) [O] | **Yes** — `list-comments`, `list-replies`, `reply` [O] | Yes |
| Export for review | — | PDF/PPTX/HTML/zip [O] | **Yes** — pdf/png/jpg/pptx/mp4(/html_bundle?) ; no SVG; signed URLs expire [O] | Yes (Download dialog; confirmation required) [O] |
| Convert Code design → editable presentation | Only by making the HTML *be* a Claude Design deck [I] | **Yes** — Send to Canva on a slide-deck project [O] | No documented tool [O] | Partial — "Use in a design" embeds a Code element; no full conversion in UI [O/I] |

### (b) Recommended division of labor and handoff formats

1. **Claude Code (source of truth)**: MD corpus → decomposition → retrieval → render two targets from one layout model: (i) plain HTML/PPTX for Canva import, (ii) `.dc.html` + `canvas.json` for Claude Design. Keep tokens as CSS custom properties + `tokens.json`; keep components as React (so `/design-sync` can ship them) with `.dc.html` wrappers for decks.
2. **Claude Design (brand system + polish + Canva bridge)**: publish the DS once via `/design-sync`; author/refine decks on it; use **Share → Send to Canva** as the *only* reliable HTML→editable-Presentation path. Handoff in: `.dc.html` via `DesignSync.write_files`; handoff out: `DesignSync.get_file`, PPTX, standalone HTML.
3. **Canva MCP (bulk, deterministic ops)**: import (PPTX/PDF/HTML-from-Claude-Design URL), `read_design` → locator map, `edit_design` text/page ops, `merge-designs`, folders, comments, `publish-brand-template`, `export-design` for redline. Handoff in: public URLs (PPTX/PDF, assets); handoff out: PDF/PNG/PPTX (+ `edit_url`), JSON element maps.
4. **Claude in Chrome (last mile, human-in-loop)**: Brand Kit font upload, font Change-All, Brand Kit/Styles apply, Magic Switch, Template link, lock elements before publishing, download. Operate via screenshots + coordinates, keep the tab foregrounded, expect dialog stalls.

### (c) Open questions only a live test answers

1. Does Canva's "Claude Design presentation" detection key off the `deck-stage`/`<x-dc>` markup (so a Claude-Code-authored `.dc.html` deck uploaded directly converts), or off a Claude-Design-origin URL/signature?
2. Do custom webfonts, gradients and inline SVG components survive Send to Canva (fonts: substituted vs. embedded vs. Brand-Kit-matched)?
3. Exact schema of your MCP's `edit_design`/`read_design`/`merge-designs`/`create-brand-template-draft` (undocumented publicly); does `edit_design` accept image/asset ops, background, or font props?
4. Does `export-design` via MCP return `html_bundle`/`html_standalone`, and does PPTX export keep presenter notes? Is there any write path for notes?
5. Can `import-design-from-url` accept an arbitrary public HTML URL (→ Code design?) or only the Connect list (PPTX/PDF/DOCX…)?
6. Will Claude in Chrome's policy refuse "Share → Template link" / Brand Template publish as an access-control change, and can it reliably operate Canva's font picker "Change all" and Brand Kit apply on a canvas-rendered editor?
7. Does `DesignSync.write_files` of a hand-authored deck `.dc.html` into a regular Project render in claude.ai/design (BeePEE suggests yes for `templates/`), and does the Claude Design "Send to Canva" then work on it?

Note: WebSearch budget ran out mid-task; several Canva help URLs (Magic Switch, Styles, Code designs, Change-All) 404'd on guessed slugs, and Reddit is unreachable from this tool, so the Chrome column rests on official constraints plus inference rather than field reports.
