# Shared-element fixes from other repositories, 10.11.

Four element questions that other repositories raised on 10.11., each measured in headless Chrome
for Testing and then scored in a blind review. Brand v2.10.0 ships the winners. The fifth point, the
superseded claim rounds, went in d863064.

## 1. Focus ring room in scrolling elements

The ring sits outside the control (3 px wide, 2 px out), and a scroller clips at its padding box. A
control at the edge of a scroller lost its whole 5 px ring on that side. Measured per element and
scale (the most clipped side of any focused item, px):

| Element                       | screen | dense | stage | after v2.10.0 |
| ----------------------------- | ------ | ----- | ----- | ------------- |
| tab row (buttons and links)   | 5      | 5     | 5     | 0 to 0.2      |
| carousel track, linked item   | 5      | 5     | 5     | 0             |
| menu, scrolled                | 5      | 5     | 5     | 0             |
| command list, scrolled        | 5      | 5     | 5     | 0             |
| list row's lead, a title link | 5      | 5     | 5     | 0             |
| command list, not scrolled    | 0      | 0     | 0     | 0             |
| dialog                        | 0      | 0     | 0     | 0             |
| list filter's long list       | 0      | 0     | 0     | 0             |
| control: button in a scroller | 5      | 5     | 5     | 5             |

The 0.2 px is a subpixel tab edge at the scrolled end. The control clips by design, which shows
that the measurement can fail.

Variants, rendered on brand's published element stories (dense, screen, stage) with the first
item focused: **J** today, **V** room (the scroller pads by the ring and takes it back in a negative
margin, so the outside ring stays whole), **D** inset (the ring drawn inside the item, as the side
navigation and the internal header already do).

| Reviewer                                 | J   | V   | D   |
| ---------------------------------------- | --- | --- | --- |
| Claude, accessibility specialist, run 1  | 3   | 8   | 8   |
| Claude, accessibility specialist, run 2  | 3   | 8   | 8   |
| Codex, accessibility specialist          | 5   | 9   | 9   |
| Claude, designer of dense business apps  | 3   | 8   | 8   |
| Codex, designer of dense business apps   | 6   | 9   | 9   |
| Claude, web designer of the company site | 2   | 9   | 7   |
| Codex, web designer of the company site  | 5   | 9   | 8   |

Mean V 8.57, D 8.14, J 3.86; noise 0.00. V is never below D, and leads with both models (Claude
+0.67, Codex +0.33). Reviewers faulted D for hiding the tab's accent bar and crowding the menu
text. Decision: room, except on the tab row, which takes D's inset ring.

What ships:

- `--hw-focus-room` (focus.css) is the ring's reach, width plus offset at the scale's values. A
  consumer's own scroller pads by it and takes it back in its margin, and any sum around that
  scroller (a sticky top, a max height) uses the token in place of its own sum.
- Menu, command list, carousel track and list row's lead keep that room themselves. The carousel
  script measures an item's position from the first item, so the padding stays out of its scroll
  targets.
- The tab row draws its tab's ring inside the tab, as D did and as the side navigation does. The
  row's hairline must touch the tab's bottom, so room below the tab means drawing the line behind
  the text; built as a background line, it left axe unable to measure the tabs' contrast on every
  story ("bgGradient"). D's tab crops were scored in this round. The mix of V elsewhere and D on
  tabs was not scored as one set. What remains: the inset ring covers the selected tab's accent bar
  while it has focus, the one reviewers named against D.

## 2. Inline code kept whole

Measured in a 288 px and a 390 px phone column (screen scale), a 320 px column (dense), an A4 column
(print) and a slide column (stage), with three short chips, a 37-character path and a long command:

| Variant                                            | Overflow past the column | Chips split inside   | Stranded punctuation |
| -------------------------------------------------- | ------------------------ | -------------------- | -------------------- |
| M, today                                           | 0 px (the table: yes)    | up to 3 per surface  | 0                    |
| N, every chip nowrap                               | 142 to 273 px            | 0                    | 1                    |
| O, marked chips nowrap                             | 38 px at 288 px          | 1                    | 1                    |
| P, marked chips an inline block capped at the line | 0 px                     | 1 (the long command) | 0, with the hold     |

