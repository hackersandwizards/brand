# @hackersandwizards/brand

The hackers&wizards brand as one package: design tokens, the print layer with its static
fonts, the logos and the expert UI layer with the components Company OS and the trainer hub share.
The document components the PDFs are built from are the document engine,
`@hackersandwizards/documents`.

Maintainer: Benedikt Stemmildt. The repo is public, its history included, so nothing goes in
that may not be public. To change the package itself, see [Work on the package](#work-on-the-package).

## Use it in another repo

Add the dependency in exactly this form, pinned to the newest tag
(`git ls-remote --tags https://github.com/hackersandwizards/brand.git` lists them). The install
needs no GitHub access.

```json
"@hackersandwizards/brand": "git+https://github.com/hackersandwizards/brand.git#v<version>"
```

Then import what you need. The colours, each hue's roles (base, text on light, night, tints) and
the chart order are in `tokens/tokens.css` and on the brand portal's Colours page.

```css
@import "@hackersandwizards/brand/tokens.css"; /* in a Tailwind 4 stylesheet */
```

| Import                                                    | File                                                                                                               |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `@hackersandwizards/brand/tokens.css`                     | Tailwind 4 `@theme` tokens                                                                                         |
| `@hackersandwizards/brand/tokens.root.css`                | the same tokens on `:root`                                                                                         |
| `@hackersandwizards/brand/tokens.json`                    | tokens and resolved colours                                                                                        |
| `@hackersandwizards/brand/tokens`                         | the same as TypeScript                                                                                             |
| `@hackersandwizards/brand/tokens.py`                      | the same as a Python module                                                                                        |
| `@hackersandwizards/brand/code-theme.json`                | the code palette as a Shiki theme (`hw-code`)                                                                      |
| `@hackersandwizards/brand/elements/code.ts`               | `codeClasses`, Shiki's code palette as classes                                                                     |
| `@hackersandwizards/brand/print.css`                      | print scale and static fonts                                                                                       |
| `@hackersandwizards/brand/fonts.css`                      | the screen faces, self-hosted, `@font-face`                                                                        |
| `@hackersandwizards/brand/fonts.json`                     | the same faces as data, for your `@font-face`, in their order; a face without `unicodeRange` takes every character |
| `@hackersandwizards/brand/night.css`                      | night for light-token surfaces, below                                                                              |
| `@hackersandwizards/brand/stage.css`                      | the slide engine's stage scale                                                                                     |
| `@hackersandwizards/brand/document.css`                   | the document engine's scale                                                                                        |
| `@hackersandwizards/brand/marker.css`                     | the list marker, plain CSS, below                                                                                  |
| `@hackersandwizards/brand/fonts/<file>`                   | font files                                                                                                         |
| `@hackersandwizards/brand/expert.css`                     | expert UI layer                                                                                                    |
| `@hackersandwizards/brand/header.css`                     | the internal header, plain CSS                                                                                     |
| `@hackersandwizards/brand/select.css`                     | the dropdown chevron, plain CSS                                                                                    |
| `@hackersandwizards/brand/disclosure.css`                 | the disclosure chevron, plain CSS                                                                                  |
| `@hackersandwizards/brand/elements.css`                   | every shared element and the scales, below                                                                         |
| `@hackersandwizards/brand/elements/<name>.css`            | one shared element, or `scales.css`                                                                                |
| `@hackersandwizards/brand/expert/components/<name>.astro` | expert UI components                                                                                               |
| `@hackersandwizards/brand/logos/<file>`                   | logos, favicon set, avatar, `logos.json`                                                                           |
| `@hackersandwizards/brand/clients/<file>`                 | client marks and `clients.json`                                                                                    |
| `@hackersandwizards/brand/press/<file>`                   | press photos and `press.json`                                                                                      |
| `@hackersandwizards/brand/mail-signature/<file>`          | signature template and `fill.ts`                                                                                   |
| `@hackersandwizards/brand/package.json`                   | the installed brand version, `version`                                                                             |

Run a command the package ships from your repo's root with `bun run <name>`. Never `bunx <name>`:
where the package is missing, `bunx` downloads a same-named package from npm, while `bun run` stops
with `Script not found`.

| Command                                                              | Does                                                                  |
| -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `brand-linkedin-frame <in.png> <out.png> --headline "<text>"`        | frames an image as a 1080 x 1350 LinkedIn post image                  |
| `brand-linkedin-terminal <spec.json> <out.png>`                      | renders a terminal snippet for the frame; no arguments print the spec |
| `brand-linkedin-sketch-prompt`                                       | prints the prompt for a generated sketch and its worked examples      |
| `brand-slide-sketch-prompt`                                          | prints the prompt for a slide sketch and its worked example           |
| `brand-mail-signature --name <n> --role <r> --out <path>`            | writes a mail signature as HTML and text; all flags in `cli.ts`       |
| `brand-colours [--tighten]`                                          | the colour, radius and shadow scan for your gate, below               |
| `brand-copies [--tighten]`                                           | flags a copy of a brand file in your tree, below                      |
| `brand-scan [--tighten]`                                             | flags a fork of an expert component, below                            |
| `brand-markers [--scale 2,4] [--site <dir>] <url, file or /path>...` | measures every list marker on your pages, below                       |
| `brand-elements [--json]`                                            | measures the shared elements on your design-system page, below        |

These commands and the exported files above are the whole interface: any other path in the package
may move in the next tag. A Python script, an HTML document or a skill that needs an exported file
on disk reads it at `node_modules/@hackersandwizards/brand/<target>`, the target the export maps it to
(`./fonts/*` to `tokens/fonts/*`).

### The logo

The logo is one line, with no line under it: the wizard beside the pixel wordmark,
`logos/lockup.svg`, is the standard; the wordmark alone, `logos/wordmark.svg`, goes on textiles
(shirts, hoodie) and stickers; the stacked `logos/lockup-compact.svg` on small spots such as the mug.
A screen header up to 40 px tall takes `logos/lockup-screen.svg`, on night
`logos/lockup-screen-night.svg`: the same lockup with the wizard at 128 px, sharp to 3x, 15 KB
where the lockup weighs 50 KB. Larger, and in print, the lockup itself. Slides carry the lockup on the title and the closing slide and the wordmark alone on
every other slide. The mail signature keeps its typed wordmark. Each has a PNG beside it, a `-night`
cut for night, black and black textile, and an `-outline` cut, a white outline round the letters,
for Purple Love, Stargazer and the gradient. The package ships the SVGs and, for a tool that cannot
draw SVG such as a PPTX export, a PNG of every logo except the 4096 px emoji print masters. The wordmark alone also has a `-white` and a `-black`
cut, every letter in that one colour, for a surface that allows one colour only, such as a partner
wall that shows every logo in white. In the night and outline cuts, the wizard of the lockup and the compact lockup
carries an edge of 7.6% of the letters' cap height: grey (`--color-ampersand-light`) in the night
cut, white in the outline cut. The gap between wizard and letters is part of the logo and the same
on every ground: 0.321 of the cap height in the lockup and 0.381 in the compact lockup, measured
between the contours, and from the edge's outer contour 0.351 and 0.411 in the cuts.
`bun scripts/outline.ts` sets the gap in the day files and writes every cut from them. The wordmark's box is 952 units tall for 851 units of
letters, centred on the line midway between the box middle and the x-height middle of the letters.
A text set beside it centres on its box (`align-items: center`, the
text at `line-height: 1`) and sits centred on the letters. The wizard, taller than the letters,
centres on that box too and then rises by 7.8% of its own height, `translate: 0
var(--logo-wizard-lift)`, so its mass sits on the letters rather than its box.
Where an icon is no taller than the letters, it takes no lift. `logos/lockup.svg` carries the lift
built in, so its box is the wizard's and the wordmark's centre line lies 7.8% of the lockup's height
below the box centre; the night and outline cuts grow their box round the wizard's edge and keep that
7.8%: a text after the lockup centres on that line once the lockup takes the same
`translate: 0 var(--logo-wizard-lift)`.

Every logo keeps clear space on every side at least as high as the h in the name, measured from
its outline: 840 units in every logo file. Each logo has a minimum width: on screen the lockup
190 px, the compact lockup and the wordmark 150 px; in print 50 mm and 40 mm. Below the lockup's,
use the wordmark. `logos/logos.json` holds these values for code: `clearSpaceUnits`, and per logo the
clear space as a share of the day file's height (`clearSpace`), `minWidthPx` and `minWidthMm`.
The screen width is the narrowest from which every gap between two letters stays open, a pixel
column through each under 50 % ink, measured in a headless Chrome render series from 40 to 400 px
at device pixel ratio 2; at ratio 1 that holds only from 370 px (lockup) and 300 px (compact
lockup, wordmark). The print width is the screen width at 96 px per inch, the CSS reference pixel,
rounded.

Till drew the wizard, and hackers&wizards GmbH holds the rights to it.

The & sits optically centred between the s and the w, its mean row-wise gap equal on both sides.
`bun scripts/ampersand.ts` writes that offset into every one-line logo,
renders its PNG and rehashes both in `manifest.json`.

### Serve the favicon

Every page serves the brand's favicon set from `logos/`, never a file of its own: `favicon.svg` and
`favicon.ico` (the hw at 73 % on a rounded tile, for a tab), `apple-touch-icon.png` (180 px),
`icon-192.png` and `icon-512.png` for a web app manifest, and `icon-maskable-512.png`
(`"purpose": "maskable"`). Copy them from the installed package into the folder your server
serves at build or install time, then link them:

```html
<link rel="icon" href="/favicon.ico" sizes="32x32" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

A page opened from disk links `node_modules/@hackersandwizards/brand/logos/favicon.svg` by its
relative path. `applications/avatars/generate.ts` builds the set beside the avatars.

### The words

`verbal/verbal.json` (`@hackersandwizards/brand/verbal.json`) holds the verbal identity: the claim
in English and German with the word a surface may highlight, mission, vision, one-line position,
boilerplate, values, terms and the retired slogans. A surface imports the text
(`import verbal from "@hackersandwizards/brand/verbal.json"`) and never retypes it; a test may fail
on any `retired` line. A language the source has not set yet is `null`. The texts are set here: the
`~/.claude` hub sync copies the file into every repo's voice skill, which keeps tone of voice,
banned words and the brand elements never said in copy. The portal shows the file under Words.

### The internal header

Every internal system and page wears one header: the 3 px strip, a 3.5rem bar under a hairline,
the lockup at 2rem with the product name beside it, and a 96rem content width with 1rem sides.
`header.css` holds it as plain CSS with its markup in the opening comment, so a static or generated
page links or inlines it; an Astro app renders `expert/components/AppHeader.astro` with its nav in
the slot; a React app writes the same markup. Each product keeps its own nav items; page content
takes the same width with the class `hw-container`. A control holding only an icon (theme, menu,
search) is `hw-header-link` with `data-icon`: round, 36 px. `ThemeToggle.astro` is one; an app
that renders no `.astro` takes its two icons from `expert/components/theme-icons.ts`.

### The catalog

Every h&w repository with a surface shows its components in a catalog at `/catalog/`, built on
`@hackersandwizards/scaffolding/catalog` (its README says how). Give the preset's `css` the tokens
and `elements.css`; its default header is this package's `AppHeader.astro` and `header.css`.

### The dropdown

A native `<select>` wears the brand chevron in place of the system's arrow: import `select.css`
and give the select the class `hw-select`, or `form-input` under the expert layer, which imports
it. The file draws only the arrow and the room for it; corner, border, height and focus stay the
surface's. The night chevron follows `data-theme="dark"` on `html`.

### The disclosure

A native `<details>` wears the brand chevron in place of the browser's triangle: import
`disclosure.css`, or the expert layer, which imports it, and give the details the class
`hw-disclosure`. The chevron is Lucide's chevron-right in the summary's text colour, 1em square,
0.5rem before the label, and turns down while open (150 ms, at once under reduced motion). Where
the chevron belongs elsewhere in the summary, inside its heading for one, put
`<span class="hw-disclosure-chevron" aria-hidden="true"></span>` there. `hw-disclosure-count` is
the neutral count pill. The rules sit in `@layer components`, so the surface's own type, colour,
padding and Tailwind utilities win.

### The shared elements

Every element two or more systems show lives in `elements/`, one plain-CSS file each: label, label box,
pill, card, callout, quote, ruled table, link in text, focus ring, round icon control, gradient
strip, accent rule, code block (and its panel), inline code, button, arrow link, field with button, facts list, segmented
control, list row, breadcrumb, status box, dashed frame, key figure, prose block. Each is an `hw-*` class (`hw-card`, `hw-pill`, ...), its variants `data-*`
attributes, night where the nearest `data-theme` is `"dark"` (`@scope`, so a `data-theme="light"` inside it turns back to day); each file's opening comment states the rule
and its settings. Import `elements.css` for all of them, or `elements/<name>.css` with
`elements/scales.css`, after `tokens.css` (and `print.css` on paper). The rules sit in
`@layer components`, so your utilities win, which is what `brand-elements` then measures; the prose
block and its inline code sit in no layer, since Tailwind Typography's `prose` comes in the utilities
layer. A `<code>` in running text takes `class="hw-inline-code"`; inside the prose block every
inline `<code>` is that element already, and every link the link in text: mark tables, code blocks,
quotes and any link that is a button or an arrow link `not-prose`, nothing else. The prose block's
lists start at the text edge, as the marker list does everywhere.

A medium sets the scale, never a colour or a shape: `data-hw-scale="screen"` (the default, the
website's px), `"dense"` (the apps and the talks site; it also sets the expert set's compact type steps, UI text
13 px and micro 11 px, and the heights `--hw-row-pad` and `--hw-control-height`; `data-hw-type="regular"` beside it keeps UI text 14 px and micro 12 px, as the trainer hub does), `"print"` (documents, pt, the type sizes
from `print.css`) or `"stage"` (slides on the 1440 stage) on any container. A surface may also set
an element's own settings (`--hw-card-pad`, `--hw-label-size`, ...), each listed in its file.

Your design-system page shows each hub element you use as a tile,
`<div data-hw-tile="card" data-hw-version="<brand version>">` holding the element in your medium,
marked in the page's own language, "from brand v<version>" on an English page and "aus brand
v<version>" on a German one, with a link to the brand catalog, and each element you keep as your own
in full with its reason, `<section data-hw-exception="<name>">`. List both in
`brand-elements.json` at your repo's root:

```json
{
  "pages": ["specimen/index.html"],
  "uses": ["label", "pill", "card"],
  "exceptions": {
    "total-band": "money on paper; no other system shows sums",
    "survey-readout": { "reason": "a slide deck on its own stylesheet", "files": ["readout.css"] }
  }
}
```

A system whose pages never turn to night adds `"lightOnly": true`: the tokens only an element's
night rules read may then stay undefined there. `"site": "<dir>"` is `brand-markers --site` (below).

Before it measures, `brand-elements` opens every closed `<details>` outside a header or nav, since
a focusable in a shut fold takes no focus. An element inside `[data-hw-shell]`, the scaffolding
catalog shell's own card and pill, is the shell's: neither measured nor counted as shown.

An exception's instance on a real page carries `data-hw-exception="<name>"` too: a hub element
inside it is that exception, not measured. `files` exempts a stylesheet of the system's own medium
from the source check.

Run `brand-elements` in your gate as a script such as `"check:elements": "brand-elements"`. It fails on an element on the pages whose
computed corner, fill, line, text colour, type, padding or size differs from the brand rule at the
same scale and theme (a reference beside it styled only by this package), on a CSS rule named like an element (card; chip, pill, tag, badge; eyebrow, kicker, label;
callout, note; quote) that sets a property that element owns (a card's corner, fill, line or
padding, a label's type and colour; a shorthand counts), or a component of such a name, without the
`hw-*` class and without an exception of that name, on a used element without a tile or with a stale version, on an exception
without a reason or a tile, and on a page showing no element.

### Night for a light-token surface

A surface written in the light tokens (`bg-bg`, `text-ink`, `text-teal`) that turns dark imports
`night.css` after `tokens.css` and puts `data-hw-night` on the subtree that turns, under
`data-theme="dark"` on itself or an ancestor: every light token takes its hue's night column, and
the expert roles `header.css` reads take their night values.

### Check your colours in your gate

The package ships `brand-colours`, which scans your working tree from the current directory down
and counts, per file:

- `hex`, `rgb`: colour literals off the tokens, as hex or as `rgb()`, `rgba()`, `hsl()`, `hsla()`
- `tokenHex`: a literal repeating a token's colour, in either notation, instead of naming the token
- `font`: font stacks without a brand family
- `palette`: Tailwind default palette classes
- `radius`, `shadow`: a `border-radius` or `box-shadow` (CSS, a custom property named for either,
  a style object, a Tailwind arbitrary value) that is no brand token, and Tailwind's default
  radius and shadow classes (`rounded-lg`, `shadow-md`). A token value, `0`, `none`, a CSS-wide
  keyword, a `var()` whose fallback is a value or another such `var()` (`var(--a, var(--b))`), and
  the generated tokens' own key (`tokens["--radius-brand"]`) pass; a value the scan cannot read, an
  interpolation or a variable, counts nothing.

A standalone SVG cannot name a token, so there a token hex counts nothing, and neither does a mix
the package derives from the tokens: a token colour on white at 7 % or at any 5 % step, and a hue
row's text colour at 70 % with ink, within 1 per channel. A shadow's colour counts in `shadow` only.

Add it to your gate as a `check:<what>` script that scaffolding's `scaffolding.check` runs:

```json
{
  "scripts": {
    "check:colours": "brand-colours",
    "check:copies": "brand-copies"
  },
  "scaffolding": { "check": [["check:colours", "check:copies"]] }
}
```

An exception goes in `brand-colours.json` beside your `package.json`, one entry per file with its
counts and the reason, and the list may only shrink: the scan fails where an entry grows against
`HEAD` or names no reason. A metric an entry leaves out allows none. `brand-colours --tighten`
lowers every entry to today's counts.

A third party's mark, such as a partner conference's or a client's logo as an SVG, carries its
owner's colours, not the brand's. Its entry names the owner in `partner` and its reason, takes no
counts, and may be added in any commit: the scan leaves the file uncounted and prints every partner
mark it allowed. `partner` on any file but an SVG fails.

```json
{
  "public/talk/conf-logo.svg": {
    "partner": "Example Conf",
    "reason": "the conference's logo beside our closing slide, in its own colours"
  }
}
```

#### Raise your pin

A newer scan can find more in files you have not touched. In the commit that changes the
`#v<version>` your `package.json` pins at `HEAD` to the installed version, the three lists may also take what the installed
scan finds in your files as committed at `HEAD`: a `brand-colours.json` entry may grow to the count
of the file at `HEAD`, a `brand-copies.json` or `brand-scan.json` entry may name a file committed
at `HEAD` and unchanged since. Whatever your own new or changed code adds still fails, and every
entry still needs its reason. The scan prints the pin change it saw.

1. Raise the pin and run `bun install`.
2. Fix what you can. A `brand-colours.json` entry takes what remains of a partly fixed file. A
   copy or fork you change in this commit can no longer be listed: fix it whole or leave it as is.
3. Run `brand-colours --tighten`, `brand-copies --tighten` and `brand-scan --tighten`: during a
   pin change they add the new findings with an empty reason. Give each its reason.
4. Commit the pin, the lockfile and the lists together. From the next commit on, the lists may
   only shrink again.

### What the scans skip

`brand-colours`, `brand-copies` and `brand-scan` read every file `git ls-files` lists (tracked and
untracked, `.gitignore` honoured) except these, and print each one they applied with its file
count. Nothing else is skipped: `public/`, `docs/`, `src/content/` and SVGs are read. A file of
yours that should not count, such as a sent document or a third-party mark, goes in the
allowlist by name with its reason.

| Exception     | Skips                                                                                                                                                                                  | Why                                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `generated`   | `node_modules/`, `dist/`, `.astro/`, `.next/`, `out/`, `coverage/`, `test-results/`, `playwright-report/`, `.vercel/`, `.wrangler/`, `__pycache__/`, `.turbo/`, `build/`, `worktrees/` | build, cache and dependency output, rebuilt from the source the scans read; a nested worktree is another checkout with its own gate |
| `tests`       | `*.test.*`, `*.spec.*`, `__tests__/`, `test/`, `tests/`                                                                                                                                | a test states the values it asserts, off-token ones included, and ships no surface                                                  |
| `allowlists`  | `brand-colours.json`, `brand-copies.json`, `brand-scan.json`, `brand-elements.json`                                                                                                    | the scans' own exception lists, whose reasons name the values they allow                                                            |
| `hub`         | `.claude/skills/parallel-session/`, `.claude/skills/voice/verbal.json`                                                                                                                 | agent tooling the `~/.claude` hub syncs into every repo, non-h&w ones included                                                      |
| `not styling` | `brand-colours` only: every extension but `.css .scss .astro .tsx .ts .mts .cts .jsx .js .mjs .cjs .vue .svelte .html .svg .py .json .webmanifest`                                     | prose, images, fonts, PDFs and other binaries carry no styling a renderer reads                                                     |
| `brand copy`  | `brand-colours` only: a file byte-identical to a package file                                                                                                                          | `brand-copies` reports it, and its allowlist governs it                                                                             |

Inside a file, one thing is skipped: a document the documents engine (`@hackersandwizards/documents`)
composed. `brand-colours` skips its style elements marked `data-hw-document`, `data-hw-components`,
`data-hw-page`, `data-hw-onepager`, `data-hw-readout` or `data-hw-certificate`, the engine's own
stylesheets inlined so the document stands alone, which the engine's gate scans in its source;
everything else in the file is read. `brand-copies` lets such a document carry the logo's drawing,
which the engine renders from this package.

### Check for copies in your gate

Never commit a copy of a brand file: read it from the installed package. `brand-copies` fails on a
file in your tree that is byte-identical to a file the package ships (the logos, tokens, fonts,
expert components, press photos, client marks, generated token formats and the signature
template, through a Git LFS pointer too), on a file named like one of `logos/` that differs from
it, and on a text file carrying a logo's path data or embedded wizard, such as a recoloured
wordmark or an inlined SVG. An exception goes in `brand-copies.json` beside your `package.json`,
`{ "<path>": "<reason>" }`, and the list may only shrink against `HEAD`; `brand-copies --tighten`
drops the entries no longer found.

### Check your components in your gate

Where you render the expert components, `brand-scan` fails on a component of yours named like one
of them (`Pill`, `PageHeader`, ...): import it from the package. An exception goes in
`brand-scan.json` beside your `package.json`, `{ "<lowercase name>": "<reason>" }`, and the list may
only shrink against `HEAD`. A name matches without case and word separators: `app-header.tsx` is
`AppHeader`, key `appheader`.

### List markers

Every list marker is `marker.css`: a small square on the middle of the first line's x-height. Set
`--hw-markers: on` on any element to mark every `ul > li` inside it (a prose container, a document
body), or put `.hw-marker-list` on one list; draw a marker beside text in a baseline-aligned row
with an empty `.hw-marker` box. Size, gap, indent, colour and the middle (`0.5cap` beside capitals)
are custom properties, listed at the top of the file. Never write your own marker: a lift rounded
to whole pixels sits up to 0.56 px off, and an inline-block marker shifts the first line once a
newline follows `<li>`.

`brand-markers` opens each page you name headless at 2x and 4x, as served and with a newline opening
every list item, and fails on a marker more than 0.25 px off its line, on a first line not starting
where the wrapped lines start, and on a page with no marker. Run it in your gate on the pages or
specimen that show your lists. It opens every closed `<details>` outside a header or nav first.
`--site <dir>` serves a built site folder on a free port for the run, a folder answering with its
`index.html`, and a page starting with `/` is a path on it, so pages whose links start at the root
load as published: `brand-markers --site dist /catalog/ /verify/`. Both measuring scans fail on a
page whose stylesheet does not load, such as a build linking `file://` stylesheets served with
`--site`: unstyled, the page shows the browser's own markers and spacing. Name such a build's
pages as files instead.

## Press kit

`press/` holds the photos of the press kit: `founders.jpg` (Stefan Munz and Benedikt Stemmildt in a
skatepark bowl, 2785 px), `benedikt-stemmildt.jpg` (2010 px) and `stefan-munz.jpg` (2290 px), each
square JPEG. Credit them "Photo: Francesca Amann"; `press.json` lists each file with what it shows,
its size and the credit. With the logos above, they make the ZIP the website's press page offers
(`/press/`, `/de/presse/`).

## Work on the package

```sh
bun install      # also points the git hooks at .githooks/
bun run check    # scaffolding's shared steps (admin-check among them), then the built catalog's tests and generated/
bun run dev      # the catalog: http://127.0.0.1:4326/brand/
bun run build    # dist/, as the Pages workflow publishes it
```

The catalog is one Astro app in `catalog/`, in scaffolding's catalog shell. Its root is the brand
portal, `catalog/portal.ts` run by the route `catalog/pages/index.html.ts`: tokens, logos, every
family of brand files in use under `applications/`, the press kit, and a link to each system's own
design-system page; the tracked files it links sit beside it (`catalog/files.ts`). The element
stories (`catalog/stories/`) are at `/brand/catalog/`. `catalogue.html` forwards to the portal with
its anchor. `dist/index.html` also opens from disk.

A release is a tag `v<version>` that matches `version` in `package.json`; consumers then raise the
tag in their dependency line. Every brand file changes here; the rest of the rules:
[CLAUDE.md](CLAUDE.md).

## Why the `git+https://` form

The package is never published to a registry. Bun rewrites `git+https://github.com/...` to
GitHub's tarball API, which serves this public repo without a login, a key or any git
configuration. Git LFS files arrive as pointers; the package ships none.

Licence: PolyForm Strict 1.0.0, see [LICENSE](LICENSE).
