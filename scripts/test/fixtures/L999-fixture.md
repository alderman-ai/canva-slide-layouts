---
id: "L999"
family: image_people
archetype: image_points
variant: standard
flow_role: body
content_shape: [bullets, image]
density: 3
info_units: 4
min_items: 2
max_items: 4
text_capacity_chars: 274
polish_cost: 2
slots_image: 1
slots_chart: 0
slots_table: 0
fonts: [Inter, Open Sans]
fonts_native: true
pairing: inter-open-sans
brand: neutral
follows_well: [section_divider]
precedes_well: [key_takeaway]
tags: [fixture, test]
status: draft
origin: "-"
accepts_schema: "-"
canva_ops: "-"
family_deck: "-"
family_page: "-"
canva_locators: []
---

Test fixture only. Not part of the layout library; `layouts/` is the library and `validate`
never scans this directory by default.

## Elements

| n | role    | x    | y   | w    | h   | font      | weight | size | lh   | align | maxChars | binds        | text                                                                            |
|---|---------|------|-----|------|-----|-----------|--------|------|------|-------|----------|--------------|---------------------------------------------------------------------------------|
| 1 | eyebrow | 96   | 96  | 800  | 28  | Inter     | 500    | 20   | 1.2  | left  | 24       | unit.section | SECTION EYEBROW                                                                 |
| 2 | title   | 96   | 140 | 1200 | 180 | Inter     | 600    | 76   | 1.1  | left  | 40       | unit.title   | Action title states the takeaway                                                |
| 3 | divider | 96   | 352 | 1728 | 2   |           |        |      |      |       |          |              | stroke:#999999                                                                  |
| 4 | shape   | 80   | 384 | 960  | 264 |           |        |      |      |       |          |              | fill:#F5F5F5 r:16                                                               |
| 5 | body    | 112  | 416 | 896  | 200 | Open Sans | 400    | 32   | 1.4  | left  | 150      | unit.items   | - First supporting point\n- Second supporting point\n- Third supporting point   |
| 6 | picture | 1104 | 400 | 720  | 480 |           |        | 24   |      |       |          | unit.image   | label:Product_screenshot                                                        |
| 7 | caption | 1104 | 896 | 720  | 32  | Open Sans | 400    | 24   | 1.35 | left  | 60       | unit.caption | Caption describing the image                                                    |

## Accepts

| unit_type | min | max | note                          |
|-----------|-----|-----|-------------------------------|
| claim     | 1   | 1   | becomes the action title      |
| enumeration | 2 | 4   | becomes the bullet block      |
| figure      | 0 | 1   | fills the picture placeholder |

## Fill rules

Title carries the takeaway as a full sentence, at most 40 characters. Bullets stay one line each.
The picture is a gray placeholder until a real asset is bound.

## Flow

Follows an opening or a section divider; precedes a proof or comparison slide.

## Speaker notes

Fixture layout used by the script tests. Says what the slide is for and how it is filled.
