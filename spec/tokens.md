# spec/tokens.md — alderman.ai brand tokens, extracted read-only

**Read this when**: authoring a layout's typography or an element mockup, picking a
pairing, building anything in `components/slides/`, or checking whether a Canva
render matches the brand. It is the extracted, cited copy of the site's design
tokens; it is **not** authoritative over the site itself. Provenance, order of
authority and the drift rule live in `spec/brand-sources.md`.

- **Source**: `C:\Users\alder\Desktop\Claude Code Website\alderman-ai\`
- **Commit read**: `78f20ed` (`git rev-parse --short HEAD`, 2026-09-02)
- **Working tree at read time**: **NOT clean** — six staged deletions under
  `public/brand-assets/`. See § Assets and § Notes on drift.
- **Retrieved**: 2026-09-02, read-only. Nothing was written to the source.
- Every value below carries `path:line` relative to the `alderman-ai/` repo root
  unless the path starts with `../`, which means the site's parent working folder
  (`Claude Code Website\`).

---

## Typography

### Families as actually loaded

Loaded through `next/font/google`, exposed as CSS variables on `<html>`:

| Role | Family | Weights loaded | Variable | Citation |
|---|---|---|---|---|
| Display + body | **Barlow** | 300, 400, 500, 600, 700 | `--font-barlow` | `app/layout.tsx:6-11` |
| Mono | **JetBrains Mono** | 400, 500 | `--font-jetbrains-mono` | `app/layout.tsx:13-18` |

Both use `subsets: ['latin']`, `display: 'swap'` (`app/layout.tsx:7,10,14,17`).
The variables are applied on `<html>` (`app/layout.tsx:32-35`); `<body>` sets
`font-body` as the default (`app/layout.tsx:36`).

Tailwind maps three family tokens onto those two variables — `display` and `body`
are **the same family today** (`tailwind.config.js:29-33`):

```
font-display → var(--font-barlow), system-ui, sans-serif     tailwind.config.js:30
font-body    → var(--font-barlow), system-ui, sans-serif     tailwind.config.js:31
font-mono    → var(--font-jetbrains-mono), ui-monospace,
               Menlo, monospace                              tailwind.config.js:32
