# `spec/schema.md` — the authoritative key sets

What each hybrid-MD file type carries: every frontmatter key with its type, whether it is required, where its values come from, and its default; the element-table columns; and the body sections a file must contain. The machine-checkable form of this document is `spec/schema/*.json` (JSON Schema draft 2020-12, `additionalProperties: false`). Where the two disagree, the JSON Schema wins and this file is the bug.

Read this with `spec/ontology.md` (what the entities mean and how they relate) and `spec/vocab/README.md` (what the controlled values are).

## Rules that apply to every file

1. **Flat frontmatter only** — scalars and flat lists, never maps (Decision 2). Structured per-element data goes in a body table.
2. **Every file of a schema carries the full key set.** No key is omitted because it is empty: use `-` for an empty text, `[]` for an empty list, `0` for an unset count, `false` for an unset flag. This is what makes Obsidian Bases columns and PowerShell `Where-Object` filters total rather than partial.
3. **Vocabulary only** (Decision 3 in CLAUDE.md, rule 3). Any value in a "vocab" column below must appear in the named `spec/vocab/*.json` file. Unknown terms are validation **errors**; propose a term by editing the vocab file first. `node spec/vocab/check-vocab.mjs` is the gate: it checks the vocabularies against each other, against every id this document and the other spec prose cite, and against every `enum` in `spec/schema/*.json`.
4. **Obsidian property types are assigned per property name vault-wide** and there are only six — Text, List, Number, Checkbox, Date, Date & time (`research/06 §e`). So a property name means the same type everywhere in the vault: `density` is a Number in a layout and in a brief; `pairing` is Text in both. The "Obsidian type" column below is that vault-wide assignment.
5. **Ids are quoted strings.** Canva design, page, asset and locator ids, and any id that looks numeric, are written quoted so `ConvertFrom-Yaml` cannot coerce them to `Int64` (`research/06 §e`).
6. **Dates are `YYYY-MM-DD`** (Obsidian Date property).

### Naming convention

**Archetype ids are `kebab-case`; every other vocabulary value is `snake_case`, except `delivery_mode` and `brand`, which are also `kebab-case`.** Frontmatter *keys* are always `snake_case`.

- Archetype ids are kebab-case because they double as file-name stems: a layout file is `layouts/L###-<archetype>.md` and a slide file `presentations/<slug>/slides/S##-<archetype>.md`, so the id has to read as a filename. `spec/taxonomy.md` is the authority for the set of 104; `spec/vocab/archetype.json` mirrors it.
- `delivery_mode` keeps its kebab values (`live-talk`, `read-deck`) because the same two names are the type-scale modes in `spec/type-scale.md` §2 and the `--live-*` custom properties in `templates/_base.css`. Normalising the vocabulary alone would split one name across three files, so it is deliberately left as written.
- `brand` keeps `alderman-ai`: a brand id names an asset directory and an upstream repository, and is also a `pairing` id in `spec/pairings.md`.
- Every other vocabulary — `purpose`, `flow_template`, `unit_type`, `element_role`, `slide_function`, `status`, `evidence_kind`, `audience`, `density`, `polish`, `family`, `flow_role`, `content_shape`, `shape`, `variant`, `route` — is snake_case. `check-vocab.mjs` fails on a value written in the wrong case for its file.
- Ids that are not vocabulary follow their own shapes and are unaffected: layout `L###`, slide `S##`, unit `u###`, intake `<yyyymmdd>-<slug>`, and the flow slot names in `spec/flows.md`, which are kebab-case.

---

## Layout — `layouts/L###-<archetype>.md`

Schema: `spec/schema/layout.schema.json`. A layout is a **class**: geometry, typography and capacity, never real content.

