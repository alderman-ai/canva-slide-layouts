---
id: "L037"
title: Table Insight
family: numbers
archetype: table-insight
variant: standard
flow_role: evidence
content_shape: [table, text]
density: 4
info_units: 6
min_items: 3
max_items: 8
text_capacity_chars: 370
polish_cost: 3
slots_image: 0
slots_chart: 0
slots_table: 1
fonts: [Inter]
fonts_native: true
pairing: neutral-default
brand: neutral
follows_well: [data-table, chart-dominant]
precedes_well: [key-takeaway, cta-next-steps]
tags: [probe, table, evidence, callout]
status: draft
origin: "-"
accepts_schema: spec/schema/layouts/L037.json
canva_ops: build/canva-ops/L037.json
family_deck: build/html/families/03-numbers.html
family_page: "1"
canva_locators: []
---

Table at span 8 (x 96, w 1141) with the read-out in a span-4 panel (x 1269, w 555). Probe layout 3 of 3; tests a table slot, a filled panel shape, and a two-column composition (P1, P7). Tables are opaque to the Canva edit API (`spec/canva-limits.md`), so the slot is a placeholder for a native Canva table added in the editor.

## Elements

| n | role    | x    | y   | w    | h   | font  | weight | size | lh  | align | maxChars | binds          | text                                                         |
|---|---------|------|-----|------|-----|-------|--------|------|-----|-------|----------|----------------|--------------------------------------------------------------|
| 1 | title   | 96   | 96  | 1728 | 100 | Inter | 700    | 76   | 1.1 | left  | 40       | unit.title     | Action title says what the table proves                      |
| 2 | table   | 96   | 240 | 1141 | 720 |       |        | 28   |     |       |          | unit.table     | rows:6 cols:4 header:true                                    |
| 3 | shape   | 1269 | 240 | 555  | 720 |       |        |      |     |       |          |                | fill:#F5F5F5 r:16                                            |
| 4 | eyebrow | 1301 | 280 | 491  | 28  | Inter | 600    | 20   | 1.2 | left  | 20       | unit.callout_label | SO WHAT                                                  |
| 5 | body    | 1301 | 328 | 491  | 560 | Inter | 400    | 32   | 1.4 | left  | 220      | unit.callout   | The read-out in two or three sentences, pointing at the row that matters. |
| 6 | caption | 96   | 992 | 1141 | 30  | Inter | 400    | 22   | 1.3 | left  | 90       | unit.source    | Source: dataset, date, method                                |

## Accepts

| unit_type | min | max | note                                   |
|-----------|-----|-----|----------------------------------------|
| claim     | 1   | 1   | becomes the action title               |
| table     | 1   | 1   | 3–8 rows, 2–6 columns                  |
| evidence  | 1   | 3   | callout sentences and the source line  |

## Fill rules

The callout is at most 220 characters and must reference a specific row or column. Tables with more than eight rows split across two slides or move to the appendix. Header row is always on.

## Flow

Follows a plain data table or a chart when the number needs a table to be believed; precedes a takeaway or the asks.

## Speaker notes

Point at the row you want them to see before you explain the callout.