```

The design-system reference card loads the same two families from Google Fonts with
the same weight sets, confirming the intent independently:
`../design-system/cards/foundations/typography.html:10`.

There is **no `@font-face` block and no custom font file** in the repo; there is no
`app/fonts/` directory. (The Claude Design project mirrors the same faces as
`barlow-{300,400,500,600,700}` + `jetbrains-mono-{400,500}` woff2 — see
`research/09-session-probes.md:37`.)

### Letter-spacing tokens

| Token | Value | Citation |
|---|---|---|
| `tracking-tightest` | `-0.04em` | `tailwind.config.js:35` |
| `tracking-display-tight` | `-0.02em` | `tailwind.config.js:36` |

Tailwind's own `tracking-tight` (−0.025em) and arbitrary values are also used —
`tracking-[0.12em]` on the IDE eyebrow (`components/special/SectionTile.tsx:173`)
and `tracking-[0.18em]` on the App eyebrow (`components/special/SectionTile.tsx:181`).

### Type scale by role (as used in `app/` and `components/`)

No Tailwind `fontSize` scale is defined; every size is an arbitrary `text-[Npx]`
value. This is the observed scale.

| Role | Family / weight | Size | Line-height | Tracking | Citation |
|---|---|---|---|---|---|
| **h1** (canonical) | display / 700 | 40px | 1.05 | −0.02em | `components/sections/HeroSection.tsx:74`; `app/contact/page.tsx:36`; `app/faq/page.tsx:79`; `app/faq-download/page.tsx:44` |
| **h1** (/about variant) | display / 700 | 37px | 1.05 | −0.02em | `app/about/page.tsx:58` |
| **h1** (desktop override) | display / 700 | **78px** `!important` | — | — | `app/globals.css:130-133` (≥768px inside `.desktop-spec`) |
| **h2** (in-paper, canonical) | display / 700 | 28px | 1.1 | −0.02em | `components/sections/TrialCTASection.tsx:33`; `components/sections/WhatYouGetSection.tsx:458`; `app/about/page.tsx:164,246`; `app/contact/page.tsx:45,148`; `app/faq/page.tsx:92,213,428` |
| h2 (28px desktop bump) | display / 700 | 35px | — | — | `app/globals.css:398-400` |
| h2 (/faq-download closer) | display / 700 | 26px | 1.15 | −0.02em | `app/faq-download/page.tsx:146` |
| h2 (/about lead, desktop) | display / 700 | 30px | — | — | `app/globals.css:761-763` |
| **h2** (paper-app inline, hero) | display / 700 | 22px | `leading-none` | −0.02em | `components/sections/HeroSection.tsx:49` |
| **h3** | display / 700 | 18px | — | — | `components/sections/WhatYouGetSection.tsx:418-419` |
| **lead / subtitle** | display / 400 | 18px | `leading-snug` | — | `components/sections/TrialCTASection.tsx:44`; `app/about/page.tsx:169,181,249`; `app/contact/page.tsx:48,151`; `app/faq/page.tsx:109,431`; `app/faq-download/page.tsx:60,149` |
| lead (18px desktop bump) | display / 400 | 22.5px | — | — | `app/globals.css:406-408` |
| **body (paper)** | display / 400 | 16px | — | — | `app/faq/page.tsx:139,224`; `components/special/FaqChat.tsx:147,150` |
| **body (post-it)** | body / 400 | 20px | `leading-snug`, `mt-5` | — | `components/special/Postit.tsx:260` |
| **post-it heading** | display / 700 | 34px | 1.05 | `tracking-tight` | `components/special/Postit.tsx:255` |
| **code / terminal** | mono / 400 | `var(--font-terminal)` = **22px** mobile, **30px** desktop | — | — | `app/globals.css:25` (root), `app/globals.css:95` (`.desktop-spec` ≥768px); consumed at `components/special/TerminalLine.tsx:382-406` |
| **eyebrow (IDE)** | mono / 400 | 11px, lowercase | — | 0.12em | `components/special/SectionTile.tsx:173` |
| **eyebrow (App)** | display / 600 | 11px, uppercase | — | 0.18em | `components/special/SectionTile.tsx:181` |
| **tile title (IDE)** | mono / 500 | 20px, lowercase | `leading-tight` | — | `components/special/SectionTile.tsx:195` |
| **tile title (App)** | display / 700 | 22px | `leading-tight` | −0.02em | `components/special/SectionTile.tsx:196` |
| **tile marker (IDE)** | mono / 400 | 16px | — | — | `components/special/SectionTile.tsx:258` |
| **caption / chrome strip** | mono / 400 | 11px | — | `tracking-tight` | `components/paper/PaperApp.tsx:171,175` |
| **nav tile label** | display / 700 | 20px, right-aligned | — | — | `components/chrome/navItems.tsx:48` |
| **footer flank** | mono / 400 | 14px, lowercase | — | — | `components/chrome/Footer.tsx:33,42` |
| **footer fine print** | mono / 400 | 12px | — | — | `components/chrome/Footer.tsx:51` |
| **url wordmark** | mono / 400 | 16px default | `leading-none` | — | `components/chrome/UrlWordmark.tsx:39,43-44` |
| **chat input pill** | mono / 500 | 15px | — | — | `components/special/FaqChat.tsx:270` |
| **chat empty state** | display / 400 | 22.5px → 28px desktop | — | — | `components/special/FaqChat.tsx:141`; `app/globals.css:413-415` |
| **chat bubble** | display / 400 | 19px | — | — | `components/special/FaqChat.tsx:173` |

Observed line-height values in use: `1.05` (h1 and post-it heading), `1.1` (h2),
`1.15` (one h2), `leading-none`, `leading-tight`, `leading-snug`. Inline
`lineHeight: 1.05` / `1.1` also appears at `components/sections/HeroSection.tsx:26`,
`components/sections/TrialCTASection.tsx:87`, `app/contact/page.tsx:76`,
`app/faq/page.tsx:177,262`, `app/faq-download/page.tsx:24`.

**Register discipline** (from `../toolbox.md:36-37`, matches the code): IDE register
(dark substrate) is `font-mono` everywhere; App register (cream paper) is
`font-display` for headings and `font-body` for prose.

---

## Color

Every named color is a Tailwind theme extension; there are no color CSS variables
and **no dark/light variants** — the site has one fixed palette, split into two
"registers" (dark IDE substrate, cream paper) plus three accents.
All from `tailwind.config.js:9-28`, cross-confirmed in
`../design-system/DESIGN.md:45-67`.

### IDE register (dark substrate)

| Token | Hex | Role | Citation |
|---|---|---|---|
| `ide` | `#272822` | nav bar / outer substrate at ≥1200px | `tailwind.config.js:11`; `app/globals.css:476,479` |
| `ide-2` | `#1E1F1A` | page background, the content column | `tailwind.config.js:12`; `app/globals.css:28` (`html` bg, anti-flash) |
| `ide-surface` | `#3E3D32` | raised IDE surfaces | `tailwind.config.js:13` |
| `ide-rule` | `#3A3B33` | column rule lines, IDE tile borders | `tailwind.config.js:14`; `app/globals.css:114,511` |
| `ide-fg` | `#F8F8F2` | primary terminal text | `tailwind.config.js:15` |
| `ide-fg-dim` | `#B0AFA7` | secondary terminal text | `tailwind.config.js:16` |
| `ide-fg-mute` | `#75715E` | muted/comment text; the paper ledge shadow | `tailwind.config.js:17` |