N and O fail on overflow and were not scored. P holds the punctuation after a whole chip in a
`nowrap` span, since a browser breaks after an inline block even before a comma. The shipped chip
also takes `line-height: normal`: at the dense scale its line height was shorter than the font's
glyph box, which axe read as text partly hidden, and the line grew by 0.8 px. With it, the line is
as tall as with an inline chip, 18.94 px. In M the table's
path chip pushes its second column past the column edge (screenshot, read by every reviewer).

| Reviewer                        | M   | P   |
| ------------------------------- | --- | --- |
| Claude, developer on a phone, 1 | 4   | 7   |
| Claude, developer on a phone, 2 | 3   | 6   |
| Codex, developer on a phone     | 6   | 8   |
| Claude, editorial designer      | 3   | 6   |
| Codex, editorial designer       | 5   | 8   |
| Claude, trainer with slides     | 4   | 7   |
| Codex, trainer with slides      | 6   | 8   |

Mean P 7.14, M 4.43; noise 1.00; P leads with both models (Claude +3.0, Codex +2.3). What keeps P
below 10: a long path still breaks mid-word in a narrow table cell. Decision: `data-whole` on
`hw-inline-code`, which the renderer sets on a chip of up to about 24 characters. Slides (24) and
the website (28) already keep such chips whole in their own code.

## 3. Table scroll

A five-column table in a 358 px phone column, website (screen, day) and apps (dense, night card),
as first shown and after a sideways swipe. **K** today (no wrapper: the table runs 46 to 61 px past
the column), **Y** a scrolling wrapper, **Z** the wrapper with the first column held below 48rem.

| Reviewer                               | K   | Y   | Z   |
| -------------------------------------- | --- | --- | --- |
| Claude, sales operations on a phone, 1 | 2   | 5   | 8   |
| Claude, sales operations on a phone, 2 | 2   | 5   | 8   |
| Codex, sales operations on a phone     | 4   | 7   | 9   |
| Claude, designer of dense apps         | 2   | 5   | 8   |
| Codex, designer of dense apps          | 3   | 7   | 9   |
| Claude, accessibility specialist       | 3   | 5   | 8   |
| Codex, accessibility specialist        | 4   | 7   | 9   |

