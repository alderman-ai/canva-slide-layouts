# 02 · Layout repos, first sweep; 62-archetype baseline; grid and type conventions

- Date: 2026-09-01
- Source: research agent (web), planning session
- Focus: open-source repos and resources to harvest for 1920x1080 slide layouts; a consolidated archetype list; grid and type conventions
- Caveats declared by the report: Canva import finding is from the Help page (later superseded by research/07); the 62-archetype list was later extended by research/03
- Superseded in part by: research/05 (deeper repo sweep with licenses and clone-first list)

---

## Ranked resources (most useful first)

1. **likaku/Mck-ppt-design-skill** — https://github.com/likaku/Mck-ppt-design-skill — The most complete archetype catalog found: 67 named layout methods in 13 families (`references/framework/engine-api.md`) plus `references/layout-matrix.yaml` giving per-layout **character budgets** (title 40, bullets 50, milestone label 8, etc.) — directly reusable as wrap-width rules. python-pptx, so geometry must be read from code. **Apache-2.0.**
2. **op7418/guizang-ppt-skill** — https://github.com/op7418/guizang-ppt-skill — `references/layouts-swiss.md` documents 22 named layouts (S01–S22: Cover, Statement, KPI Tower, Duo Compare, Loop Diagram, Image Matrix, Stacked Ledger, Image Hero, Closing Manifesto…) with explicit structure and a 16-column grid (`gap:16px`, padding `5.6vh 5vw 4.4vh`), plus 10 editorial layouts in `references/layouts.md` with grid ratios (7/5, 6/6, 8/4). Uses vw/vh units — convert to px at 1920×1080. **AGPL-3.0** (copyleft; harvest structure ideas, don't copy code).
3. **lewislulu/html-ppt-skill** — https://github.com/lewislulu/html-ppt-skill — 31 named single-page layouts (cover, toc, section-divider, bullets, two/three-column, big-quote, stat-highlight, kpi-grid, table, timeline, roadmap, comparison, pros-cons, gantt, image-hero, image-grid, chart-*, process-steps, cta, thanks). Flow-based HTML, not fixed artboard. **MIT.**
4. **zarazhangrui/frontend-slides** + **beautiful-html-templates** + **archlizheng/frontend-slides-editable** — https://github.com/zarazhangrui/frontend-slides, https://github.com/zarazhangrui/beautiful-html-templates, https://github.com/archlizheng/frontend-slides-editable — Fixed **1920×1080 stage** with transform scaling, no reflow; `html-template.md` gives a concrete type scale (title 112px / subtitle 34px / body 28px, slide padding 72px, gap 32px). The editable fork uses **absolute-positioned `[data-slide-object]`** elements on the same canvas — closest analog to a Canva page model. 34 templates × 3 slides each. All **MIT.**
5. **Slidev built-in layouts** — https://sli.dev/builtin/layouts — Canonical minimal taxonomy: `center, cover, default, end, fact, full, image, image-left, image-right, iframe, iframe-left, iframe-right, intro, none, quote, section, statement, two-cols (::right::), two-cols-header (::left::/::right::)`. **MIT.**
6. **anthropics/skills — pptx skill** — https://github.com/anthropics/skills/tree/main/skills/pptx — Current SKILL.md is pptxgenjs-based (canvas 10"×5.625" or 13.3"×7.5"); it lists layout ideas (two-column text+illustration, icon+text rows, 2×2/2×3 grids, half-bleed image + overlay), a type ladder (titles 36–44pt, section headers 20–24pt, body 14–16pt, captions 10–12pt), margins ≥0.5", 0.3–0.5" between blocks, "don't repeat a layout". The older **html2pptx.md** (body `720pt×405pt`, flexbox only, text must be in `<p>/<h1-6>/<ul>/<ol>`) has been removed from the main path; a mirror is at https://github.com/frankxai/claude-skills-library/blob/main/free-skills/anthropic/pptx/html2pptx.md. **Proprietary Anthropic license** — read for guidance, do not copy files.
7. **StrategyU "14 Consulting Slide Layouts"** — https://strategyu.co/slide-layouts/ — Best consulting-deck archetype list with geometry hints (e.g. chart occupies left two-thirds, takeaway in right third; 4–6 KPI tiles across the top). Article, not code.
8. **mrigankad/SlideArchitect** — https://github.com/mrigankad/SlideArchitect — Clean 17-type taxonomy in 5 families (Structural / Content / Comparison / Data & Process / Closing). No formal license.
9. **1weiho/open-slide** — https://github.com/1weiho/open-slide — Fixed 1920×1080 canvas framework with a `/slide-authoring` skill carrying type-scale and layout rules. **MIT.**
10. **icgma/slide-skill** — https://github.com/icgma/slide-skill — SVG-first, fixed 1280×720 coordinates; 7 layouts (cover, section-divider, bullet-list, two-column, metric-highlight, quote, closing). Good reference for absolute coordinates. **MIT.**
11. **Kuneosu/make-slide** — https://github.com/Kuneosu/make-slide — 12 slide-type patterns × 4 layout styles (Centered, Wide, Split, Editorial). **MIT.**
12. **danny0926/ppt-skills** — https://github.com/danny0926/ppt-skills — 15+ visual-first layouts (split-visual, visual-hero, comparison, big-number, process-flow, icon-grid, timeline) in `docs/DESIGN_SYSTEM.md`. **MIT.**
13. **Duarte Diagrammer taxonomy** — https://diagrammer.duarte.com/ — The slide:ology diagram taxonomy: Flow (Linear, Loop, Merge/Divide, Parallel), Join (Hook, Overlap), Segment (Donut, Pie), Network (Flare, Hub-and-Spokes, Ring, Spokes), Stack (Horizontal, Vertical). Use the taxonomy, not the 4,000 files (proprietary, free-signup).
14. **Google Slides default layouts** — 11 presets: Title slide, Section header, Title and body, Title and two columns, Title only, One column text, Main point, Section title and description, Caption, Big number, Blank (https://developers.google.com/apps-script/reference/slides/layout). Keynote themes add Title & Subtitle, Title & Bullets, Title – Top, Photo – 3 Up, Quote, Statement/Big Fact.
15. **Marp / reveal.js** — Marp core themes are fixed **1280×720** (https://github.com/marp-team/marp-core, MIT); reveal.js default **960×700**, margin 0.04, uniform scaling (https://revealjs.com/presentation-size/, MIT). Both are flow/theme systems — low layout-harvest value beyond canvas conventions. Marp gallery: https://rnd195.github.io/marp-community-themes/.

**Canva import findings:** Canva's HTML import (https://www.canva.com/help/import-html/) converts only **Claude Design** decks into editable multi-slide Presentations; any other HTML becomes a "Code design" with basic edits. No public spec of the detection markers was found; `data-document-role` returned nothing. https://github.com/RyanPiao/md-html-slides is a Canva App that rasterizes HTML to PNG (not editable). https://github.com/popovycj/CanvaToHTML goes the other direction. Practical implication: author to 1920×1080 absolute HTML, but expect to route through Claude Design's export or the Canva MCP `import-design-from-url` rather than raw HTML.

## Grid and type conventions for 1920×1080

- **Margins:** 72px (frontend-slides), ~96–108px (guizang: 5vw ≈ 96px sides, 5.6vh ≈ 60px top), pptx skill: ≥0.5" ≈ 96px at 1920 wide. Recommend a 96px outer margin / 1728×888 content box, footer safe zone bottom ~22px (`bottom:2vh`).
- **Columns:** 12-col (Keynote modular grid tutorial, 12×6 modules, https://medium.com/@madeinkeynote/learn-how-to-make-perfect-modular-grids-in-keynote-with-shortcuts-8234cba7a49c) or 16-col with 16px gutter (guizang). 12-col at 1728 wide with 32px gutters gives 114.7px columns; typical splits 6/6, 7/5, 8/4, 4/4/4, 3/3/3/3.
- **Type ladder (px at 1920×1080):** hero/statement 160–224px (guizang 8.4–11.6vw); title 96–112px; subtitle/section header 40–56px; body 28–36px; caption/label 20–24px. Cross-check in pt on a 13.33" slide: title 36–44pt ≈ 96–117px, body 14–16pt ≈ 37–43px (pptx skill); live decks title 60pt+/body 40pt+/caption 20pt+ (https://www.superchart.io/blog/presentation-font-size); BrightCarbon minimums title 28pt, body 16pt for leave-behinds.
- **Wrap widths:** Mck character budgets — title ≤40 chars, bullets ≤50, card descriptions 60–80, KPI label ≤20, timeline milestone ≤8.

## Consolidated layout archetypes (52, deduplicated)

**Structural:** 1 Title/Cover · 2 Intro (title + author/meta) · 3 Agenda/TOC · 4 Section divider · 5 Section title + description · 6 Executive summary (3 columns) · 7 Key takeaway / summary · 8 Appendix title · 9 Closing / thank-you · 10 CTA / next steps · 11 Q&A / contact

**Single-idea text:** 12 Statement (centered sentence) · 13 Question · 14 Quote / testimonial · 15 Quote + evidence (split) · 16 Title + body (single column) · 17 Bullet list · 18 Numbered list panel · 19 Two-column text · 20 Content + sidebar/callout

**Numbers:** 21 Big number · 22 Two-stat / three-stat row · 23 KPI grid / metric cards (2×2, 2×3, 3×2) · 24 KPI dashboard (4–6 tiles + trend) · 25 Stacked KPI ledger · 26 Progress bars · 27 Chart-dominant (chart 70–80%) · 28 Chart + insight callout (2/3 + 1/3) · 29 Data table · 30 Table + insight

**Comparison & evaluation:** 31 Side-by-side (Option A/B, 2 columns) · 32 Three-column · 33 Four-column / four cards · 34 Before/after · 35 Pros/cons · 36 Comparison table / scorecard / Harvey balls · 37 SWOT (2×2 labeled) · 38 Checklist / RAG status

**Frameworks:** 39 2×2 matrix (axes) · 40 Risk/priority matrix · 41 Pyramid / temple · 42 Funnel · 43 Venn · 44 Cycle / loop · 45 Concentric system diagram · 46 Value chain / chevrons

**Process & time:** 47 Horizontal process steps (3–6) · 48 Vertical steps · 49 Horizontal timeline · 50 Vertical timeline · 51 Roadmap / Gantt (phases × lanes) · 52 Pipeline / architecture / decision tree

**Image & people:** 53 Full-bleed image + overlay · 54 Image hero (60/40 top-bottom) · 55 Image left / image right split (50/50, 60/40) · 56 Image + 3–4 points · 57 Image grid (3×2, 4×3) · 58 Picture with caption · 59 Icon grid · 60 Team / people grid · 61 Case study · 62 Stakeholder map

(62 after merging near-duplicates; trim per your needs.)

Sources: https://github.com/likaku/Mck-ppt-design-skill · https://github.com/op7418/guizang-ppt-skill · https://github.com/lewislulu/html-ppt-skill · https://github.com/zarazhangrui/frontend-slides · https://github.com/archlizheng/frontend-slides-editable · https://sli.dev/builtin/layouts · https://github.com/anthropics/skills/tree/main/skills/pptx · https://strategyu.co/slide-layouts/ · https://github.com/mrigankad/SlideArchitect · https://github.com/1weiho/open-slide · https://github.com/icgma/slide-skill · https://diagrammer.duarte.com/ · https://www.canva.com/help/import-html/ · https://github.com/RyanPiao/md-html-slides · https://revealjs.com/presentation-size/ · https://tosea.ai/slide-skills · https://deckary.com/blog/powerpoint-layout-ideas · https://linia-presentations.com/blogs/presentation-blog/15-different-types-of-slide-layouts-in-powerpoint · https://www.superchart.io/blog/presentation-font-size · https://www.brightcarbon.com/blog/presentation-font-size/
