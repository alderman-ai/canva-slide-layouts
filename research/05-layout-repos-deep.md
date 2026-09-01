# 05 · Harvest-grade HTML slide layout sources, deep sweep

- Date: 2026-09-02
- Source: research agent (web + GitHub API via `gh`), planning session
- Focus: best open-source repos of HTML/CSS slide templates and frameworks to harvest into a 1920x1080 layout library; AI generators with layout catalogs; Claude Code skill repos; Canva wire-format evidence
- Caveats declared by the report: star counts as of 2026-09-01; several repos have no license (need author permission before redistribution); AGPL/GPL repos are quarantined
- Known list at the time (not re-reported): likaku/Mck-ppt-design-skill, op7418/guizang-ppt-skill, lewislulu/html-ppt-skill, zarazhangrui/frontend-slides, zarazhangrui/beautiful-html-templates, archlizheng/frontend-slides-editable, Slidev built-in layouts, anthropics/skills pptx, mrigankad/SlideArchitect, 1weiho/open-slide, icgma/slide-skill, Kuneosu/make-slide, danny0926/ppt-skills, marp-core, reveal.js core (see research/02)

---

# Harvest-grade HTML slide layout sources — research report (2026-09-02)

Method: GitHub API (`gh`) for stars/pushed/license and file trees, plus web fetches of theme galleries and curated lists. Star counts are as of 2026-09-01. Format legend: **ABS** = fixed 1920×1080 (or other fixed px) canvas with absolute/scaled stage; **FLEX** = flow/flex/grid, no fixed canvas; **PPTX** = geometry lives in PowerPoint/python-pptx/pptxgenjs, not HTML.

---

## 1. WebSlides — https://github.com/webslides/WebSlides
6.3k stars · MIT · **effectively dead (last push 2022-12-10)** · FLEX (100vh `<section>`s, responsive)
Layout system is SCSS modules, not named slide layouts: `flexblock` + 9 variants (`activity, clients, features, gallery, metrics, plans, reasons, specs, steps`), `grid`, `cards` (card-50/40), `slides-bg` (background image/video), `quotes`, `toc`, `header-footer`, `longform`, `zoom`, `promos`, `tables`, `avatars/badges/browser`. Demos: `keynote, landings, portfolios, longforms, interviews, classes, media, netflix-culture, components, why-webslides`.
**Why harvest:** the `keynote.html` and `netflix-culture.html` demos are still a good catalogue of Apple-keynote-ish compositions (big-number, 50/50 text-image, full-bleed with caption, 3-up metrics, pricing plans). Structures must be re-boxed to 1920×1080 by hand. Medium value; MIT is clean.

