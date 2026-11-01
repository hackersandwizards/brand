# @hackersandwizards/brand

The hackers&wizards brand as one package: design tokens, the print layer with its static
fonts, the logos and the expert UI layer with the components Company OS and the trainer hub share.
The document components the PDFs are built from are the document engine,
`@hackersandwizards/documents`.

Maintainer: Benedikt Stemmildt. The repo is public, its history included, so nothing goes in
that may not be public.

## Use it in another repo

Add the dependency in exactly this form, pinned to the newest tag
(`git ls-remote --tags https://github.com/hackersandwizards/brand.git` lists them). The install
needs no GitHub access.

```json
"@hackersandwizards/brand": "git+https://github.com/hackersandwizards/brand.git#v<version>"
```

Then import what you need. The colours, each hue's roles (base, text on light, night, tints) and
the chart order are in `tokens/tokens.css` and on the catalogue's Colours page.

```css
@import "@hackersandwizards/brand/tokens.css"; /* in a Tailwind 4 stylesheet */
```

| Import                                                    | File                                            |
| --------------------------------------------------------- | ----------------------------------------------- |
| `@hackersandwizards/brand/tokens.css`                     | Tailwind 4 `@theme` tokens                      |
| `@hackersandwizards/brand/tokens.root.css`                | the same tokens on `:root`                      |
| `@hackersandwizards/brand/tokens.json`                    | tokens and resolved colours                     |
| `@hackersandwizards/brand/tokens`                         | the same as TypeScript                          |
| `@hackersandwizards/brand/tokens.py`                      | the same as a Python module                     |
| `@hackersandwizards/brand/code-theme.json`                | the code palette as a Shiki theme (`hw-code`)   |
| `@hackersandwizards/brand/print.css`                      | print scale and static fonts                    |
| `@hackersandwizards/brand/marker.css`                     | the list marker, plain CSS, below               |
| `@hackersandwizards/brand/fonts/<file>`                   | font files                                      |
| `@hackersandwizards/brand/expert.css`                     | expert UI layer                                 |
| `@hackersandwizards/brand/header.css`                     | the internal header, plain CSS                  |
| `@hackersandwizards/brand/select.css`                     | the dropdown chevron, plain CSS                 |
| `@hackersandwizards/brand/expert/components/<name>.astro` | expert UI components                            |
| `@hackersandwizards/brand/logos/<file>`                   | logos, `avatar-512.png` square, the favicon set |
| `@hackersandwizards/brand/clients/<file>`                 | client marks and `clients.json`                 |
| `@hackersandwizards/brand/press/<file>`                   | press photos and `press.json`                   |
| `@hackersandwizards/brand/mail-signature/<file>`          | signature template and `fill.ts`                |

Run a command the package ships from your repo's root with `bun run <name>`. Never `bunx <name>`:
where the package is missing, `bunx` downloads a same-named package from npm, while `bun run` stops
with `Script not found`.

| Command                                                       | Does                                                                  |
| ------------------------------------------------------------- | --------------------------------------------------------------------- |
| `brand-linkedin-frame <in.png> <out.png> --headline "<text>"` | frames an image as a 1080 x 1350 LinkedIn post image                  |
| `brand-linkedin-terminal <spec.json> <out.png>`               | renders a terminal snippet for the frame; no arguments print the spec |
| `brand-linkedin-sketch-prompt`                                | prints the prompt for a generated sketch and its worked examples      |
| `brand-slide-sketch-prompt`                                   | prints the prompt for a slide sketch and its worked example           |
| `brand-mail-signature --name <n> --role <r> --out <path>`     | writes a mail signature as HTML and text; all flags in `cli.ts`       |
| `brand-colours [--tighten]`                                   | the colour, radius and shadow scan for your gate, below               |
| `brand-copies [--tighten]`                                    | flags a copy of a brand file in your tree, below                      |
| `brand-scan [--tighten]`                                      | flags a fork of an expert component, below                            |
| `brand-markers [--scale 2,4] <url or file>...`                | measures every list marker on your pages, below                       |

