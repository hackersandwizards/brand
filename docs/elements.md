# Shared elements

How to use the `hw-*` elements, their scales and night. The
[catalog](https://hackersandwizards.github.io/brand/catalog/) shows each one in every state.

## The shared elements

Every element two or more systems show lives in `elements/`, one plain-CSS file each: label, label box,
pill, card, callout, quote, ruled table, link in text, focus ring, round icon control, gradient
strip, accent rule, code block (and its panel), inline code, button, arrow link, field (text field, field with button, textarea, select, combobox, date, file, password, read-only, warning and success, sizes), checkbox and radio, form field (label, optional mark, hint, error, warning and success message, character count, floating label, fieldset), switch, range, error summary, facts list, dot list, segmented
control, list row, breadcrumb, disclosure, navigation list, filter value, search field, status box, dashed frame, key figure, prose block, dialog, drawer, menu, popover, tooltip, command palette, toast, tabs, progress bar, spinner, skeleton, empty state, accordion, avatar, pagination, stepper, tree view, carousel, the screen-reader-only text `hw-sr-only`, and the skip link `hw-skip-link`, an `hw-button` hidden until it takes focus. The chosen value of a filter value, segmented control or pressed icon control takes one fill, `elements/chosen.css`, which each imports. The catalog groups them in sections as mature UI
libraries do: Forms, Actions, Navigation, Feedback, Overlays, Data display, Typography, Containers, Utilities. Each is an `hw-*` class (`hw-card`, `hw-pill`, ...), its variants `data-*`
attributes, night where the nearest `data-theme` is `"dark"` (`@scope`, so a `data-theme="light"` inside it turns back to day). `data-theme` goes on a container: an element carrying it itself stays day. For a catalogue's static sample, `data-hw-focus` on an element draws its focused state without focus and `data-hw-hover` its hover state without a pointer. Inside night an element reads its roles from `--hw-night-background`, `-foreground`, `-accent`, `-on-accent`, `-muted`, `-border` and `-input`, which `expert.css` sets from its night roles on a dark `html` and `night.css` under `data-hw-night` (all but `-on-accent` and `-input`); elsewhere, such as a night band on a light page, it takes brand's night tokens. Each file's opening comment states the rule
and its settings. Import `elements.css` for all of them, or `elements/<name>.css` with
`elements/scales.css`, after `tokens.css` (and `print.css` on paper). The rules sit in
`@layer components`, so your utilities win, which is what `brand-elements` then measures; every
brand file that opens a layer first declares Tailwind's order (`properties, theme, base,
components, utilities`), so the text base never outranks an element whichever file loads first; the prose
block and its inline code sit in no layer, since Tailwind Typography's `prose` comes in the utilities
layer. A `<code>` in running text takes `class="hw-inline-code"`; inside the prose block every
inline `<code>` is that element already, and every link the link in text: mark tables, code blocks,
quotes and any link that is a button or an arrow link `not-prose`, nothing else. The prose block's
lists start at the text edge, as the marker list does everywhere.
`hw-measure` on a container holding rendered Markdown gives its top-level running text the
same measure and nothing else, in `@layer components`, so a utility on a child wins.

Three kinds of reader meet these elements, and two settings cover them without a mechanism of their
own. `data-hw-scale` sets density: `dense` for internal expert systems (os, the admin hub, the trainer
hub: dense, desktop, keyboard) and the talks catalogue, `screen` for public readers. `any-pointer:
coarse` sets the touch target: every row, tab and page link reaches 44 px on a touch screen at the
screen and dense scales (print and stage set both floors to 0), while a mouse keeps `--hw-item-height`; a smaller control (an icon button, a pill's remove, a
segment, an avatar that is a button, `hw-touch-target` on any other) reaches it through an invisible
area, its look kept (`elements/touch.css`), and a field's text stays at 16 px or more, so iOS does not
zoom on focus. A phone layout stands in the element itself where the
narrow screen needs another shape (a dialog docks to the bottom, a stepper stacks, pagination keeps
the current page), so a public non-expert reader gets the phone form and a public expert reading on
a phone gets the same.

A medium sets the scale, never a colour or a shape: `data-hw-scale="screen"` (the default, the
website's px), `"dense"` (the apps and the talks site; it also sets the expert set's compact type steps, UI text
13 px and micro 11 px, and the heights `--hw-row-pad-block`, `--hw-row-pad-inline` and `--hw-control-height`; `data-hw-type="regular"` beside it keeps UI text 14 px and micro 12 px, as the trainer hub does), `"print"` (documents, pt, the type sizes
from `print.css`) or `"stage"` (slides on the 1440 stage) on any container. A surface may also set
an element's own settings (`--hw-card-pad`, `--hw-label-size`, ...), each listed in its file.

## The dropdown

A native `<select>` wears the brand chevron in place of the system's arrow: the brand dropdown is
`<select class="hw-field hw-select">`, framed and sized by the field at every scale, its chevron at
the field's padding and night with the field. `select.css` (in `elements.css`) alone draws only
the arrow and its room for a select the surface frames itself (`hw-select`), or `form-input` under
the expert layer, which imports it; that night chevron follows `data-theme="dark"` on `html`, up to
a `data-theme="light"` element.

## The disclosure

A native `<details>` wears the brand chevron in place of the browser's triangle: import
`disclosure.css` (`elements/disclosure.css`), or `elements.css` or the expert layer, which import it, and give the details the class
`hw-disclosure`. The chevron is Lucide's chevron-right in the summary's text colour, 1em wide,
0.5rem before the label, in the middle of its first line where the summary aligns on the baseline
or the start, and turns down while open (150 ms, at once under reduced motion). Where
the chevron belongs elsewhere in the summary, inside its heading for one, put
`<span class="hw-disclosure-chevron" aria-hidden="true"></span>` there: its box is one line of
the type around it high, so beside a heading with a shorter line it makes a centred row as tall
as the summary's line; inside the heading, or given the heading's type, it keeps the heading's. `hw-disclosure-count` is the
neutral count pill. The rules sit in `@layer components`, so the surface's own type, colour,
padding and Tailwind utilities win.

## List markers

Every list marker is `marker.css`: a small square whose middle sits two thirds of the way from the
first line's x-height middle to its cap-height middle. Set `--hw-markers: on` on any element to mark
every `ul > li` inside it (a prose container, a document body), or put `.hw-marker-list` on one
list; draw a marker beside text in a baseline-aligned row with an empty `.hw-marker` box. Size,
gap, indent, colour and the middle (`0.5cap` beside capitals) are custom properties, listed at the
top of the file. A marker under CSS `zoom` needs `--hw-zoom` set to the same factor on the zoomed
element, or it sits off its line; the prose task box and `hw-check` take it too. Never write your own marker: a lift rounded to whole pixels sits up to 0.56 px
off, and an inline-block marker shifts the first line once a newline follows `<li>`.

An area of h&w carries its area mark, `.hw-mark` in `marker.css`: one icon per area, in its
colour, beside a link into the area and before the H1 of a page in it. The areas, sizes and settings
are listed at the top of its block in the file.

## Lists you filter and navigate

A sidebar, a rail or a header's links is `hw-nav` (`elements/nav.css`): links in lists inside a
`<nav>`, the current one marked by `aria-current`, counts in `hw-nav-count`, captions in
`hw-label hw-nav-group`, a branch a `details.hw-disclosure` (which `elements.css` imports). A
space's tree is `expert/components/SpaceNavTree.astro` over `buildSpaceTree(base, entries, title)`
from `expert/components/space-nav.ts`, the entry `{ id, data: { order? } }`; your app keeps only
its collection query.

A list with a search and a facet is `expert/components/ListFilter.astro`: a GET form whose values
are `hw-choice` (a label around a radio, a link with `aria-current` or a button with
`aria-pressed`, with its count) and whose field is `hw-search`, sized by your `data-hw-scale` (44 px
targets on `screen`). Its browser side is `initListFilter` in `elements/list-filter.ts`, which a
page without Astro runs over the same markup; each row carries `data-filter-item`, its search
text in `data-filter-text` (case, accents, umlauts and ß fold, so "muller" finds Müller), its facet values as JSON in `data-filter-facets`
(`{"topic":["tools"]}`), its place in `data-filter-order`; a `[data-filter-title]` gets the matches
marked and a `[data-filter-group]` hides while none of its rows shows. `facets` lists any number of
facets in order, each shown as choices unless its labels sum past `budget` characters (160), then as
a select; an empty list shows the search alone, without the phone's Filters button. Pass only the
facets that split the rows. `browse="active"` lists rows only while a filter is
set; on a static page its rows then wait in a template without JavaScript, or load on first use from
the page `source` names, or stay in the page with `listed`. `inline` sets the first select beside
the search from 64rem. Ctrl+K or Cmd+K focuses the search, unless a command palette (`data-hw-shortcut="k"`)
takes the key. On a phone the facets fold behind a
Filters button on its own row under the search, which names the chosen values across the row's width, and a tapped choice folds them again. From 100 rows (`LONG_LIST`) a row off
screen skips layout (`content-visibility: auto`), standing in at the mean content height (padding and border
excluded) of the rows the browser renders, which the script measures on each width change and
sets on the list as `--hw-list-filter-row`, so a page sets no row height; a shorter list renders every row. Should the script fail, the phone's facets and the search button stay usable. A row is `expert/components/ListRow.astro` on `hw-row`
(`stripeColor`, the slots `lead` and `trail`, every further attribute passed to the row, `current`
for the record open beside the list).

## Night for a light-token surface

A surface written in the light tokens (`bg-bg`, `text-ink`, `text-teal`) that turns dark imports
`night.css` after `tokens.css` and puts `data-hw-night` on the subtree that turns, under
`data-theme="dark"` on itself or an ancestor: every light token takes its hue's night column, and
the expert roles `header.css` reads take their night values. It works on `<html>` too, beside
`tokens.root.css`. The nearest `data-theme` wins: a `data-theme="light"` element inside that night
is day again, its colour tokens (the derived ones included) from `tokens.root.css`, which such a
surface links for that, its text colour and `--hw-line`; a token night leaves alone, such as a
scale's size or a corner, keeps what an ancestor sets. `expert.css` turns night on `html` alone, and a `data-theme="light"` element inside
it takes the day roles and text colour again.