| Key | Obsidian type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `id` | Text | yes | `^L\d{3}$` | — | Library id; the filename prefix. |
| `title` | Text | yes | free text, 1–60 chars | — | Human name of the layout, e.g. `KPI Grid 2x3`. Not an id — the machine-readable class is `archetype`. Read by `build-html` as the page label (it becomes the Canva page title) and shown as the Layout column of `bases/layouts.base`. |
| `family` | Text | yes | vocab `family.json` | — | Top-level grouping and the Canva family master this layout lives in. |
| `archetype` | Text | yes | vocab `archetype.json` | — | The layout class. Its `broader` in `archetype.json` must equal `family`. |
| `variant` | Text | yes | vocab `variant.json` | `standard` | Cut of the archetype: standard, dense, sparse. |
| `flow_role` | Text | yes | vocab `flow_role.json` | `body` | Narrative position: opener, bridge, body, evidence, closer. |
| `content_shape` | List | yes | vocab `content_shape.json` | `[]` | Modalities the layout can host. A unit binds only if its `shape` is in this list. |
| `density` | Number | yes | 1–5 → `density.json` in order | — | Density level the layout is drawn for (`research/03 §c`). |
| `info_units` | Number | yes | 1–12 | — | Distinct information units carried. At most 6 elements per slide (`research/03 §c`, PLOS rule 7). |
| `min_items` | Number | yes | 0–60 | `0` | Minimum count of the repeated role, from the archetype item range. |
| `max_items` | Number | yes | 0–60, ≥ `min_items` | `0` | Maximum count of the repeated role. |
| `text_capacity_chars` | Number | yes | ≥ 0 | — | **Derived**: sum of `maxChars` over every element whose role has `broader: text_role`. Computed by `validate`; a mismatch is an error. |
| `polish_cost` | Number | yes | 1–5 → `polish.json` in order | — | Design effort needed (`research/03 §d`). Capped by the deck `polish` dial: quick ≤ 2, standard ≤ 3, premium any. |
| `slots_image` | Number | yes | 0–30 | `0` | Count of `picture` and `media` elements. |
| `slots_chart` | Number | yes | 0–10 | `0` | Count of `chart` elements. |
| `slots_table` | Number | yes | 0–10 | `0` | Count of `table` elements. |
| `fonts` | List | yes | families in `spec/fonts.json` | `[]` | Families used, spelled as the registry spells them. |
| `fonts_native` | Checkbox | yes | true/false | `false` | True when every family has `canva_native: yes`. Decision 5: non-native warns, never fails. |
| `pairing` | Text | yes | a name in `spec/pairings.md` | — | Named title/body pairing, kebab-case. |
| `brand` | Text | yes | vocab `brand.json` | `neutral` | `neutral` for anything pushed to the public repo (Decision 4). |
| `follows_well` | List | yes | layout ids or archetype values | `[]` | Continuity hints consumed by `match.mjs`. |
| `precedes_well` | List | yes | layout ids or archetype values | `[]` | Continuity hints consumed by `match.mjs`. |
| `tags` | List | yes | free text | `[]` | Retrieval keywords only; never read by the planner. |
| `status` | Text | yes | vocab `status.json` under `layout_status`: `draft, built, imported, verified` | `draft` | Layout lifecycle. |
| `origin` | Text | yes | repo-relative path or `-` | `-` | Intake contract or harvested source this layout came from. |
| `accepts_schema` | Text | yes | path, normally `spec/schema/layouts/<id>.json` | — | The per-layout accepts file (see `accepts.template.json`). |
| `canva_ops` | Text | yes | path or `-` | `-` | Generated `build/canva-ops/<id>.json`. |
| `family_deck` | Text | yes | quoted Canva design id or `-` | `-` | The family master design holding this layout as a page. |
| `family_page` | Text | yes | quoted Canva page id or `-` | `-` | The page inside `family_deck`. |
| `canva_locators` | List | yes | quoted `PBxxx-LByyy` ids | `[]` | Element locators in element-table order, written by `index.mjs`. |

**Body sections, in this order and all required:**

| Heading | Contents |
|---|---|
| `## Elements` | The element table (columns below). One row per element. |
| `## Accepts` | Prose restatement of `accepts_schema` for a human reader, plus the LLM-facing one-liner verbatim. |
| `## Fill rules` | How copy is chosen and trimmed: what goes in each role, what to do on overflow, what to delete when an optional role is unbound. |
| `## Flow` | Why `follows_well` / `precedes_well` are what they are, and which flow templates place this layout. |
| `## Speaker notes` | The speaker-notes template for slides built on this layout. Placeholder text only. |

