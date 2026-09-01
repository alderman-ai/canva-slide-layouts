# presentations/

One directory per deck. Contents are private by default: everything under `presentations/*` except this README is git-ignored, so briefs, context files, and filled slides never reach the public repo. Publish a deck deliberately with `slides.ps1 export-bundle <slug> -Public` (Skill 5).

Layout of a deck directory (see `docs/PLAN.md` § Repository layout and § Pipeline for a presentation):

```
<slug>/
  brief.md        dials: audience, purpose, delivery_mode, length_minutes|target_slides, density, polish, pairing, brand_kit_id, fonts_native_required, content_public
  context/        all source material (md, txt, csv, json, pdf, images, urls.md); _index.md is generated
  units.md        typed content units extracted from context (vocab-checked)
  plan.md         ordered slides → layout id → unit ids, plus fit report
  slides/         S##-<archetype>.md filled hybrid MDs (and .v<n> forks from redlines)
  build/          deck.html, canva-ops/*.json, previews/, bundle.json
  canva.md        design id, page ids, locators, upload log, redline sync log
```

Create one with `.\scripts\slides.ps1 new-deck <slug>`.
