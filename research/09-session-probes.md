# 09 · Facts verified directly in the planning session (2026-09-01 to 2026-09-02)

- Source: read-only tool calls made by the orchestrator during planning (Canva MCP, DesignSync, Claude in Chrome listing, PowerShell, Canva Help tool)
- Trust level: highest in this folder; these are observations, not research. Re-verify anything older than a few weeks before relying on it.

## Canva account state (Canva MCP, read-only)

| Item | Value |
|---|---|
| Presentation page size | 1920 x 1080 px, confirmed via `read-design` page_metadata on design `DAHT4uBPl_o` (3 pages, all 1920x1080, `design_type: presentation`) |
| Brand kits | `kAFjGF70Qy4` (unnamed), **`kAHHTmdCWzo` "alderman.ai"**, `kAHQhBkX9oo` "CB Dejvice", `kAHT2fOXLrI` "apify non commercial demo" |
| Folders matching "template" | **`FAFsWyFFv3w` "Presentation templates"** (created 2023-08, updated 2025-06, currently **empty**); `FAFj18FqHtA` "LinkedIn Templates" |
| Presentation brand templates | one: **`EAGpdGyNc_Q` "Red Border"** (created 2023-08, updated 2025-06). Its existence shows `search-brand-templates` works on this account; whether `publish-brand-template` works is untested |
| Owner / team | `user_id oUY6w-hxkfq-xcz37QJWh8`, `team_id oBY6wjpR4xcGJHwHvy0mNI` (the account is inside a team) |
| Recent owned presentations (sample) | `DAHT4uBPl_o` "1" (3 pages, 2026-09-01), `DAHT2wuxRAI` "Subtitle", `DAHJuWqoNIQ` "for petr bucha" (38 pages), `DAHHfpfTtOY` "Describing actors" (16), `DAHHCzhi3Kg` "Hero section" (18), `DAFsRXDWMUU` "Scan exercise 2.0" (25), `DAG3XAB9hXQ` "LI x AI HotSpot 2025" (12), `DAGjTatAgqU` "Profinit kickoff_April 2025" (40) |

## Canva MCP tool surface actually exposed to this session

Loaded and schema-read: `help`, `get-export-formats`, `import-design-from-url`, `generate-design-structured`, `create-brand-template-draft`, `get-assets`, `list-brand-kits`, `edit-design`, `read-design`, `get-design-dataset`, `upload-asset-from-url`, `search-designs`, `search-folders`, `merge-designs`, `generate-design`, `search-brand-templates`, `list-folder-items`. Also listed (not loaded): `comment-on-design`, `copy-design`, `create-design-from-brand-template`, `create-design-from-candidate`, `create-folder`, `export-design`, `get-brand-template-dataset`, `get-design-candidates`, `list-comments`, `list-replies`, `move-item-to-folder`, `publish-brand-template`, `reply-to-comment`, `request-outline-review`, `resize-design`, `resolve-shortlink`. **Not present**: `autofill-design`.

Key schema facts read directly:
- `edit-design` operations (27): `update_title, replace_text, update_fill, insert_fill, delete_element, find_and_replace_text, position_element, resize_element, format_text, add_text, insert_shape, replace_shape, add_page, update_opacity, layer_element, recolor_element, rotate_element, group_elements, ungroup_elements, flip_media, crop_media, reorder_page, replace_speaker_notes, update_text_anchoring, update_stroke_properties, update_line_properties, update_autofill_field`. `format_text` fields: color, decoration, font_size 1–800, font_style normal|italic, font_weight normal|bold, line_height 0.5–2.5, link, list_level, list_marker, strikethrough, text_align. **No font family field anywhere.** `add_page` width/height 40–8000. `replace_speaker_notes` ≤5000 chars. `insert_shape` path commands M/L/H/V/C/S/A/Z only. `add_text` with `width` uses block reflow (word wrap), without it natural reflow. All ops in one call target one `page_index`; `finalize: commit|cancel` must be called with empty operations. `is_responsive`, `is_editable`, `is_empty` flags echo `read-design` page facts.
- `read-design` fields: `design_metadata, page_metadata, design_content, thumbnails, presenter_notes`; `open_transaction: true` returns element JSON with `locator_id` (`PBxxx-LByyy`); `page_metadata` returns first 50 pages unless `filter.page_indices`.
- `merge-designs`: `create_new_design` (insert_pages only) or `modify_existing_design` (insert/move/delete), 1–500 operations; delete requires the exact user phrase "I approve the deletion".
- `import-design-from-url`: description documents `data-document-role="page"`, `data-label`, `data-speaker-notes`; blocks `canva.com/design/` URLs; `intended_design_type` enum includes `presentation`; security rule: never push private files to public hosts without explicit informed consent.
- `search-designs` and `search-brand-templates` currently filter only `design_types: ["presentation"]`.

