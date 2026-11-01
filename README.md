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

| Import                                                    | File                             |
| --------------------------------------------------------- | -------------------------------- |
| `@hackersandwizards/brand/tokens.css`                     | Tailwind 4 `@theme` tokens       |
| `@hackersandwizards/brand/tokens.root.css`                | the same tokens on `:root`       |
| `@hackersandwizards/brand/tokens.json`                    | tokens and resolved colours      |
| `@hackersandwizards/brand/tokens`                         | the same as TypeScript           |
| `@hackersandwizards/brand/tokens.py`                      | the same as a Python module      |
| `@hackersandwizards/brand/print.css`                      | print scale and static fonts     |
| `@hackersandwizards/brand/fonts/<file>`                   | font files                       |
| `@hackersandwizards/brand/expert.css`                     | expert UI layer                  |
| `@hackersandwizards/brand/expert/components/<name>.astro` | expert UI components             |
| `@hackersandwizards/brand/logos/<file>`                   | logos                            |
| `@hackersandwizards/brand/clients/<file>`                 | client marks and `clients.json`  |
| `@hackersandwizards/brand/press/<file>`                   | press photos and `press.json`    |
| `@hackersandwizards/brand/mail-signature/<file>`          | signature template and `fill.ts` |

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
| `brand-colours [--tighten]`                                   | the colour scan for your gate, below                                  |
| `brand-scan [--tighten]`                                      | flags a fork of an expert component, below                            |

These commands and the exported files above are the whole interface: any other path in the package
may move in the next tag. A Python script, an HTML document or a skill that needs an exported file
on disk reads it at `node_modules/@hackersandwizards/brand/<target>`, the target the export maps it to
(`./fonts/*` to `tokens/fonts/*`).

The logo is one line, with no line under it: the wizard beside the pixel wordmark,
`logos/lockup.svg`, is the standard; the wordmark alone, `logos/wordmark.svg`, goes on textiles
(shirts, hoodie) and stickers; the stacked `logos/lockup-compact.svg` on small spots such as the mug
and lock screens. Slides carry the lockup on the title and the closing slide and the wordmark alone on
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

### Check your colours in your gate

The package ships `brand-colours`, which scans your working tree from the current directory down
for hex values off the tokens, hex values repeating a token, font stacks without a brand family and
Tailwind default palette classes. Add it to your `bun run check`:

```json
"check": "... && brand-colours"
```

An exception goes in `brand-colours.json` beside your `package.json`, one entry per file with its
counts and the reason, and the list may only shrink: the scan fails where an entry grows against
`HEAD` or names no reason. `brand-colours --tighten` lowers every entry to today's counts.

### Check your components in your gate

Never commit a copy of a brand file: read it from the installed package.

Where you render the expert components, `brand-scan` fails on a component of yours named like one
of them (`Pill`, `PageHeader`, ...): import it from the package. An exception goes in
`brand-scan.json` beside your `package.json`, `{ "<lowercase name>": "<reason>" }`, and the list may
only shrink against `HEAD`.

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
