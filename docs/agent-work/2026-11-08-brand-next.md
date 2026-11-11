# Brand next: what the consumer runs asked of brand

Two runs answered the briefs other repositories left for brand. v1.58.0 (08.11.) took the list
filter's facets, icon links, the dialog's ring and the night logo. v2.15.0 (11.11.) took the
scanners, the table wrapper, the focus-ring sample, translucent white, the carousel, the lockup's
size and the imprint's country code. Counts below were measured on each consumer's `origin/main`,
exported with `git archive` into scratch, never in its checkout.

## Scanners (v2.15.0)

Each change came with a control: the old scanner fails it, the new one passes.

- `brand-colours` reads no `${...}` interpolation as a literal. `font-family="${FAM[fam]}"` was a
  font finding and `fill="${white}"` a token finding.
- It now reads the strings of an expression prop (`fill={on ? "var(--color-ink)" : "white"}`) and
  a custom property set to one colour name (`--mark: white`). It missed both before.
- The `tests` exception takes Python's `test_*.py`, `*_test.py` and `conftest.py`.
- `brand-elements` passes a `*Button` component that renders `hw-icon-button`, and a `Fact`
  component that renders a `dt`, one row of the facts list its parent renders.
- `brand-markers --site-at` and `"site": { "dir", "at" }` serve a site built under a base path such
  as `/mail/`, so its stylesheets load. Served at the root, `/mail/_astro/a.css` answered 404.

Over the 11 consumers, the new scanners find nothing new. Three entries go stale, each a false
finding the old scanner made: os (`test_*.py`), website (`phone.js`) and certificate-verifier
(`src/worker.ts`, an interpolated font). Each runs `bun run brand-colours --tighten` at the raise.

Not changed:

- **Whole words.** The name match already reads whole words of the kebab-case name:
  `PhasedPillsSlide` matches because `pills` is one. Its exception with a reason is the mechanism.
- **A raster template.** `brand-elements` reads every styled source. It cannot tell a page from a
  template a script turns into an image. Renaming the template's classes, as the website did, costs
  nothing.
- **The count in v2.12.0's release note.** On the website's tree before its fix (07ea5ba6), the
  v2.12.0 and v2.13.0 scanners both find 23 colour findings and 1 element source finding, the
  note's numbers. The 24 and 3 that run reported do not reproduce on the committed tree.

## The table wrapper (v2.15.0)

In `hw-prose` the wrapper padded 5 px above and below and took that back from its own margin. A
margin can only collapse with a neighbour's, so beside any block with a margin over 11 px the table
stood 5 px further off than a bare table. Measured in Chrome at 1000 px, the gap from the table's
box to the next block:

| Next block               | Bare table | Wrapper before | Wrapper now |
| ------------------------ | ---------- | -------------- | ----------- |
| paragraph                | 16 px      | 21 px          | 16 px       |
| h2                       | 24 px      | 29 px          | 24 px       |
| rule                     | 32 px      | 37 px          | 32 px       |
| nothing                  | 16 px      | 16 px          | 16 px       |
| previous paragraph above | 16 px      | 21 px          | 16 px       |

The wrapper now pads only at its sides. Above and below, the cells' padding holds a focused
control's ring: 3 px clear above a sortable head's button, 6 px below a link in the last row.

