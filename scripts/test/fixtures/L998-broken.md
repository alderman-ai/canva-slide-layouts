---
id: "L998"
family: content
archetype: broken_fixture
nested_key:
  a: 1
  b: 2
text_capacity_chars: 999
fonts: [Inter, Nonexistent Font]
fonts_native: yes
status: draft
---

Deliberately invalid: nested frontmatter, an out-of-bounds element, a duplicate `n`,
a non-numeric coordinate, an unregistered font, and a wrong `text_capacity_chars`.

## Elements

| n | role    | x   | y   | w    | h   | font             | weight | size | lh   | align | maxChars | binds | text                         |
|---|---------|-----|-----|------|-----|------------------|--------|------|------|-------|----------|-------|------------------------------|
| 1 | title   | 96  | 96  | 1900 | 180 | Inter            | 600    | 76   | 1.1  | left  | 40       |       | Runs off the right edge      |
| 1 | body    | 96  | 400 | 900  | 200 | Nonexistent Font | 400    | 32   | 1.4  | left  | 50       |       | Duplicate n and unknown font |
| 3 | caption | abc | 900 | 400  | 40  | Inter            | 400    | 24   | 1.35 | left  | 30       |       | Non-numeric x                |
