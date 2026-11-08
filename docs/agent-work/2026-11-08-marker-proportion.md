# One marker proportion across website, documents and slides

The vertical placement was already the same everywhere: on every surface the square's middle sits
0.33em above the baseline (0.36em beside a capitals label), from the one rule in
`tokens/marker.css`. Size and gap were not, and from v1.41.0 they follow one proportion: the gap is
0.625em of the text everywhere, the square 0.375em on screens and slides as on the website, and
0.5em on paper, where a blind panel of print readers scored the website's 0.375em lower.

## Measured before the change

Each marker was measured on the built pages in headless Chrome against the text beside it
(`side / font-size`, `gap / font-size`, middle above the baseline / font-size). Built pages read:
website `dist/`, documents `dist/types/`, slides `dist/stories/` at 1920x1080, brand's prose story.

| Surface                                        | Text         | Square                    | Gap                        | Middle         |
| ---------------------------------------------- | ------------ | ------------------------- | -------------------------- | -------------- |
| Website lists, body                            | 16px         | 6px, 0.375em              | 10px, 0.625em              | 0.33em         |
| Website lists, meta and lead text              | 12, 14, 20px | 6px, 0.50 / 0.43 / 0.30em | 10px, 0.83 / 0.71 / 0.50em | 0.33em         |
| Website destination swatch (not a list marker) | 12 to 16px   | 10px, 0.63 to 0.83em      | 8px                        | 0.31 to 0.42em |
| os prose (`hw-prose`, brand's prose story)     | 16px         | 0.375em                   | 0.625em                    | 0.32em         |
| Onepager, cards and lists                      | 9.5pt / 12pt | 6pt, 0.63 / 0.50em        | 6pt, 0.63 / 0.50em         | 0.33em         |
| Proposal, document, briefing                   | 10pt         | 6pt, 0.60em               | 6pt, 0.60em                | 0.33em         |
| Certificate                                    | 9.5pt        | 0.63em                    | 0.63em                     | 0.33em         |
| Readout deck                                   | 19.6px       | 0.41em                    | 0.55em                     | 0.33em         |
| Slides, content list                           | 36px at 1920 | 12px, 0.33em              | 21px, 0.59em               | 0.33em         |
| Slides, comparison, cards, two columns         | 36px         | 0.33em                    | 16px, 0.44em               | 0.33em         |
| Slides, activity                               | 40px         | 0.30em                    | 0.67em                     | 0.33em         |
| Slides, capitals label                         | 27 to 32px   | 0.38 to 0.45em            | 0.40 to 0.42em             | 0.36em         |

The website's marker is fixed in rem (6px, 10px), so its proportion changes with the text size; the
0.375em and 0.625em hold beside its 16px body.

## Where the values came from

- Documents: `--bullet: 6pt` and `--list-marker-gap: 6pt` entered brand in v0.29.0 from the
  documents engine, with the comment "squares, as the website's patterns.css": the website's 6px
  written as 6pt. No print reason is recorded for the size. Beside 10pt text, 6pt is 0.6em, taller
  than Inter's x-height (0.55em). Type guidance keeps a bullet at or under the x-height
  ([fonts.com, bullets](https://www.fonts.com/content/learning/fontology/level-3/signs-and-symbols/bullets),
  [CreativePro, TypeTalk](https://creativepro.com/typetalk-the-ins-and-outs-of-bullets/)).
- Slides: `--slide-marker: 0.5625rem` is the website's square times the stage factor, with a
  recorded projection reason (viewing distance), so beside the 24px stage body it kept the website's
  0.375em. Slide lists set their text at 36px, though, which made it 0.33em. The gaps are Tailwind
  steps chosen per component (`gap-3`, `gap-4`), with no recorded reason.

## Blind review

Medium and display size per persona, written into each prompt. Variants under shuffled neutral
numbers per reviewer: A as it was, B the website's 0.375em square and 0.625em gap, C a 0.5em square
and 0.625em gap. Criteria, fixed before scoring: belongs to its line, presence, breathing room,
calm, overall (each 1 to 10). Claude Opus and Codex (gpt-6.1-sol, high), two runs each.

Overall score per run (A / B / C):

| Persona                                    | Claude 1  | Claude 2  | Codex 1   | Codex 2   | Mean               |
| ------------------------------------------ | --------- | --------- | --------- | --------- | ------------------ |
| Reader of a printed onepager, 40 cm        | 6 / 6 / 8 | 7 / 7 / 8 | 8 / 8 / 9 | 8 / 8 / 9 | 7.25 / 7.25 / 8.50 |
| Workshop participant, projected slide, 8 m | 6 / 8 / 7 | 6 / 8 / 7 | 8 / 9 / 8 | 8 / 9 / 9 | 7.00 / 8.50 / 7.75 |
| Design lead, onepager and slide            | 8 / 6 / 7 | 6 / 8 / 6 | 7 / 8 / 9 | 7 / 9 / 8 | 7.00 / 7.75 / 7.50 |

Noise, the spread between a reviewer's two runs on one variant, is 0 to 1 point for print and
workshop, 2 points for the Claude design lead. Print: C leads B and A by 1 to 2 points in every run,
with both models, outside the noise, so paper keeps its own size. Slides: B leads A by 1 to 2 points
in every run and C by 0 to 1. Design lead: a tie inside the noise. The current state never led on
any surface.

Reviewer prompt, verbatim (the reader of a printed onepager, Codex run 1, image paths shortened to
`<dir>`):

> You are an engineering manager at a client company who has just been handed a printed A4 onepager
> about a training and reads it at arm's length, about 40 cm. You compare three variants of the
> small square list markers (the squares before list items). The variants differ only in the
> marker's size and the space between marker and text; everything else is identical. Judge only
> the markers. Medium and display size: An A4 onepager printed on paper, read at arm's length. Each
> variant is shown as the full page at about 1000 px and as a 3x close-up of its lists, about what
> 290 dpi print shows. Images (read every one; the same image numbers within a variant show the same
> view): `<dir>/variant-1-1.png`: variant 1, onepager page; `<dir>/variant-1-2.png`: variant 1,
> onepager lists, close-up; (the same for variants 2 and 3). Criteria, each scored 1 to 10 (10
> best): 1. belongs: the square reads as belonging to its own line of text, beside it and level
> with it. 2. presence: the square is visible enough to scan the items, and no louder than the text. 3. room: breathing room between square and text, neither cramped nor detached. 4. calm: visual
> calm of the list as a whole. 5. overall: how willing you would be to ship this as it is. Answer
> only with JSON, no prose around it: (the JSON shape).

Review: large, because a shared brand element changes on two surfaces.

## What changed (v1.41.0)

- `tokens/document.css`: `--bullet: 0.5em`, `--list-marker-gap: 0.625em`, `--list-indent` their
  sum; new `--deck-marker-gap` for the readout deck.
- `tokens/stage.css`: `--slide-marker: 0.375em`, new `--slide-marker-gap: 0.625em`.
- `elements/scales.css`: the stage scale sets the marker from `--slide-marker` and
  `--slide-marker-gap`, the print scale from `--bullet` and `--list-marker-gap` (v1.41.2).
- `tokens/marker.css` (v1.41.2): an item's indent takes the square's rounded side, as the square
  does, so an em size no longer sets the square up to 0.5px left of the item's edge.
- The website keeps its rem values. Checked with `brand-markers` on the onepager, proposal,
  certificate and readout built against this tree: 112 readings, 0 off by more than 0.25px.

## Left out

- `--ol-indent` stays 12pt. Beside 9.5 to 10pt text, ordered-list text now starts 0.75 to 1.3pt
  right of bulleted text; the ordered list was not part of the review.

- The website's marker stays fixed in rem, so beside its 12px and 14px meta text it is larger than
  0.375em. Switching it to em would change every website list; worth a review round only once a
  reader names those lists as heavy.
- The destination swatch is a separate element with its own size, not a list marker.
