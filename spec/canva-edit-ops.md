# Canva `edit-design` operations — full parameter reference

- Source: the live Canva MCP connector schema for `edit-design`, read in-session on 2026-09-01 (confidence: schema-read). Complements `spec/canva-limits.md` §1, which lists limits; this file lists parameters.
- Call shape: `edit-design { transaction_id, page_index (1-based, required when operations non-empty), operations[], finalize: keep_open|commit|cancel, is_editable, is_responsive, is_empty, user_intent }`. All operations in one call target the same page. `commit`/`cancel` must be sent with `operations` omitted or `[]`.
- Transaction comes from `read-design { design_id, open_transaction: true }`; every addressable node in that response has a `locator_id` like `PBxxx-LByyy`. Never construct locator ids.
- Responsive pages (`type: "responsive"` in `read-design`) accept only: `update_title, replace_text, update_fill, delete_element, find_and_replace_text` (and `replace_text` at page level only when `is_empty: true`).

| # | type | Required fields | Optional fields | Notes |
|---|---|---|---|---|
| 1 | `update_title` | `title` | | Design title |
| 2 | `replace_text` | `locator_id`, `text` | | Whole element text. Community: resets line-height to 1.4 and list markers; re-apply `format_text` |
| 3 | `update_fill` | `locator_id`, `asset_type` image\|video, `asset_id`, `alt_text` | | Swap the media in an existing fill |
| 4 | `insert_fill` | `page_id`, `asset_type`, `asset_id`, `alt_text` | `top`, `left`, `width` (>0), `height` (>0), `rotation` -180..180, `opacity` 0..1 | New image/video element; asset from `upload-asset-from-url` |
| 5 | `delete_element` | `locator_id` | | |
| 6 | `find_and_replace_text` | `locator_id`, `find_text`, `replace_text` | | Substring replace inside one element; preferred for filling placeholders since it preserves formatting |
| 7 | `position_element` | `locator_id`, `top`, `left` | | px relative to page |
| 8 | `resize_element` | `locator_id` | `width`, `height`, `preserve_aspect_ratio` (default false) | TEXT: give `width` only (height auto). IMAGE/VIDEO: with `preserve_aspect_ratio: true` give exactly one of width/height; with false give both |
| 9 | `format_text` | `locator_id`, `formatting{}` | formatting keys: `color` #RRGGBB, `decoration` none\|underline, `font_size` int 1..800, `font_style` normal\|italic, `font_weight` normal\|bold, `line_height` 0.5..2.5, `link` url or "", `list_level` int ≥0 (0 removes list), `list_marker` none\|disc\|circle\|square\|decimal\|lower-alpha\|lower-roman, `strikethrough` none\|strikethrough, `text_align` start\|center\|end | Applies to the whole text box. **No font family field.** |
| 10 | `add_text` | `page_id`, `text` | `top` (default 0), `left` (default 0), `width` (>0 → BLOCK reflow with word wrap; omitted → NATURAL reflow), `rotation`, `opacity` | Community: lands as black 16px default font; follow with `format_text` |
| 11 | `insert_shape` | `page_id`, `top`, `left`, `width` (>0), `height` (>0), `path` (SVG d), `view_box_width` (>0), `view_box_height` (>0) | `color` #RRGGBB, `stroke_color`, `stroke_weight` 0..1000, `corner_rounding` 0..1000, `rotation`, `opacity` | Path commands allowed: M L H V C S A Z only (no Q/T). Rectangle: `M0 0H{w}V{h}H0Z` with view box = w,h |
| 12 | `replace_shape` | `locator_id`, `path`, `view_box_width`, `view_box_height` | | Replace geometry of an existing shape |
| 13 | `add_page` | | `title`, `width` int 40..8000, `height` int 40..8000, `background_color` #RRGGBB | New page appended |
| 14 | `update_opacity` | `locator_id`, `opacity` 0..1 | | |
| 15 | `layer_element` | `locator_id`, `position` front\|back | | Z-order to extremes only |
| 16 | `recolor_element` | `locator_id`, `color` #RRGGBB | | |
| 17 | `rotate_element` | `locator_id`, `rotation` -180..180 | | |
| 18 | `group_elements` | `locator_ids[]` (≥2) | `rotation` | |
| 19 | `ungroup_elements` | `locator_id` | | |
| 20 | `flip_media` | `locator_id`, `axis` horizontal\|vertical, `flipped` bool | | |
| 21 | `crop_media` | `locator_id` | `top`, `left`, `width` (>0), `height` (>0), `rotation` | Image box inside the frame |
| 22 | `reorder_page` | `page_id`, `anchor_page_id`, `position` before\|after | | |
| 23 | `replace_speaker_notes` | `page_id`, `notes` (0..5000 chars) | | Writable notes; corrects research/08's "read-only" cell |
| 24 | `update_text_anchoring` | `locator_id`, `anchoring` start\|center\|end | | Which side of the text box stays fixed as lines are added |
| 25 | `update_stroke_properties` | `locator_id` | `color` #RRGGBB, `weight` 0..100 (separators 1..100) | |
| 26 | `update_line_properties` | `locator_id` | `weight` (>0), `geometry` straight\|elbowed\|curved, `start{}`, `end{}` each with `top`/`left` **or** `connection{locator_id, point top\|left\|bottom\|right\|center}`, plus `marker` bar\|arrow\|triangle\|open_circle\|circle\|open_square\|square\|open_diamond\|diamond\|none | Connectors between elements |
| 27 | `update_autofill_field` | `locator_id` | `autofill_field_label` (omit to remove) | Fixed-page designs only; tags text/image elements for brand-template autofill |

## Practical sequences

- **Fill a master page (Route C)**: for each bound element `find_and_replace_text{locator, placeholder, real text}`; if a whole-text swap is unavoidable, `replace_text` then `format_text{line_height, text_align, list_*}` restoring the layout's values; `delete_element` for unused slots; `replace_speaker_notes{page_id, notes}`; one call per page; commit once.
- **Add an element natively (Route B)**: `insert_shape` for the container, `add_text{width}` for each text run, then `format_text` per run (size, bold, line-height, align, color), then `group_elements` if it should move as one; capture returned locators into the slide MD.
- **Verify**: re-read with `read-design { transaction_id, filter.fields: ["thumbnails","design_content"], page_indices }` before `finalize: commit`.

## Related tool shapes read in-session (for completeness)

- `read-design { design_id | share url, filter{ fields[] of design_metadata|page_metadata|design_content|thumbnails|presenter_notes, page_indices[], thumbnail_pages[], element_ids[] }, open_transaction, transaction_id }`.
- `merge-designs { type: create_new_design|modify_existing_design, design_id (modify only), title, operations[1..500] of insert_pages{source{type:design, design_id, page_numbers[]}, after_page_number} | move_pages{from_page_numbers[], to_after_page_number} | delete_pages{page_numbers[]} }`. Deletions require the operator's exact phrase "I approve the deletion".
- `import-design-from-url { url (https, not canva.com/design), name, intended_design_type }`.
- `upload-asset-from-url { url, name }`; `get-assets { asset_ids[] }`.
- `search-folders { query, limit ≤100, ownership }`, `list-folder-items { folder_id | "root", item_types[], sort_by }`.
- `search-designs { query, design_types:["presentation"], ownership, sort_by, limit }`, `search-brand-templates { query, dataset any|non_empty, design_types, limit }`.
- `create-brand-template-draft { brand_template_id }` (returns an editable draft design; publish with `publish-brand-template`).
- `get-export-formats { design_id }` before `export-design`.
