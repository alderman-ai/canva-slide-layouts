# `spec/vocab/` — controlled vocabularies

Nineteen flat JSON files, one per vocabulary, plus `check-vocab.mjs`, the gate that keeps the vocabularies, the spec prose and the JSON Schemas in agreement. Every vocabulary file is an **array of objects** with the same eight keys, a SKOS-style shape taken from the SKOS primer (`research/06 §f`):

```json
{ "value": "kpi-grid", "prefLabel": "KPI grid / metric cards", "altLabels": ["kpi_grid", "metric cards"],
  "definition": "A grid of metric cards, each a value with a label.", "broader": "numbers",
  "inScheme": "archetype", "examples": ["items: 4-6"], "sources": ["research/02 #23"] }
```

- `value` is the stable identifier written into frontmatter, never renamed once used. Its casing follows the naming convention below.
- `prefLabel` is the human label; `altLabels` are synonyms the retrieval scripts and Claude may match on, never written to frontmatter.
- `broader` is the parent concept inside the same file (`""` at the top). It is load-bearing in `archetype.json` (parent = family), `element_role.json` (parent = role group) and `status.json` (parent = lifecycle group).
- A concept belongs to **one** `broader` group. When a value legitimately sits in two groups, the second is declared by an `examples` entry of the exact form `also in: <group value>` — `draft` in `status.json` is the only current case (both `layout_status` and `intake_status`). `validate.mjs` derives a subset as *`broader` equals the group, or `examples` contains `also in: <group>`*.
- `examples` carry the numeric ranges and defaults; `sources` cite the research file and section they came from. In `archetype.json` the first example is always `items: <range>`, copied from the `items` column of `spec/taxonomy.md`, and a later example records any merge or split the taxonomy made when the term was reconciled.
- **`altLabels` are unique within a file** and never repeat a `value`, so a synonym resolves to exactly one term. When an id is renamed, the old id becomes an `altLabel` of the surviving term — every archetype's old `snake_case` id is recorded that way.

## Naming convention

**`archetype.json` values are `kebab-case`. Every other vocabulary is `snake_case`, except `delivery_mode.json` and `brand.json`, which are also `kebab-case`.**

- **Archetype ids are kebab-case** because they double as file-name stems: a layout is `layouts/L###-<archetype>.md` and a slide `presentations/<slug>/slides/S##-<archetype>.md`. `spec/taxonomy.md` is the authority for the set — the id column of its seven family tables — and this file follows it, so a new archetype is added to the taxonomy first.
- **`delivery_mode` stays kebab-case** (`live-talk`, `read-deck`) rather than being normalised to snake_case. Its values name the two type-scale modes in `spec/type-scale.md` §2 and the `--live-*` custom properties in `templates/_base.css`, which are already written that way; renaming the vocabulary alone would split one name across three files.
- **`brand` stays kebab-case** (`alderman-ai`) because a brand id names an asset directory and an upstream repository, and is also a `pairing` id in `spec/pairings.md`.
- Everything else — `purpose`, `flow_template`, `unit_type`, `element_role`, `slide_function`, `status`, `evidence_kind`, `audience`, `density`, `polish`, `family`, `flow_role`, `content_shape`, `shape`, `variant`, `route` — is snake_case: lowercase words joined by `_`.
- `check-vocab.mjs` enforces exactly this, and fails on a value written in the wrong case for its file.

**Enforcement is external.** Obsidian has exactly six property types and no enum (`research/06 §e`), so `validate` is what rejects an unknown term. Single-valued vocabulary fields are Obsidian **Text** properties, multi-valued ones are **List**; Bases filters wrap both with `list()` so they filter alike. The JSON Schemas in `spec/schema/` carry copies of these enums — `validate.mjs` injects them from these files, so the two must stay in sync (see the `$comment` on every enum).

