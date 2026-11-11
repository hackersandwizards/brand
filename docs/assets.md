# Logos, favicon, press photos and words

Which logo goes where, how to serve the favicon, the press photos and the verbal identity. The
[brand portal](https://hackersandwizards.github.io/brand/#logos) shows every file with a download.

## The logo

The logo is one line, with no line under it: the wizard beside the pixel wordmark,
`logos/lockup.svg`, is the standard; the wordmark alone, `logos/wordmark.svg`, goes on textiles
(shirts, hoodie) and stickers; the stacked `logos/lockup-compact.svg` on small spots such as the mug.
A header up to 40 px tall, on screen or in print, takes `logos/lockup-screen.svg`, on night
`logos/lockup-screen-night.svg`: the same lockup with the wizard at 256 px, sharp to 6x, past 384 dpi
in a PDF, at under half the lockup's weight. Larger, the lockup itself. Slides carry the lockup on the title and the closing slide and the wordmark alone on
every other slide. The mail signature keeps its typed wordmark. Each has a `-night`
cut for night, black and black textile, and an `-outline` cut, a white outline round the letters,
for Purple Love, Stargazer and the gradient. The package ships the SVGs and, for a tool that cannot
draw SVG such as a PPTX export, a PNG of every cut but the outline cuts of the compact lockup and the wordmark. The wordmark alone also has a `-white` and a `-black`
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
clear space as a share of the day file's height (`clearSpace`), `minWidthPx` and `minWidthMm`. `sizes` holds the `width` and `height` of each logo SVG (the favicon aside) and each lockup and wordmark PNG, keyed by file name, for an `<img>`'s
attributes, so its box holds before the file loads.
The screen width is the narrowest from which every gap between two letters stays open, a pixel
column through each under 50 % ink, measured in a headless Chrome render series from 40 to 400 px
at device pixel ratio 2; at ratio 1 that holds only from 370 px (lockup) and 300 px (compact
lockup, wordmark). The print width is the screen width at 96 px per inch, the CSS reference pixel,
rounded.

Till drew the wizard, and hackers&wizards GmbH holds the rights to it.

The wizard alone ships as `logos/emoji-256.png` (256 px, 13 KB), for a page or document that shows
or inlines it as an icon. Its 4096 px master `emoji-logo-short.png` and the CMYK print file stay in
Git LFS outside the package; `bun scripts/outline.ts` writes the 256 px file from the master.

The & sits optically centred between the s and the w, its mean row-wise gap equal on both sides.
`bun scripts/ampersand.ts` writes that offset into every day logo carrying the one-line wordmark,
renders its PNG and rehashes both in `manifest.json`; `bun scripts/outline.ts` then writes the
night, outline, white and black cuts from them.

## Serve the favicon

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

## The words

`verbal/verbal.json` (`@hackersandwizards/brand/verbal.json`) holds the verbal identity: the claim
in English and German with the word a surface may highlight, the home page headline, the
descriptor (the offer line under the claim on banners and the booth, without a closing full stop,
which a surface setting it as a sentence adds), mission,
vision, position, boilerplate, values, terms and the retired slogans. A surface imports the text
(`import { claim } from "@hackersandwizards/brand/verbal.json"`) and never retypes it; `brand-retired`
([checks](checks.md#check-your-build-for-retired-lines)) fails on any `retired` line in its build. A language the source has not set yet is `null`. The texts are set here: the
`~/.claude` hub sync copies the file into every repo's voice skill, which keeps tone of voice,
banned words and the brand elements never said in copy. The portal shows the file under Words.

## Press kit

`press/` holds the photos of the press kit: `founders.jpg` (Stefan Munz and Benedikt Stemmildt in a
skatepark bowl, 2785 px), `benedikt-stemmildt.jpg` (2010 px) and `stefan-munz.jpg` (2290 px), each
square JPEG without camera data. Each portrait has a 640 px cut beside it for a slide or a small
spot, named in `press.json` as `cut` (`benedikt-stemmildt-640.jpg`, `stefan-munz-640.jpg`). Credit them "Photo: Francesca Amann"; `press.json` lists each file with what it shows,
its size and the credit. With the logos above, they make the ZIP the website's press page offers
(`/press/`, `/de/presse/`).
