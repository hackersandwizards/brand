# What the consumer runs found missing in the elements, 08.11.

Release v1.50.0. One section per change, with its evidence.

## 1. One chosen fill

`elements/chosen.css` holds the chosen fill once: teal-dark with white text, on night teal-night
with night text. `hw-choice`, `hw-segmented` and a pressed `hw-icon-button` import it and read
`--_hw-chosen` and `--_hw-on-chosen`. Rendered against v1.49.0 for every scale, day and night, at
1280 and 390 px, by mouse and by touch: pixel-identical. No review, since nothing visible changed.

## 2. The list filter without its script

The inline script folded the phone's facets before the module ran, so a failed module left them
shut with a toggle that did nothing. The module now marks the filter `data-ready`; at
`DOMContentLoaded` without that mark the inline script restores the state without script: facets
open, search button shown, toggle hidden. Test: the screen story at 390 px with every module script
stripped from the page.

## 3. Toast placement

Blind review, medium. Medium: a desktop browser window, 1440 by 900 CSS px. Surfaces: a personal
website (header links and a button on the right) and an internal business tool (header actions on
the right, a table). Personas: a public visitor copying a link, and an all-day internal user. Runs:
Claude twice for the visitor (noise), Codex once, Claude and Codex once for the internal user.
Sheets with neutral letters, shuffled per reviewer, day and night side by side.

| Placement     | Personal site, overall per run | Mean | Business tool, overall per run | Mean |
| ------------- | ------------------------------ | ---- | ------------------------------ | ---- |
| Top right     | 3, 3, 5, 2, 5                  | 3.6  | 3, 2, 4, 3, 5                  | 3.4  |
| Bottom right  | 7, 7, 7, 7, 7                  | 7.0  | 7, 7, 7, 7, 8                  | 7.2  |
| Bottom centre | 8, 8, 8, 8, 8                  | 8.0  | 7, 8, 8, 7, 9                  | 7.8  |

Noise, the spread between the visitor's two Claude runs: 0 to 1. Top right loses on both surfaces
with both models: it covers the header's links and actions. Bottom centre leads bottom right in
every run on the site (1.0) and ties within the noise in the tool (0.6), so one placement serves
both: the stack moves to the bottom centre on wide screens, which also matches the phone. Fixed from
the reasons: a toast is as wide as its text (all three Claude runs named the empty width). Not
taken: a lighter dark-mode ground, which the overlays share and which needs its own cross-surface
round. `data-place="top"` keeps its job, the phone's stack at the top.

## 4. Copy feedback on the button

`copyButton()` in `elements/behaviour.ts`, wired by `enhance()` on every `[data-hw-copy]`, follows
the certificate verifier's `public/copy.js`, which won its blind review against the toast: the
result shows on the pressed button, one button at a time reads as copied, a failure says to select
the text, a button that starts `hidden` shows only once wired. The toast region announces the
result through an `hw-sr-only` note. `hw-sr-only` (`elements/sr-only.css`) replaces the carousel's
`hw-sr-status`, which no consumer used.

## 5. The navigation list

Blind review, medium, the same set-up on desktop at 1100 CSS px. Surfaces: a design-system catalog
rail (the group being scrolled through marked alone) and a handbook sidebar (a section holding the
open page). Personas: an all-day internal user (Claude twice, Codex once), a developer reading a
catalog (Claude, Codex).

| Section mark                     | Catalog rail, per run | Mean | Handbook, per run | Mean |
| -------------------------------- | --------------------- | ---- | ----------------- | ---- |
| Accent text on its tint (before) | 7, 8, 9, 8, 9         | 8.2  | 5, 5, 7, 6, 7     | 6.0  |
| Accent text, no tint             | 6, 7, 8, 7, 8         | 7.2  | 7, 7, 8, 8, 8     | 7.6  |
| Full foreground, weight 500      | 5, 6, 7, 6, 7         | 6.2  | 8, 8, 9, 9, 9     | 8.6  |

Noise 0 to 1. A section marked alone keeps its tint, leading in every run. A section whose list
holds the current page takes the full foreground at weight 500 without the tint: it leads the
accent text by 1.0 in every run with both models. So the quieter mark is a rule of where the page
sits, not a setting per surface. The catalog rail marks its group alone and keeps today's look.
The focus ring of a navigation item now sits inside the item, so a scrolling list never clips it.

The internal user's prompt, verbatim, paths shortened:

> You spend your whole working day in a small consultancy's internal tools and handbook (customers, deals, invoices, how-we-work pages), on a laptop and a desktop monitor, by mouse and keyboard. You want dense, quiet, fast screens.
>
> You are reviewing sidebar navigation in a desktop web interface. Nothing else about the work is known to you; judge only what you see. Medium: a desktop web page at desk distance; each sheet shows the same screen light (left) and dark (right), each 1100 CSS px wide at 1x. Audience: people as described above. Some sheets show a design-system catalog (the sidebar lists component groups; the highlighted group is the one being scrolled through, with its entries listed below it), others a handbook (a section holding the open page, and that page inside it).
>
> Images, read each: sheet-A.png sheet-B.png sheet-C.png sheet-D.png sheet-E.png sheet-F.png
>
> Score each sheet's sidebar 1 to 10 overall and on each criterion: (1) Where you are reads at a glance; (2) The section or group holding you reads as the place you are in without competing with the exact page or entry; (3) Visual calm; (4) Breathing room, appropriately dense for all-day work; (5) Legibility; (6) The dark version works as well as the light one.
>
> Return only: a compact table with columns sheet, overall, c1..c6, and one short clause naming what keeps it below 10. Then at most three concrete defects you would fix first, each naming the sheet. No preamble.

Reviewers also named the dark rail's bright divider and search border. Those belong to the
mock-up's page, not to `hw-nav`.

## 6. Leftovers of v1.49.0

- The touch target: `scales.css` raises `--hw-item-height` to the touch target under
  `any-pointer: coarse` for screen and dense, in place of the same rule in accordion, command,
  menu, pagination, tabs and tree. Pixel-identical by mouse and by touch.
- The stepper: the stacked layout is written once, the default; across is the wide screen's
  override. The line below a finished step now takes the accent when stacked too, as it does
  across (a specificity slip kept it grey).
- `behaviour.ts`: one `holdWhileUsed()` for the toast's and the carousel's pointer and focus holds.
- The portal suffixes every id a sample declares, and each attribute naming one, instead of a
  hand-kept list of attribute names. The output is identical for every sample.
- The carousel's autoplay has its test: it advances each tick, holds under the pointer and stops on
  pause.

Not changed: the accordion keeps its own chevron and the empty state its own dashed frame. Each
differs on purpose from the disclosure and the dashed frame (a downward chevron at the end; the
strong line), and merging them would change a look that scored 9 and 7 to 9. The card corner rule
lists its containers by hand; a test that derives the list flagged the field and the error summary,
which hold no cornered block, so no derived list was found that is correct.

## 7. The website's list-filter props

`ListFilter.astro` takes `source`, `listed`, `inline` and `budget`; without `source` or `listed`, a
`browse="active"` filter keeps its rows in an inert template and shows the form only once the script
runs. A facet past its label budget shows as a select. The budget of 160 characters keeps the
website's chip facets as chips (knowledge index 133, blog 152, with "All") and turns a longer
facet into a select; os's 25 is for a one-row toolbar. Stories `inert`, `listed`, `source` and
`many`, with their cases in `test/catalog/list-filter.test.ts`.
