# Brand next: list filter facets, icon links, dialog ring, night logo (v1.58.0)

## The list filter takes any number of facets

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