### Paper register (cream)

| Token | Hex | Role | Citation |
|---|---|---|---|
| `paper` | `#F6F4EE` | paper-app surface | `tailwind.config.js:19` |
| `paper-2` | `#EDEAE0` | secondary paper surface, chrome strip fallback | `tailwind.config.js:20` |
| `ink` | `#1C1C1A` | primary paper text | `tailwind.config.js:21` |
| `ink-soft` | `#5A5A54` | secondary paper text | `tailwind.config.js:22` |
| `ink-faint` | `#A19F96` | faint paper text, placeholders, 30%-alpha chrome divider | `tailwind.config.js:23` |

### Accents (the brand chord)

| Token | Hex | Role | Citation |
|---|---|---|---|
| `orange` | `#FD971F` | `man` · the paper glow · CTA warmth · post-it body | `tailwind.config.js:25` |
| `green` | `#A6E22E` | `al` / `ai` · "human" accent | `tailwind.config.js:26` |
| `purple` | `#AE81FF` | `alder` / `.` · terminal prompt + cursor · gutter glow | `tailwind.config.js:27` |

### Derived / literal colors that are not tokens

| Value | Where | Citation |
|---|---|---|
| `#D67100` | post-it body gradient end (saturated dark orange) | `components/special/Postit.tsx:127` |
| `#8A3804` · `#C26414` · `#F09443` | post-it curl-crescent gradient stops | `components/special/Postit.tsx:136` |
| `#EDEAE0 → #ECE5E3 → #E1D9E1 → #DBD3DE` | opalescent 105° chrome-strip gradient (paper-2 → warm mauve → ~15%-sat purple) | `components/paper/PaperApp.tsx:111-114` |
| `rgba(174,129,255, .55/.30/.10/0)` | purple gutter-glow radial stops (H1 and terminal-line) | `app/globals.css:151-155,160-164,199-203` |
| `rgba(253,151,31,0.6)` + `0 0 28px rgba(253,151,31,0.45)` | orange CTA hover border + glow | `app/globals.css:1050-1051`; `components/chrome/navItems.tsx:53` |
| `rgba(174,129,255,0.6)` + `0 0 28px rgba(174,129,255,0.45)` | purple CTA hover border + glow | `components/chrome/navItems.tsx:66,81` |
| `rgba(166,226,46,0.6)` + `0 0 28px rgba(166,226,46,0.45)` | green CTA hover border + glow | `app/globals.css:1240-1241,1249-1251` |

### Accent gradients (BL-anchored, per surface)

```
IDE tile   linear-gradient(to top right, rgba(<accent>, 0.45) 0%,
                                          rgba(<accent>, 0.18) 25%, transparent 65%)
App tile   linear-gradient(to top right, rgba(<accent>, 0.65) 0%,
                                          rgba(<accent>, 0.30) 25%, transparent 75%)
```
`components/special/SectionTile.tsx:106-122`; the App recipe is reused verbatim for
nav tiles at `components/chrome/navItems.tsx:51-52,78-79`.

### Wordmark color chords (two, deliberately different)

- **Stacked logo (the asset)**: `>` purple `#AE81FF` · `_` purple · `al` green
  `#A6E22E` · `der` white `#F8F8F2` · `man` orange `#FD971F` —
  `components/chrome/StackedLogo.tsx:34-39`.
- **URL wordmark (text)**: `alder` purple · `man` orange · `.` purple · `ai` green —
  `components/chrome/UrlWordmark.tsx:25-27,46-49`.

---

## Spacing & shape

### Radius

| Token | Value | Citation |
|---|---|---|
| `rounded-paper` | `14px` | `tailwind.config.js:69` |
| `rounded-tile` | `7px` | `tailwind.config.js:70` |
| post-it BR corner | `0 0 60px 0` | `components/special/Postit.tsx:118,225` |

### Shadow / elevation

```
shadow-paper-glow (4 layers, "non-negotiable per spec")
  3px  3px  0  0  rgba(117, 113, 94, 0.80)   ledge (ide-fg-mute, card thickness)
  8px 10px 24px   rgba(253, 151, 31, 0.55)   hot orange core
 16px 18px 40px   rgba(253, 151, 31, 0.20)   orange tail
 28px 38px 80px   rgba(0, 0, 0, 0.50)        dark grounding
```
`tailwind.config.js:54-59`. A quieter side-nav variant swaps the two orange layers
to `0.18` / `0.07` — `app/globals.css:586-592`.

