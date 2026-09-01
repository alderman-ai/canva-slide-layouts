# spec/pairings.md — named font pairings

Read this with `spec/fonts.json` when setting a layout's `pairing` key, when picking type for a new deck, or when deciding what a non-native deck degrades to inside Canva.

**13 pairing ids.** Twelve are the pairings in `research/04` §(b); the thirteenth, `alderman-ai`, is new and comes from the brand fonts already loaded in the "alderman.ai Design System" Claude Design project (`docs/PLAN.md` § Claude Design project, Decision 9). `neutral-default` **is** `research/04` §(b) row 2 (Inter Display 600 / Inter 400) given its canonical id — it is not a fourteenth pairing.

Fonts are a **registry, not an allowlist** (Decision 5): any pairing may be used. `validate` errors only on a family that is absent from `spec/fonts.json`, and warns when `canva_native` is `no` or `unverified`. Wrap widths are computed against Inter metrics regardless of the pairing (`spec/type-scale.md` §4).

## Summary

| # | id | Title / Body | Feel | Free? | Canva-native degrade |
|---|---|---|---|---|---|
| 1 | `sohne-premium-tech` | Soehne Halbfett 600 / Soehne Buch 400 | Premium tech, the Stripe and Linear era | No — Klim commercial | Inter 600 / Inter 400 |
| 2 | `neutral-default` | Inter Display 600 / Inter 400 (cv01, ss03, -0.02em) | Startup and SaaS default | Yes | Native (Inter is in Canva; Inter Display degrades to Inter) |
| 3 | `geist-developer` | Geist 600 / Geist 400 + Geist Mono captions | Developer and infrastructure | Yes | Inter / Inter + IBM Plex Mono |
| 4 | `instrument-founder-editorial` | Instrument Serif Italic 400 / Inter 500 | Founder-editorial, the 2024–26 landing-page look | Yes | DM Serif Display / Inter |
| 5 | `tiempos-editorial-calm` | Tiempos Headline 500 / Suisse Int'l 400 | Editorial-intellectual, calm | No — Klim + Swiss Typefaces | Lora / Inter |
| 6 | `canela-luxury` | Canela Light 300 / GT America 400 | Luxury, hospitality, wellness | No — Commercial Type + Grilli | Cormorant Garamond / Work Sans |
| 7 | `fraunces-warm-consumer` | Fraunces 600 (opsz 144) / Manrope 500 | Warm consumer, DTC | Yes | Fraunces / Manrope (both unverified — see note) |
| 8 | `space-grotesk-ai-tech` | Space Grotesk 700 / DM Sans 400 | AI and "innovation" tech | Yes | Space Grotesk / DM Sans (both unverified — see note) |
| 9 | `georgia-consulting` | Georgia Bold 700 / Arial 400 | Consulting (the McKinsey PowerPoint substitution) | System | Native (Georgia and Arial are Canva system standbys); Lora / Arimo if system fonts are barred |
| 10 | `clash-agency-display` | Clash Display 600 / Satoshi 400 | Agency, bold display, poster-like | Yes — Fontshare FFL | Anton / Poppins (research/04 names Archivo Black / DM Sans) |
| 11 | `playfair-investor-classic` | Playfair Display 700 / Inter 400 | Investor-classic, "sophisticated" | Yes | Native (both in Canva) |
| 12 | `ibm-plex-academic` | IBM Plex Serif 600 / IBM Plex Sans 400 | Academic, data-heavy | Yes | Merriweather / Fira Sans (Plex is unverified in Canva) |
| 13 | `alderman-ai` | Barlow 600 / Barlow 400 + JetBrains Mono captions and code | alderman.ai house brand | Yes | Barlow is native; JetBrains Mono degrades to IBM Plex Mono |

**Note on rows 7, 8 and 12.** `research/04` §(b) calls these "both Canva", but `research/04` §(a) separately flags DM Sans, Manrope, Space Grotesk, IBM Plex and Fraunces as needing editor verification before being tagged native. `spec/fonts.json` therefore records them `unverified`, and the degrade column here names the confirmed-native second choice. Resolve this by checking the Canva picker once and updating `canva_native` in `spec/fonts.json`.

