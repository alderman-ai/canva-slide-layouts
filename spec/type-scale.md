# spec/type-scale.md — the type ladder and wrap-width maths

Read this with `spec/grid.md` before authoring or porting a layout, and before writing the `maxChars` column of any element table. Carried over from `docs/PLAN.md` § "Specs carried over"; grounded in `research/04` §(c).

## 1. Unit conversion

A PowerPoint 16:9 slide is 13.333 x 7.5 in = 960 x 540 pt, so at 1920 x 1080 **1 pt = 2 px** (`research/04` §(c)). Canva's size field on a 1920x1080 presentation behaves as canvas px, i.e. CSS px (`research/04` §(c)).

Consequences used throughout: consulting "44 pt title / 18 pt body" = 88 / 36 px; the 20 pt Kosslyn body floor = **40 px**; the 30 pt Kawasaki floor = **60 px**; the 42 pt TED floor = **84 px**.

## 2. Scale

Modular ratio **1.333**, base **32 px** (`research/04` §(c)). Two modes; the deck's delivery mode picks the column (see `spec/rubrics.md` §2).

| Token | Read-deck px | Live-talk px | line-height | tracking | Max chars / line | Notes |
|---|---|---|---|---|---|---|
| `display` | 128 | 160 | 1.00 | -0.03em | 20–28 | hero, section number, statement |
| `title` | 76 | 96 | 1.10 | -0.02em | 35–45 | <=2 lines, <=10 words |
| `subtitle` | 56 | 64 | 1.15 | -0.01em | 45–55 | H2 / section subhead |
| `lead` | 42 | 48 | 1.25 | 0 | 55–60 | H3, deck-opening paragraph |
| `body` | 32 | 40 | 1.40 | 0 | 45–60 | wrap ~900–1000 px in Inter |
| `caption` | 24 | 28 | 1.40 | 0 | 70 | source line, figure caption |
| `eyebrow` | 20 | 24 | 1.20 | +0.08em | — | ALL CAPS labels only |

Rules (`research/04` §(c)):
- **<=4 sizes per slide, <=6 per deck.**
- Negative tracking only at display sizes (Linear -0.022em at 48–72 px; Vercel -0.04 to -0.0475em). Positive tracking is reserved for all-caps labels.
- Display line-height 1.05–1.2, body 1.4–1.6; line length 45–60 characters.
- Optical sizing: use the Display cut above ~20 pt / 40 px — Inter Display for `display`/`title`, Tiempos Headline vs Text, Fraunces `opsz` 72–144 for titles, SF Pro Display >=20 pt. Recorded per family in `spec/fonts.json` as `optical_size_note`.

## 3. Character budgets per role

Element-table `maxChars` defaults (`docs/PLAN.md` § Specs carried over; from `research/02` § Wrap widths — the Mck `layout-matrix.yaml` budgets).

| Role | maxChars | Token |
|---|---|---|
| title | **40** | `title` |
| subtitle | **70** | `subtitle` |
| bullet (one item) | **50** | `body` |
| card body / description | **60–80** | `body` |
| KPI / metric label | **20** | `eyebrow` or `caption` |
| timeline milestone label | **8** | `caption` |
| big number (the numeral itself) | **6** | `display` |
| source line | 70 | `caption` |

A budget is a hard cap for `validate`: text longer than `maxChars` on a single-line element is an overflow error, and the fix is a split, never a size reduction (`spec/rubrics.md` §6).

## 4. Wrap widths are computed against Inter metrics