Mean Z 8.43, Y 5.86, K 2.86; noise 0.00; Z leads with both models. Decision: `hw-table-scroll`,
first column held below 48rem. Once the table has scrolled, that column takes `--hw-table-ground`
(the surface's `--background`, else white, on night the night ground) and a hairline at its right,
through a scroll-driven animation. A table that fits keeps today's look, since os wraps every
markdown table. Where a browser lacks scroll timelines, the table scrolls whole. The held column
takes at most 40 % of the view, wraps a long word only where it must, and covers the wrapper's ring
room, so no scrolled cell shows at its left; a focused cell scrolls clear of it.
Z as scored showed the line and a padded second column before the swipe too. The swipe state is the
one shipped. It has ring room at its edges for a sortable head's
button and does not scroll on paper.

## 4. Priority pills and a pill's night tone

Contrast before the change (text on the pill / pill against its ground):

| Pill        | day page    | day card    | night page   | night card   |
| ----------- | ----------- | ----------- | ------------ | ------------ |
| P2          | 5.16 / 1.14 | 5.30 / 1.14 | 7.60 / 1.30  | 6.96 / 1.34  |
| P3          | 4.72 / 1.07 | 4.83 / 1.07 | 7.52 / 1.14  | 7.00 / 1.17  |
| P4          | 4.79 / 1.04 | 4.90 / 1.04 | 7.88 / 1.07  | 7.40 / 1.08  |
| a light hue | 5.79 / 1.04 | 5.79 / 1.10 | 10.93 / 1.47 | 10.93 / 1.36 |

Text passes AA everywhere. The fills of P3, P4 and a pill given a light hue sit 1.04 to 1.07 off the
day ground, so their shape disappears, and at night P2 to P4 read as one grey. Variants on a dense
list mock, day and night: **H** today, **F** deeper steps (ink at 10, 7 and 4 %, night white at 14,
10 and 6 %, one text colour), **L** one grey for P2 to P4.

| Reviewer                       | F   | H   | L   |
| ------------------------------ | --- | --- | --- |
| Claude, operations lead, run 1 | 7   | 6   | 4   |
| Claude, operations lead, run 2 | 7   | 6   | 5   |
| Codex, operations lead         | 8   | 8   | 7   |
| Claude, design lead            | 8   | 6   | 5   |
| Codex, design lead             | 8.6 | 8.2 | 7.6 |
| Claude, new team member        | 7   | 6   | 5   |
| Codex, new team member         | 8   | 7   | 7   |

Mean F 7.66, H 6.74, L 5.80; noise 0.33; F leads with both models (Claude +1.33, Codex +0.47).
After v2.10.0: P2 5.00 / 1.21, P3 5.16 / 1.14, P4 5.32 / 1.07 on the day page; on the night page
6.84 / 1.48, 7.60 / 1.30, 8.39 / 1.14. What keeps F below 10: P0 and P1 are about equally strong,
which `work-priority-pill-order` keeps.

The faint pill with a light hue has two causes:

- `Pill.astro` built a colour's night tone as `--color-<hue>-night`, falling back to the day tone.
  Ampersand and factory have no such token. The hue table gives them their light tones, so at night
  an ampersand pill took its day tone. Fixed. Blind review of a category list, day and night, before
  (S) and after (G): Claude G 8.0 / S 7.0, Codex G 8.25 / S 8.5. That is a tie, which goes to G,
  since G follows the hue table.
- A surface that passes a light tone as the day hue gets a 15 % wash of an already light grey. That
  is the surface's choice, and the brief to os names it.

## Left as found

- The page title's lead and subtitle in `expert/expert.css` clip a focus ring the same way; not
  measured in this round.
- A whole chip at the full column width followed by a comma runs the comma past the column edge.
- Inside a link, a whole chip shows the link's underline only through `text-decoration: inherit`.
- Without `--background` on the surface, the held column's ground is white by day and night on
  night: a card of another tone sets `--hw-table-ground`.

## Review method

Four panels, one per point, each with three personas from that point's readers, Claude (Opus) and
Codex (gpt-6.1-sol), plus a second Claude run of the first persona for the noise. Neutral letters,
order shuffled per reviewer, today's state scored alongside, criteria fixed before any score. The
category review had two personas, both models, one run. The prompt of the first ring reviewer:

> You are an accessibility specialist who audits keyboard navigation in web applications against
> WCAG 2.2.
>
> You review versions of keyboard focus on three interface elements (a tab row, a menu, a
> carousel), each shown on three surfaces: the company's business apps (dense scale), its public
> website (screen scale) and its slide decks (stage scale). In each crop the first item holds
> keyboard focus. Each image is one version of the whole set; the versions differ only in how the
> focus is drawn.
>
> Medium: screen. Audience: the people who use these surfaces at work. Crops at 2x the pixels of
> real display size, from a 1100 px wide laptop window (1440 px for the slide stage); the sheet is
> downscaled to 2576 px on its long side.
>
> Open and look at each image (use the Read tool on each path):
>
> - /tmp/brand-next6/r/ring-J.png (version J)
> - /tmp/brand-next6/r/ring-D.png (version D)
> - /tmp/brand-next6/r/ring-V.png (version V)
>
> Score each version from 1 to 10 on each criterion:
>
> 1. The focused item is identifiable at a glance
> 2. The focus indicator is whole and unbroken
> 3. Visual calm: the indicator does not crowd text or neighbouring items
> 4. The same element reads the same on all three surfaces
> 5. Fits a clean, quiet brand
>
> Then give each version an overall score from 1 to 10. For each version and criterion below 10,
> name in one line what keeps it below 10.

Surfaces and the combinations skipped:

- Ring: brand's published element stories at dense, screen and stage. Not shown: night, and paper,
  where nothing takes focus.
- Inline code: mocks on brand's CSS at screen (288 and 390 px), dense, print and stage. Not shown:
  night, and the consumers' own catalog stories.
- Table: mocks on brand's CSS, website day and apps night. Not shown: slides at stage scale (not
  rendered in this run; the slide engine lays a table out itself), and paper, where the wrapper does
  not scroll (set in CSS, not scored).
- Pills: a dense list mock, day and night, as in the 10.11. pill review. Priority pills show only
  in the apps.

Review: medium, because each change reaches every consumer's screens at the next pin.