---

## Roles per weight

For each pairing: which family and weight fills each type-scale token (`spec/type-scale.md` §2).

### 1. `sohne-premium-tech`
| Token | Family / weight |
|---|---|
| display, title | Soehne Halbfett 600 |
| subtitle, lead | Soehne Kraeftig 500 |
| body | Soehne Buch 400 |
| caption, eyebrow | Soehne Buch 400 (eyebrow in caps, +0.08em) |

Degrade: Inter 600 / 500 / 400. Inter is a 90% metric match, so wrap widths hold (`research/04` §(a)).

### 2. `neutral-default`
| Token | Family / weight |
|---|---|
| display, title | Inter Display 600, tracking -0.02em (display -0.03em) |
| subtitle | Inter Display 500 |
| lead, body | Inter 400 |
| caption | Inter 400 |
| eyebrow | Inter 500, caps, +0.08em |

OpenType features `cv01` and `ss03` as specified in `research/04` §(b) row 2; they do not survive a Canva import, so treat them as HTML-preview-only. This is the default `pairing` for any layout that does not declare one.

### 3. `geist-developer`
| Token | Family / weight |
|---|---|
| display, title | Geist 600 |
| subtitle, lead | Geist 500 |
| body | Geist 400 |
| caption, eyebrow, code | Geist Mono 400 (500 for emphasis) |

Degrade: Inter 600 / 500 / 400 with IBM Plex Mono for captions and code.

### 4. `instrument-founder-editorial`
| Token | Family / weight |
|---|---|
| display, title | Instrument Serif 400 Italic |
| subtitle | Inter 500 |
| lead, body | Inter 500 (400 at long measures) |
| caption, eyebrow | Inter 400 |

Instrument Serif has only Regular and Italic, so `fallback_weight_map` collapses 600 and 700 to 400. Degrade: DM Serif Display 400 / Inter.

### 5. `tiempos-editorial-calm`
| Token | Family / weight |
|---|---|
| display, title | Tiempos Headline 500 (600 for short titles) |
| subtitle | Tiempos Text 500 |
| lead, body | Suisse Int'l 400 |
| caption, eyebrow | Suisse Int'l 400 |

Degrade: Lora 500 / Inter 400. Both families are commercial, so this pairing always needs a Brand Kit upload before import.

### 6. `canela-luxury`
| Token | Family / weight |
|---|---|
| display, title | Canela Light 300 |
| subtitle | Canela Regular 400 |
| lead, body | GT America 400 |
| caption, eyebrow | GT America 500 |

Do not use Canela below 56 px. Degrade: Cormorant Garamond 300/400 / Work Sans 400.

### 7. `fraunces-warm-consumer`
| Token | Family / weight |
|---|---|
| display, title | Fraunces 600, opsz 144 |
| subtitle | Fraunces 500, opsz 72 |
| lead, body | Manrope 500 |
| caption, eyebrow | Manrope 500 (Manrope has no italics) |

Canva rejects variable fonts, so the opsz cuts must be exported as separate static files (`research/04` §(d)). Degrade if Fraunces or Manrope are not in the picker: Lora 700 / Poppins 500.

### 8. `space-grotesk-ai-tech`
| Token | Family / weight |
|---|---|
| display, title | Space Grotesk 700 |
| subtitle | Space Grotesk 500 |
| lead, body | DM Sans 400 |
| caption | DM Sans 400 |
| eyebrow | DM Sans 500, caps, +0.08em |

Neither family carries italics in the weights used. Degrade if not in the picker: Oswald 500 / Poppins 400.

### 9. `georgia-consulting`
| Token | Family / weight |
|---|---|
| display, title | Georgia 700 |
| subtitle | Georgia 400 |
| lead, body | Arial 400 |
| caption | Arial 400 |
| eyebrow | Arial 700, caps, +0.08em |

The deliberate system-font consulting look (`research/04` headline findings): two to three sizes per deck, titles at most two lines, the same size everywhere. Degrade if system fonts are barred: Lora 700 / Arimo 400.