---

## Slide — `presentations/<slug>/slides/S##-<archetype>.md`

Schema: `spec/schema/slide.schema.json`. A slide is an **instance**: the same element table with real copy, bound units, and Canva ids. A **fork** (Skill 3) is the same file type with `parent` set, written as `S##-<archetype>.v<n>.md`.

| Key | Obsidian type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `slide_no` | Number | yes | 1–350 | — | Position in the deck. Canva caps a design at 350 pages. |
| `deck` | Text | yes | slug | — | The `presentations/<slug>` directory name. |
| `layout` | Text | yes | `^L\d{3}$` | — | Layout instantiated. |
| `units` | List | yes | `^u\d{3}$` | `[]` | Content unit ids bound here, in binding order. |
| `fill_status` | Text | yes | vocab `status.json` under `slide_status`: `auto, edited, approved` | `auto` | How the copy got here. |
| `overflow` | Checkbox | yes | true/false | `false` | True when any element exceeds its `maxChars`. Must be false before upload. |
| `redline_status` | Text | yes | vocab `status.json` under `redline_status`: `none, open, applied, resolved` | `none` | State of synced Canva comment threads. |
| `canva_page_id` | Text | yes | quoted id or `-` | `-` | Canva page for this slide. |
| `locators` | List | yes | quoted `PBxxx-LByyy` | `[]` | Element locators in element-table order. |
| `canva_ops` | Text | yes | path or `-` | `-` | Generated ops file for this slide. |
| `brand` | Text | yes | vocab `brand.json` | inherited from the brief | May differ from the layout when a neutral layout is filled in brand. |
| `pairing` | Text | yes | a name in `spec/pairings.md` | inherited from the brief | Pairing in force on this slide. |
| `fonts_native` | Checkbox | yes | true/false | inherited | True when every family on this slide is Canva-native. |
| `parent` | Text | yes | slide filename or `-` | `-` | Fork lineage. |
| `version` | Number | yes | ≥ 1 | `1` | Fork version. |
| `change_request` | Text | yes | free text or `-` | `-` | The operator request, stored **verbatim** on a fork. |
| `changed_keys` | List | yes | `key` or `<n>.<column>` | `[]` | Exactly what the fork changed. Must explain the before/after pixel diff. |

**Body sections, in this order and all required:** `## Elements` (the element table with `text` filled) · `## Notes` (speaker notes as uploaded via `replace_speaker_notes`) · `## Redlines` (synced comment threads, one bullet per thread: thread id, author, request, state).

---

## Element table — layouts, slides and intake contracts

The same table in all three, keyed by `(role, index)` exactly as OOXML and Google Slides key a placeholder (`research/06 §a`). Row order is z-order and is the order `locators[]` is written back in.

```
| n | role | x | y | w | h | font | weight | size | lh | align | maxChars | binds | text |
```

| Column | Type | Rule |
|---|---|---|
| `n` | integer | 1…N, contiguous, no gaps. Table order = z-order = locator order. |
| `role` | vocab | A leaf value of `element_role.json` (not one of the five `*_role` group concepts). `(role, n)` is the primary key. |
| `x` | px integer | 0 ≤ `x`, `x + w` ≤ 1920. |
| `y` | px integer | 0 ≤ `y`, `y + h` ≤ 1080. |
| `w` | px integer | > 0. |
| `h` | px integer | > 0. |
| `font` | text | A family in `spec/fonts.json`, or `-` for `visual_role` / `decor_role` / `chrome_role` rows. |
| `weight` | integer | 100–900 in steps of 100. `-` when `font` is `-`. |
| `size` | px integer | 1 pt = 2 px at 1920×1080. At most 4 distinct sizes on a slide, 6 across a deck. `-` for non-text rows. |
| `lh` | decimal | Line-height multiplier, e.g. `1.1`. `-` for non-text rows. |
| `align` | enum | `start` \| `center` \| `end`. Logical, not left/right. |
| `maxChars` | integer or `-` | Integer for every `text_role`; `-` for every other role. This is the wrap-and-fit budget, computed against **Inter** metrics whatever the family (`docs/PLAN.md §Specs carried over`). |
| `binds` | binding or `-` | Which unit field fills the element. `-` for decor, chrome and any element the layout fills itself. |
| `text` | text | A layout carries **placeholder** copy; a slide carries the real copy. For `visual_role` and `decor_role` rows it carries a **spec string** instead (see below). |