```
shadow-postit  4px 6px 16px rgba(0,0,0,0.45), 1px 2px 4px rgba(0,0,0,0.35)
```
`tailwind.config.js:60` — **defined but never called**; `Postit` uses local
`drop-shadow` filters instead: `drop-shadow(1px 4px 8px rgba(0,0,0,0.22))` for the
paper and `drop-shadow(-1px -1px 2px rgba(0,0,0,0.22))` for the curl lift
(`components/special/Postit.tsx:143-144,151-152`).

### CSS custom properties

| Variable | Value | Scope | Citation |
|---|---|---|---|
| `--gutter-mobile` | `12%` | `:root` | `app/globals.css:10` |
| `--page-half` | `min(50vw, 200px)` | `:root` | `app/globals.css:16` |
| `--font-terminal` | `22px` | `:root` | `app/globals.css:25` |
| `--font-terminal` | `30px` | `.desktop-spec` ≥768px | `app/globals.css:95` |
| `--gutter-extension` | `39px` | `.desktop-spec` ≥768px | `app/globals.css:96` |
| `--prompt-offset` | `-60px` (mobile falls back to `-3ch`) | `.desktop-spec` ≥768px | `app/globals.css:97`; fallback at `components/special/TerminalLine.tsx:415` |
| `--scrollbar-width` | set by inline script | `<html>`, runtime | `app/layout.tsx:43-47` |

### Spacing scale

Tailwind defaults (0.25rem step) — no `spacing` extension exists in
`tailwind.config.js`. The recurring literal rhythm values are:

| Value | Meaning | Citation |
|---|---|---|
| `80px` | the uniform flow gap between every top-level element at ≥1200px | `app/globals.css:605-609` |
| `60px` | column bottom padding at ≥1200px | `app/globals.css:651-653` |
| `39px` | gutter-extension: how far anything may hang past the column rule | `app/globals.css:96` |
| `21px` | terminal grid inset from column-left | `app/globals.css:331-335` |
| `294px` / `64px` / `0` | header spacer at ≥768 / ≥1200 / ≥1200 collapsed | `app/globals.css:124-126,464-466,618-620` |
| `px-8 py-10` | default PaperApp body padding | `components/paper/PaperApp.tsx:183` |
| `px-5 h-10` | PaperApp chrome strip (40px tall) | `components/paper/PaperApp.tsx:156` |
| `px-5 py-3` | SectionTile padding | `components/special/SectionTile.tsx:155-156` |

### Container widths

| Width | Meaning | Citation |
|---|---|---|
| `400px` | mobile/baseline page column (`max-w-[400px]` + `mx-auto`) | `components/layout/PageFrame.tsx:34` |
| `550px` | desktop column at ≥768px inside `.desktop-spec` | `app/globals.css:102-106` |
| `304px` | the capped width every paper-app and IDE tile returns to on desktop | `app/globals.css:215-220,260-264,343-347,384-388` |
| `407px` | terminal-line wrap zone (preserves ~20 chars/line at 30px) | `app/globals.css:331-333` |
| `300px` / `200px` | side-nav rail / logo inside it, ≥1200px | `app/globals.css:529-553` |
| `192px` | side-nav menu min-width floor | `app/globals.css:570-573` |
| `220 / 304 / 220` @ 24px gap, `792px` total | /faq desktop chat shell grid | `app/globals.css:975-983` |
| `240 × 240` | post-it square | `components/special/Postit.tsx:117` |
| `2px` | column rule lines and every tile border | `app/globals.css:110-114`; `components/special/SectionTile.tsx:155` |

### Breakpoints — three systems, not one

| Tier | Where it lives | Citation |
|---|---|---|
| Tailwind `md:` = **1000px** (overrides the 768px default) | `tailwind.config.js:6-8` |
| Raw `@media (min-width: 768px)` — the whole `.desktop-spec` block | `app/globals.css:64,737,834,1097,1160` |
| Raw `@media (min-width: 1200px)` — SideNav in, FloatingNav out | `app/globals.css:443,728,766,863,1133` |
| Raw `@media (max-width: 767px)` — mobile always-on CTA glow | `app/globals.css:1233` |

`../toolbox.md:25` states this explicitly: *"Treat 'one mobile/desktop split' as false."*

### Grid

| Token | Value | Citation |
|---|---|---|
| `grid-cols-page` | `repeat(6, minmax(0, 1fr))` — **zero call sites** | `tailwind.config.js:64`; `../toolbox.md:43` |
| `grid-cols-canvas` | `repeat(3, minmax(0, 1fr))` — used by `/contact` and `WhatYouGetSection` | `tailwind.config.js:66`; `../toolbox.md:42` |

### Motion (cadence, in case a slide animates)

`terminal-blink` 1.06s · `tail-blink` 1.6s · `bracket-blink` 2.12s (no call site) ·
`cursor-cascade-2` 2.12s · `cursor-cascade-3` 3.18s · `cursor-walk-3` 2.12s ·
`knob-walk-3` 2.12s — all `steps(1,end)` or `linear`, `infinite`
(`tailwind.config.js:264-302`). 1.06s is the codified base cadence.

