# spec/brand-sources.md — provenance for the alderman.ai brand extraction

**Read this when**: you are about to trust a value in `spec/tokens.md`, when you need
to know which source wins in a disagreement, or before any session that touches brand
work against the operator's website. It records where every token came from, how
fresh it is, and how to tell when it has gone stale.

- **Extraction date**: 2026-09-02
- **Extracted by**: read-only pass over the site codebase; nothing was written,
  staged, created or deleted under `Claude Code Website\`.
- **Output**: `spec/tokens.md` (this file's companion).
- **Governing decision**: `docs/DECISIONS.md` row 6 — *"Brand source is read-only."*

---

## Commit observed

```
git -C "C:\Users\alder\Desktop\Claude Code Website\alderman-ai" rev-parse --short HEAD
→ 78f20ed                                        ✅ matches the pinned baseline

git -C "C:\Users\alder\Desktop\Claude Code Website\alderman-ai" status --short
→ D  public/brand-assets/logos/alderman-ai-mark-transparent-v1.svg
  D  public/brand-assets/logos/alderman-ai-wordmark-v2.svg
  D  public/brand-assets/photography/alex-portrait-still-human-v1.png
  D  public/brand-assets/scribbles/human-approach-tagline-v1.svg
  D  public/brand-assets/scribbles/orange-scratch.svg
  D  public/brand-assets/scribbles/replace-retain-v2.svg
                                                 ❌ expected empty