**`binds` grammar** — three forms:

| Form | Meaning |
|---|---|
| `unit.<field>` | A field of the slide's primary unit (`units[0]`): `unit.title`, `unit.value`, `unit.attribution`, `unit.caption`, `unit.source`. |
| `unit.items[<i>]` | The i-th repeated child of the primary unit, **1-based**: `unit.items[2]` is the second bullet, tile or step. |
| `<uid>.<field>` | A named unit on a multi-unit slide: `u014.value`. The uid must appear in `units[]`. |

**Spec strings** in the `text` cell for non-text rows, so the element still round-trips through `build-html` and `ingest-html`:

| Role | Spec string form | Example |
|---|---|---|
| `picture`, `media` | `<kind> <aspect>, <asset id or placeholder>` | `photo 16:9, ph-16x9` |
| `chart` | `<chart form>, <n> series, <axis note>` | `bar, 3 series, y=revenue` |
| `table` | `table <cols>x<rows>, header row` | `table 5x4, header row` |
| `diagram` | `<archetype-local form>, <n> nodes` | `chevrons, 5 nodes` |
| `icon` | `icon <name>` | `icon trend-up` |
| `shape` | `rect r=<radius> fill=<token>` | `rect r=16 fill=token.surface` |
| `divider` | `rule <weight>px <token>` | `rule 1px token.hairline` |

---

## Content units — `presentations/<slug>/units.md`

Schema: `spec/schema/unit.schema.json`. **File** frontmatter:

| Key | Obsidian type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `deck` | Text | yes | slug | — | Deck this unit set belongs to. |
| `extracted_from` | List | yes | repo-relative paths | `[]` | Context files decomposed. |
| `unit_count` | Number | yes | ≥ 0 | — | Must equal the number of `## u###` sections in the body. |

**Body:** one `## u###` section per unit, in extraction order, each opening with a flat key/value list and then the unit's text or items. Per-unit keys (validated against `$defs/unit`):

| Key | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `uid` | text | yes | `^u\d{3}$` | — | Unique within the deck; equals the heading. |
| `slide_function` | vocab | yes | `slide_function.json` | `content` | Layer 1 (`research/06 §b`). |
| `unit_type` | vocab | yes | `unit_type.json` | — | Layer 2 (`research/06 §b`). |
| `shape` | vocab | yes | `shape.json` | — | Layer 3 (`research/06 §b`). Must appear in the chosen layout's `content_shape[]`. |
| `items` | number | yes | 0–60 | `0` | Repeated children (bullets, steps, tiles, rows). |
| `chars` | number | yes | ≥ 0 | — | Total characters; compared against the layout's `text_capacity_chars`. |
| `has_number` | checkbox | yes | true/false | `false` | Carries a quantity that could fill a `number` role. |
| `evidence_kind` | vocab | yes | `evidence_kind.json` or `none` | `none` | Kind of proof offered. |
| `importance` | number | yes | 1–5 | `3` | What gets dropped first when the budget binds. |
| `must_include` | checkbox | yes | true/false | `false` | Leaving it unplaced fails Skill 1 acceptance. |
| `source` | text | yes | `context/<file>#<anchor>` | — | Provenance anchor. |
| `section` | text | yes | free text | — | Source section; section dividers are inserted at these boundaries (`research/06 §d`). |

---

## Deck — `brief.md` and `plan.md`

Schema: `spec/schema/deck.schema.json` (`oneOf` brief, plan).

### `presentations/<slug>/brief.md`