## 2. Slidev theme gallery — layouts each theme adds beyond built-ins
Built-in default/seriph set = `cover, fact, intro, quote, section, statement` (+ core `two-cols, image-left/right, iframe, center, end`). Themes that contribute *distinct* layouts (from each repo's `layouts/` dir):

| Theme (repo) | Stars / lic | Added layout names |
|---|---|---|
| **tahta** (zcag/tahta) | 125 · MIT · active | `agenda, bigtype, bleed, chart, code-explain, columns, compare, define, diagram, embed, end, feature, image, lead, logos, metric, panels, reference, showcase, stats, steps, timeline, two-cols` — 30 layouts, 13 visual variants, WCAG-AA. **Best Slidev layout catalogue by far.** |
| **scholarly** (jxpeng98) | 36 · MIT | 34: `agenda, compare, experiment-grid, method-pipeline, related-work-matrix, result-highlight, split-image, timeline, toc, paper-summary, defense-question…` (academic but structurally rich) |
| **kalouk** (fabianabarca) | 52 · none | 31: `grid, chart, plot, steps, quiz, two-cols-header, iframe-left/right, image-left/right, equation, code…` |
| **neversink** (gureckis) | 161 · MIT | `four-cell, side-title, top-title, top-title-two-cols, two-cols-title, credits, full` |
| **apple-basic** (official) | MIT | `3-images, bullets, image-right, intro-image, intro-image-right` |
| **vuetiful** (LinusBorg) | 76 · MIT | `big-points, full-image, gridbase, outro, video` |
| **penguin** (alvarosabu) | 215 | `text-image, text-window, two-thirds, new-section, presenter` |
| **gemini** (leochiu-a) | 30 | `cards, list, table, timeline, topics, two-cols-header` (cinematic cover-led) |
| **unicorn** (Dawntraoz) | 80 | `cover-logos, image-center, table-contents, new-section` |
| **shibainu** (official) | MIT | `default-2…7, section-2/3, right, center` (numbered variants) |
| **light-icons** | 67 | `center-image, dynamic-image, image-header-intro` |
| **academic** | 170 · MIT | `figure, figure-side, index, table-of-contents` |
| **dracula** | 161 | `author, image-left, image-right` |
| **the-unnamed** | 69 · MIT | `about-me, two-cols` |
| **touying** | 7 · MIT | `focus, outline` |
| geist, purplin, frankfurt, eloc, bricks, hep, prussianblue | — | ≤4 layouts, nothing new (geist = `cover, split`; frankfurt = `cover, intro`; eloc = `default` only) |

All Slidev layouts are Vue + UnoCSS FLEX inside a 980×552 (scaled) stage — geometry is proportional, easy to re-express at 1920×1080. Harvest tahta, scholarly, neversink, apple-basic, kalouk.

## 3. Older framework ecosystems — verdict
- **reveal.js** (72k, MIT): core has no layout catalogue (`r-stack, r-fit-text, r-stretch` only). `rajgoel/reveal.js-plugins` (815, MIT) are behaviour plugins, not layouts. Corporate themes found (`palantirnet/palantir-reveal` with `l-2up/3up/4up`, `AnneTee/reveal-js-themes`) are 2015–16 and thin. **Skip.**
- **impress.js** (38k, MIT): 3D positioning, no layout library. **Skip.**
- **bespoke.js** (4.8k, MIT, dead 2020), **Fusuma** (5.4k, no license file, dead 2024), **remark** (13k, MIT, dead 2024), **Shower** (4.9k; `ribbon`/`material` themes with `cover, shout, grid` classes only). **Skip.**
- **Spectacle** (10k, MIT, 2026-04): `FlexBox/Grid/Box` primitives + `Slide` templates — no named layouts. **mdx-deck** (11.5k, dead 2023): `Invert, Split, SplitRight, FullScreen, Horizontal`. **Skip.**
- **nodeppt** (10k, MIT, dead 2021): 9-position `.background-*` grid and WebSlides-derived classes — superseded by WebSlides itself.
- **animotion** (1.7k, MIT, Svelte, active) — animation-first, no layout catalogue.

## 4. GitHub search finds: fixed-canvas HTML libraries
- **dreamid27/frontend-slides** — https://github.com/dreamid27/frontend-slides · 4 stars · MIT · 2026-07 · **ABS 1920×1080**. Fork of zarazhangrui/frontend-slides adding **88 style-agnostic `layout-presets/**/layout.md` + `preview.html`** grouped: opening (13: `atlas, corner-weight, dossier, half-plate, horizon, masthead, monolith, offset-marquee, poster-stack, spine, split-ledger…`), section (7), list (7), stats (7: `bar-ledger, denominator, keynote-figure, number-story, ratio-split, stat-strip, ticker`), chart (16), closing (13), video (5), quote (2), comparison (2), timeline (2), image (2), agenda, pricing, team, roadmap, risk, spec, gallery, qa, prose, case, definition, process. Each preset "fixes where everything sits and how big it is on the 1920×1080 stage". **This is exactly the deliverable you're building — highest harvest value found.**
- **Jorin1222/html-slides-skill** — 0 stars · MIT · 2026-07 · **ABS 1920×1080** (`#deck{width:1920px;height:1080px}` scaled stage). 12 standalone template files: `cover, section-header, two-column, cards, demo-code, closing, agenda, stats, outline-dark, pain-cards, before-after, cases-accordion`. Small but clean, single-file each.
- **FluidForm-ai/fluiddocs-deck-builder** — 29 · MIT · 2026-06 · FLEX single-file decks. 8 full reference decks: `airbnb, anthropic, sequoia-classic, stripe, keynote-default, launch-default, sales-default, all-hands-default`, each with typed slide classes (`s-cover, s-problem, s-whynow, s-how, s-demo, s-customers, s-pricing, s-roadmap, s-team, s-cta`). Pitch/launch narrative structures worth harvesting; geometry is flex.
- **niujingjingbfsu/slides-design-systems** (0 · MIT · 2026-08): 20 zero-dependency single-file decks (`noir, brutal, neon, memphis, deco, ukiyo-e, mineral-strata…`) plus `DESIGN_SYSTEMS.md`. **ChenChen913/html-presentation-v1** (0 · MIT): 20 templates × 10 pages. Both look like beautiful-html-templates derivatives; low priority but cheap to scan.
- **v0id-byte/peg-design-system** (8 · MIT): type-led data-deck system with `SlideAtoms.jsx`, `FlowBand`, `PegLine` React components — good for stat/flow-band layouts.
- Topic searches `presentation-template`, `slide-deck`, `pitch deck html`, `astro slides`, `sveltekit presentation` returned nothing above these (mostly Beamer/personal decks).

## 5. Open-source AI generators — do they ship a layout library?
| Repo | Stars · lic · pushed | Layout library? | Format |
|---|---|---|---|
| **hugohe3/ppt-master** | 51k · MIT · 2026-08 | **Yes — `templates/layouts/*/layouts_index.json`**: `presentation_core` (20 page types: `title_slide, two_content, comparison, content_caption, picture_caption, hero_statement, editorial_split, three_card, kpi_dashboard, process_timeline, data_story, two_picture_caption, screenshot_focus, chart_insight, table_summary…`), `editorial_bleed` (10: `hero_full, hero_side_scrim, split_bleed, quote_over_image, triptych, image_grid_four, full_statement…`), `report_core` (13), `presentation_core_43` (16), `moments_square`, `xiaohongshu_post`; plus 12 `styles/` (consulting-decision, investor-pitch, product-launch, narrative-keynote…) and 33 chart + 6 table templates | SVG → PPTX (geometry in SVG/JSON, brand-neutral "structure-only") |
| **presenton/presenton** | 10k · Apache-2.0 · 2026-08 | Yes — `layouts.json` (14 named React/Tailwind layouts per template: `business_proposal_cover, content_index, about_us, goals_objectives, annual_earnings, our_services, strategy, project_cards, contact_us…`) + `templates/v2` schema; themes general/modern/classic/professional | HTML/Tailwind TSX (FLEX, fixed aspect) |
| **allweonedev/presentation-ai** | 3k · MIT · 2026-06 | No named layout library — theme/font/background system over a Plate editor | React |
| **Anionex/banana-slides** | 15.5k · **AGPL-3.0** · 2026-09 | No — image-generation templates (upload a reference image); per-page template matching | image/PPTX |
| **icip-cas/PPTAgent** | 5k · MIT · 2026-08 | Reference-deck induction (`templates/{default,beamer,cip,hit,thu}/slide_induction.json`) — learned schemas, not an authored catalogue | PPTX |
| **PresentAgent / -2** (AIGeeksGroup) | research | No layout library (video pipeline) | — |
| **AutoPresent** (para-lost) | research | `SlidesLib` = python-pptx helper functions (`add_title`, `add_bullet_points`), no geometry library | PPTX |
| **barun-saha/slide-deck-ai** (SlideDeck AI) | 373 · MIT | 3–4 pptx templates, JSON schema | PPTX |
| **chuspeeism/dashi-ppt-skill** | 7.2k · **AGPL** · 2026-07 | 12 compiled theme runtimes + `template-swiss.html`; layouts are inside minified `themeNN.module.mjs` — hard to harvest, AGPL | HTML → PPTX |
| **nexu-io/open-design** | 93k · Apache-2.0 | Deck framework prompt + `qa/deck-layout.ts`; no data-document-role, no static layout catalogue found | HTML |
| **JimLiu/baoyu-design** | 3.8k · MIT | Design skill; deck via pptxgenjs, no named layout list | PPTX |
| **veasion/AiPPT** (1.9k, GPL-3) and **SmartSchoolAI/ai-to-pptx** (1.5k, GPL-3) | — | JSON pptx templates; GPL — avoid | PPTX |
| Converters: **Hasasasa/html-to-editable-pptx** (59, MIT), **g21589/PPTX2HTML** (635, MIT, 2017), **yanliudesign/html-to-ppt** (1920×1080 → PPTX, MIT) | — | tooling only | — |

## 6. Skill repos (2025–26) with real layout catalogues (beyond your known list)
- **Akxan/ppt-agent-skill** — 140 · MIT · 2026-05. `references/layouts/`: `asymmetric, hero-top, l-shape, mixed-grid, primary-secondary, single-focus, symmetric, t-shape, three-column, waterfall` + page templates `cover, toc, section, end`; 26 styles benchmarked to Linear/Anthropic/Stripe. Compositional grammar, HTML.
- **WayneZhon/KingDee-PPT-Skill** — 56 · MIT · 2026-06. 29 numbered layouts (要点列表, 数据卡片, 左右对比, 横向流程, 图文并排, 时间轴, 数据看板, Bento Grid, 架构生态, 分层矩阵, 金句, 全出血图文, Bento超大焦点, Icon Row, Half-Bleed Overlay, Floating Stats, Before/After…) — **but geometry is python-pptx (PPTX)** with an `html-bento-template.md` companion.
- **SlideSpeak/slide-design-skill** — 17 · MIT · 2026-06. 8 domain skills each with `layout-grammar.md` (consulting: `cover, executive-summary, section-divider, content-3col, content-2col-image, data-callout, framework-2x2, process-flow, comparison-table, closing`; pitch: `problem, market, solution, why-now, traction, business-model, gtm, customers, team, competition, ask`) + `tokens.json`, `chrome.css`. Slot-based, consulting-grade — good taxonomy source.
- **alchaincyf/huashu-design** — 23.8k · MIT. 20 PPT "design styles" and scene templates, but **no geometric layout catalogue** (style prose only).
- **nicobailon/visual-explainer** (9.6k, MIT), **Kuneosu/make-slide** (known), **gongnyang/deck-factory** (75, MIT, dark-editorial), **appautomaton/presentation** (56, no license; pptxgenjs masters `COVER/CONTENT/DIVIDER/CLOSER` only), **Jane-xiaoer/paper-collage-ppt** (60, MIT, 20 layouts in `references/layouts.md`, collage style), **lainshao/modern-ppt** (8, AGPL, 12 layouts in one `template.html`), **yuebinzhang77-hub/yb-slide-skill** (13 layouts, Nothing-style, no license) — secondary.
- Curated lists to monitor: **ToseaAI/awesome-html-slide-skills** (133), **brycewang-stanford/many-ppt-skills** (auto-refreshed, ~120 repos), **cosen1024/awesome-presentation-skills**.

## 7. Canva import / `data-document-role`
Canva's HTML import (help page) only auto-converts to an editable *Presentation* when the file is a Claude Design slide deck; otherwise it lands as a "Code design". GitHub code search shows the wire format is simply `<section data-document-role="page" data-label="…">` with a fixed-px page (`width:1920px` in Devlabs-club/website `public/pitchdeck-canva/`, `1600×900` in hs150521/Endfield-PPT-Template). No public repo documents the attribute officially; 117 HTML files use it, all one-off exports. Best structured example: **hs150521/Endfield-PPT-Template** (10 named pages: `Cover, Agenda, Section Divider, Content, Image and Text, Data Overview, Comparison, Timeline, Quote, Closing`; no license). Nothing else worth cloning — treat `data-document-role="page"` + `data-label` + fixed-px section as the target spec your library should emit.

---

## Top-15 ranking for harvest value
1. **dreamid27/frontend-slides** — 88 fixed 1920×1080 layout presets with previews, MIT.
2. **hugohe3/ppt-master `templates/layouts`** — 60+ structure-only page types across 6 systems, JSON-indexed, MIT.
3. **zcag/tahta** — 30 typography-forward Slidev layouts, MIT.
4. **jxpeng98/slidev-theme-scholarly** — 34 layouts (matrix/grid/pipeline compositions), MIT.
5. **FluidForm-ai/fluiddocs-deck-builder** — 8 pitch/launch/keynote narrative decks with typed slide classes, MIT.
6. **presenton/presenton** — 14-layout React templates × 4 themes, Apache-2.0.
7. **Jorin1222/html-slides-skill** — 12 clean 1920×1080 single-file templates, MIT.
8. **Akxan/ppt-agent-skill** — 10 compositional grammars + 4 page templates, MIT.
9. **SlideSpeak/slide-design-skill** — consulting/pitch slot grammars + tokens, MIT.
10. **gureckis/slidev-theme-neversink** — column/title-position variants, MIT.
11. **fabianabarca/slidev-theme-kalouk** — 31 layouts incl. chart/grid/steps (no license — verify).
12. **WebSlides** — keynote/landing demos and flexblock variants, MIT (dead).
13. **WayneZhon/KingDee-PPT-Skill** — 29 named layouts (PPTX geometry, needs porting), MIT.
14. **slidevjs/themes (apple-basic, shibainu)** — image-led variants, MIT.
15. **niujingjingbfsu/slides-design-systems** + **ChenChen913/html-presentation-v1** — 40 single-file decks to mine for compositions, MIT.

## Clone first (5)
1. `github.com/dreamid27/frontend-slides` (only `layout-presets/`)
2. `github.com/hugohe3/ppt-master` (sparse: `skills/ppt-master/templates/layouts`, `styles`)
3. `github.com/zcag/tahta` (`packages/theme/layouts`)
4. `github.com/jxpeng98/slidev-theme-scholarly` (`layouts/`)
5. `github.com/FluidForm-ai/fluiddocs-deck-builder` (`templates/`)

Avoid or quarantine for licensing: banana-slides, dashi-ppt-skill, guizang-ppt-skill, modern-ppt (AGPL); veasion/AiPPT, ai-to-pptx (GPL); kalouk, KingDee-style zero-license repos need author permission before redistribution.

Sources: [WebSlides](https://github.com/webslides/WebSlides) · [Slidev theme gallery source](https://raw.githubusercontent.com/slidevjs/slidev/main/docs/.vitepress/themes.ts) · [tahta](https://github.com/zcag/tahta) · [scholarly](https://github.com/jxpeng98/slidev-theme-scholarly) · [dreamid27/frontend-slides](https://github.com/dreamid27/frontend-slides) · [ppt-master](https://github.com/hugohe3/ppt-master) · [presenton](https://github.com/presenton/presenton) · [fluiddocs-deck-builder](https://github.com/FluidForm-ai/fluiddocs-deck-builder) · [Jorin1222/html-slides-skill](https://github.com/Jorin1222/html-slides-skill) · [Akxan/ppt-agent-skill](https://github.com/Akxan/ppt-agent-skill) · [SlideSpeak/slide-design-skill](https://github.com/SlideSpeak/slide-design-skill) · [KingDee-PPT-Skill](https://github.com/WayneZhon/KingDee-PPT-Skill) · [awesome-html-slide-skills](https://github.com/ToseaAI/awesome-html-slide-skills) · [many-ppt-skills](https://github.com/brycewang-stanford/many-ppt-skills) · [tosea.ai/slide-skills](https://tosea.ai/slide-skills) · [banana-slides](https://github.com/Anionex/banana-slides) · [PPTAgent](https://github.com/icip-cas/PPTAgent) · [AutoPresent](https://github.com/para-lost/AutoPresent) · [PresentAgent](https://github.com/AIGeeksGroup/PresentAgent) · [slide-deck-ai](https://github.com/barun-saha/slide-deck-ai) · [Canva Import HTML](https://www.canva.com/help/import-html/) · [Endfield-PPT-Template](https://github.com/hs150521/Endfield-PPT-Template) · [palantir-reveal](https://github.com/palantirnet/palantir-reveal) · [open-design](https://github.com/nexu-io/open-design)