**Rule (Decision 5).** Every `maxChars` in the library is computed against **Inter** metrics, whatever family the layout declares. Inter is the recorded fallback for nearly every commercial grotesk in `spec/fonts.json`, so a Söhne or GT America layout re-renders in Inter with **<=1 line of drift** (`research/04` § "Practical implication"; `docs/DECISIONS.md` #5).

Layouts therefore carry `fonts[]`, `fonts_native` and `pairing`, but their geometry is Inter-safe. `validate` warns, and does not fail, when a declared family is non-native or `unverified` (Decision 5).

## 5. maxChars formula

```
maxChars(width_px, font_px, k) = floor( width_px / (k * font_px) )
width_px(maxChars, font_px, k) = ceil( maxChars * k * font_px )
```

`k` is the **average character advance in em** for Inter at that role.

### 5.1 Where k comes from

`research/04` §(c) states that Inter body text at **32 px** fits **45–60 characters** in a wrap width of **~900–1000 px**. That bounds the advance at 900/60 = 15.0 px to 1000/45 = 22.2 px; the midpoint 950 / 52.5 = **18.1 px = 0.565 em**. The library adopts **k = 0.55** for mixed-case Inter 400/500 body text, and adjusts for the two cases where `research/04` §(c) also fixes the tracking:

| Role | Weight / tracking | k (em) | Basis |
|---|---|---|---|
| `body`, `lead`, `caption` | 400–500, tracking 0 | **0.55** | derived from `research/04` §(c) 45–60 ch in 900–1000 px at 32 px |
| `title`, `subtitle` | 500–700, tracking -0.02em | **0.55** | heavier weight widens, negative tracking narrows; net kept at the body value, and it reproduces the published band (below) |
| `display` | 500–700, tracking -0.03em | **0.52** | as above with the larger negative tracking |
| `eyebrow` (all caps) | 500–600, tracking +0.08em | **0.68** | caps advance plus the published +0.08em |

`k` is **derived**, not a published Inter metric — no source states an average advance. It is validated only by reproducing `research/04` §(c)'s own max-chars column:

| Role | Width used | Computed maxChars | `research/04` §(c) band |
|---|---|---|---|
| `display` 128 px | 1728 (span 12) | 25 | 20–28 ✓ |
| `title` 76 px | 1728 (span 12) | 41 | 35–45 ✓ |
| `subtitle` 56 px | 1728 (span 12) | 56 | 45–55 ✓ (1 over; use span 11 for 51) |
| `body` 32 px | 950 (Inter wrap) | 53 | 45–60 ✓ |
| `caption` 24 px | 924 | 70 | 70 ✓ |

Re-derive `k` if a rendered probe deck disagrees by more than one line; record the new value here with the probe as its source.

### 5.2 Worked spans (Inter, read-deck column)

`maxChars` at each grid span (`spec/grid.md` §3.1), rounded down:

| Span (w px) | `title` 76 | `subtitle` 56 | `body` 32 | `caption` 24 |
|---|---|---|---|---|
| 3 (408.00) | 9 | 13 | 23 | 30 |
| 4 (554.67) | 13 | 18 | 31 | 42 |
| 5 (701.33) | 16 | 22 | 39 | 53 |
| 6 (848.00) | 20 | 27 | 48 | 64 |
| 7 (994.67) | 23 | 32 | 56 | 75 |
| 8 (1141.33) | 27 | 37 | 64 | 86 |
| 12 (1728.00) | 41 | 56 | 98 | 130 |

Where a computed value exceeds the §3 role budget, the **role budget wins** (a 12-span body line computes to 98 characters but a bullet is still capped at 50).

## Sources

- `research/04` §(c) — 1 pt = 2 px, ratio 1.333 / base 32, the two-mode px table, line-heights, tracking, optical sizing, <=4 sizes per slide / 6 per deck, 8 px spacing grid, Inter wrap ~900–1000 px at 45–60 ch.
- `research/04` § "Practical implication" — design wrap widths against Inter metrics; tag each layout with a fallback family for <=1 line drift.
- `research/02` § "Wrap widths" — Mck character budgets (title 40, bullets 50, card 60–80, KPI label 20, milestone 8).
- `research/03` §(c) — the pt floors converted in §1 (42 pt TED, 30 pt Kawasaki, 20 pt Kosslyn, 14–16 pt consulting body).
- `docs/DECISIONS.md` #5 — fonts are a registry, not an allowlist; wrap widths computed against Inter.