| Key | Obsidian type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `deck` | Text | yes | slug | — | Directory name. |
| `title` | Text | yes | free text | — | Becomes the Canva design name. |
| `audience` | Text | yes | vocab `audience.json` | — | Who is in the room. |
| `purpose` | Text | yes | vocab `purpose.json` | — | Selects the default `flow_template` (see `examples` in `purpose.json`). |
| `delivery_mode` | Text | yes | vocab `delivery_mode.json` | — | Sets the default `density` (`research/03 §c` script rule). |
| `flow_template` | Text | yes | vocab `flow_template.json` or `auto` | `auto` | Explicit override of the purpose default. |
| `length_minutes` | Number | yes | 0–480 | `0` | Speaking time; `0` for a read-deck. |
| `target_slides` | Number | yes | 0–350 | `0` | Explicit count, or `0` to derive from `length_minutes` and the pace norms. |
| `density` | Number | yes | 0 = auto, else 1–5 | `0` | Resolved against `delivery_mode` when `0`. |
| `polish` | Text | yes | `quick` \| `standard` \| `premium` | `standard` | Caps layout `polish_cost` at 2 / 3 / any. |
| `verbosity` | Text | yes | `concise` \| `standard` \| `text-heavy` | `standard` | Presenton knob (`research/06 §b`). No vocab file yet; enum is inline in the schema. |
| `content_generation` | Text | yes | `preserve` \| `enhance` \| `condense` | `enhance` | Presenton knob (`research/06 §b`). No vocab file yet. |
| `style_hint` | Text | yes | free text or `-` | `-` | Tone and look steer. Never parsed by the planner. |
| `pairing` | Text | yes | a name in `spec/pairings.md` | — | Font pairing for the deck. |
| `brand` | Text | yes | vocab `brand.json` | `alderman-ai` | Brand the deck is built in. |
| `brand_kit_id` | Text | yes | quoted Canva id or `-` | `-` | `kAHHTmdCWzo` is the alderman.ai kit. |
| `fonts_native_required` | Checkbox | yes | true/false | `false` | When true the planner rejects layouts with `fonts_native: false`. |
| `content_public` | Checkbox | yes | true/false | `false` | Decision 4: `export-bundle` refuses to publish unless this is explicitly true. |

**Body:** `## Brief` (free text) · `## Must include` (bullets, resolved to `must_include` units) · `## Forbidden` (content that must not appear) · `## Per-slide overrides` (optional table `slide | key | value`).

### `presentations/<slug>/plan.md`

| Key | Obsidian type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `deck` | Text | yes | slug | — | Directory name. |
| `flow_template` | Text | yes | vocab `flow_template.json` | — | The flow actually used. |
| `target_slides` | Number | yes | 1–350 | — | Budget the planner worked to. |
| `density` | Number | yes | 1–5 | — | Resolved level. |
| `polish` | Text | yes | `quick` \| `standard` \| `premium` | — | Resolved dial. |
| `layout_sequence` | List | yes | `^L\d{3}$` | — | Ordered layout ids; length must equal the plan table row count. |
| `route` | Text | yes | vocab `route.json` | `c` | Upload route (Decision 3). |
| `unplaced_units` | List | yes | `^u\d{3}$` | `[]` | Units the budget could not fit. Any `must_include` unit here fails acceptance. |
| `overflow_count` | Number | yes | ≥ 0 | `0` | Rows with unresolved overflow. Must be `0` before fill. |

**Body:** `## Slides` — the table `slide | layout | units | fit | note`, one row per planned slide (`slide` = `S##`, `units` = comma-separated uids, `fit` = `ok` / `tight` / `overflow` / `split` / `merged`) — then `## Fit report` (budget arithmetic, merges, splits, drops, and why).

---

## Intake contract — `intake/<yyyymmdd>-<slug>.md`

Schema: `spec/schema/intake.schema.json`. The operator surface for Skill 4: edit cells, answer questions, then set `status: confirmed`.