---

## Components — the five groups (15 `.tsx`)

Slide-element candidates are marked ✅. All paths relative to `alderman-ai/`.

### `components/chrome/` (6)

| Component | Props | Structure | Slide element? |
|---|---|---|---|
| **StackedLogo** `chrome/StackedLogo.tsx:73` | `height` (default 76), `boxed`, `alt`, `className` | Places the stacked-logo SVG as a plain `<img>`, width derived from `STACKED_LOGO_ASPECT = 249.75/379.5 ≈ 0.658` (`:53`). `boxed` letterboxes it in a `height × height` square — the canonical nav/rail idiom. | ✅ **yes** — but see the hard rule below |
| **UrlWordmark** `chrome/UrlWordmark.tsx:39` | `size` (default 16) | Four `<span>`s setting `alderman.ai` in JetBrains Mono in the four-segment chord. Intentionally **zero importers** (`:12-18`); kept as the executable statement of the chord. | ✅ yes, for a mono byline |
| **Footer** `chrome/Footer.tsx:14` | none | `border-t border-ide-rule`; a row of `© alex` (mono 14px, `mt 33px`) · 140px StackedLogo · `2026` (mono 14px, `mb 21px`, bottom-anchored), then a centered mono 12px trade-license line with purple parens, orange `HUMAN`, green `cz`. | ✅ a slide footer/credit strip |
| **SideNav** `chrome/SideNav.tsx:28` | none (reads `usePathname`) | `<aside class="side-nav">`: a 200px boxed StackedLogo above a `width="fit"` PaperApp holding right-aligned nav tiles. Visible only ≥1200px. | no |
| **FloatingNav** `chrome/FloatingNav.tsx:38` | none | Fixed top bar on `bg-ide/90`: 76×76 logo left, 52×52 purple round-cap hamburger right; open state is a dimmed backdrop + `fit` PaperApp of nav tiles. | no |
| **navItems** `chrome/navItems.tsx` | data module | `NAV_ITEMS` (4 destinations, `:31-44`), `NAV_TILE_CLASS` (`:47-48`), plus the orange/purple gradient + hover pairs for each nav (`:50-83`). | no (but the gradients are reusable) |

### `components/layout/` (1)

| Component | Props | Structure | Slide element? |
|---|---|---|---|
| **PageFrame** `layout/PageFrame.tsx:31` | `children` | Two nested divs: `min-h-screen bg-ide-2` → `mx-auto max-w-[400px]` → `px-[var(--gutter-mobile)]`. The 12% resolves against the 400px column, not the viewport. Widened to 550 and un-guttered at ≥768 by `globals.css`. **Not a grid.** | no — this is the page shell, and slide layouts stay neutral |

### `components/paper/` (1)

| Component | Props | Structure | Slide element? |
|---|---|---|---|
| **PaperApp** `paper/PaperApp.tsx:129` | `width` (`narrow`\|`medium`\|`wide`\|`fit`, default `narrow`), `chromeLeft`, `chromeRight`, `children`, `className`, `showAccentDots` (default true), `chromeClassName`, `chromeStyle`, `accentDotSize` (default 11), `accentDotOrder` (default `['purple','orange','green']`), `paperStyle`, `bodyClassName` (default `px-8 py-10`) | A `rounded-paper bg-paper shadow-paper-glow overflow-hidden` card: 40px chrome strip (`h-10 px-5`, opalescent 105° gradient, `border-b border-ink-faint/30`) carrying the 11px accent-dot chord at 80% opacity plus mono-11px `chromeLeft` (`text-ink-soft`) and `chromeRight` (`text-ink-faint`), over an `text-ink` body. | ✅ **the flagship element** — a slide card |

**Usage discipline** (`../toolbox.md:61`): `chromeLeft`/`chromeRight` are left empty
by default. Do not invent filenames for the chrome strip.

### `components/sections/` (3)

| Component | Props | Structure | Slide element? |
|---|---|---|---|
| **HeroSection** `sections/HeroSection.tsx:17` | none | H1 (40px) → terminal line 1 → PaperApp with a stuck-on Postit → terminal line 2. Vertical stack at every breakpoint. | pattern only — a composition, not an element |
| **WhatYouGetSection** `sections/WhatYouGetSection.tsx:452` | none | Title + subtitle on paper, then a three-column hand-authored SVG triptych (bowling-pin silhouettes; palette `ink-soft` bodies, `paper-2` laptop screens, `ink-faint` @0.5 stroke frame). | the triptych is a reusable **three-step narrative** figure |
| **TrialCTASection** `sections/TrialCTASection.tsx:23` | none | `id="brochure"`; a wide PaperApp with h2 + 18px subtitle + App-variant SectionTile, and a `flipX` BL-overhang Postit. Cleanest reference composition of paper-app + tile. | pattern only |

