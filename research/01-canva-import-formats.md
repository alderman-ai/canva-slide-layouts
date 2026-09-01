# 01 · Canva import formats, PPTX fidelity, fonts, brand templates

- Date: 2026-09-01
- Source: research agent (web), planning session for the Canva slide system
- Focus: most faithful and batch-friendly way to get agent-authored slide layouts into Canva as editable pages
- Caveats declared by the report: distinguishes official docs from inference; font lists are community-sourced; `data-*` HTML attributes were not found in public docs at the time (later confirmed as the MCP tool's own description, see research/07)
- Superseded in part by: research/07 (constraint table and HTML spec), research/08 (brand template gating)

---

# Canva editable-slide import research (as of 2026-09-01)

## 1. Design Import / URL Import: formats, limits, HTML handling

**Officially documented (canva.dev Connect API)**

- Two import families: *Design import* (upload bytes with `Content-Type: application/octet-stream` + `Import-Metadata` header) and *URL import* (`POST` with JSON `{title, url, mime_type?}`; URL must be "accessible from the internet and be publicly available", 1–2048 chars; `mime_type` optional, auto-detected if omitted; rate limit 20 req/min/user; scope `design:content:write`). URL import went GA 2025-06-24. Sources: https://www.canva.dev/docs/connect/api-reference/design-imports/create-url-import-job.md , https://www.canva.dev/docs/connect/changelog/
- The official supported-types table lists only: .ai, .psd, Affinity, Keynote/Numbers/Pages, .xls/.xlsx, .ppt/.pptx, .doc/.docx, ODG/ODP/ODS/ODT, PDF. **HTML and Markdown do not appear in the Connect API table.** https://www.canva.dev/docs/connect/api-reference/design-imports.md
- No size limits are stated in the API docs; the only structural note is "Imports with a large number of pages or assets are split into multiple designs." Title max 50 chars (bytes upload) / 255 (URL import).

**Canva MCP `import-design-from-url`** (the tool description as published in MCP catalogs): "Import a file OR zip file from a URL as a new Canva design. USE THIS TOOL when the user provides a URL to a .zip, .tar.gz archives or .html file, or any webpage/HTML content… Supports PDF, PPTX, DOCX, XLSX, CSV, HTML, Markdown, PSD, AI, Keynote, Pages, Numbers… URL must be a public HTTPS link." Canva's own tools page only lists it as "20 req/min | All plans". Sources: https://www.speakeasy.com/product/mcp-gateway/catalog/canva , https://www.canva.dev/docs/mcp/tools.md . So HTML/zip import is documented for the MCP tool, but not for the raw Connect endpoint (inferred: the MCP tool wraps the same URL-import job and the backend accepts `text/html`/zip beyond the published table).

**HTML handling (Canva Help Center, official):** https://www.canva.com/help/import-html/
- "Text becomes editable text boxes… Images are placed as separate elements… Layout is preserved as closely as possible."
- Limitations verbatim: "Complex CSS styling may not convert exactly as displayed in browsers", "JavaScript functionality isn't supported", "External resources (fonts, images hosted elsewhere) may not import", links may not be preserved.
- **Critical fork:** "When you import HTML presentations created in Claude Design, Canva automatically converts them into fully editable Canva Presentations." Everything else: "Other HTML files import as Code designs" — and Code designs "can't be… directly edited within Canva" as normal elements (edited via prompting/toolbar; interactivity only in Canva viewer/website). https://www.canva.com/help/canva-code/ , Code 2.0 launch (2026-07-14): https://venturebeat.com/technology/canva-launches-code-2-0-offering-ai-website-building-to-every-user-including-free-accounts
- **`data-document-role="page"`, `data-label`, `data-speaker-notes`: not found in any public Canva or Anthropic documentation.** Searches across canva.dev, canva.com/help, GitHub and the Claude Design announcements returned nothing. Treat these as an undocumented Claude-Design-export convention (inferred), and the "must be from Claude Design" detection heuristic is unpublished. Markdown import is officially **Docs-only** ("Importing to other design types isn't supported yet", 5 MB cap): https://www.canva.com/help/import-markdown/
- **CSS feature-level mapping (flex/grid vs absolute, @font-face, letter-spacing, border-radius, gradients, box-shadow, inline SVG, background-image): no official per-property documentation exists.** Only the generic "complex CSS may not convert" and "external fonts may not import" statements. Anything more specific must be established empirically.

## 2. PPTX import fidelity

Official (https://www.canva.com/help/powerpoint-import/ , https://www.canva.com/help/upload-formats-requirements/):
- .ppt ≤100 MB; .pptx/.potx/.ppsm ≤300 MB; **max 300 slides**; **max 1,400 elements+images per file**.
- "Charts, SmartArt, 3D objects, and WordArt aren't supported and will be ignored."
- Fonts: "We'll try to identify and match the text font… it's not always possible to find an exact match" (substitution with a similar Canva font; same policy for PDF: "Unsupported fonts may be replaced with similar fonts").
- Raster images: colors not editable; vector shapes convert better. Feature still labelled "early version (beta release)", desktop-only.
- Not officially addressed: gradients, grouped shapes, master/layout slides. Community reporting (Canva↔PPTX direction) says simple linear gradients and simple groups survive, multi-stop/radial gradients and shadows drift: https://www.designexporter.com/blog/canva-to-powerpoint-formatting (inferred, not official).

**Verdict (inferred from the above):** for *agent-generated layout templates*, PPTX is the only path with a documented format spec, documented limits, and a mature generation ecosystem — python-pptx v1.0 (text boxes, autoshapes, pictures, notes, layouts/masters; no gradient/shadow API in core) https://python-pptx.readthedocs.io/en/latest/ and PptxGenJS (text, shapes, images/SVG, tables, gradients, shadows, slide masters, notes) https://github.com/gitbrent/PptxGenJS . HTML→editable *Presentation* is officially gated to Claude-Design-origin HTML; arbitrary HTML lands as a Code design, which is not what you want for a batch template library. PPTX also carries speaker notes natively (Canva notes export is documented for PDF; import behavior of notes is not documented: https://www.canva.com/help/download-notes/ ). Design in PPTX with native text boxes, native autoshapes, flat fills or simple linear gradients, no SmartArt/charts/WordArt, and fonts from Canva's library.

> Project note (2026-09-02): the operator ruled that no PPTX or other vendor design file may live in this repo; PPTX is at most a transitory emergency artifact generated in the scratchpad. See docs/DECISIONS.md #1 and #3.

## 3. Native font library

- **No official public list** of Canva fonts (Free vs Pro). Pro fonts show a crown icon in the picker; only Pro can upload fonts (.otf/.ttf/.woff). Apps SDK: `requestFontSelection`/`findFonts` return `{ref, name, weights[{weight, styles[]}], previewUrl}` with weight enum `thin|extralight|light|normal|medium|semibold|bold|ultrabold|heavy`; but "Apps can't access Canva Pro fonts", `findFonts` returns only a locale-based recommended subset, and refs are short-lived — so it is not a full-catalogue source. https://canva.dev/docs/apps/api/asset-request-font-selection , https://www.canva.dev/docs/apps/fonts/
- Best community lists (unofficial, but consistent across sources): https://fallontravels.com/blog/canva-sans-serif-fonts , https://dailycreativeco.com/best-10-canva-fonts/ , https://madegooddesigns.com/best-canva-fonts/
- Commonly available **Free** fonts (weights where a source stated them; otherwise Google-Fonts weights are a reasonable inference since Canva ships the open-source families):
  Montserrat (Light/Regular/SemiBold/Bold noted; Classic variant also), Open Sans, Poppins (Light…Bold noted), Lato, Roboto, Raleway (Thin/Regular noted), Nunito, Quicksand (Light noted), Josefin Sans (Thin/Bold noted), Work Sans (Light…Black noted), Inter, Source Sans Pro, Fira Sans, Barlow, Oswald, Bebas Neue (single), Anton (single), League Spartan, Muli (Extra Light/Regular/Bold/Black), Prompt (Thin/Light/Medium/Bold/Black), Now (Thin/Regular/Bold), Playfair Display, Lora, Merriweather, Libre Baskerville, DM Serif Display, Cormorant Garamond, EB Garamond, Glacial Indifference, Canva Sans (proprietary), plus system standbys Arial, Georgia, Times New Roman, Calibri.
  **Pro-only examples:** Greycliff (Light/Regular/DemiBold), Object Sans, Visby, Acherus Grotesque, Evolve Sans.
- Substitution on import: official statements above (nearest-match, user must fix manually). Practical recommendation (inferred): declare font names exactly as Canva spells them and stick to the Free list so Free collaborators do not get watermarks/substitutions.

## 4. Pro vs Teams: Brand Templates

- **Canva pricing page (official):** "Brand Templates" row is **blank for Free and Pro, checked for Business/Teams and Enterprise**; Brand Kits 1/5/100/1000 for Free/Pro/Business/Enterprise. https://www.canva.com/pricing/
- Help Center: only **Brand Designers and Admins** (team roles) can publish; Brand Templates are "designed for internal team use". https://www.canva.com/help/publish-team-template/
- **Connect API wording conflicts:** brand-templates docs say the user must be "on a Canva plan with access to brand templates (such as Canva Pro, Canva Teams, or Canva Enterprise)" and hold Team admin / Brand designer / Org admin / Org designer roles. Publish-brand-template API is **preview** (2026-06-04), scope `brandtemplate:content:write`, 20 req/min. https://www.canva.dev/docs/connect/api-reference/brand-templates/publish-brand-template.md . The MCP tools page lists `search-brand-templates`, `create-design-from-brand-template` as "Pro and above" and `get-brand-template-dataset` as "Enterprise only"; the MCP overview says brand kits/brand templates/autofill are Enterprise. https://www.canva.dev/docs/mcp/tools.md . Net: a solo Pro account has no role that can publish, so in practice **Brand Template creation requires Teams/Business or Enterprise** (the MCP server you have connected exposes `create-brand-template-draft`/`publish-brand-template`, but expect them to fail without a team-admin/brand-designer role).
- **Pro-tier reusable-template mechanisms (official):**
  - **Template link**: Share → Template link → "Create template link"; recipients get an editable copy in their own account; Pro/Teams/Enterprise/Edu/Nonprofit can create. https://www.canva.com/help/share-template-link/
  - "Make a copy" / "Use as template" from Projects, and folders for organizing. Also the Connect/MCP `copy-design` and `merge-designs` (MCP, undocumented publicly) can serve as programmatic "instantiate from master".

## 5. Presentation dimensions and page limits

- Default Canva presentation: **1920 × 1080 px (16:9)**; 4:3 = 1024 × 768. https://www.canva.com/sizes/presentation/
- **"Designs can have up to 350 pages."** (official) https://www.canva.com/help/manage-pages/ ; import caps: PPTX 300 slides, PDF 500 pages, both 1,400 elements. Resize bounds 40×40 to 8000×3125 px. https://www.canva.com/help/resize/
- Export/share-to-cloud cap: 100 pages per PDF/PPTX download to Dropbox/Drive/Microsoft. https://www.canva.com/help/sharing-social-media-limitations/

## Bottom line for a batch, editable, agent-authored pipeline

1. Generate **PPTX** (PptxGenJS if you need gradients/shadows/masters; python-pptx for plain text+shapes), 1920×1080-equivalent 13.333×7.5 in, native text boxes and autoshapes, Canva-library font names, no SmartArt/charts/WordArt, ≤300 slides & ≤1,400 elements per file.
2. Push via `import-design-from-url` (public HTTPS) or the Connect URL-import job; 20 req/min.
3. HTML→Presentation is only officially guaranteed for Claude-Design-exported decks; the `data-*` slide attributes are undocumented, and generic HTML becomes a non-editable Code design.
4. Reuse on Pro = Template links / copy-design; true Brand Templates need Teams/Enterprise roles.