Blind review, medium. A handbook page at 1440 px in a retina window, full-resolution crops, two
versions with neutral names in a shuffled order, five criteria from 1 to 10 (rhythm, breathing
room, calm, the table in the text's flow, overall):

| Reviewer                                     | Before, overall | Now, overall | Before, sum | Now, sum |
| -------------------------------------------- | --------------- | ------------ | ----------- | -------- |
| Claude, engineer reading the handbook, run 1 | 7               | 7            | 37          | 33       |
| Claude, engineer reading the handbook, run 2 | 8               | 8            | 39          | 40       |
| Claude, editorial designer                   | 7               | 7            | 35          | 36       |
| Codex, project lead between meetings         | 8               | 9            | 42          | 44       |

The same persona's two runs moved the lead on the sum by 5 points, so every lead sits inside the
noise: a tie, which goes to the margins the rule names. Three reviewers saw more space above a
table than below it in both versions. Its cause is not yet measured.

`elements/table.ts` adds `tableScroll`, a rehype step that writes the wrapper from Markdown and
names it by the heading above. `scrollStops`, which `enhance()` runs, keeps the wrapper a tab stop
only while its table scrolls. Without script every wrapper stays one.

The held column and the header nav's fade are now written as animation longhands. lightningcss
without browser targets folded `animation-timeline` into the shorthand, which Chrome refuses.

## The focus-ring sample (v2.15.0)

The catalog's sample showed no ring until someone tabbed to it. Small review: Codex as a front-end
developer looking the ring up. The catalog page at 1440 px, light and dark, three samples:

| Sample                                        | Overall | Ring seen at once |
| --------------------------------------------- | ------- | ----------------- |
| a button to tab to (before)                   | 5       | 1                 |
| one button with `data-hw-focus`               | 8       | 9                 |
| one with `data-hw-focus` beside one to tab to | 9       | 10                |

The third ships. Noise was not measured: one run.

## Translucent white and the scrim (v2.15.0)

`--white-line` (white at 15 %), `--white-wash` (7 %) and `--scrim` (night at 40 %, the dialog's
backdrop) name the mixes fifteen element files wrote. All 56 night stories render pixel-identical,
except two animated ones that differ between two shots of the same build too. No review, since
nothing visible changed. A darker lightbox backdrop, such as the website's 70 %, stays the
surface's.

## The carousel (v2.15.0)

What the website's item named as missing from the module: an item width
(`--hw-carousel-item`), the grid's columns (`--hw-carousel-columns`), controls outside the
carousel (`data-hw-controls`), dots the page writes, and `carousels(root)`, which wires carousels
without `enhance()`'s document-wide handlers. The pipeline graph's own pause control in the
controls' row is the website's markup and needs nothing from brand.

## The lockup's size and the imprint (v2.15.0)

`logos/logos.json` `sizes` holds each logo SVG's width and height. The header and portal keep
their typed sizes, which a test holds to the SVGs and to `sizes`. v1.58.0 (below) already shrank
the lockups that a brief named at 24,505 bytes: the day screen cut is now 22,491 bytes and the
night one 28,960. `verbal/imprint.json` has `countryCode` `DE`.

## The list filter takes any number of facets (v1.58.0)

`ListFilter`'s `facet` and `select` props are now one `facets: Facet[]`. Each facet shows as
choices unless its labels pass `budget`, then as a select. An empty list shows the search alone,
without the phone's Filters button. The browser side now reads every fieldset of radios, not just
the first. Covered in `test/catalog/list-filter.test.ts` by two choice facets filtering together,
the story with no facet, and the select beside the search on the `many` story.

## Icon links: blind review

The link's icon variant replaces the `inline-flex items-center gap-1` chain consumers paste onto
`hw-link`. On the rendered page that chain moved every icon link in running text above the line's
baseline. The page showed an app record at 14 px (dense) and a website paragraph at 18 px
(screen), in light and night, 900 px wide at 2x.

- k: the pasted chain (centred, 0.25rem gap, 0.875em icon).
- m: the label on the baseline and the icon centred, 0.3em gap, 1em icon, label underlined.
- r: like m, but with no underline until hover.

Three personas (a consultant reading app records, an engineering lead reading the website, a
trainer using the trainer hub), each run once with Claude and once with Codex. Labels were neutral
and shuffled for each reviewer. Overall scores out of 10:

| Reviewer          | k   | m   | r   |
| ----------------- | --- | --- | --- |
| consultant Claude | 5.9 | 8.3 | 7.6 |
| consultant Codex  | 8.0 | 9.2 | 8.5 |
| lead Claude       | 5.8 | 8.6 | 7.6 |
| lead Codex        | 8.5 | 9.2 | 8.8 |
| trainer Claude    | 5.9 | 8.6 | 7.6 |
| trainer Codex     | 8.2 | 9.0 | 8.5 |
| mean              | 7.1 | 8.8 | 8.1 |

m leads with every reviewer. Noise was not measured (one run each). Reviewers named the jump above
the baseline for k and the colour-only cue for r. m ships in `elements/link.css`: an `<svg>` as a
direct child turns it on, in `hw-prose` too. A wrapped label keeps its icon on the first line, and
the link moves to the next line whole. `brand-elements` now compares the link's alignment, and its
gap, icon size and underline offset in em of the link's own font size. A link that a surface sizes
itself (`text-ui`) passes, and so does one in a flex row. With that, a row of smaller links needs
no setting of its own: the row's font size is enough.

## The dialog draws no ring without hw-focus-ring

`dialog.css` now sets `.hw-dialog:focus-visible { outline: none }` itself, so the browser's ring is
gone outside `hw-focus-ring` too. In `test/behaviour.test.ts` the case fails on the previous
`dialog.css`, and its control shows that a control outside `hw-focus-ring` still gets the
browser's ring.

## Night logo LCP: measured, left lazy

Measured at 412 px, 2x, 150 ms latency, 1.6 Mbit/s down, cache off; median of 5. The header page
had one line of text.

| Page                                    | night logo lazy | eager  | eager, `fetchpriority="low"` |
| --------------------------------------- | --------------- | ------ | ---------------------------- |
| night, LCP is the logo                  | 900 ms          | 732 ms | 724 ms                       |
| light, LCP is day logo                  | 560 ms          | 676 ms | 684 ms                       |
| brand portal, dark (LCP is a list item) | 1736 ms         |        |                              |

Loading eagerly saves a night page about 170 ms but costs a light page about 116 ms, because the
hidden 34 KB night SVG shares the bandwidth. The header stays `lazy`. The night lockup is now
29 KB and the day lockup 22 KB (were 34 and 24.5 KB): the night edge raster at the wizard's density,
280 px instead of 559, and svgo on the paths. The wizard stays at 256 px, the floor the v1.34.0 blind
review set for print. At 1.6 Mbit/s the 5 KB saved is about 25 ms of the 116 ms a light page lost
(computed, not measured), so eager loading still costs a light page and `lazy` stays. A single image
whose source the theme switches is the remaining fix for both themes.

## Checked and already done on main

`--slide-page-width` and `--slide-page-height`: slides reads only `--radius-brand` from
`tokens.json`, and the page size through `var()` from `stage.css`, so `tokens.json` needs neither.
The `hw-catalog-*` renames, `catalogue.html` forwarding to the root, `brand-mail-signature --help`,
the flat `elements.css` and `document.css`, and the first row of the ruled `hw-facts` in columns
were all done before this run.
