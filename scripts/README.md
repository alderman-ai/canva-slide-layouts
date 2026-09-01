# scripts/ — the deterministic toolchain

Node ESM (`"type": "module"`, node 20+; built on node 24.15) plus one PowerShell 5.1 entry point.
Semantic work (reading context, writing copy) is done by Claude through the repo skills; everything
here is deterministic: parse, validate, emit, cache, screenshot.

## What each file does → when to run it

| File | What it does | Run it when |
|---|---|---|
| `lib/md.mjs` | Hybrid-MD library: `parseHybrid` / `serializeHybrid` (flat frontmatter + GFM tables), tolerant pipe-table parser with numeric coercion, `loadVocab` / `loadSchemas` / `loadFonts` / `loadTextRoles`, `walk` / `readJson` / `writeText` (UTF-8, LF, no BOM), and the shared element helpers (`escapeHtml`, `fontStack`, `parseShapeSpec`, `bulletLines`, `textCapacity`). | Never directly — every other script imports it. Read it before changing the MD contract. |
| `validate.mjs` | The gate: repo hygiene (no vendor design files), flat frontmatter, JSON Schema per type (Ajv 2020, vocab enums injected at load), vocab-only values, element table well-formed and inside 1920x1080, `text_capacity_chars` == sum of `maxChars` over text roles, fonts in `spec/fonts.json`, `fonts_native` consistent, unique layout ids. Exit 1 on errors. | Every session start, after editing any layout/slide/intake/bundle MD, and at the end of every skill run. |
| `build-html.mjs` | Layout/slide MD → annotated HTML for Canva `import-design-from-url` (Route A): one non-nested `<section data-document-role="page">` per slide, leaf elements only, real `<li>`s, absolute positions, registry font stacks. Also writes the 25%-scaled contact sheet `build/html/index.html`. | Before an HTML import, before previews, and whenever a layout's geometry changes. |
| `build-dc.mjs` | Same inputs → `build/dc/<name>/Main.dc.html` + `canvas.json` in the Claude Design deck shape (`<x-dc>`, `<helmet>`, `<x-import component-from-global-scope="deck-stage">`, `support.js`). **Experimental** (Route D, probe question 5). | Before pushing a deck into a Claude Design project with `DesignSync.write_files`. |
| `build-canva-ops.mjs` | Per layout or per slide → `build/canva-ops/<id>.json`: real `edit-design` operations (`add_text`, `format_text`, `insert_shape`, `insert_fill`, `replace_speaker_notes`) in ≤25-op chunks, plus the `find_and_replace` variant for slides bound to a master page (Route C). | Before a Route B repair or a Route C fill; after any text or geometry edit. |
| `manifest.mjs` | Derived caches: `manifest/layouts.json` (frontmatter + element table + `element_count`, `text_capacity_chars`, `accepts`, `components`) and `manifest/components.json` from `components/slides/*/`. | After adding or editing layouts; `slides.ps1 find` and the planner read these. |
| `preview.mjs` | Playwright screenshots of `build/html/*.html` → `build/previews/<id>.png` at 480x270, plus a contact sheet per family. Prints the Chromium install command and exits 0 when the browser is missing. | After `build`, when you want to eyeball the library in Obsidian or a browser. |
| `slides.ps1` | The operator surface: argument handling, retrieval over `manifest/layouts.json`, deck scaffolding. Delegates everything else to the node scripts. | Always — it is the documented entry point (`.\scripts\slides.ps1 <verb>`). |
| `test/` | `node --test` suite over the library, the validator and the three emitters, against the fixtures in `test/fixtures/`. | Before committing a change to any script. |

## `slides.ps1` verbs

| Verb | Arguments | Does |
|---|---|---|
| `validate` | `[-Json]` | Runs `validate.mjs`. Exit 1 on errors, so it works in a gate. |
| `build` | `[-Deck <slug>] [-Family <name>]` | `build-html.mjs`. No flags = every layout + contact sheet. |
| `build-dc` | `[-Deck <slug>] [-Family <name>]` | `build-dc.mjs` (experimental Claude Design deck). |
| `ops` | `[-Deck <slug>]` | `build-canva-ops.mjs`. |
| `manifest` | | Rebuilds both manifest caches. |
| `preview` | | `preview.mjs`. |
| `find` | `-Family -Archetype -Shape -Accepts -Items -MaxPolish -Density -FlowRole -Component -Brand -NativeFontsOnly [-Json]` | Retrieval over `manifest/layouts.json`; prints id / title / family / density / polish / capacity. `-Items n` keeps layouts whose `min_items..max_items` covers n; `-MaxPolish n` caps `polish_cost`. |
| `show` | `<layout-id>` | Prints one layout's frontmatter and element table. |
| `new-deck` | `<slug>` | Scaffolds `presentations/<slug>/` (`brief.md` with the dial frontmatter, `context/`, `slides/`, `build/`, `canva.md` stub). |
| `hygiene` | | The vendor-design-file check on its own (hard rule 1). |
| `help` | | The verb table. |

Every verb returns the underlying script's exit code, and node's own output is passed through
(so `.\scripts\slides.ps1 validate -Json > report.json` works). Windows PowerShell 5.1 only:
no `&&`, no ternary, no `??`; `Set-StrictMode -Version 2` is on.

## Authoring conventions the emitters rely on

- **Element table columns**: `n | role | x | y | w | h | font | weight | size | lh | align | maxChars | binds | text`. `n` orders the elements; geometry is px on a 1920x1080 page.
- **Bullets**: either repeated `bullet` rows (consecutive rows are grouped into one `<ul>`) or one `body` row whose `text` holds `- item` entries separated by a literal `\n` (table cells cannot contain real newlines). Both emit real `<li>` elements.
- **Shapes**: the `text` cell carries a spec string — `fill:#E5E5E5 r:16 stroke:#999 sw:2` (`r` = corner radius, `sw` = stroke width). `divider` rows use `stroke:` and a height of 1–4 px.
- **Placeholders**: `picture`, `chart`, `table`, `diagram`, `media` (and the emitter alias `image`) render as a gray box with a centered label; `label:Some_text` in the spec string sets the label (underscores become spaces).
- **Escaping**: `|` inside a cell is written `\|`; `serializeHybrid` re-escapes it.
- **Ops placeholders**: `$PAGE`, `$LOC[n]` (n = the element's `n`), `$ASSET[n]` are filled in at upload time from `read-design`; nothing in `build/canva-ops/` contains live Canva ids.
- **Text roles**: `text_capacity_chars` sums `maxChars` over roles whose `broader` is `text_role` in `spec/vocab/element_role.json` (falling back to "everything except shape/divider/image/picture/chart/table/diagram/media" when the vocabulary is absent).

## How to run the tests

```
npm install          # once; installs gray-matter, cheerio, ajv, ajv-formats, yaml, playwright
                     # (cheerio is reserved for the future ingest-html.mjs round trip)
npm test             # node --test "scripts/test/*.test.mjs"
node --test "scripts/test/md.test.mjs"     # one file
```

The suite is hermetic: it validates against `scripts/test/fixtures/spec/` (a two-font registry),
never against `spec/`, so a change in the specification cannot turn the tests red on its own.
`scripts/test/fixtures/L999-fixture.md` is a complete valid layout and `L998-broken.md` seeds one
of every error class. Fixtures never live in `layouts/`.

**Playwright browsers are not installed by `npm install`.** Run this once before the first
`preview`, then never again:

```
npx playwright install chromium
```

`preview.mjs` prints that exact command and exits 0 when the browser is missing, so a pipeline
never breaks on it.
