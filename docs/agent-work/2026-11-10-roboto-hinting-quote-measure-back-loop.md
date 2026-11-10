# Roboto overrides under full hinting, the quote's measure, the list filter's Back loop, 10.11.2026

Three open points from the consumer runs of 10.11.2026, each measured and settled here.

## Roboto's fallback overrides: the factor is the hinting style

The website's v1.5.4 run measured more layout shift with the `Inter Fallback Roboto` overrides than
without them at 375 and 412 px (0.0364 against 0.0295, 0.0877 against 0.0322), where brand's v2.4.0
run had measured none. The difference is the fontconfig hinting style, not the font file.

Method: Debian trixie, its Chromium 156, the website's `dist/` at v1.5.4 (brand v2.4.1), Inter's
main file 400 ms late, a fresh context per load, CLS summed once `document.fonts.ready` has
resolved and 1.2 s have passed, window 860 px high, device scale 2 below 768 px. Each profile is a
fontconfig file setting Roboto as `sans-serif` and `system-ui`, Chromium started with
`--hide-scrollbars`. Two loads per cell, equal in every cell but one: static, hintslight, no
overrides, 1280 px read .1708 and .1699.

| Profile, Inter Fallback Roboto        | 360   | 375   | 390   | 393   | 412   | 414   | 430   | 768   | 1280  | 1440  |
| ------------------------------------- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Debian's static Roboto, hintslight    | 0     | 0     | 0     | 0     | 0     | 0     | 0     | 0     | 0     | .0003 |
| Android's variable Roboto, hintslight | 0     | 0     | 0     | 0     | 0     | 0     | 0     | 0     | 0     | .0003 |
| static, hintslight, no overrides      | .0351 | .0038 | .0833 | .0836 | .0329 | .0328 | .0080 | .0055 | .1708 | .1445 |
| static, hintfull                      | .0007 | .0364 | .0016 | .0016 | .0877 | .0260 | .0013 | .0013 | .0005 | .0007 |
| static, hintfull, no overrides        | .0294 | .0295 | .0034 | .0580 | .0322 | .0321 | .0017 | .0031 | .1587 | .1355 |

- The font file is not the factor. Debian's static Roboto (2.138, 2017) and Android's variable
  Roboto (3.005, AOSP `external/roboto-fonts` on `main`) give the same readings with the overrides
  at every width. Without them they part at 375 px alone, .0038 static against .0332 variable. Their
  advances over the website home's 17,756 characters differ by 0.00 % at 400, 0.11 % at 500,
  0.40 % at 600 (static Bold standing in) and 0.05 % at 700. Against Inter they ask for 107.37,
  107.52, 108.16 and 108.82 % (variable), where the committed overrides are 107.28, 107.41, 108.07
  and 108.75 %.
- The hinting style is the factor. Debian's own configuration (`10-hinting-slight.conf`) gives no
  shift at any width. Adding only `hintstyle hintfull` to that profile reproduces the website's
  readings to the fourth decimal in every cell, with and without overrides. The website's
  fontconfig file replaced Debian's whole configuration, so fontconfig's built-in full hinting
  applied. A second control, the website's file with only `hintslight` added, gave no shift at
  any width either, measured before the scrollbar was hidden, so at layouts 15 px narrower than
  the widths named.
- Android runs Chromium with slight hinting and subpixel positioning
  (`ui/gfx/font_render_params_skia.cc` on Chromium `main`, read 10.11.2026). Slight hinting is the
  stand-in for Android, and under it the overrides remove every shift.
- Even under full hinting the overrides cut the shift summed over the ten widths from 0.48 to 0.16.
  They raise it at 375 and 412 px only.

The overrides stay as they are.

