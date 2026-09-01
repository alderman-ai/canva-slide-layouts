---
id: "L046"
title: Three Column
family: comparison
archetype: three-column
variant: standard
flow_role: body
content_shape: [text]
density: 3
info_units: 3
min_items: 3
max_items: 3
text_capacity_chars: 792
polish_cost: 2
slots_image: 0
slots_chart: 0
slots_table: 0
fonts: [Barlow, JetBrains Mono]
fonts_native: true
pairing: alderman-ai
brand: alderman-ai
follows_well: [section-divider, title-body]
precedes_well: [key-takeaway, comparison-table]
tags: [probe, columns, comparison, alderman-ai]
status: draft
origin: "-"
accepts_schema: spec/schema/layouts/L046.json
canva_ops: build/canva-ops/L046.json
family_deck: build/html/families/04-comparison.html
family_page: "1"
canva_locators: []
---

Three equal columns (span 4 each on the 12-column grid: x = 96, 683, 1269; w = 555). Probe layout 2 of 3; deliberately set in the alderman.ai pairing (Barlow, JetBrains Mono) to test non-native font handling (P2).

## Elements

| n  | role    | x    | y   | w    | h   | font           | weight | size | lh   | align | maxChars | binds             | text                                                                 |
|----|---------|------|-----|------|-----|----------------|--------|------|------|-------|----------|-------------------|----------------------------------------------------------------------|
| 1  | title   | 96   | 96  | 1728 | 100 | Barlow         | 700    | 76   | 1.1  | left  | 40       | unit.title        | Action title states the comparison                                   |
| 2  | divider | 96   | 216 | 1728 | 2   |                |        |      |      |       |          |                   | stroke:#999999                                                       |
| 3  | label   | 96   | 264 | 555  | 60  | Barlow         | 600    | 40   | 1.15 | left  | 24       | unit.items[0].title | Column one heading                                                 |
| 4  | body    | 96   | 340 | 555  | 420 | Barlow         | 400    | 32   | 1.4  | left  | 200      | unit.items[0].body  | Column one supporting text, three to five short lines.             |
| 5  | label   | 683  | 264 | 555  | 60  | Barlow         | 600    | 40   | 1.15 | left  | 24       | unit.items[1].title | Column two heading                                                 |
| 6  | body    | 683  | 340 | 555  | 420 | Barlow         | 400    | 32   | 1.4  | left  | 200      | unit.items[1].body  | Column two supporting text, three to five short lines.             |
| 7  | label   | 1269 | 264 | 555  | 60  | Barlow         | 600    | 40   | 1.15 | left  | 24       | unit.items[2].title | Column three heading                                               |
| 8  | body    | 1269 | 340 | 555  | 420 | Barlow         | 400    | 32   | 1.4  | left  | 200      | unit.items[2].body  | Column three supporting text, three to five short lines.           |
| 9  | caption | 96   | 1000| 1728 | 30  | JetBrains Mono | 400    | 22   | 1.3  | left  | 80       | unit.source       | source: where these three come from                                  |

## Accepts

| unit_type   | min | max | note                                         |
|-------------|-----|-----|----------------------------------------------|
| claim       | 1   | 1   | becomes the action title                     |
| comparison  | 1   | 1   | a comparison unit with exactly three items   |
| enumeration | 0   | 1   | alternatively an enumeration of three items  |
| evidence    | 0   | 1   | source line                                  |

## Fill rules

Exactly three items; two or four items route to `side-by-side` or `four-card-grid`. Each column heading is at most 24 characters and each body at most 200 characters (about five lines at 32px in a 555px column).

## Flow

Sits after a section divider or a title-body slide that framed the question; hands off to a takeaway or a comparison table when the detail matters.

## Speaker notes

Walk the columns left to right; state the difference that matters before the audience reads it.