### `components/special/` (4)

| Component | Props | Structure | Slide element? |
|---|---|---|---|
| **Postit** `special/Postit.tsx:195` | `heading`, `children`, `rotation` (default −5), `className`, `rotationOrigin` (dead — never passed, `:76-78`), `flipX`, `overhang` (`br`\|`bl`\|`none`), `anchorTop`, `anchorMarginTop` | 240×240 square in three layers: body `linear-gradient(135deg,#FD971F 0%,#FD971F 50%,#D67100 100%)` with a `0 0 60px 0` radius under a soft drop-shadow; a `clip-path` crescent "curl" at the BR fold (arc + inward Bézier at (200,200)); a centered content layer — 34px display-bold heading over 20px body text. Must never render flat: the ±5° tilt is canonical. | ✅ **yes** |
| **SectionTile** `special/SectionTile.tsx:134` | `variant` (`ide`\|`app`), `accent` (`purple`\|`orange`\|`green`, default purple), `eyebrow`, `title`, `href`, `download`, `className` | One anatomy, two dialects, in a `rounded-tile` 2px-border shell with a BL-anchored accent gradient. **IDE**: `border-ide-rule`, mono lowercase 20px title, `=== eyebrow ===` in mono 11px/0.12em, `[ >_ ]` marker with **orange brackets**, accent `>`, walking white `_`. **App**: `border-ink/15`, Barlow-bold 22px ink title, `— EYEBROW —` in display 11px/0.18em semibold uppercase, an ink pill with an accent knob. Both markers walk 0 → 13 → 26px on a 2.12s linear loop. `href` makes the whole tile the link and enables the accent hover glow. | ✅ **yes** — the CTA / callout element |
| **TerminalLine** `special/TerminalLine.tsx:197` | `text`, `segments` (`{text,color,blinkOnDone}[]`), `startDelayMs` (1060), `charDelayMs` (27), `align`, `textColor` (`text-ide-fg`), `promptColor` (`text-purple`), `cursorColor` (`text-purple`), `fontSize` (`var(--font-terminal)`), `leadingSpaces` (2), `className`, `onComplete`, `hangingPrompt`, `persistCursor`, `cursorGlyph`, `idleCursorGlyph`, `doneCursorGlyph`, `doneCursorGlyphDelayMs`, `blinkOnDone`, `doneBlinkClassName` | `>_` idle → `> content_` typing → `> content`. IntersectionObserver-driven type-out; the `>` is absolutely positioned into the gutter in hanging mode (`left: var(--prompt-offset, -3ch)`). | ✅ **yes** — as a static rendered line (no typing in Canva) |
| **FaqChat** `special/FaqChat.tsx:42` | `entries: {q, a}[]`, `emptyState` | A PaperApp as a chat window: purple `Chevron` SVGs outside the paper edge, a mono-15px input pill, message bubbles at display-19px. At ≥1200 the chevrons/pill hide and two 7-item CTA flank columns appear. | the **bubble pair** is a candidate; the widget is not |

---

## Assets

Served from `public/`; referenced by the leading-slash path.

| Path | Format | Intrinsic size | Referenced at | Status |
|---|---|---|---|---|
| `/brand-assets/logos/alderman-ai-stacked-logo-v1.svg` | SVG | viewBox `0 0 249.75 379.5` (aspect ≈0.658); file `width=333 height=506` | `components/chrome/StackedLogo.tsx:50` | **Canonical. THE logo.** Requires a dark substrate — `der` is white. Present on disk and live (verified on alderman.ai, 2026-09-02). |
| `/brand-assets/logos/alderman-ai-mark-v1.png` | PNG | **1181 × 1181** | (no code reference) | Canonical filled-ground mark; the **light-placement** variant, since it carries its own dark square. |
| `/brand-assets/photography/alex-headshot-full-v1.jpg` | JPEG | 1200 × 1823 | `app/about/page.tsx:75` | Canonical. |
| `/brand-assets/photography/still-human-circle-portrait.svg` | SVG | viewBox `0 0 380.25 386.25`; file `width=507 height=515` | `app/page.tsx:69`; `app/contact/page.tsx:125`; `app/faq-download/page.tsx:201` | Canonical. Verified live. |
| `/alderman-ai-faq.md`, `/alderman-ai-faq-cz.md` | Markdown | — | `app/faq-download/page.tsx:76` | Shipped downloads. |

**Missing from the working tree** (present at `78f20ed`, staged as deleted — see
§ Notes on drift): `logos/alderman-ai-mark-transparent-v1.svg` (deprecated,
off-chord anyway), `logos/alderman-ai-wordmark-v2.svg` (**canonical inline
wordmark**), `photography/alex-portrait-still-human-v1.png`,
`scribbles/replace-retain-v2.svg`, `scribbles/human-approach-tagline-v1.svg`,
`scribbles/orange-scratch.svg`. The whole `scribbles/` folder is gone from disk.