Method traps, both found in this run: Chromium's headless mode draws a 15 px classic scrollbar
unless started with `--hide-scrollbars` (puppeteer adds it itself), so a viewport of 412 px laid
out 397 px. And under the website's fontconfig file `fc-match sans-serif` answers DejaVu Sans,
not Roboto, so its control, every new `local()` name renamed, most likely fell through to DejaVu.
That would explain why its control row differs from its no-override row. Inferred from
`fc-match`, not checked on a rendered page.

Not measured: Android itself.

## The quote in the prose block keeps the measure

`hw-prose` gave running text the measure but skipped `.not-prose`, and brand asks for `hw-quote`
to be marked `not-prose`, so a quote ran 768 px at 1440 px beside 528 px paragraphs. Three
variants were rendered on a handbook page in an app frame at 1440 px. Each was reviewed blind by
two personas, a consultant reading the internal handbook and a trainer preparing from knowledge
articles, one run each with Claude and Codex, labels shuffled per reviewer:

| Variant                               | Claude, consultant | Claude, trainer | Codex, consultant | Codex, trainer | Ships |
| ------------------------------------- | ------------------ | --------------- | ----------------- | -------------- | ----- |
| Quote at the block's 768 px (before)  | 6.0                | 6.5             | 8.00              | 8.00           | 0/4   |
| Quote box at the measure, 528 px      | 7.5                | 7.8             | 8.83              | 8.83           | 3/4   |
| Quote text at the measure, box 546 px | 7.0                | 7.3             | 8.67              | 8.83           | 1/4   |

Mean of six criteria (reading comfort, scanning, the quote reads as text yet set apart, breathing
room, calm, fit), 1 to 10. Noise not measured. The box at the measure leads the
old state by 0.83 to 1.5 in every run. It ties the third variant with the Codex trainer, who ships
the third over a single line break. So every `.hw-quote` in `hw-prose` takes
`max-width: var(--container-measure)`, unless it holds an image, video, code block, table or
figure, as running text does. The quote sets `box-sizing: border-box` itself, so its box, rule and
gap included, is the paragraphs' width on a page without Tailwind's preflight too.

A second round on the dense scale, the one the admin hub, os and the trainer hub set (13 px, a
429 px measure), at 1440 px, one consultant reading notes and handbook pages, the old width against
the measure: Claude 6.2 against 7.2, Codex 7.33 against 8.50, both shipping the measure. Not scored:
widths below the block's 768 px, where the measure no longer narrows anything, and the print and
stage scales.

The consultant's prompt, verbatim, with the three file paths after it:

> You are a senior software consultant at a small engineering consultancy. Several times a day you open pages of the company's internal handbook in its internal web app on a 14-inch laptop (browser window 1440 CSS px wide) to look up how a process runs, often reading a whole page before acting on it. Below are three versions of the same handbook page in that app, each screenshot at full size as it appears in the browser window (labels: x y z). Medium: internal web app; audience: the staff and trainers who read it; display: a laptop browser window 1440 CSS px wide, images at 1:1. Criteria, each scored 1 to 10: (1) reading comfort of the running text, the quotation included, (2) how easily you scan for a section or a fact, (3) how clearly the quotation reads as part of the text yet set apart, (4) breathing room, not cramped, (5) visual calm, (6) overall fit for this page. Answer with one block per page: the page label, the six scores, a mean, and one sentence per criterion on what keeps it below 10. Then name the page you would ship.

## The list filter: Back no longer loops after a failed source load

With a source page whose load fails after the search was recorded, by Enter or by the typing
debounce, the filter left the page for the source page and kept the entry carrying the search.
Back returned to that entry, which loaded the source again and left once more. A facet picked
after the load had failed did the same: the page left and the pick still pushed an entry. Three
catalog tests reproduce the paths, Enter, the debounce and a facet, each failing the load again on
the page Back reaches. A failed load now records no entry for an active search, and where the
current entry already carries one, the source page's address replaces it (`location.replace`),
else it is a new entry. Both build the address the same way, from `stateUrl`. Back from the source
page lands on the page without the search and stays there.
