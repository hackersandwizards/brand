---
kind: review
status: open
priority: 2
order: 3
owner: Benedikt
area: brand
evidence: tokens/marker.css, scan/markers.ts, release v1.21.0
recommended: upper
options:
  - key: upper
    label: Two thirds from the x-height middle to the cap-height middle (shipped)
    detail: "--hw-marker-mid: calc(1ex / 6 + 1cap / 3), 0.334em in Inter, about 1 px higher than before at 16 px."
    score: 9.03
    noise: 0.34
  - key: between
    label: Midway between the x-height middle and the cap-height middle
    detail: 0.318em in Inter, where Chrome draws its own disc and square at large sizes.
    score: 8.8
    noise: 0.34
  - key: cap
    label: Half the cap height
    detail: 0.364em in Inter, where Inter's own capitals bullet (bullet.case) sits.
    score: 8.64
    noise: 0.34
  - key: x
    label: The x-height middle (before)
    detail: 0.273em in Inter, a hair under Inter's own bullet glyph (0.29em).
    score: 7.72
    noise: 0.34
images:
  upper:
    - src: docs-timesheet.jpg
      caption: Timesheet cell, before and now
    - src: docs-proposal.jpg
      caption: Proposal cards, before and now
    - src: specimen.jpg
      caption: 10 pt and 16 px, sentence case, lowercase starts and capitals, before and now
  x:
    - src: browser-default.jpg
      caption: Chrome's unstyled disc and square and Inter's bullet glyph on the same text
---

# The list marker sits higher: please look at it on your surfaces

The square now sits two thirds of the way from the first line's x-height middle to its cap-height
middle. Before, it sat on the x-height middle, which reads low beside a line that opens with a
capital. In both review rounds that position came last, with every persona and both models. The
change is in brand v1.21.0. Each consumer takes it with a pin bump, and its own `brand-markers`
then measures the new position.

## Your two questions

**How does a browser place an unstyled bullet?** The CSS Lists spec leaves it open: "CSS does not
specify the precise location of the marker box"
([css-lists-3](https://drafts.csswg.org/css-lists-3/)). The `disc` and `square` markers are
U+2022 and U+25AA ([css-counter-styles-3](https://drafts.csswg.org/css-counter-styles-3/)).
Chrome does not set them from the font: it draws a shape sized from the font's ascent. Measured
here in Inter, its middle sits 0.32em above the baseline at 100 px, about midway between the
x-height middle (0.273em) and the cap-height middle (0.364em). At 16 px pixel rounding brings it
down to 0.28em. Inter's own `•` glyph sits at 0.29em, just above the x-height middle. Inter also
has a `bullet.case` glyph for capitals, centred exactly on half the cap height (read from the
font file).

**What do typographers and design systems recommend?** Ilene Strizver (Fonts.com) writes: "If all
of your items begin with a cap, center the bullet on the cap, or a bit lower so it balances with
the negative spaces created by the lowercase." Items that start lowercase centre on the x-height
([source](https://www.myfonts.com/pages/fontscom-learning-fontology-level-3-signs-and-symbols-bullets)).
Butterick's chapter on lists says nothing on vertical position. GOV.UK Frontend, Tailwind
Typography, Primer, USWDS and Polaris keep the browser's own marker. Carbon puts a dash glyph in
`::before`. None of them sets a vertical offset, so h&w's drawn square has no design-system
precedent and follows the typographic rule instead.

## Review

Large panel, blind: a type designer, a brand designer, a client's engineering lead reading a
proposal and a timesheet, and a developer reading the os notes. Claude and Codex, two runs each
with fresh shuffles and neutral labels, the current position among the variants unmarked. Each
saw the same regions at their real size: documents' proposal cards and timesheet cell, three slide
regions at 1920, the website's procurement page, the os notes and a specimen with capitals and
lowercase starts. Criteria fixed before scoring, 1 to 10: C1 centred at a glance, C2 belongs to
the first line of a two-line item, C3 centred beside capitals and beside lowercase starts, C4 calm
in a column.

Round 1 (noise 0.48): midway 8.97, half the cap height 8.80, the x-height middle 7.64. The
leader's top cause, named by most reviewers, was a slight low lean beside capitals. Round 2 added
the variant two thirds of the way up:

| Variant | C1   | C2   | C3   | C4   | Mean | Claude | Codex |
| ------- | ---- | ---- | ---- | ---- | ---- | ------ | ----- |
| upper   | 8.94 | 9.31 | 8.69 | 9.19 | 9.03 | 8.75   | 9.31  |
| between | 8.88 | 9.00 | 8.38 | 8.94 | 8.80 | 8.69   | 8.91  |
| cap     | 8.56 | 9.19 | 8.00 | 8.81 | 8.64 | 7.81   | 9.47  |
| x       | 7.69 | 8.19 | 7.06 | 7.94 | 7.72 | 7.34   | 8.09  |

The lead of `upper` over `between` sits inside the noise of 0.34. `upper` won three of the four
model and run means, and it is the only variant both models put in their top two. Codex leaned to
`cap` within its noise, and Claude scored `cap` second to last. Votes to ship: `upper` 7,
`cap` 5, `between` 4, `x` 0.

## What changed

- `tokens/marker.css`: the default `--hw-marker-mid` is `1ex / 6 + 1cap / 3`, for the list marker
  and `.hw-marker` alike. A capitals label keeps `0.5cap`, as slides sets it. Safari before 17.2
  has no `cap` unit and keeps the x-height middle (checked by forcing the fallback in Chrome, not
  in Safari).
- `elements/prose.css`: the task checkbox takes the same middle, so checkboxes and squares share
  one line in a column.
- `brand-markers` measures the new target: the line opens with "xxxxHHHH", and the target is two
  thirds of the way from the x band's ink middle to the H band's. Where `text-transform` sets the
  line in capitals, both bands are capitals and the target is the cap middle.
- Measured at 4x with the new rule: documents' proposal and timesheet, slides' print frames, the
  website and the os notes, 98 markers, all within 0.09 px. With their current CSS, the same pages
  read 0.85 to 1.05 px low and 2.2 px low on the 1920 slides.

The proposal and timesheet images are the fictional samples the public documents catalog
already shows.

Look at the new position on a proposal, a slide and the website after each repo bumps its pin. If
it reads high beside lowercase lists, `between` is the next candidate.