These commands and the exported files above are the whole interface: any other path in the package
may move in the next tag. A Python script, an HTML document or a skill that needs an exported file
on disk reads it at `node_modules/@hackersandwizards/brand/<target>`, the target the export maps it to
(`./fonts/*` to `tokens/fonts/*`).

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

### The internal header

Every internal system and page wears one header: the 3 px strip, a 3.5rem bar under a hairline,
the lockup at 2rem with the product name beside it, and a 96rem content width with 1rem sides.
`header.css` holds it as plain CSS with its markup in the opening comment, so a static or generated
page links or inlines it; an Astro app renders `expert/components/AppHeader.astro` with its nav in
the slot; a React app writes the same markup. Each product keeps its own nav items; page content
takes the same width with the class `hw-container`.

### The dropdown

A native `<select>` wears the brand chevron in place of the system's arrow: import `select.css`
and give the select the class `hw-select`, or `form-input` under the expert layer, which imports
it. The file draws only the arrow and the room for it; corner, border, height and focus stay the
surface's. The night chevron follows `data-theme="dark"` on `html`.

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
  keyword or a lone `var()` passes; a value the scan cannot read, an interpolation or a variable,
  counts nothing.

A standalone SVG cannot name a token, so there a token hex counts nothing, and neither does a mix
the package derives from the tokens: a token colour on white at 7 % or at any 5 % step, and a hue
row's text colour at 70 % with ink, within 1 per channel. A shadow's colour counts in `shadow` only.

Add it to your `bun run check`:

```json
"check": "... && brand-colours && brand-copies"
```

An exception goes in `brand-colours.json` beside your `package.json`, one entry per file with its
counts and the reason, and the list may only shrink: the scan fails where an entry grows against
`HEAD` or names no reason. A metric an entry leaves out allows none. `brand-colours --tighten`
lowers every entry to today's counts.

#### Raise your pin

A newer scan can find more in files you have not touched. In the commit that changes the
`#v<version>` your `package.json` pins at `HEAD`, the three lists may also take what the installed
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
| `allowlists`  | `brand-colours.json`, `brand-copies.json`, `brand-scan.json`                                                                                                                           | the scans' own exception lists, whose reasons name the values they allow                                                            |
| `hub`         | `.claude/skills/parallel-session/`                                                                                                                                                     | agent tooling the `~/.claude` hub syncs into every repo, non-h&w ones included                                                      |
| `not styling` | `brand-colours` only: every extension but `.css .scss .astro .tsx .ts .mts .cts .jsx .js .mjs .cjs .vue .svelte .html .svg .py .json .webmanifest`                                     | prose, images, fonts, PDFs and other binaries carry no styling a renderer reads                                                     |
| `brand copy`  | `brand-colours` only: a file byte-identical to a package file                                                                                                                          | `brand-copies` reports it, and its allowlist governs it                                                                             |

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
only shrink against `HEAD`.

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
specimen that show your lists.

## Press kit

`press/` holds the photos of the press kit: `founders.jpg` (Stefan Munz and Benedikt Stemmildt in a
skatepark bowl, 2785 px), `benedikt-stemmildt.jpg` (2010 px) and `stefan-munz.jpg` (2290 px), each
square JPEG. Credit them "Photo: Francesca Amann"; `press.json` lists each file with what it shows,
its size and the credit. With the logos above, they make the ZIP the website's press page offers
(`/press/`, `/de/presse/`).

## Work on the package

```sh
bun install      # also points the git hooks at .githooks/
bun run check      # format, lint, typecheck, tests, generated/ and catalogue.html up to date
bun run catalogue  # rebuild catalogue.html
```

Open `catalogue.html` from disk for the brand portal: tokens, logos, every family of brand files in
use under `applications/`, the press kit, and a link to each system's own design-system page.

A release is a tag `v<version>` that matches `version` in `package.json`; consumers then raise the
tag in their dependency line. Every brand file changes here; the rest of the rules:
[CLAUDE.md](CLAUDE.md).

## Why the `git+https://` form

The package is never published to a registry. Bun rewrites `git+https://github.com/...` to
GitHub's tarball API, which serves this public repo without a login, a key or any git
configuration. Git LFS files arrive as pointers; the package ships none.

Licence: PolyForm Strict 1.0.0, see [LICENSE](LICENSE).