| Key | Obsidian type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `id` | Text | yes | `^\d{8}-[a-z0-9-]+$` | — | Filename stem. |
| `created` | Date | yes | `YYYY-MM-DD` | — | Date of intake. |
| `source` | Text | yes | path or URL | — | What was read. |
| `source_type` | Text | yes | `image` \| `url` \| `canva` \| `html` | — | Chooses the extraction path. No vocab file yet; enum is inline in the schema. |
| `detected_archetype` | Text | yes | vocab `archetype.json` | — | Best-guess class. |
| `detected_family` | Text | yes | vocab `family.json` | — | Must equal the archetype's `broader`. |
| `confidence` | Number | yes | 0–1 | — | Confidence in `detected_archetype`. Per-row confidence lives in the table. |
| `canvas_w` | Number | yes | px | — | Source canvas width. |
| `canvas_h` | Number | yes | px | — | Source canvas height. |
| `target_w` | Number | yes | `1920` | `1920` | Canva presentation page width (`research/09`). |
| `target_h` | Number | yes | `1080` | `1080` | Canva presentation page height. |
| `fonts_detected` | List | yes | family names | `[]` | Families read off the source. |
| `fonts_native` | Checkbox | yes | true/false | `false` | True when all detected families are Canva-native. |
| `license_note` | Text | yes | free text | `structure only` | What may be reused. |
| `brand` | Text | yes | vocab `brand.json` | `neutral` | Brand the catalogued layout will carry. |
| `status` | Text | yes | vocab `status.json` under `intake_status`: `draft, confirmed, catalogued, uploaded` | `draft` | Conversion runs only at `confirmed`. |
| `open_questions` | List | yes | free text | `[]` | Mirrored as the body `## Questions` list. |
| `layout_id` | Text | yes | `^L\d{3}$` or `-` | `-` | Assigned at catalogue time. |

**Body:** `## Elements` — the element table **plus a trailing `confidence` column** (0–1 per row) — then `## Questions`, one bullet per open question.

---

## Bundle — `bundles/<slug>/bundle.md`

Schema: `spec/schema/bundle.schema.json`. Account state never appears here; it lives in `bundles/<slug>/canva/<account-id>.md`, git-ignored (Decision 11).

| Key | Obsidian type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `bundle_id` | Text | yes | slug | — | Directory name. |
| `title` | Text | yes | free text | — | Human title of the bundled deck. |
| `created` | Date | yes | `YYYY-MM-DD` | — | Export date. |
| `library_version` | Text | yes | commit sha | — | Library commit exported from; mirrored in `bundle-manifest.json`. |
| `layout_ids` | List | yes | `^L\d{3}$` | — | Vendored layouts. The bundle must reference nothing outside this list. |
| `slide_count` | Number | yes | 1–350 | — | Must equal the Canva page count after upload (acceptance). |
| `fonts` | List | yes | family names | `[]` | Families used across the bundled slides. |
| `fonts_native` | Checkbox | yes | true/false | `false` | True when a foreign account needs no font upload. |
| `routes_supported` | List | yes | vocab `route.json` | `[a, c]` | Routes the bundle ships artefacts for. |
| `brand` | Text | yes | vocab `brand.json` | `neutral` | Normally `neutral` for a public bundle. |
| `pairing` | Text | yes | a name in `spec/pairings.md` | — | Pairing carried by the bundled slides. |
| `content_public` | Checkbox | yes | true/false | `false` | Decision 4: export refuses unless true or `-Public` passed. Never inferred. |
| `license` | Text | yes | SPDX id or `all-rights-reserved` | `all-rights-reserved` | What the bundle is published under. |

**Body:** `## What this is` · `## How to upload` (the `/bundle-upload` procedure and the route it will take) · `## What you still do by hand` (fonts, brand polish, redlines).

---

## Font registry — `spec/fonts.json`

Schema: `spec/schema/font.schema.json` (an array, not frontmatter). A **registry, not an allowlist** (Decision 5): `validate` errors on an unregistered family, warns on `canva_native: no` or `unverified`.

