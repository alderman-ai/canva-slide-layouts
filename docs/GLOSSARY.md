# Glossary

Terms as used across this repo. Vocabulary values themselves live in `spec/vocab/*.json`; this file explains the entities and mechanisms.

| Term | Meaning |
|---|---|
| **Layout** | A slide layout class: one hybrid MD in `layouts/` with flat frontmatter (retrieval attributes) and an element table (geometry, fonts, wrap widths). Never contains real content, only placeholders. |
| **Slide** | An instance of a layout inside a presentation: `presentations/<slug>/slides/S##-*.md`, same element table with real text, bound to content units, carrying Canva page and locator ids after upload. |
| **Element** | One row of a layout or slide table, keyed by `(role, index)`: role, x, y, w, h, font, weight, size, line-height, alignment, maxChars, binding, text. |
| **Element role** | Controlled value such as `title, subtitle, body, column, caption, picture, chart, table, diagram, number, quote, attribution, icon, label, eyebrow, shape, divider, footer, slide_number, date, notes` (reconciled from OOXML and Google Slides). |
| **Content unit** | An atom extracted from a corpus: typed by `slide_function`, `unit_type` (claim, evidence, statistic, comparison, process, definition, problem, solution, example, quote, cause_effect, concession, enumeration, summary, call_to_action, figure, table, chart_data), and `shape`. Lives in `units.md`. |
| **Accepts** | A layout's JSON Schema stating which unit types it takes, with `minItems`/`maxItems` per repeated role and character ranges. Used by `match.mjs` before scoring. |
| **Flow template** | A named ordered sequence of archetype slots with a target length (SCQA consulting, Sequoia pitch, Kawasaki 10/20/30, Duarte sparkline, Gagné teaching, status update, workshop, slidedoc, Takahashi). In `spec/flows.md`. |
| **Density** | Level 1–5 (cinematic, talk, briefing, consulting, slidedoc) with numeric limits on info units, words, and pace. Set by delivery mode; overflow splits a slide before density rises. |
| **Polish cost** | Level 1–5 of how much design effort a layout needs to look good (typography only → bespoke illustration). The `polish` dial (quick ≤2, standard ≤3, premium any) caps it. |
| **Deck / presentation project** | `presentations/<slug>/` with `brief.md`, `context/`, `units.md`, `plan.md`, `slides/`, `build/`, `canva.md`. |
| **Brief** | `brief.md` frontmatter dials: audience, purpose, delivery_mode, length_minutes or target_slides, density, polish, pairing, brand_kit_id, fonts_native_required, content_public. |
| **Plan** | `plan.md`: ordered slides → layout id → unit ids, with a fit report (overflow, dropped units, budget math). |
| **Master** | A Canva design holding one family's layouts as pages with the right fonts; the source pages that `merge-designs` copies from. |
| **Route A / B / C / D** | A: annotated HTML → `import-design-from-url`. B: build or repair pages with `edit-design` ops. C: `merge-designs` from masters, then fill text by locator (default for filled decks). D: `.dc.html` deck → Claude Design → Send to Canva. |
| **Locator** | Canva's per-element id (`PBxxx-LByyy`) returned by `read-design` inside a transaction; the handle for every `edit-design` operation. |
| **Transaction** | An `edit-design` editing session opened by `read-design open_transaction: true`; operations accumulate per page and are committed or cancelled in a separate call. |
| **Upload bundle** | `build/bundle.json`: ordered pages, per-page ops or HTML refs, assets, checksums; what Skill 1 hands to the upload step. |
| **Portable bundle** | `bundles/<slug>/`: a self-contained copy of a deck plus vendored layouts, scripts, and the `bundle-upload` skill, publishable as its own repo and uploadable from another device (Skill 5). |
| **Intake contract** | `intake/<date>-<slug>.md`: the hybrid MD created from an image or URL whose frontmatter lists what was detected, confidence, and open questions; confirmed by the operator before conversion to markup and cataloguing (Skill 4). |
| **Fork (redline)** | `slides/S##-*.v<n>.md` created by Skill 3 with `parent`, `change_request` verbatim, and `changed_keys[]`; uploaded as a replacement or as a side-by-side variant. |
| **Font registry** | `spec/fonts.json`: family, weights, source, license, `canva_native`, `canva_fallback`, weight map. Not an allowlist. |
| **Pairing** | A named title/body font combination from `spec/pairings.md`, referenced by layouts and briefs. |
| **Hybrid MD** | A Markdown file whose flat frontmatter is machine-retrievable and whose body holds human-readable sections plus a parseable table. |
| **Design Sync** | The Claude Code `DesignSync` tool and `/design-sync` skill that push React components (as four-file cards) into a Claude Design design-system project. |
| **Design System project** | The claude.ai/design project "alderman.ai Design System" (`d1228f56-c841-450e-8665-c2d177fb9414`). |
| **Code design** | Canva's fallback for HTML it does not recognize as a slide deck: viewable, not element-editable, no conversion path back. The failure mode Route A must avoid. |
