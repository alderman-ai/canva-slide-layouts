# 04 · Professional slide typography: fonts, pairings, type scale, Canva font upload

- Date: 2026-09-02
- Source: research agent (web), planning session
- Focus: which fonts and type systems top-tier slide templates use; Canva-native fallbacks; type scale at 1920x1080; Canva Brand Kit font-upload facts
- Caveats declared by the report: "in Canva" claims come from third-party lists, verify in the editor before tagging; Pitch/Gamma do not publish their built-in theme fonts; name-matching of uploaded fonts on import is unverified

---

## Slide Typography Research Report (Sept 2026)

### Headline findings

- **The "design-forward deck" world has converged on a small set of neo-grotesks**: Inter (free), Söhne (commercial — Stripe, OpenAI, Linear-adjacent), Geist (free, Vercel), GT America / Suisse Int'l / Neue Haas Grotesk (commercial), with **Instrument Serif, Fraunces, Tiempos, Canela** as the editorial/luxury serif counterweights. Fontshare's Satoshi / General Sans / Cabinet Grotesk / Clash Display are the free "looks-expensive" tier. Sources: [madegooddesigns popular fonts](https://madegooddesigns.com/popular-fonts/), [font trends 2026](https://madegooddesigns.com/font-trends-2026/), [Söhne in use](https://fontsinuse.com/typefaces/97994/soehne), [FontAlternatives Söhne](https://fontalternatives.com/alternatives/sohne/).
- **Product-company decks are really "website typography at slide scale"**: Linear = Inter Variable, weights 300/510/590, `cv01`+`ss03`, display sizes 72/64/48px with ~-0.022em tracking ([Open Design Linear](https://opendesigner.io/design-systems/linear-app), [typ.io](https://typ.io/s/2jmp)). Vercel = Geist 400/500/600, sizes 12–64px, h1 48px at -2.28px (~-4.75%), line-heights 1.15 / 1.5 / 1.625 ([Vercel DESIGN.md](https://github.com/educlopez/design-bites/blob/main/design-mds/vercel.com/DESIGN.md), [SeedFlip](https://seedflip.co/blog/vercel-design-system)). Stripe used Söhne across dashboard/docs/marketing and has since moved to a rounder custom face; OpenAI moved from Söhne to OpenAI Sans ([font trends 2026](https://madegooddesigns.com/font-trends-2026/), [FontAlternatives](https://fontalternatives.com/alternatives/sohne/)).
- **Consulting decks are deliberately system-font**: McKinsey's brand faces are Bower (serif) + McKinsey Sans, substituted in PowerPoint by **Georgia titles / Arial body**; BCG's brand face is Henderson Sans, falling back to **Trebuchet MS**; Bain uses Helvetica Neue / Arial Narrow-type fallbacks ([Slideworks](https://slideworks.io/resources/decoding-mckinseys-visual-identity-and-powerpoint-template), [Deckary](https://deckary.com/blog/consulting-slide-standards), [ZeCraft Henderson](https://www.zecraft.com/fonts/bcg-henderson-sans/)). Two-to-three sizes per deck; titles ≤2 lines, same size everywhere.
- **Pitch-deck templates**: the widely distributed Sequoia template (Slidebean/VIP Graphics redraws) is set in **Inter**; YC's official seed deck is intentionally plain Google Slides (Arial-class) and third-party YC redraws use Inter ([pitchdeckstudios](https://www.pitchdeckstudios.com/product/sequoia-pitch-deck-template/), [YC HN thread](https://news.ycombinator.com/item?id=16568546), [VIP Graphics YC](https://vipgraphics.gumroad.com/l/YCdeck)). Figma Slides' basic template defaults to Inter ([Figma help](https://help.figma.com/hc/en-us/articles/26621828788631-Find-and-use-slide-deck-templates)). Keynote's White/Black themes use Helvetica Neue (older builds Gill Sans); Apple's own keynotes use SF Pro Display, which Apple specifies for ≥20pt ([Apple Community](https://discussions.apple.com/thread/255212619), [Apple Fonts](https://developer.apple.com/fonts/)).
- **Gap**: neither Pitch.com nor Gamma publicly documents which families ship in their built-in themes; both support TTF/OTF (Gamma also WOFF) custom uploads on paid plans ([Pitch help](https://help.pitch.com/en/articles/4057308-upload-custom-fonts), [Gamma help](https://help.gamma.app/en/articles/11029150-can-i-add-my-own-colors-and-fonts-to-gamma)). Pitch users must download Google Fonts and upload them manually.

---

### (a) Font table

Weights = what templates typically use for title / body / caption. "Canva" = confirmed in Canva's library per [madegooddesigns](https://madegooddesigns.com/best-canva-fonts/), [Firther serif list](https://www.firtherdesignco.com/blog/the-best-free-serif-fonts-on-canva), [bloggingguide](https://bloggingguide.com/best-sans-serif-fonts-in-canva/), [NodeSure](https://www.nodesure.com/top-50-best-canva-fonts-for-2026/).

| Family | Category | Licence | Source | Typical role | Weights used | Fallback (metrics-near) |
|---|---|---|---|---|---|---|
| Inter / Inter Display | Neo-grotesk | Free OFL | Google Fonts | Body + titles (startup default) | 400/500/600 body; 500–700 titles | **In Canva.** Itself is the fallback for Söhne, Suisse, Neue Haas, Graphik |
| Geist | Geometric grotesk | Free OFL | Google Fonts / Vercel | Dev/tech titles+body | 400/500/600 | Inter (Canva) |
| Söhne (+Breit/Schmal/Mono) | Neo-grotesk (Akzidenz) | Commercial (Klim) | klim.co.nz | Premium tech titles+body | Buch 400 / Kräftig 500 / Halbfett 600 | Inter 90%, Geist 85%, Work Sans 82% |
| GT America | Grotesk (American/Swiss hybrid) | Commercial (Grilli) | grillitype.com | Corporate/tech | 400/500/700 | Inter 86%, Work Sans 83%, IBM Plex Sans 80% |
| Suisse Int'l | Neo-grotesk | Commercial (Swiss Typefaces) | swisstypefaces.com | Editorial/agency | 400/500/600 | Inter 90%, Work Sans, IBM Plex Sans |
| Neue Haas Grotesk / Helvetica Now | Grotesk | Commercial (Monotype) | fonts.com | Corporate, Keynote-style | 45/55/65/75 | Inter (density), Arimo/Helvetica in Canva |
| Graphik | Grotesk | Commercial (Commercial Type) | commercialtype.com | Corporate/consulting-modern | 400/500/600 | Inter 88%, Work Sans |
| SF Pro Display/Text | Neo-grotesk | Free for Apple platforms only | developer.apple.com/fonts | Apple-style decks | 400/500/600/700 | Inter |
| Work Sans | Grotesk | Free OFL | Google Fonts | Body | 400/500/600 | **In Canva** |
| DM Sans | Geometric/low-contrast | Free OFL | Google Fonts | Body, friendly SaaS | 400/500/700 | **In Canva** |
| Manrope | Geometric (Circular-like) | Free OFL | Google Fonts | Titles+body | 500/600/700 (no italics) | **In Canva** |
| Space Grotesk | Quirky grotesk | Free OFL | Google Fonts | Titles (tech/AI) | 500/700 (no italics) | **In Canva** |
| IBM Plex Sans (+Mono/Serif) | Grotesk | Free OFL | Google Fonts | Technical/data | 400/500/600 | **In Canva** |
| Plus Jakarta Sans | Geometric | Free OFL | Google Fonts | Warm titles | 500/600/700 | Canva: check; else DM Sans |
| Satoshi | Geometric grotesk | Free (ITF FFL) | Fontshare | Titles+body | 500/700 (10 styles + variable) | DM Sans / Manrope |
| General Sans | Swiss-geometric | Free (ITF FFL) | Fontshare | Titles+body | 500/600/700 (12 styles) | Inter / Work Sans |
| Cabinet Grotesk | Soft grotesk | Free (ITF FFL) | Fontshare | Titles | 700/800 (8 wts, Thin–Black) | Work Sans |
| Clash Display | Tight neo-grotesk display | Free (ITF FFL) | Fontshare | Titles only | 500/600 (6 wts) | Space Grotesk / Archivo |
| Neue Montreal | Neo-grotesk | Free basic tier (Pangram Pangram) | pangrampangram.com | Agency decks | 400/500/700 | Inter |
| Instrument Serif | Editorial serif (display) | Free OFL | Google Fonts | Titles only (Regular + Italic only) | 400 + 400i | Not confirmed in Canva; use DM Serif Display / Playfair (Canva) |
| Fraunces | Soft "old style" serif, opsz 9–144 | Free OFL | Google Fonts | Titles (wonky), body at low opsz | 300–600 titles | **In Canva** (Fraunces Semibold) |
| Playfair Display | High-contrast Didone | Free OFL | Google Fonts | Titles | 400/700/900 | **In Canva** |
| Tiempos Headline / Text | Editorial transitional serif | Commercial (Klim) | klim.co.nz | Titles (Headline) / body (Text) | 400/500/600 | Instrument Serif (headline), Source Serif / Lora (text) |
| Canela | Soft editorial serif | Commercial (Commercial Type) | commercialtype.com | Luxury titles | Light/Regular | Lora 77%, Instrument Serif, Cormorant Garamond (Canva) |
| Recoleta | Soft retro serif | Commercial (Latinotype) | MyFonts | Friendly titles | 500/600 | Fraunces 82% (Canva) |
| Newsreader | Editorial serif, opsz 6–72 | Free OFL | Google Fonts | Body serif | 400/500 | Lora / Libre Baskerville (Canva) |
| Georgia | Transitional serif | System | Windows/mac | Consulting titles | 400/700 | Lora (Canva) |
| Arial / Helvetica | Grotesk | System | — | Consulting body | 400/700 | Arimo / Helvetica in Canva |
| Trebuchet MS | Humanist sans | System | Windows | BCG-style body | 400/700 | Fira Sans / Open Sans (Canva) |
| Canva Sans / Canva Sans Display | Humanist sans (Colophon) | Canva only | Canva | Native default | 400/700 | — (is the native fallback) |

Sources for fallback scores: [FontAlternatives Söhne](https://fontalternatives.com/alternatives/sohne/), [GT America](https://fontalternatives.com/fonts-like/gt-america/), [Suisse](https://fontalternatives.com/fonts-like/suisse/), [Graphik](https://fontalternatives.com/alternatives/graphik/), [Canela](https://fontalternatives.com/alternatives/canela/with/elegant/), [Recoleta](https://fontalternatives.com/alternatives/recoleta/), [Neue Haas](https://fontbench.com/alternatives-to/neue-haas-grotesk/). Fontshare weights: [General Sans](https://glypho.org/font/general-sans/), [Clash Display](https://freebiesbug.com/free-fonts/clash-display/), [Cabinet Grotesk](https://freebiesbug.com/free-fonts/cabinet-grotesk/), [licence](https://madegooddesigns.com/fontshare/). Instrument Serif weights: [Jukebox](https://www.jukeboxprint.com/fonts/font-preview/instrument-serif). Fraunces/Newsreader axes: [Google Fonts tweet](https://x.com/googlefonts/status/1377251647995383808), [Fontsource Newsreader](https://fontsource.org/fonts/newsreader). Tiempos: [Klim](https://klim.co.nz/retail-fonts/tiempos-headline/). Geist: [Google Fonts](https://fonts.google.com/specimen/Geist), [licence](https://github.com/vercel/geist-font/blob/main/LICENSE.txt).

Caveat: "in Canva" claims come from third-party lists, not a Canva-published index — verify DM Sans/Manrope/Space Grotesk/IBM Plex in the editor before tagging.

### (b) Recommended pairings

| # | Title / Body | Feel | Free? | Canva-native degrade |
|---|---|---|---|---|
| 1 | Söhne Halbfett / Söhne Buch | Premium tech (Stripe/Linear era) | No | Inter 600 / Inter 400 |
| 2 | Inter Display 600 / Inter 400 (cv01, ss03, -0.02em) | Startup/SaaS default | Yes | Native |
| 3 | Geist 600 / Geist 400 + Geist Mono captions | Developer/infra | Yes | Inter / IBM Plex Mono |
| 4 | Instrument Serif Italic + Inter 500 body | Founder-editorial, 2024–26 landing-page look | Yes | DM Serif Display / Inter |
| 5 | Tiempos Headline / Suisse Int'l | Editorial-intellectual (Anthropic-style calm) | No | Lora / Inter |
| 6 | Canela Light / GT America | Luxury, hospitality, wellness | No | Cormorant Garamond / Work Sans |
| 7 | Fraunces (opsz 144, soft) / Manrope | Warm consumer, DTC | Yes | Fraunces / Manrope (both Canva) |
| 8 | Space Grotesk 700 / DM Sans 400 | AI / "innovation" tech | Yes | Both Canva |
| 9 | Georgia Bold / Arial | Consulting (McKinsey) | System | Lora / Arimo |
| 10 | Clash Display 600 / Satoshi 400 | Agency, bold display, poster-like | Yes (Fontshare) | Archivo Black / DM Sans |
| 11 | Playfair Display 700 / Inter 400 | Investor-classic, "sophisticated" | Yes | Both Canva |
| 12 | IBM Plex Serif 600 / IBM Plex Sans 400 | Academic / data-heavy | Yes | Both Canva |

Pairing evidence: [Whitepage font guide](https://www.whitepage.studio/blog/the-ultimate-guide-for-using-fonts-in-decks-presentations), [Presenter's Arena](https://presentersarena.com/design/15-best-fonts-for-presentations-in-2026-with-pairing-examples), [madegooddesigns Space Grotesk pairings](https://madegooddesigns.com/space-grotesk-font-pairing/), [Instrument Serif pairing note](https://www.jukeboxprint.com/fonts/font-preview/instrument-serif).

### (c) Type-scale recommendation for 1920×1080

Unit conversion first: a PowerPoint 16:9 slide is 13.333×7.5 in = 960×540 pt, so at 1920×1080 **1 pt = 2 px** ([AiPPT](https://www.aippt.com/blog/powerpoint-slide-dimension), [BrightCarbon](https://www.brightcarbon.com/blog/presentation-font-size/)). Canva's size field on a 1920×1080 presentation behaves as canvas px (third-party guides give "PDF pt × 1.33 = Canva unit", i.e. CSS px) ([Canva size guide](https://okevance.com/dr/canva/)). So consulting "44pt title / 18pt body" ≈ 88 / 36 px.

Documented conventions: modular ratios 1.25 / 1.333 / 1.414 / 1.5 ([designwithjack](https://designwithjack.dev/)); body ≥24px screen, title ≥48px, caption ≥18px, max 4 sizes per slide, 6 per deck; display line-height 1.05–1.2, body 1.4–1.6; line length 45–60ch; ≥96px safe margin; presentations.ai: titles 36–44pt, subtitles 28–32pt, body 18–24pt, captions 12–16pt ([presentations.ai](https://www.presentations.ai/blog/what-font-size-is-best-for-presentations)); Superchart live: 60/40/20pt vs leave-behind 40/20/12pt ([Superchart](https://www.superchart.io/blog/presentation-font-size)). Tracking: negative only at display sizes — Linear -0.022em at 48–72px, Vercel -0.04 to -0.0475em; positive tracking reserved for all-caps labels ([madegooddesigns line-height](https://madegooddesigns.com/line-height-letter-spacing/)). Optical sizing: use Display cuts above ~20pt (SF), Inter Display for large text, Tiempos Headline vs Text, Fraunces opsz 72–144 for titles ([rsms.me/inter](https://rsms.me/inter/), [Apple fonts](https://developer.apple.com/fonts/)).

Proposed scale (ratio 1.333, base 32px, two modes):

| Token | Read-deck px (lh / tracking) | Live-talk px | Max chars/line |
|---|---|---|---|
| Display (hero/section) | 128 (1.0 / -0.03em) | 160 | 20–28 |
| Title (H1) | 76 (1.1 / -0.02em) | 96 | 35–45, ≤2 lines, ≤10 words |
| Subtitle / H2 | 56 (1.15 / -0.01em) | 64 | 45–55 |
| H3 / lead | 42 (1.25 / 0) | 48 | 55–60 |
| Body | 32 (1.4 / 0) | 40 | 45–60 (wrap ≈ 900–1000px in Inter) |
| Caption / source | 24 (1.4 / 0) | 28 | 70 |
| Label / eyebrow (caps) | 20 (1.2 / +0.08em) | 24 | — |

Keep ≤4 sizes per slide; 8px spacing grid; 96px margins.

### (d) Canva font-upload facts

- Plans: Pro, Teams, Business, Education, Nonprofits; only owners/admins/brand designers can upload ([Canva help](https://www.canva.com/help/upload-fonts/)).
- Formats: **OTF, TTF, WOFF** only — no WOFF2, EOT, SVG, ZIP; <15MB per file; **variable fonts unsupported**; must be licensed for embedding (Adobe Originals rejected) ([font upload error](https://www.canva.com/help/font-upload-error/), [formats](https://www.canva.com/help/upload-formats-requirements/)).
- Limits: 500 fonts per Brand Kit; **up to 18 styles per family**; each weight/italic is a separate static file; styles auto-group only if the internal family-name metadata matches — otherwise fix names (FontBase/Font Book) and re-upload; fonts uploaded before July 2023 need re-upload to group ([Canva help](https://www.canva.com/help/upload-fonts/), [Fallon Travels](https://fallontravels.com/blog/upload-fonts-to-canva)).
- No faux bold/italic: B/I buttons stay greyed unless that style file exists ([Adventures with Art](https://adventureswithart.com/cant-italicize-bold-fonts-canva/)).
- Brand Kit roles: one default font per H1–H5 + body, with size/bold/italic per role ([brand fonts](https://www.canva.com/help/brand-fonts/)).
- **PPTX import**: Canva "tries to identify and match" fonts and otherwise substitutes the closest library font; the docs do *not* state that uploaded Brand Kit fonts are matched by name. Practical mitigation: upload fonts before import, then use the font picker's **Change All** to swap per family ([PowerPoint import](https://www.canva.com/help/powerpoint-import/), [SlideModel](https://slidemodel.com/how-to-change-fonts-in-canva/)). Treat name-matching as unverified and test with one file.
- Import ceilings: 300MB .pptx, 300 slides, 1,400 elements; charts/SmartArt/WordArt dropped.

Practical implication for the layout library: design wrap widths against Inter metrics (the fallback for nearly every commercial grotesk), ship every commercial family as static OTF weight files (Regular/Medium/Semibold + italics), and tag each layout with a `fallback_family` so a Söhne or GT America layout re-renders in Inter/Work Sans with ≤1 line drift.