| File | Enumerates | Frontmatter keys that use it |
|---|---|---|
| `family.json` | 7 top-level layout families; also the Canva family master a layout lives in | `family` (layout), `detected_family` (intake) |
| `archetype.json` | 104 layout classes in `kebab-case`, each with its family as `broader` and its item range in `examples`. **`spec/taxonomy.md` is the authority for this set**; the two must name the same 104 ids | `archetype` (layout), `detected_archetype` (intake), `follows_well`, `precedes_well` |
| `content_shape.json` | the 8 content modalities a **layout** can host (research/06 §b Layer 3) | `content_shape[]` (layout) |
| `shape.json` | the same 8 modalities as carried by a **content unit**; a unit binds only when its `shape` is in the layout `content_shape[]` | `shape` (unit) |
| `unit_type.json` | 18 rhetorical unit types, Layer 2 of research/06 §b | `unit_type` (unit), `accepts_unit_types[]` (accepts schema) |
| `slide_function.json` | 7 structural slide functions, Layer 1 of research/06 §b | `slide_function` (unit) |
| `element_role.json` | 24 element roles plus 5 grouping concepts (`text_role`, `visual_role`, `decor_role`, `chrome_role`, `offstage_role`) | `role` column of every element table; `requires`/`optional`/`chars` keys in an accepts schema |
| `flow_role.json` | 5 narrative positions: opener, bridge, body, evidence, closer. Distinct from `slide_function.json`, which is the archetype's structural job — the `slide_function` column of `spec/taxonomy.md` | `flow_role` (layout) |
| `flow_template.json` | the 10 named flow templates with target lengths and slot sequences (research/03 §b); `spec/flows.md` carries one numbered section per value, headed by the id | `flow_template` (brief, plan) |
| `density.json` | 5 density levels with their word, line, type-size and pace limits (research/03 §c): `cinematic`, `talk`, `briefing`, `consulting`, `slidedoc` | `density` (layout, brief, plan) — stored as the **number** 1–5 |
| `polish.json` | 5 polish-cost levels with family defaults (research/03 §d): `typography_only`, `type_primitives`, `chart_or_photo`, `curated_imagery`, `bespoke` | `polish_cost` (layout) — stored as the **number** 1–5; the separate `polish` dial (quick/standard/premium) caps it and has no vocab file |
| `audience.json` | 11 audiences | `audience` (brief) |
| `purpose.json` | 13 deck purposes, each naming its default flow template in `examples`; `spec/flows.md` § "Purpose to flow mapping" carries one row per value and must agree | `purpose` (brief) |
| `delivery_mode.json` | 7 delivery modes in `kebab-case`, each naming its default density in `examples`; `spec/rubrics.md` §2 carries one row per value | `delivery_mode` (brief) |
| `evidence_kind.json` | 11 kinds of proof a unit can offer | `evidence_kind` (unit) |
| `status.json` | 4 lifecycle groups and their 14 states (layout, slide fill, intake, redline) | `status` (layout, intake), `fill_status` and `redline_status` (slide) |
| `variant.json` | standard, dense, sparse | `variant` (layout) |
| `brand.json` | `alderman-ai`, `neutral` | `brand` (layout, slide, brief, intake, bundle) |
| `route.json` | the 4 Canva upload routes A–D (Decision 3), as lowercase `a`–`d` | `route` (plan), `routes_supported[]` (bundle) |

## Adding a term

1. For an **archetype**, add the row to `spec/taxonomy.md` first — it is the authority for that set — then mirror the id here.
2. Edit the vocabulary file: new object, all eight keys, `sources` filled in, `broader` set where the file uses it, casing per the naming convention above.
3. Update the matching `enum` in `spec/schema/*.json`. Every vocab-backed enum names its file in a `$comment` of the form `Source of truth: spec/vocab/<name>.json`; a `description` reading `Subset ... with broader <group>` narrows it, and any extra literal it needs (`"auto"`, `"none"`) is named in double quotes there. Regenerate the array from the vocabulary rather than editing it by hand.
4. Update the prose that enumerates the vocabulary: `spec/flows.md` for `purpose` and `flow_template`, `spec/rubrics.md` for `density`, `polish` and `delivery_mode`, `spec/taxonomy.md` for `archetype` and `family`.
5. Run `node spec/vocab/check-vocab.mjs`, then `validate`. A term used in frontmatter but absent here is an error, not a warning (CLAUDE.md hard rule 3).

## `check-vocab.mjs`

`node spec/vocab/check-vocab.mjs` exits non-zero on any of:

1. **A malformed vocabulary** — a missing key, a duplicate `value`, an `altLabel` claimed twice or shadowing a `value`, an unresolved `broader`, an empty `definition` or `sources`, or a value in the wrong case for its file.
2. **An unknown id in the prose** — anything backticked in `taxonomy.md`, `flows.md`, `rubrics.md`, `pairings.md`, `ontology.md`, `schema.md` or this file that looks like an id (lowercase kebab or snake, two or more segments) and is not a vocabulary value. Flow slot names and font pairing ids are read out of `flows.md` and `pairings.md` themselves; everything else that is legitimately not vocabulary — frontmatter keys, script names, inline enums, third-party names — sits in an explained allowlist inside the script.
3. **A stale schema enum** — any `enum` in `spec/schema/*.json` that differs from the vocabulary its `$comment` names.
4. **A cross-file disagreement** — a `purpose` whose default flow template differs between `purpose.json` and `flows.md`, a `flow_template` with no section in `flows.md`, a pairing id present in only one half of `pairings.md`, or an archetype id in `taxonomy.md` but not `archetype.json` (or the reverse).
