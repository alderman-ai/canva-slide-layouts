# 06 · Prior art for slide schemas, content-unit typology, accepts relations, decomposition heuristics, Obsidian and PowerShell retrieval

- Date: 2026-09-02
- Source: research agent (web + GitHub), planning session
- Focus: ground the ontology, controlled vocabulary, and planner rules in existing systems rather than inventing them
- Caveats declared by the report: Keynote master names and Beautiful.ai per-slide item limits are not published; Presenton's outline response is typed only as `string[]`; Duarte's slide-type taxonomy is book-only

---

# Prior art for a Markdown-first layout/content-unit/planner system

## Source landscape in one paragraph

Three families of prior art matter. **Format object models** (OOXML `ST_PlaceholderType`, Google Slides `PlaceholderType`/`PredefinedLayout`, Slidev, Marp) define *element roles* and *named layouts* but never "accepts" relations. **Academic doc→deck systems** (DOC2PPT 2021, D2S 2021, PPTAgent 2025, PresentAgent 2025, Paper2Poster 2025) define the *decomposition* and, in PPTAgent/PresentAgent, a per-layout *content schema* that is the closest thing to your layout-class-with-element-table. **Product/OSS generators** (Presenton, Gamma, Beautiful.ai, siril9/presentation-skill) supply the *layout catalogs* and the only published *cardinality constraints* (Presenton's JSON-Schema `minItems`/`maxItems`). Rhetorical/argument vocabularies (RST, Stab & Gurevych, Minto SCQA, Duarte) supply the *unit-type* names.

## (a) Unified placeholder / element-role vocabulary

Reconciled across OOXML ([ST_PlaceholderType](https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_ST_PlaceholderType_topic_ID0EENHIB.html): title, body, ctrTitle, subTitle, dt, sldNum, ftr, hdr, obj, chart, tbl, clipArt, dgm, media, sldImg, pic), Google Slides ([PlaceholderType](https://developers.google.com/apps-script/reference/slides/placeholder-type): BODY, CHART, CLIP_ART, CENTERED_TITLE, DIAGRAM, DATE_AND_TIME, FOOTER, HEADER, MEDIA, OBJECT, PICTURE, SLIDE_NUMBER, SUBTITLE, TABLE, TITLE, SLIDE_IMAGE — note OOXML has no NONE/UNSUPPORTED and Google has no `hdr`-on-slide), PPTAgent's schema triple (Category / Description / Data, e.g. Title, Date, Image — [arXiv 2501.03936](https://arxiv.org/html/2501.03936v3)), Presenton's element kinds (Text, Images, Shapes/Lines, Tables, Charts, Containers — [docs](https://docs.presenton.ai/general/presentations-and-slides.md)), Slidev slots (`::left::`, `::right::`, `image`, `url` — [layouts](https://sli.dev/builtin/layouts)), and Gamma/Pitch blocks (text, image, media, chart, table, embed, callout — [Gamma](https://help.gamma.app/en/articles/11016396-what-are-cards-in-gamma-and-how-to-do-they-work), [Pitch](https://help.pitch.com/en/articles/3998376-use-smart-formatting)):

| Proposed role (flat enum) | OOXML | Google | Notes |
|---|---|---|---|
| `title` | title / ctrTitle | TITLE / CENTERED_TITLE | Fold `ctrTitle` into `title` + layout-level `emphasis: hero` |
| `subtitle` | subTitle | SUBTITLE | |
| `body` | body | BODY | Bullets/paragraph; add `body_kind: bullets\|prose` |
| `column` | body (idx n) | BODY (index n) | Google/OOXML distinguish repeated bodies only by `index`; give it its own role for two-col layouts |
| `caption` | — | (CAPTION_ONLY layout) | Google exposes caption as a layout not a placeholder |
| `picture` | pic / clipArt | PICTURE / CLIP_ART | Merge clipArt |
| `chart` | chart | CHART | |
| `table` | tbl | TABLE | |
| `diagram` | dgm | DIAGRAM | SmartArt/process/flow |
| `media` | media | MEDIA | |
| `object` | obj | OBJECT | "Any content type" wildcard — keep as escape hatch only |
| `number` | — | (BIG_NUMBER layout) | Product-only role: Google BIG_NUMBER, Beautiful.ai "Big Number", Slidev `fact`, siril9 `stats`/`kpi-hero` |
| `quote` + `attribution` | — | — | Slidev `quote`, Keynote-style Quote (per Spectacle PR modelled on Keynote) |
| `icon` | — | — | Anthropic pptx skill "icon + text rows", Beautiful.ai |
| `footer`, `slide_number`, `date`, `header` | ftr, sldNum, dt, hdr | FOOTER, SLIDE_NUMBER, DATE_AND_TIME, HEADER | Chrome; exclude from planner |
| `notes` | (notes page body) | notes page | Google has a Notes page type ([page-elements](https://developers.google.com/workspace/slides/api/concepts/page-elements)) |

Two structural facts worth copying: Google enforces that **only shapes can be placeholders/inherit** (images, tables, charts cannot), and both models identify a placeholder by `(type, index)`, which is exactly what your element table needs as a primary key.

## (b) Content-unit type vocabulary

Prior art gives three layers. Use all three as separate flat fields rather than one giant enum.

**Layer 1 — structural/functional role of the slide** (PPTAgent: "structural slides that support the presentation's organization (e.g., opening slides)" vs "content slides" — [paper](https://arxiv.org/html/2501.03936v3); PresentAgent's categories "bullet slide, figure-description, or title-intro" — [arXiv 2507.04036](https://arxiv.org/html/2507.04036); Google [PredefinedLayout](https://developers.google.com/apps-script/reference/slides/predefined-layout): TITLE, SECTION_HEADER, SECTION_TITLE_AND_DESCRIPTION, MAIN_POINT, BIG_NUMBER, CAPTION_ONLY; Slidev: cover, intro, section, end):
`opening | agenda | section | content | summary | closing | appendix`

**Layer 2 — rhetorical unit type** (what the corpus fragment *is*). Sources per term:

| Unit type | Definition | Source(s) |
|---|---|---|
| `claim` | Assertion the author wants accepted; the "message" | Stab & Gurevych claim/major-claim ([J17-3005](https://aclanthology.org/J17-3005/)); Minto governing thought; PLOS Rule 3 "heading states the exact message" ([PLOS](https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1009554)) |
| `premise` / `evidence` | Reason or data that raises belief in a claim | S&G premise; RST *Evidence* (satellite increases belief in nucleus) ([SFU RST](https://www.sfu.ca/rst/01intro/definitions.html)) |
| `statistic` | A single quantified fact | Google BIG_NUMBER; Slidev `fact`; Beautiful.ai "Big Number Slides" ([beautiful.ai](https://www.beautiful.ai/smart-slides)) |
| `comparison` | Two+ items alike in most respects, differing in specified ones | RST *Contrast* (multinuclear); Beautiful.ai "Comparison"; siril9 `comparison-2col`, `matrix` ([presentation-skill](https://github.com/siril9/presentation-skill)) |
| `process` / `sequence` | Ordered steps | RST *Sequence*; Gamma `/process`, `/timeline`, `/funnel`; siril9 `timeline`, `flow` |
| `definition` / `background` | Context the audience must have first | RST *Background*, *Preparation*; Minto **Situation** |
| `problem` | What is wrong/changing | Minto **Complication**; RST *Solutionhood* satellite |
| `solution` / `recommendation` | The answer to the complication | Minto **Answer**; RST *Solutionhood* nucleus |
| `example` / `elaboration` | Detail or instance of a nucleus | RST *Elaboration* |
| `quote` | Attributed verbatim speech | Slidev `quote`; Keynote/Spectacle Quote |
| `cause_effect` | X caused Y | RST *Volitional/Non-volitional Cause/Result* |
| `concession` / `counterpoint` | Acknowledged incompatibility | RST *Concession*, *Antithesis*; S&G *attack* relation |
| `enumeration` / `list` | Comparable items in series, no ordering | RST *List*, *Joint* |
| `summary` / `restatement` | Shorter restatement of multi-unit nucleus | RST *Summary*, *Restatement* |
| `call_to_action` | What the audience should do | RST *Motivation*, *Enablement* (presentational relations aimed at action) |
| `figure` / `table` / `chart_data` | Visual asset with caption | DOC2PPT treats figures ("images, graphs, charts, and tables") as first-class objects alongside sentences ([DOC2PPT PDF](https://arxiv.org/pdf/2101.11796v4)); Paper2Poster asset library keyed by caption ([arXiv 2505.21497](https://arxiv.org/html/2505.21497)) |

**Layer 3 — modality/shape** (independent axis): `text | bullets | number | image | chart | table | diagram | quote`. Presenton's `verbosity: concise|standard|text-heavy` and `content_generation: preserve|enhance|condense` ([outline API](https://docs.presenton.ai/api-reference/v3-presentation/generate-an-outline.md)) are useful *deck-level* density knobs to carry in frontmatter.

Duarte contributes constraints rather than types: one idea per slide and the 3-second Glance Test ([Duarte](https://www.duarte.com/resources/guides-tools/the-glance-test/)); Minto contributes the **vertical** (answer → grouped arguments → evidence) and **horizontal** (MECE siblings) ordering rules that become your flow template ([SCQA](https://thinkinsights.net/strategy/scqa-logic)).

## (c) Layout ↔ unit "accepts" relations supported by prior art

No format spec defines accepts/cardinality; it is implicit in placeholder counts. The explicit precedents are:

- **Presenton** is the only public system with formal per-layout JSON Schema constraints — `title-and-bullets` requires `title` (8–80 chars) and `bullets` (`minItems: 2, maxItems: 5`); a slide is `{layout: "<id>", content: {...}}` validated against that schema, and layouts are discovered via `GET /api/v3/standard-template/{id}` returning `{id, description}` ([standard-from-json](https://docs.presenton.ai/api-guides/standard-from-json.md)). Copy this shape verbatim: layout id + LLM-facing description + schema with min/max.
- **PPTAgent** stores per-cluster schema rows (Category/Description/Data) and selects a reference slide by "slide-level functional description" — layout selection is by description matching, not typed accepts.
- **PresentAgent** maps each content block to a "slide category" then to "a predefined layout schema encoded in HTML", populated via `replace_text`, `insert_image`, `add_list`.
- **DOC2PPT** learns a three-level policy (`[SEC]`→`[SLIDE]`→`[OBJ]`, actions `NEW_SLIDE|END_SEC`, `NEW_OBJ|END_SLIDE`) — i.e., cardinality is *learned*, but its dataset gives empirical priors (below).

Proposed accepts table (role cardinality from format specs; unit types from Layer 2 mapping):

| Layout archetype (Google / Slidev / siril9 name) | Requires | Optional | Accepts unit types |
|---|---|---|---|
| `opening` (TITLE / cover / title) | title×1 | subtitle×1, picture×1 | opening |
| `section` (SECTION_HEADER / section) | title×1 | subtitle×1 | section |
| `title_body` (TITLE_AND_BODY / default / standard) | title×1, body×1 (2–5 bullets per Presenton; ≤6 elements per PLOS Rule 7) | picture×1 | claim, enumeration, elaboration, summary |
| `two_column` (TITLE_AND_TWO_COLUMNS / two-cols / split, comparison-2col) | title×1, column×2 | | comparison, cause_effect, problem+solution, concession |
| `image_text` (image-left/right / image-sidebar) | title×1, picture×1, body×1 | caption | figure+claim, example |
| `full_image` (image / full, scientific-figure) | picture×1 | caption, title | figure |
| `big_number` (BIG_NUMBER / fact / stats, kpi-hero) | number×1 (1–3 for stats grid), title/label×1 | body×1 | statistic |
| `statement` (MAIN_POINT / statement) | title×1 | | claim (single), recommendation |
| `quote` (quote) | quote×1, attribution×1 | picture×1 | quote |
| `process` (timeline / flow / diagram) | title×1, diagram×1 (3–6 steps) | | process, sequence |
| `chart` (chart) | title×1, chart×1 | caption/body | statistic, comparison, chart_data |
| `table` (table / matrix) | title×1, table×1 | | comparison, enumeration |
| `cards_n` (cards-2/cards-3, "icon + text rows") | title×1, icon+body×2–3 | | enumeration, definition |
| `closing` (end) | title×1 | body (call_to_action) | closing, call_to_action, summary |

## (d) Decomposition heuristics with numbers

- **Slides per minute:** ~1 slide/min for talks ("a 20-minute presentation should have somewhere around 20 slides", PLOS Rule 2); 2 min/slide for business decks (Plus AI table: 10 min→5, 20→10, 30→15, 60→25 ±3–8 — [plusai](https://plusai.com/blog/how-many-slides-do-i-need-for-my-presentation/)); Kawasaki 10/20/30 ([Tuts+](https://business.tutsplus.com/tutorials/how-many-slides-use-presentation--cms-34652)). Speaking rate 100–150 wpm.
- **Density:** one idea per slide (PLOS R1, Duarte, Plus AI "3-2-1"); ≤6 elements per slide (PLOS R7); title = full-sentence takeaway (PLOS R3); "almost never have slides that only contain text" and split multipanel figures one panel per slide (PLOS R6); Anthropic's pptx skill: "Every slide needs a visual element" and "don't put every section on the same title-and-bullets slide" ([SKILL.md](https://raw.githubusercontent.com/anthropics/skills/main/skills/pptx/SKILL.md)). 5/5/5 and 6-word-per-slide folk rules appear in trade sources only.
- **Empirical corpus priors (DOC2PPT Table 1):** 16.8 slides per deck, 8.1 sentences per slide, 2.5 figures per deck, 6.99 sections per paper → roughly **2.4 slides per section**; slide sentences average 11.6 words vs 17.3 in the source (paraphrase compression ≈0.67); slides with ≥80% overlap with predecessor are treated as animation builds and removed.
- **Compression ratios (Paper2Poster):** 12,155 words/22.6 figures → 774 words/8.7 figures = 14.4× text, 2.6× figure reduction; layout via binary-tree split sized by word count and figure aspect ratio.
- **PresentAgent:** 3,000–8,000-word documents → 5–10 slides; narration 30–150 s per slide.
- **Section dividers:** no published numeric rule found. Structural evidence: Google, Slidev, Keynote-derived and siril9 catalogs all include a section archetype; Presenton adds `include_title_slide` (default true); DOC2PPT's `END_SEC` boundary is the natural insertion point. Practical rule consistent with the priors: insert a `section` slide at each top-level heading when the section yields ≥2 content slides and the deck has ≥3 sections; add `agenda` when ≥4 sections.
- **Pipeline order** (converges across PPTAgent, Presenton, banana-slides, presentation-ai): parse → outline (review gate) → per-slide layout selection → fill → render. Presenton's outline endpoint takes `n_slides`, `tone`, `verbosity`, `instructions`; presentation-ai recommends 5–10 slides ([repo](https://github.com/allweonedev/presentation-ai)); Gamma caps generation at 10 (free)/100 (paid) cards.

## (e) Obsidian Bases + PowerShell retrieval notes

- **Property types** are exactly six — Text, List, Number, Checkbox, Date, Date & time — assigned **per property name vault-wide**; reserved names `tags`, `aliases`, `cssclasses`; list items one per line with `- `; wikilinks in lists must be quoted; dates `YYYY-MM-DD`, datetimes ISO 8601 ([properties](https://obsidian.md/help/properties)). There is no enum/select type: enforce your controlled vocabulary as Text (single) or List (multi) and validate externally.
- **Bases `.base` structure:** top-level `filters` (recursive `and/or/not`), `formulas`, `properties` (displayName), `summaries`, and a `views` array with `type` (table/cards/list/map), `name`, `limit`, `groupBy`, `order`, `filters`, `summaries`; namespaces `note.*`, `file.*`, `formula.*`; operators `== != > < >= <= && || !`; date arithmetic `now() - "1 week"`; `this` = embedding/active file ([syntax](https://obsidian.md/help/bases/syntax)). Embed with `![[File.base#View]]` ([views](https://obsidian.md/help/bases/views)).
- **Functions useful for enum retrieval:** `contains/containsAny/containsAll` on lists, `list.filter/map/unique/flat/join`, `if()`, `isEmpty()`, `isType()`, `file.hasTag/hasProperty/hasLink/inFolder`; crucially `list(x)` "if the provided element is a list, returns it unmodified, otherwise wraps" — use it so a unit with a single `unit_type` and one with several filter identically ([functions](https://obsidian.md/help/bases/functions)). Summaries support Sum/Avg/Min/Max/Unique/Filled etc.
- **Dataview vs Bases:** Bases is core, fast, GUI-editable, YAML-declarative and readable by external tools; Dataview still wins for JS, inline queries and complex rollups ([obsidian.rocks](https://obsidian.rocks/dataview-vs-datacore-vs-obsidian-bases/), [locul](https://locul.ai/blog/obsidian-bases-plugin)). Because a `.base` is plain YAML, the same filter can be re-evaluated in PowerShell.
- **PowerShell:** `Install-Module powershell-yaml` (YamlDotNet-based); `ConvertFrom-Yaml` returns Hashtables (use `-Ordered` for OrderedDictionary), `-AllDocuments`, `-UseMergingParser`; bare numbers become Int64, so quote IDs ([cloudbase/powershell-yaml](https://github.com/cloudbase/powershell-yaml)). Alternative: jborean93's [Yayaml](https://github.com/jborean93/PowerShell-Yayaml) (YAML 1.2 core schema, `-Schema`). `ConvertFrom-Markdown` does **not** expose frontmatter — open [issue #16857](https://github.com/PowerShell/PowerShell/issues/16857) — so split on the first two `---` lines yourself before parsing. Retrieval pattern: `Get-ChildItem -Recurse *.md | % { split frontmatter; ConvertFrom-Yaml } | Where-Object { @($_.unit_type) -contains 'statistic' }` — the `@()` wrap mirrors Bases' `list()`.

## (f) Additional links

[PPTAgent repo](https://github.com/icip-cas/pptagent) · [DOC2PPT](https://arxiv.org/abs/2101.11796) · [D2S/SciDuet](https://aclanthology.org/2021.naacl-main.111/) · [PresentAgent repo](https://github.com/AIGeeksGroup/PresentAgent) · [AutoPresent/SlidesBench](https://arxiv.org/abs/2501.00912) · [SlideCoder](https://arxiv.org/abs/2506.07964) · [Paper2Poster](https://github.com/Paper2Poster/Paper2Poster) · [PPTC](https://github.com/gydpku/PPTC) · [Marpit directives](https://raw.githubusercontent.com/marp-team/marpit/main/docs/directives.md) · [Presenton repo](https://github.com/presenton/presenton) · [banana-slides](https://github.com/Anionex/banana-slides) · [slidegen JSON deck schema](https://github.com/sanand0/slidegen) · [S&G annotation scheme figure](https://www.researchgate.net/figure/Argument-Component-Annotation-Scheme-Stab-Gurevych-2014a_fig1_316441886) · [SKOS primer](https://www.w3.org/TR/skos-primer/) (use `prefLabel`/`altLabel`/`broader`/`inScheme` as flat JSON keys for your vocabulary file) · [Obsidian Bases guide 2026](https://got.md/obsidian-bases/).

**Gaps:** Keynote's master-layout names and Beautiful.ai's per-slide item limits are not published in fetchable docs; Presenton's outline response is typed only as `string[]`; Duarte's slide-type taxonomy is book-only. Treat those as unverified.