| Key | JSON type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `family` | string | yes | — | — | Spelled exactly as Canva's font library spells it. |
| `weights_used` | array of number | yes | 100–900 step 100 | — | Weights the library actually uses. |
| `category` | string | yes | `grotesk, geometric, humanist, serif, slab, mono, display, system` | — | Classification used by pairing rules. Registry-internal, no vocab file. |
| `source` | string | yes | — | — | `google`, `fontshare`, `adobe`, a foundry, or `system`. |
| `license` | string | yes | — | — | e.g. `OFL-1.1`, or a commercial licence reference. |
| `canva_native` | string | yes | `yes` \| `no` \| `unverified` | `unverified` | Whether Canva ships it. |
| `canva_fallback` | string | yes | a `family` in this registry | `Inter` | What Canva substitutes. Wrap widths are computed against Inter metrics regardless. |
| `fallback_weight_map` | array of string | yes | `"<w>:<w>"` | `[]` | Flat remapping, e.g. `"350:400"`. A flat list, not a map (Decision 2). |
| `optical_size_note` | string | yes | free text or `-` | `-` | Separate Display cut, tracking caveats, etc. |

## Asset registry — `manifest/assets.json`

Schema: `spec/schema/asset.schema.json` (an array).

| Key | JSON type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `id` | string | yes | kebab-case | — | Referenced by element spec strings and bundle manifests. |
| `path` | string | yes | under `assets/` | — | Repo-relative path. |
| `kind` | string | yes | `placeholder, photo, icon, logo, screenshot, chart_png, video` | — | Manifest-internal, no vocab file. |
| `w` / `h` | number | yes | px | — | Intrinsic size. |
| `alt` | string | yes | — | — | Alt text; also the caption default. |
| `source` | string | yes | — | `-` | Provenance; `-` for repo-generated placeholders. |
| `license` | string | yes | — | — | Public-repo assets must be redistributable (Decision 4). |
| `canva_asset_id` | string | yes | quoted id or `-` | `-` | Returned by `upload-asset-from-url`. |
| `used_by` | array of string | yes | layout ids and slide paths | `[]` | Reverse index. |

## Per-layout accepts — `spec/schema/layouts/<id>.json`

Meta-schema: `spec/schema/accepts.template.json`, which also carries two worked examples (a KPI grid and a two-column comparison). Shape copied from Presenton, the only public system with formal per-layout constraints (`research/06 §c`):

```json
{ "$id": "L###",
  "description": "LLM-facing one-liner: what this layout is for and when to pick it",
  "requires": { "<role>": { "min": 1, "max": 1 } },
  "optional": { "<role>": { "min": 0, "max": 1 } },
  "accepts_unit_types": ["<unit_type>"],
  "items":  { "min": 4, "max": 6 },
  "chars":  { "<role>": { "min": 8, "max": 40 } } }
```

Role keys are leaf values of `element_role.json`; `accepts_unit_types` values are from `unit_type.json`. `items` mirrors the layout's `min_items` / `max_items`. `chars.<role>.max` must equal that role's `maxChars` in the element table.

---

## Invariants `validate` enforces

1. **`text_capacity_chars` = Σ `maxChars`** over every element whose `role` has `broader: text_role` in `element_role.json`. Roles under `visual_role`, `decor_role`, `chrome_role` and `offstage_role` carry `-` and contribute nothing.
2. **Every schema key is present on every file of that schema** — no omitted keys, empties written as `-`, `[]`, `0` or `false`.
3. **Vocabulary closure**: every value in a vocab-typed key exists in the named vocab file. Every `enum` in `spec/schema/*.json` equals the value list of its vocab file, narrowed by the subset rule its `description` declares and extended by any extra literal that `description` names in double quotes (`validate` injects them, then diffs; `check-vocab.mjs` diffs them standalone). Each such enum carries a `$comment` of the form `Source of truth: spec/vocab/<name>.json`.
4. **Archetype/family agreement**: `family` equals the `broader` of `archetype` in `archetype.json`. Same for `detected_family` / `detected_archetype`.
5. **`accepts` agreement**: `min_items` / `max_items` equal `items.min` / `items.max` in `accepts_schema`; every role in `requires` and `optional` appears in the element table; `chars.<role>.max` equals that role's `maxChars`.
6. **Geometry**: `0 ≤ x`, `0 ≤ y`, `x + w ≤ 1920`, `y + h ≤ 1080`, `w > 0`, `h > 0`, `n` contiguous from 1.
7. **Typography**: `weight` ∈ 100…900 step 100; at most 4 distinct `size` values per slide and 6 per deck; `size` and `lh` present exactly on text rows.
8. **Bindings resolve**: every `binds` other than `-` names a field or item index that exists on a unit in `units[]`; `unit.items[i]` has `i ≤ units[0].items`.
9. **Budget**: no element's `text` exceeds its `maxChars`; if any does, `overflow: true` and the slide cannot be uploaded.
10. **Density**: the slide's word and item counts sit inside the limits of its resolved density level (`spec/vocab/density.json` definitions).
11. **Polish cap**: every planned layout's `polish_cost` ≤ the deck's `polish` dial cap (quick 2, standard 3, premium 5).
12. **Fonts**: every family in `fonts[]` is registered in `spec/fonts.json` (error); non-native or unverified families warn (Decision 5). `fonts_native` agrees with the registry.
13. **Ids**: `id` matches its filename; `slide_no` matches the `S##` prefix; `unit_count` equals the number of `## u###` sections; `layout_sequence` length equals the plan table row count.
14. **Public hygiene**: no vendor design file anywhere in the repo (Decision 1); a bundle publishes only with `content_public: true` (Decision 4).
15. **Body sections**: every required heading for the file type is present, in order, with no extras.

