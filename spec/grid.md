# spec/grid.md — the 1920x1080 geometry contract

Read this before authoring or porting any layout, and before writing `build-html`. Every `x/y/w/h` in a layout element table is resolved against the numbers here. Carried over from `docs/PLAN.md` § "Specs carried over"; grounded in `research/02` § "Grid and type conventions for 1920x1080".

## 1. Page

| Property | Value | Source |
|---|---|---|
| Page size | **1920 x 1080 px** | Canva presentation pages are 1920x1080 (`research/09`; `CLAUDE.md` § Environment facts) |
| Emitted markup | one `<section data-document-role="page" data-label="…">`, `position:relative; width:1920px; height:1080px; overflow:hidden` | `docs/PLAN.md` § "HTML authoring rules confirmed by import evidence"; `research/05` §7 |
| Positioning model | absolute inside the page | `docs/PLAN.md` § HTML authoring rules |
| Outer margin | **96 px** on all four sides | `research/02` § Grid and type conventions (96–108 px; pptx skill >=0.5in = 96 px at 1920 wide) |

## 2. Content box

| Property | Value |
|---|---|
| Origin | **(96, 96)** |
| Size | **1728 x 888** |
| Right edge | x = 1824 |
| Bottom edge | y = 984 |

## 3. Columns

12 columns, 32 px gutters, inside the 1728 px content box (`research/02`).

```
column_width = (1728 - 11 * 32) / 12 = 1376 / 12 = 114.666667 px
column_pitch = 114.666667 + 32 = 146.666667 px
x(col c)     = 96 + (c - 1) * 146.666667          # c = 1..12
w(span n)    = n * 114.666667 + (n - 1) * 32      # n = 1..12
```

### 3.1 Span widths

| Span | Width (px) | Span | Width (px) |
|---|---|---|---|
| 1 | 114.67 | 7 | 994.67 |
| 2 | 261.33 | 8 | 1141.33 |
| 3 | 408.00 | 9 | 1288.00 |
| 4 | 554.67 | 10 | 1434.67 |
| 5 | 701.33 | 11 | 1581.33 |
| 6 | 848.00 | 12 | 1728.00 |

### 3.2 Column start offsets

| Col | x (px) | Col | x (px) |
|---|---|---|---|
| 1 | 96.00 | 7 | 976.00 |
| 2 | 242.67 | 8 | 1122.67 |
| 3 | 389.33 | 9 | 1269.33 |
| 4 | 536.00 | 10 | 1416.00 |
| 5 | 682.67 | 11 | 1562.67 |
| 6 | 829.33 | 12 | 1709.33 |

Emit column-derived values rounded to 2 decimal places; do **not** snap them to the 8 px grid (see §6).

## 4. Standard splits

All heights are the author's choice; only x and w are fixed by the grid.

| Split | Use | Block | x | w |
|---|---|---|---|---|
| 6 / 6 | two-column text, side-by-side, before/after | left | 96.00 | 848.00 |
| | | right | 976.00 | 848.00 |
| 7 / 5 | text + supporting visual (editorial ratio, `research/02` guizang) | main | 96.00 | 994.67 |
| | | aside | 1122.67 | 701.33 |
| 8 / 4 | content + sidebar/callout | main | 96.00 | 1141.33 |
| | | aside | 1269.33 | 554.67 |
| **8 / 4 chart + takeaway** | chart occupies left two-thirds, "so what" in right third (`research/02` §7 StrategyU; `research/03` §(a)#9) | chart | 96.00 | 1141.33 |
| | | takeaway | 1269.33 | 554.67 |
| 4 / 4 / 4 | three-column, exec summary (S / F / R) | a | 96.00 | 554.67 |
| | | b | 682.67 | 554.67 |
| | | c | 1269.33 | 554.67 |
| 3 / 3 / 3 / 3 | four cards, KPI row, icon grid | a | 96.00 | 408.00 |
| | | b | 536.00 | 408.00 |
| | | c | 976.00 | 408.00 |
| | | d | 1416.00 | 408.00 |

## 5. Chrome and safe areas

| Zone | Box (x, y, w, h) | Rule |
|---|---|---|
| **Footer safe zone** | (0, 1040, 1920, 40) | **Nothing** is placed here. Bottom 40 px (`docs/PLAN.md` § Specs carried over; `research/02` proposed ~22 px, PLAN raised it to 40) |
| Footer band | (96, 1000, 1728, 40) | The only region between the content box bottom (y = 984) and the safe zone |
| **Source line** | (96, 1000, 1141.33, 34) | Left, span 8. Caption 24 px / lh 1.4 = 33.6 px, so it ends at y = 1033.6, clear of 1040 |
| **Page number** | (1416, 1000, 408, 34) | Right-aligned, span 3, right edge at x = 1824 |
| Eyebrow / kicker | (96, 96, 1141.33, 24) | Optional label row at the top of the content box; body content then starts at y = 152 |

## 6. Spacing grid

- **8 px vertical/horizontal rhythm**: all y, h, and every gap not derived from the column math is a multiple of 8 (`research/04` §(c) "8px spacing grid").
- Gutter between columns is 32 px (4 units); gutter between stacked blocks is 32 px, tightened to 24 px at density 4–5 and opened to 48–64 px at density 1–2 (see `spec/rubrics.md`).
- Card padding: 32 px default, 24 px at density 4–5.

## 7. Sketch

```
0                                                                       1920
 +---------------------------------------------------------------------+ y=0
 |                        96 px top margin                             |
 |  +---------------------------------------------------------------+  | y=96
 |  | c1   c2   c3   c4   c5   c6   c7   c8   c9   c10  c11  c12    |  |
 |  | [] 32 [] 32 [] 32 [] 32 [] 32 [] 32 [] 32 [] 32 [] 32 [] 32 []|  |
 |  |  each [] = 114.67 px            each 32 = gutter              |  |
 |  |                                                               |  |
 |  |            content box  1728 x 888  at (96, 96)               |  |
 |  |                                                               |  |
 |  +---------------------------------------------------------------+  | y=984
 |   source line (96, 1000, span 8)          page number (span 10-12)  | y=1000
 |=================== footer safe zone: keep clear =====================| y=1040
 +---------------------------------------------------------------------+ y=1080
x=0   x=96                                                    x=1824  x=1920
```

## 8. Validation hooks

`validate` fails a layout when any element box: starts before x = 96 or y = 96; ends after x = 1824 or y = 984 (full-bleed image layouts are exempt via `bleed: true`); overlaps the footer safe zone; or uses an x that is not a column start and not marked `off_grid: true`.

## Sources

- `research/02` § "Grid and type conventions for 1920x1080" — margins, 12-col at 1728 with 32 px gutters, 114.7 px columns, standard splits 6/6, 7/5, 8/4, 4/4/4, 3/3/3/3; StrategyU chart-two-thirds + takeaway-third.
- `research/04` §(c) — 8 px spacing grid, >=96 px safe margin.
- `research/05` §7 — `data-document-role="page"` + fixed-px section is the emit target.
- `research/09` via `CLAUDE.md` — Canva presentation pages are 1920x1080.
- `docs/PLAN.md` § "Specs carried over", § "HTML authoring rules confirmed by import evidence".
