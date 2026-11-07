# The brand corner on the outermost block only

Shipped in v1.21.0 (v1.21.1 covers closed panels and the engines' corner roles): a block, picture, field or button inside a block with the brand corner takes
the small corner. The rule is in `tokens/tokens.css`, `elements/card.css` sets it, and
`brand-elements` fails a brand corner inside a brand corner.

## Inventory (07.11., before the rule)

Brand corners counted in the browser: top-left and bottom-right larger than top-right. "Nested"
means one sits inside another.

| Surface, view                       | Brand corners | Nested | With the rule |
| ----------------------------------- | ------------- | ------ | ------------- |
| documents, preparation sheet (A4)   | 7             | 3      | 4, 0 nested   |
| documents, handout, first page      | 4             | 0      | 4             |
| documents, proposal without prices  | 8             | 0      | 8             |
| slides, content slide with cards    | 4             | 0      | 4             |
| slides, code slide                  | 2             | 0      | 2             |
| slides, statement slide             | 0             | 0      | 0             |
| website, home, whole page           | 42            | 8      | 34, 0 nested  |
| website, training page, whole page  | 24            | 0      | 24            |
| practitioners, overview, whole page | 115           | 57     | 58, 0 nested  |
| admin, repository hub               | 18            | 13     | 5, 0 nested   |
| os, deal detail page                | 1             | 0      | not measured  |
| trainer hub, start page             | 9             | 0      | 9             |
| mail, letter with picture           | 0             | 0      | 0             |

The nested ones were code blocks in a step card (documents), portraits in a person card
(practitioners, website), option cards and buttons in a card (admin). "With the rule" is
`elements/card.css`'s rule injected into the consumer's own page at v1.19.2. No consumer source
was changed. The os page had gone offline before that run; it holds one brand corner and nothing
nested.

## Sources

- Nested radii in design systems: the inner radius is the outer radius minus the padding
  ([CSS-Tricks](https://css-tricks.com/?p=15151),
  [30 seconds of code](https://30secondsofcode.org/css/s/nested-border-radius),
  [DEV](https://dev.to/sgbp/the-concentric-border-radius-rule-why-nested-rounded-corners-look-slightly-wrong-3hog)).
  At 20 px against a 24 px card padding that leaves nothing, so the small corner is the nearest
  step.
- [Atlassian radius](https://atlassian.design/foundations/radius): containers take the larger
  radii; imagery inside tables and supporting elements take the small one.
- [Priority Commerce brand device](https://brandguidelines.prioritycommerce.com/brand-device):
  the frame is not overused in layouts and goes to key images or hero sections.

## Candidates

- **A**: a block inside a block with the brand corner takes the small corner.
- **B**: A, and every code block takes the small corner.
- **C**: one brand corner per view, the first outermost block; every other block takes the small
  corner. This breaks the current rule that pictures and buttons take the brand corner.

The images: `2026-11-07-corner-nesting/` (the preparation sheet in all four, the code slide now
and under B).

## Blind review

The panel was large: four personas (a brand designer, a CTO reading proposals and slides, a
trainer handing out sheets, a developer copying commands), Claude (opus) and Codex (gpt-6.1-sol),
and the current state as an unmarked arm. The criteria were fixed before the first score: brand
recognisable, calm, hierarchy, room. Six surfaces at real size: preparation sheet, handout, code
slide, cards slide, practitioners, website training page.

Round 1 put the four arms of a surface in one 2x2 sheet, with labels shuffled per surface. Every
arm landed within 0.1 of the others, because the tiles were too small to show a corner. Round 1
is not counted.

Round 2: each image separate at full size, one label per arm for each reviewer, a forced ranking
per surface, two runs each (16 reviews). The overall score is on a 10-point scale:

| Arm     | Overall | Mean rank, Claude run 1 / 2 | Mean rank, Codex run 1 / 2 |
| ------- | ------- | --------------------------- | -------------------------- |
| A       | 8.30    | 1.96 / 1.38                 | 1.83 / 1.88                |
| B       | 8.18    | 1.50 / 2.17                 | 1.50 / 1.46                |
| current | 7.94    | 3.13 / 2.96                 | 3.42 / 2.88                |
| C       | 7.55    | 3.42 / 3.50                 | 3.25 / 3.79                |

Noise is the mean gap between a reviewer's two runs: 0.28, at most 1.3. The ranking carries a halo
effect. A, B and the current state are pixel-identical on the cards slide and the training page,
yet each reviewer ordered them there as everywhere else. The decision therefore rests on the
criteria sums of the pages where two arms differ:

| Pair, page                        | Round 2 wins / losses / ties | Second pass |
| --------------------------------- | ---------------------------- | ----------- |
| A over current, preparation sheet | 16 / 0 / 0                   | 5 / 0 / 3   |
| A over current, practitioners     | 16 / 0 / 0                   | 6 / 1 / 1   |
| B over A, handout (code alone)    | 12 / 1 / 3                   | 0 / 6 / 2   |
| B over A, code slide (code alone) | 4 / 7 / 5                    | 0 / 7 / 1   |

The reasons agree. On the current state, "curve sits on curve", "the motif doubles up" (code in
step cards, portraits in person cards). On C, "the signature looks applied at random". On B, the
standalone code blocks lose the shape that ties them to the cards. In round 2 that weighed on B
less, because a bug in the simulation also took the corner off a card that held a code block.
The second pass (A, the corrected B, the current state; 8 reviews) reversed B's lead on the
standalone code.

Decision: A. Claude's overall lead over the current state (0.45 and 0.73) stands outside the
noise. Codex's (0.14 and 0.11) does not, but Codex too picks A over the current state on every
page where the two differ. B ties A overall and loses on standalone code once corrected, and it would add an
exception (code) to the rule.

Not scored: os, admin and mail. os and admin show client and person records, and mail draws no
brand corner. The trainer hub was only measured, with nothing nested.

A reviewer prompt, verbatim (round 2; `$persona` was e.g. "a brand designer who keeps one
company's visual identity consistent across printed documents, slide decks, websites and internal
apps", `$files` the 24 absolute paths):

> You are $persona. You review the visual design of one company's surfaces. Four design variants
> K, M, R, T of the same system are shown; each file is named <surface>-<variant>.png and shows
> the surface at its real display size. The variants differ only in the shape of some corners;
> compare them closely and say which differences you see. Surfaces: (1) doc-prep, an A4
> preparation sheet for a training, read on a laptop at about 70% zoom and printed; (2)
> doc-handout, an A4 training handout, same medium; (3) slide-code, a 16:9 slide at 1440x810 shown
> on a projector; (4) slide-cards, a 16:9 slide, same; (5) practitioners, an internal web
> directory at 1440 px desktop width; (6) web-training, the public website's training page at
> 1440 px desktop width. Images: $files. Score every variant on every surface from 1 to 10 on
> four criteria: brand (the company's look is recognisable and distinctive), calm (visual calm,
> nothing competes for attention without reason), hierarchy (what belongs to what and what matters
> most reads at a glance), room (breathing room, not cramped). Rank the four variants per surface
> (1 best, no ties). Then give one overall score per variant across all six surfaces, and per
> variant one sentence on what keeps it below 10. Answer with JSON only: …

Review: large, because the rule changes every surface.