---

## Deviations and additions recorded here

These resolve gaps or conflicts between `docs/PLAN.md`, `docs/GLOSSARY.md` and the research files. Each is a decision this document makes explicit rather than a source it invents.

| Where | What | Why |
|---|---|---|
| Layout `title` | Added: a human name for the layout, alongside the `id` and the vocab `archetype` | `bases/layouts.base` renders a Layout column and `build-html` uses it as the page label; without the key both fall back to `L### <archetype>`, which reads as machinery. |
| Archetype ids | `kebab-case`, taken verbatim from the id column of `spec/taxonomy.md`; the old `snake_case` ids survive as `altLabels` in `archetype.json` | Two documents enumerated the archetypes independently. The taxonomy wins because its ids double as layout and slide file-name stems, and because it is the document that carries the item ranges, families and adjacency edges. |
| Layout `canva_*` | PLAN writes `canva_*` as a wildcard; resolved to `family_deck`, `family_page`, `canva_locators` | The Canva state a layout can hold is a master design, a page in it, and per-element locators (`docs/PLAN.md §Pipeline step 7`, Skill 4 acceptance). |
| `density`, `polish_cost` | Stored as **Number** 1–5, mapping in order onto the named vocab entries | PLAN specifies "density 1–5" and "polish-cost 1–5"; the vocab naming rule requires word identifiers. The number is the frontmatter value so Obsidian can sort it; the vocab file is the definition. |
| Slide fork `status: candidate` | Expressed as `parent ≠ "-"` with `fill_status: auto\|edited`; promotion sets `fill_status: approved` and archives the parent | `status.json`'s slide scheme is `auto, edited, approved`; adding `candidate` would fork the vocabulary for a state already derivable. |
| `redline_status` | Added a fourth `status.json` sub-scheme: `none, open, applied, resolved` | PLAN's slide frontmatter carries `redline_status`, and hard rule 3 forbids free text in a frontmatter value. |
| `verbosity`, `content_generation`, `source_type`, font `category`, asset `kind` | Enums held **inline** in the JSON Schemas, no vocab file | The task's vocabulary set is fixed; these five never appear in a retrieval filter. Promote to `spec/vocab/` if a Base or `find` ever needs them. |
| Brief `deck`, `title`; plan `route`, `unplaced_units`, `overflow_count` | Added beyond PLAN's dial list | A brief with no identifier cannot be resolved to a directory, and the plan's fit report is machine-checked at acceptance (Skill 1). |
| `binds` form `<uid>.<field>` | Added to PLAN's `unit.title` / `unit.items[i]` / `unit.value` | A slide binds several units (`units: [u12,u13,u14,u15]` in PLAN's own example), so a binding needs a way to name which one. |
| `unit.items[i]` indexing | Defined as **1-based** | Matches the `n` column and how the operator reads the table. |
| Unit `must_include` | Added to PLAN's unit key list | Skill 1's acceptance test refers to units "marked `must_include`". |
