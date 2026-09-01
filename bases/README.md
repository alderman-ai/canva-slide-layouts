# bases/ — Obsidian Bases views

| File | What | Open when |
|---|---|---|
| `layouts.base` | Views over `layouts/*.md`: all layouts, family board, quick-polish, by density, flow roles, comparison shapes, not yet in Canva, needs font install | Browsing or picking layouts in Obsidian |
| `decks.base` | Views over `presentations/*/brief.md` and `plan.md` | Reviewing decks and their plans |

Bases evaluate flat frontmatter only; `list()` wraps single values so single- and multi-valued keys filter alike. The same filters are re-implemented in `scripts/slides.ps1 find` for PowerShell.