### Two hard asset rules, carried over verbatim in intent

1. **Never reconstruct the logo — place the file.** Not from text spans, divs, CSS
   grid, positioned glyphs, hand-authored `<path>` data, or lookalike type; not as a
   placeholder meant to be swapped later. This holds off-site: *"Canva graphics place
   the asset, they do not redraw it."*
   (`public/brand-assets/README.md:21-29`; `components/chrome/StackedLogo.tsx:13-23`.)
2. **The stacked logo is the logo; the URL wordmark is second tier** — never a nav
   slot, footer, corner stamp, avatar, favicon or social lockup. Choose by ground:
   stacked SVG on dark, `alderman-ai-mark-v1.png` on light.
   (`public/brand-assets/README.md:15-36`.)

---

## Notes on drift

### Order of authority (the site's own, `alderman-ai/LOCAL-AGENTS.md` § "What to trust")

`code (.tsx + globals.css) > deployed site (alderman.ai) > site CLAUDE.md > verified
specs (desktop-spec.md, toolbox.md, mobile-order.md) > briefs/ > concept docs >
_deleted-2026-08-24/ archive (trust nothing)`.

Everything in this file is taken from rank 1 (code) except where a row says
otherwise; rank-4 specs are cited only as corroboration.

### Conflicts observed — reported, not resolved

1. **⚠ The working tree is not clean.** `git status --short` returns six staged
   deletions of `public/brand-assets/` files (both `scribbles/` items plus
   `orange-scratch.svg`, the wordmark v2 SVG, the transparent mark SVG and the
   still-human PNG). The entry doc's check #2 expects an empty status
   (`../EXTERNAL_SKILLS_START_HERE.md:103`) and says *"`main` is dirty. Stop; someone
   else is mid-edit."* HEAD itself is still `78f20ed`, so the token values above are
   unaffected — but **the canonical inline wordmark and every scribble asset are not
   currently on disk**. Escalate before relying on them; do not restore them (that is
   a write to a read-only source).

2. **Design-system typography card vs code.** The card sets the display role at
   weight 700 / `-0.04em` and h2 at weight **600** / `-0.02em`
   (`../design-system/cards/foundations/typography.html:39,41`). The code uses
   `font-bold` (**700**) with `tracking-display-tight` (−0.02em) for both h1 and h2
   (`components/sections/HeroSection.tsx:74`;
   `components/sections/TrialCTASection.tsx:33`). No shipped element uses
   `tracking-tightest` (−0.04em) at all. **Code wins**: h1/h2 = Barlow 700 at −0.02em.

3. **`brand-assets/README.md` says the mark PNG is `1000×1000`**
   (`public/brand-assets/README.md:59`). Measured on disk: **1181 × 1181**.

4. **`DESIGN.md` says the post-it carries "the two-layer `postit` shadow"**
   (`../design-system/DESIGN.md:184`). The `shadow-postit` token exists
   (`tailwind.config.js:60`) but has **zero call sites**; `Postit` uses two local
   `drop-shadow` filters at ~0.22 opacity instead
   (`components/special/Postit.tsx:143-152`). `../toolbox.md:38` records this
   correctly.

5. **`DESIGN.md` calls the IDE marker's brackets "neutral"**
   (`../design-system/DESIGN.md:181`). The code renders them `text-orange`
   (`components/special/SectionTile.tsx:261`), and `../toolbox.md:212` says
   *"Brackets are always orange."* Code wins.

6. **`DESIGN.md` says the App marker knob is a "small orange knob"**
   (`../design-system/DESIGN.md:181`). It is accent-colored, not fixed orange —
   `ACCENT_KNOB_BG` maps purple/orange/green
   (`components/special/SectionTile.tsx:128-132`).

7. **`display` and `body` are the same family.** Both resolve to `--font-barlow`
   (`tailwind.config.js:30-31`). Treat them as one family with two roles; do not
   assume a second face exists.

8. **Kalam / marker-script was never shipped.** The concept doc's post-it section
   describes it; the post-it sets both heading and body in Barlow
   (`alderman-ai/LOCAL-AGENTS.md` known-stale list;
   `components/special/Postit.tsx:255,260`). Do not reintroduce a script face.

9. **Two `globals.css` comments are wrong** (flagged in `../desktop-spec.md:51` and
   in `LOCAL-AGENTS.md`): the ≥1200 nav block describes a transparent nav that no
   longer exists, and a rule-line comment says 1px where the code correctly does
   **2px** (`app/globals.css:110-114`).

