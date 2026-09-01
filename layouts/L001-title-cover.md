---
id: "L001"
title: Title Cover
family: structural
archetype: title-cover
variant: standard
flow_role: opener
content_shape: [text]
density: 1
info_units: 1
min_items: 1
max_items: 3
text_capacity_chars: 182
polish_cost: 1
slots_image: 0
slots_chart: 0
slots_table: 0
fonts: [Inter]
fonts_native: true
pairing: neutral-default
brand: neutral
follows_well: []
precedes_well: [agenda-toc, executive-summary-3col, statement]
tags: [probe, opener, cover]
status: draft
origin: "-"
accepts_schema: spec/schema/layouts/L001.json
canva_ops: build/canva-ops/L001.json
family_deck: build/html/families/01-structural.html
family_page: "1"
canva_locators: []
---

Deck opening. One claim, optional subtitle, one meta line. Probe layout 1 of 3 (Route A/B/D probe, `docs/OPEN-QUESTIONS.md` P1–P2). Geometry per `spec/grid.md` (96px margins, 1728px content width) and `spec/type-scale.md` live-talk mode.

## Elements

| n | role     | x   | y   | w    | h   | font  | weight | size | lh   | align | maxChars | binds         | text                                        |
|---|----------|-----|-----|------|-----|-------|--------|------|------|-------|----------|---------------|---------------------------------------------|
| 1 | eyebrow  | 96  | 300 | 1200 | 30  | Inter | 500    | 24   | 1.2  | left  | 24       | unit.section  | DECK EYEBROW                                |
| 2 | title    | 96  | 352 | 1440 | 260 | Inter | 700    | 128  | 1.0  | left  | 28       | unit.title    | Deck title in two lines                     |
| 3 | subtitle | 96  | 640 | 1200 | 140 | Inter | 400    | 48   | 1.15 | left  | 70       | unit.subtitle | Subtitle that frames the promise of the deck |
| 4 | divider  | 96  | 912 | 200  | 4   |       |        |      |      |       |          |               | stroke:#111111                              |
| 5 | caption  | 96  | 944 | 1200 | 32  | Inter | 400    | 24   | 1.3  | left  | 60       | unit.meta     | Presenter · Organisation · Date             |

## Accepts

| unit_type | min | max | note                                   |
|-----------|-----|-----|----------------------------------------|
| claim     | 1   | 1   | becomes the title                      |
| summary   | 0   | 1   | becomes the subtitle                   |
| definition | 0  | 1   | presenter, org, date on the meta line  |

## Fill rules

Title at most 28 characters over two lines at 128px; if the claim is longer, the planner prefers `intro-title-meta` or drops to the read-deck title size. Subtitle is a single sentence. The eyebrow is optional and uppercase.

## Flow

Always first. Precedes an agenda when the deck has four or more sections, otherwise the executive summary or an opening statement.

## Speaker notes

Open with the one sentence the audience should remember; do not read the subtitle aloud.
