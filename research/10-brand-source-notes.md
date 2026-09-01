# 10 · Brand source notes: alderman.ai codebase and site

- Date: 2026-09-02
- Source: `C:\Users\alder\Desktop\Claude Code Website\EXTERNAL_SKILLS_START_HERE.md` (read in-session; written 2026-08-27 by the operator's tooling for visiting agents) and the operator's instruction that this codebase plus the live site alderman.ai are the primary source of branding details
- Trust level: operator-designated primary source. Values are to be extracted **read-only** into `spec/tokens.md` and `spec/brand-sources.md` during execution step 1

## Where the brand lives

| Item | Location | Notes |
|---|---|---|
| Visitor entry doc | `C:\Users\alder\Desktop\Claude Code Website\EXTERNAL_SKILLS_START_HERE.md` | Supersedes `FOLDER DIRECTORY.md` for visiting agents |
| **The codebase** | `C:\Users\alder\Desktop\Claude Code Website\alderman-ai\` | The only git repo and the only thing deployed; `main` at `78f20ed` (pinned baseline for external tooling) |
| Best orientation doc | `alderman-ai\LOCAL-AGENTS.md` | Untracked; has "What to trust" with the order of authority |
| Site rules | `Claude Code Website\CLAUDE.md` | Auto-loads only when a session is rooted there; rules still bind visitors |
| Routes | `alderman-ai\app\{about,contact,faq,faq-download}\page.tsx` + `app\page.tsx` | 5 routes |
| Components | `alderman-ai\components\{chrome,layout,paper,sections,special}\` | 15 `.tsx`; never add files here. Same five groups as the Claude Design "alderman.ai Design System" project |
| Live worktree | `alderman-ai\.rt\` | branch `rt/2026-08-24` at `78f20ed`; tooling target for the external translator; must not be deleted, pruned, or hand-edited |
| Deploy config | `alderman-ai\vercel.json` | `git.deploymentEnabled:false`, push does not deploy; `vercel whoami` should be `alex-6826` |
| Content sources at the root | `briefs/`, `design-system/`, `page-md/`, `faq.md`, `toolbox.md`, `desktop-spec.md`, `mobile-order.md` | Mixed freshness; specs verified 2026-08-24 |
| External translator project | `C:\Users\alder\Desktop\Alderman OS\Workspace-1\PROJ_Custom Web Page Template\` | Markdown ⇄ Next.js translator, skills `export-page-to-md`, `import-md-to-page`, `new-page-intake`; `Deliverables\Schema and Lexicon.md` is its contract |
| Live site | https://alderman.ai | Cross-check when code and site differ |

## Order of authority (from LOCAL-AGENTS.md as quoted by the entry doc)

code > deployed site > `CLAUDE.md` > specs > briefs > concept docs > archive

## Visitor rules (verbatim intent)

May: read anything under `alderman-ai/`; run `npm test` in the translator; run `export` (read-only); run `import` into `.rt/` only; run `npm run check` or `npm run build` inside `.rt/`; deploy a preview from `.rt/` only if a followed skill says so.

May not: write to `main`; create anything under `components/`; run `vercel --prod`; stage or commit any file outside `alderman-ai/`; remove or prune `.rt/`; edit `.rt/` contents by hand; re-pin the baseline SHA.

If a task appears to need a "may not" item, that is the operator's decision. Say what is needed and stop.

## Five checks the entry doc prescribes before trusting anything there

1. `git -C <repo> rev-parse --short HEAD` → `78f20ed` (if it moved, halt and tell the operator; do not re-pin)
2. `git -C <repo> status --short` → empty
3. `git -C <repo> worktree list` → `.rt` at `78f20ed` on `rt/2026-08-24`
4. `node --version` → v24.x
5. `cd <translator> && npm test` → 252 pass

## Gotchas noted there

- Test command is `npm test`; bare `node --test` hits a Node 24 / Windows bug.
- CRLF vs LF differences in archived exports; diff with `tr -d '\r'`.
- Two different `Working/` folders exist across the projects; `Working/translator` is the external project's.
- The root `.claude/skills/` there holds site skills (`spawn-about-variants`, `kick-off`), not for visitors.

## What this project extracts (read-only) and where it goes

- Font families and weights as loaded by the site (expected Barlow 300–700, JetBrains Mono 400/500, matching the Claude Design project's `fonts/`), type sizes and line-heights, spacing and radius scale, color tokens (recorded for element work only; layout styling stays neutral), logo assets, and the component anatomy of the five groups → `spec/tokens.md`.
- Every value cites file, line, and the commit read (`78f20ed`) → `spec/brand-sources.md`, so drift is detectable when `main` moves.
- Layout frontmatter gets `brand: alderman-ai | neutral`; brand-specific slide components live in this repo's `components/slides/`, never in the site repo.