```

### ⚠️ HEAD matches; the working tree does not

**HEAD is `78f20ed`**, exactly the pinned baseline, so every typography, color,
spacing and component value in `spec/tokens.md` is read from the intended commit and
is trustworthy.

**But the tree is dirty**, which the site's own check #2 says is a stop condition
(`EXTERNAL_SKILLS_START_HERE.md:103` — *"`main` is dirty. Stop; someone else is
mid-edit."*). Six brand assets that exist at `78f20ed` have been staged for deletion
and are gone from disk, including the **canonical inline wordmark**
(`alderman-ai-wordmark-v2.svg`) and the entire `scribbles/` folder
(`replace-retain-v2.svg`, `human-approach-tagline-v1.svg`, `orange-scratch.svg`).

Consequences for this project:

- Token extraction proceeded — no code file was affected by the deletions.
- **Do not plan a slide element around the inline wordmark or any scribble** until
  the operator says what happened to them. They are recoverable from the commit, but
  recovering them is a write to a read-only source and is therefore the operator's
  call, not ours.
- This was not resolved, only reported, per the visitor rule: *"If a task appears to
  need one of the 'may not' items, that is a decision for the operator, not for you."*

---

## Provenance table

Rank = order of authority (1 wins). Ranks 1–7 are the site's own ordering, quoted
from `alderman-ai/LOCAL-AGENTS.md` § "What to trust".

| Rank | Source path | Commit / date | What was taken from it |
|---|---|---|---|
| 1 | `alderman-ai/app/layout.tsx` | `78f20ed` · 2026-09-02 | Font families, the five Barlow + two JetBrains Mono weights, `--font-barlow` / `--font-jetbrains-mono` variable names, `display: swap`, the `--scrollbar-width` runtime script |
| 1 | `alderman-ai/tailwind.config.js` | `78f20ed` · 2026-09-02 | All 15 named colors; the three `fontFamily` tokens; `letterSpacing` (`tightest`, `display-tight`); `borderRadius` (`paper` 14, `tile` 7); `boxShadow` (`paper-glow` 4-layer, `postit`); `screens.md = 1000px`; `gridTemplateColumns`; the seven keyframe/animation cadences |
| 1 | `alderman-ai/app/globals.css` | `78f20ed` · 2026-09-02 | `:root` variables (`--gutter-mobile`, `--page-half`, `--font-terminal`); the `.desktop-spec` knobs (`--font-terminal: 30px`, `--gutter-extension: 39px`, `--prompt-offset: -60px`); the 768 / 1200 / max-767 tiers; column widths 550 and the 304 cap; the 80px flow rhythm; the purple gutter-glow gradient recipe; the desktop type bumps |
| 1 | `alderman-ai/components/paper/PaperApp.tsx` | `78f20ed` · 2026-09-02 | Full prop surface; chrome-strip geometry (`h-10 px-5`, `border-b border-ink-faint/30`); the opalescent 105° chrome gradient stops; accent-dot defaults (11px, purple/orange/green, 80% opacity); default body padding `px-8 py-10` |
| 1 | `alderman-ai/components/special/Postit.tsx` | `78f20ed` · 2026-09-02 | Prop surface; `SIZE 240`, `CORNER_RADIUS 60`; body and curl gradients; the two `drop-shadow` filters; the ±5° tilt convention; heading 34px / body 20px type |
| 1 | `alderman-ai/components/special/SectionTile.tsx` | `78f20ed` · 2026-09-02 | Both variant anatomies; the IDE/App accent gradients; eyebrow, title and marker type; orange brackets; accent knob map; 2px border, `px-5 py-3` |
| 1 | `alderman-ai/components/special/TerminalLine.tsx` | `78f20ed` · 2026-09-02 | Twenty-prop surface and its defaults (`startDelayMs 1060`, `charDelayMs 27`, `promptColor`/`cursorColor` = `text-purple`, `fontSize = var(--font-terminal)`); hanging-prompt geometry |
| 1 | `alderman-ai/components/chrome/StackedLogo.tsx` | `78f20ed` · 2026-09-02 | Logo asset path, `STACKED_LOGO_ASPECT = 249.75/379.5`, `height`/`boxed`/`alt` props, the never-reconstruct rule, the logo color chord |
| 1 | `alderman-ai/components/chrome/UrlWordmark.tsx` | `78f20ed` · 2026-09-02 | The four-segment URL wordmark chord; mono 16px default; the "second tier, never the logo" rule |
| 1 | `alderman-ai/components/chrome/{Footer,SideNav,FloatingNav,navItems}.tsx` | `78f20ed` · 2026-09-02 | Footer type sizes and chord; nav tile class (`display 700 20px ink right`); the orange-utility / purple-primary gradient + hover pairs; side-nav 300/200/192px geometry |
| 1 | `alderman-ai/components/layout/PageFrame.tsx` | `78f20ed` · 2026-09-02 | 400px baseline column, `mx-auto`, the nested 12% gutter, "not a grid" |
| 1 | `alderman-ai/components/sections/{Hero,WhatYouGet,TrialCTA}Section.tsx` | `78f20ed` · 2026-09-02 | Per-role type sizes (h1 40, h2 28, h3 18, lead 18); the triptych palette; composition patterns |
| 1 | `alderman-ai/components/special/FaqChat.tsx` | `78f20ed` · 2026-09-02 | Chat bubble / input-pill / empty-state type sizes; the purple chevron SVG |
| 1 | `alderman-ai/app/{page,about/page,contact/page,faq/page,faq-download/page}.tsx` | `78f20ed` · 2026-09-02 | Per-route h1/h2/lead sizes and line-heights; asset reference paths |
| 1 | `alderman-ai/public/brand-assets/README.md` | `78f20ed` · 2026-09-02 | Logo hierarchy, the never-reconstruct-place-the-file rule, asset status/deprecations, versioned-filename convention |
| 1 | `alderman-ai/public/brand-assets/{logos,photography}/*` | `78f20ed` · 2026-09-02 (measured on disk) | Formats, intrinsic sizes, viewBoxes |
| 2 | https://alderman.ai | fetched 2026-09-02 | Confirmed the site is live and serves `/brand-assets/logos/alderman-ai-stacked-logo-v1.svg` and `/brand-assets/photography/still-human-circle-portrait.svg`. **No font family or hex was observable** — `next/font` inlines and hashes its `@font-face` rules |
| 3 | `Claude Code Website/CLAUDE.md` | not read this pass | Rules only; superseded for visitors by `EXTERNAL_SKILLS_START_HERE.md` |
| 3 | `Claude Code Website/EXTERNAL_SKILLS_START_HERE.md` | written 2026-08-27 | The visitor rules restated below; the five pre-trust checks; the "codebase is `alderman-ai/`, not the root" correction |
| 3 | `alderman-ai/LOCAL-AGENTS.md` | untracked, 2026-08-25 | The order of authority; the freshness table; the known-stale list (briefs, faq.md, the Kalam/post-it supersession, the two wrong `globals.css` comments) |
| 4 | `Claude Code Website/toolbox.md` | 2026-08-24 | Corroboration only: the CSS-variable list, the three-breakpoint warning, per-component codified sizes, the `shadow-postit`-unused and `grid-cols-page`-unused notes |
| 4 | `Claude Code Website/desktop-spec.md` | 2026-08-24 | Corroboration only: column 550, gutter inlay marks at ±39, the 80/80 H1 frame, the compositional left/right/center rhythm, the 2px-not-1px correction |
| 4 | `Claude Code Website/mobile-order.md` | 2026-08-24 | Not needed this pass (per-page mobile element order) |
| 6 | `Claude Code Website/design-system/DESIGN.md` | 2026-08-24 | Corroboration of the color table and font families; **four disagreements with code** logged in `spec/tokens.md` § Notes on drift |
| 6 | `Claude Code Website/design-system/cards/foundations/{typography,colors,elevation}.html` | 2026-04-30 → 2026-08-24 | Corroboration of the Google-Fonts weight sets, the `paper-glow` / `postit` shadow strings and the 14/7px radii; **one typography disagreement** (h2 weight 600 vs code's 700) logged as drift |
| 7 | `Claude Code Website/_deleted-2026-08-24/`, `briefs/`, `os-model-concept.md` | — | **Not read. Not trusted.** |
| — | `Canva templates/research/09-session-probes.md:36-38` | 2026-09-02 | Independent confirmation that the Claude Design project ships Barlow 300–700 and JetBrains Mono 400/500 woff2, in the same five component groups |
| — | `Canva templates/research/10-brand-source-notes.md` | 2026-09-02 | The extraction brief this pass executed |

---

## Order of authority

Quoted from `alderman-ai/LOCAL-AGENTS.md` § "What to trust", and binding on this
project's brand work:

1. **The code in this repo** — `.tsx` files and `app/globals.css`. Ultimate truth for
   what exists, what props a component takes, and what actually renders.
2. **The deployed site** — https://alderman.ai. Truth for what shipped.
3. **`CLAUDE.md`** (the site's) — truth for rules, permissions, settled decisions.
4. **Verified specs** — `desktop-spec.md`, `toolbox.md`, `mobile-order.md`. Truth for
   intent and vocabulary.
5. **Briefs** — `briefs/`. Truth for what a page is *for*. Copy may lag code.
6. **Concept docs** — `os-model-concept.md`, and `design-system/` in practice.
   Direction only; explicitly superseded in places.
7. **`_deleted-2026-08-24/`** — archive. Trust nothing in it.

Where this project's own files disagree with the source, the source wins and
`spec/tokens.md` must be re-derived — never patched to match a slide.

---

## Drift-detection rule

`spec/tokens.md` is a **snapshot of `78f20ed`**, not a live mirror. It goes stale
silently. Re-run the extraction whenever any of the following is true:

```
git -C "C:\Users\alder\Desktop\Claude Code Website\alderman-ai" rev-parse --short HEAD
```

- **≠ `78f20ed`** → the pin moved. **Halt and tell the operator; do not re-pin
  yourself** (`EXTERNAL_SKILLS_START_HERE.md:102`). Once they rule, re-extract in full
  and bump the commit in both spec files.
- **= `78f20ed`** but `git status --short` is non-empty → the tree is dirty. Token
  values from tracked source files are still valid; **asset availability is not**.
  Re-check `public/brand-assets/` before citing any asset. This is the condition that
  held on 2026-09-02.
- Either way, re-run before: authoring a new brand-bearing layout, building anything
  in `components/slides/`, a Design Sync push, or a bundle publish.

Record the check in `docs/WORKLOG.md` with the SHA observed, so the snapshot's age is
always visible. Both checks are read-only and safe to run from any cwd.

Cheap sanity check on the four values most likely to move:

```
grep -n "Barlow\|JetBrains" <repo>/app/layout.tsx          # families + weights
grep -n "orange:\|green:\|purple:" <repo>/tailwind.config.js   # the accent chord
grep -n "paper:\|tile:" <repo>/tailwind.config.js              # radii
grep -n "font-terminal" <repo>/app/globals.css                 # 22 / 30
```

---

## Visitor rules — the five that bind this project

1. **Read only.** Never create, modify, stage or delete anything under
   `C:\Users\alder\Desktop\Claude Code Website\`. Extraction copies values out; it
   never writes back.
2. **Never touch `alderman-ai/.rt/`.** It is a live git worktree (branch
   `rt/2026-08-24` at `78f20ed`) that external tooling depends on — do not delete,
   prune, hand-edit or mistake it for a stale clone.
3. **Never create anything under `components/`**, never run `npm`, `vercel` or
   `vercel --prod` there, and never `git add` outside this repo.
4. **Only two git commands are permitted there**, both read-only:
   `git -C <repo> rev-parse --short HEAD` and `git -C <repo> status --short`. Never
   re-pin the baseline SHA yourself.
5. **If a task appears to need a forbidden action, stop and say what was needed.**
   That is the operator's decision, not ours — as it was for the six deleted brand
   assets recorded above.