10. **`lib/tokens.ts` does not exist.** `tailwind.config.js:53` and
    `components/paper/PaperApp.tsx:91` both reference an `ambientGlow` export there;
    the PaperApp comment notes it was deleted in commit `1e0efa9`, and there is no
    `lib/` directory. `tailwind.config.js:53` is a stale pointer.

11. **`grid-cols-page` has zero call sites** (`tailwind.config.js:64`;
    `../toolbox.md:43`). The page column is a centered max-width, not a grid.
    `animate-bracket-blink` is likewise defined with no call site
    (`../toolbox.md:51`).

12. **Live-site cross-check (2026-09-02)**: `WebFetch` on https://alderman.ai
    returned the copy and the two asset paths above, but `next/font` inlines and
    hashes its `@font-face` rules so **no font family name or hex was observable in
    the fetched markup**. No drift detected; none could be, at that resolution. The
    site is up and serving the stacked logo and the still-human portrait.

---

## Machine block

```json
{
  "source.repo": "C:/Users/alder/Desktop/Claude Code Website/alderman-ai",
  "source.commit": "78f20ed",
  "source.retrieved": "2026-09-02",
  "source.tree_clean": false,

  "font.title.family": "Barlow",
  "font.title.weights": [300, 400, 500, 600, 700],
  "font.title.stack": "var(--font-barlow), system-ui, sans-serif",
  "font.title.size_px": 40,
  "font.title.line_height": 1.05,
  "font.title.letter_spacing_em": -0.02,
  "font.title.weight": 700,

  "font.heading.size_px": 28,
  "font.heading.line_height": 1.1,
  "font.heading.weight": 700,
  "font.heading.letter_spacing_em": -0.02,

  "font.body.family": "Barlow",
  "font.body.weights": [300, 400, 500, 600, 700],
  "font.body.stack": "var(--font-barlow), system-ui, sans-serif",
  "font.body.size_px": 18,
  "font.body.weight": 400,

  "font.caption.size_px": 11,
  "font.eyebrow.size_px": 11,
  "font.eyebrow.letter_spacing_em_ide": 0.12,
  "font.eyebrow.letter_spacing_em_app": 0.18,

  "font.mono.family": "JetBrains Mono",
  "font.mono.weights": [400, 500],
  "font.mono.stack": "var(--font-jetbrains-mono), ui-monospace, Menlo, monospace",
  "font.mono.size_px": 22,
  "font.mono.size_px_desktop": 30,

  "color.ide": "#272822",
  "color.ide-2": "#1E1F1A",
  "color.ide-surface": "#3E3D32",
  "color.ide-rule": "#3A3B33",
  "color.ide-fg": "#F8F8F2",
  "color.ide-fg-dim": "#B0AFA7",
  "color.ide-fg-mute": "#75715E",
  "color.paper": "#F6F4EE",
  "color.paper-2": "#EDEAE0",
  "color.ink": "#1C1C1A",
  "color.ink-soft": "#5A5A54",
  "color.ink-faint": "#A19F96",
  "color.orange": "#FD971F",
  "color.green": "#A6E22E",
  "color.purple": "#AE81FF",
  "color.orange-deep": "#D67100",

  "radius.paper": "14px",
  "radius.tile": "7px",
  "radius.postit-curl": "60px",

  "space.gutter-mobile": "12%",
  "space.gutter-extension": "39px",
  "space.flow-gap": "80px",
  "space.terminal-inset": "21px",
  "space.column-bottom": "60px",
  "space.paper-body": "32px 40px",
  "space.chrome-height": "40px",

  "width.column-mobile": "400px",
  "width.column-desktop": "550px",
  "width.card-cap": "304px",
  "width.postit": "240px",
  "width.border-rule": "2px",

  "breakpoint.tailwind-md": "1000px",
  "breakpoint.desktop-spec": "768px",
  "breakpoint.wide": "1200px",

  "shadow.paper-glow": "3px 3px 0 0 rgba(117,113,94,0.80), 8px 10px 24px rgba(253,151,31,0.55), 16px 18px 40px rgba(253,151,31,0.20), 28px 38px 80px rgba(0,0,0,0.50)",
  "shadow.cta-glow": "0 0 28px rgba(<accent>,0.45)",

  "asset.logo.primary": "/brand-assets/logos/alderman-ai-stacked-logo-v1.svg",
  "asset.logo.primary.aspect": 0.658,
  "asset.logo.light-ground": "/brand-assets/logos/alderman-ai-mark-v1.png",
  "asset.portrait.circle": "/brand-assets/photography/still-human-circle-portrait.svg",
  "asset.portrait.headshot": "/brand-assets/photography/alex-headshot-full-v1.jpg",

  "chord.logo": ["purple:>", "purple:_", "green:al", "white:der", "orange:man"],
  "chord.wordmark": ["purple:alder", "orange:man", "purple:.", "green:ai"]
}
```