## Canva Help tool answers (official help service, 2026-09-01)

- HTML import: pages defined by `data-document-role="page"`; aim for 16:9 e.g. 1920x1080; absolute positioning often preserved, complex flex/grid may be flattened; simple border-radius and linear gradients usually editable; simple SVG shapes may stay editable, complex SVG rasterized; fonts mapped to nearest native, custom fonts only if in Brand Kit.
- Pro plan: the help service claimed Pro can create and publish Brand Templates from the editor or Brand tab, organize them in folders; page and import size limits "unknown". (Conflicts with the pricing page; treat as unverified.)
- Fonts: no published list; substitution by style and weight on import; Pro can upload fonts.

## Claude Design (DesignSync, read-only)

- Writable design-system projects: exactly one, **"alderman.ai Design System"**, `projectId d1228f56-c841-450e-8665-c2d177fb9414`, owner "Alex", updated 2026-08-14.
- File list (abridged): `README.md`, `styles.css`, `_ds_bundle.css`, `_ds_bundle.js`, `_ds_manifest.json`, `_ds_sync.json`, `_ds_needs_recompile`, `_adherence.oxlintrc.json`, `_vendor/react.js`, `_vendor/react-dom.js`; `components/chrome/{FloatingNav,Footer,SideNav,StackedLogo,UrlWordmark}`, `components/layout/PageFrame`, `components/paper/PaperApp`, `components/sections/{HeroSection,TrialCTASection,WhatYouGetSection}`, `components/special/{FaqChat,Postit,SectionTile,TerminalLine}`, each with `<Name>.html`, `<Name>.jsx`, `<Name>.prompt.md`, `<Name>.d.ts`; `_preview/<Name>.js` for each; `fonts/fonts.css` plus `barlow-{300,400,500,600,700}-latin{,-ext}.woff2` and `jetbrains-mono-{400,500}-latin{,-ext}.woff2`; `screenshots/*.png`; `templates/linkedin-social/{LinkedinSocial.dc.html, ds-base.js, support.js, .thumbnail, reference/{README.md, screenshot-post.html, terminal-post.html, tip-card.html, shipped/*.png}}`.
- Implication: brand fonts are Barlow (300–700) and JetBrains Mono (400/500); components follow a four-file convention in five groups; a `templates/` area already hosts a canvas template with reference HTML.

## Claude in Chrome

- `list_connected_browsers`: one browser, `deviceId b72545d0-f876-4373-b8d7-8489472c2d55`, name "Browser 1", Windows, local. Before any browser action the user must pick the browser (AskUserQuestion flow per the tool's rule).

## Local machine

| Tool | Version / state |
|---|---|
| node | v24.15.0 (`C:\Program Files\nodejs\node.exe`) |
| npm / npx | 11.12.1 |
| python | 3.14.4 (`C:\Python314\python.exe`); `py` launcher 3.14.7 |
| git | 2.54.0.windows.1 |
| gh | 2.91.0, logged in as **alderman-ai**, scopes gist, read:org, repo, protocol https |
| git identity | Alex Alderman <alex@alderman.agency> |
| pwsh (PowerShell 7) | missing; Windows PowerShell 5.1 is the shell |
| code (VS Code CLI) | missing |
| Vercel CLI | not installed |

## Repo bootstrap done in this session

- `git init -b main` in `C:\Users\alder\Desktop\Canva templates`; `.gitignore` blocks vendor design files, `presentations/*`, `bundles/**/canva/`, `node_modules/`.
- Directory tree created: `docs research spec layouts presentations bundles bases build manifest assets scripts/lib components intake .claude/skills`.
- `docs/PLAN.md` is the verbatim approved plan with a status header.