### 10. `clash-agency-display`
| Token | Family / weight |
|---|---|
| display, title | Clash Display 600 |
| subtitle | Clash Display 500 |
| lead, body | Satoshi 500 (400 at long measures) |
| caption, eyebrow | Satoshi 500 |

Clash Display is title-only; never use it below 40 px. Degrade: Anton 400 / Poppins 400 (`research/04` §(b) names Archivo Black / DM Sans; both are unverified in Canva, so the confirmed-native pair is used here).

### 11. `playfair-investor-classic`
| Token | Family / weight |
|---|---|
| display, title | Playfair Display 700 (900 for hero) |
| subtitle | Playfair Display 400 |
| lead, body | Inter 400 |
| caption | Inter 400 |
| eyebrow | Inter 500, caps, +0.08em |

Fully native: both families are on the Canva free list. No degrade needed.

### 12. `ibm-plex-academic`
| Token | Family / weight |
|---|---|
| display, title | IBM Plex Serif 600 |
| subtitle | IBM Plex Serif 400 |
| lead, body | IBM Plex Sans 400 |
| caption | IBM Plex Sans 400 |
| eyebrow | IBM Plex Sans 500, caps, +0.08em |
| code | IBM Plex Mono 400 |

Degrade: Merriweather 700 / Fira Sans 400 (Merriweather has no 600, so 600 maps to 700 — see `fallback_weight_map` in `spec/fonts.json`).

### 13. `alderman-ai`
| Token | Family / weight |
|---|---|
| display | Barlow 700 |
| title | Barlow 600 |
| subtitle | Barlow 500 |
| lead, body | Barlow 400 |
| caption | JetBrains Mono 400 |
| eyebrow, labels, code | JetBrains Mono 500, caps for eyebrows, +0.08em |

The house pairing for `brand: alderman-ai` layouts. Both families are already loaded in the "alderman.ai Design System" Claude Design project — Barlow 300/400/500/600/700 and JetBrains Mono 400/500 — as WOFF2, which Canva does **not** accept; static OTF or TTF cuts of the same weights must be uploaded to the Brand Kit (`docs/PLAN.md` § Claude Design project; `research/04` §(d)). Barlow itself is on the Canva free list, so only JetBrains Mono strictly needs uploading; its degrade is IBM Plex Mono. Exact token values (sizes, line-heights, spacing) are lifted into `spec/tokens.md` by the brand-extract step (Decision 6).

---

## Canva delivery notes (all pairings)

From `research/04` §(d):

- Uploads are **OTF, TTF or WOFF** only, under 15 MB per file. **No WOFF2, no variable fonts** — each weight and italic is a separate static file.
- **500 fonts per Brand Kit, up to 18 styles per family.** Styles group only when the internal family-name metadata matches.
- **No faux bold or italic**: Canva's B and I buttons stay greyed out unless that style file exists. Every weight in the tables above must be uploaded as its own file.
- Whether Canva matches uploaded Brand Kit fonts **by name** on import is **unverified**. Mitigation: upload before importing, then use the font picker's **Change All** per family.
- Only Pro, Teams, Business, Education and Nonprofit plan owners, admins or brand designers can upload.

## Sources

- `research/04` §(b) — the twelve pairings, their feel labels, free/commercial status and Canva degrades.
- `research/04` §(a) — the per-family fallback proximity scores and the "verify in the editor" caveat behind the unverified degrades.
- `research/04` §(c) — the type-scale tokens the role tables map onto, and the tracking values.
- `research/04` §(d) — the Canva upload constraints in the delivery notes.
- `research/01` §3 — the Canva free-font list that decides which degrades are confirmed-native.
- `docs/PLAN.md` § Claude Design project and `docs/DECISIONS.md` #5, #6, #9 — the `alderman-ai` pairing, the registry-not-allowlist rule and the read-only brand source.
- `spec/fonts.json` — every family named here, with its `canva_native`, `canva_fallback` and `fallback_weight_map`.
