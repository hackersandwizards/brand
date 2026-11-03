# Performance final run: brand

Final run of os item `work-make-every-frontend-snappier-all-os-pages`, 2026-11-03. The brand portal
loaded 2.2 MB at start, nearly all of it merch and device-sticker print files in sections nobody had
opened, and jumped on a slow link when the quick start appeared above the tiles. Now it loads 259 KB
at start and holds still: Lighthouse mobile 64 to 85, desktop 93 to 98, CLS 0.412 to 0.008, SEO 91
to 100. The catalog pages lose their favicon 404 (best practices 96 to 100). Every page is
pixel-identical.

## Method

- Production: `astro build` (224 pages), served by a static server that emulates GitHub Pages
  (gzip, `max-age=600`, base `/brand`): before on 127.0.0.1:4689, after on :4691. Dev:
  `astro dev --ignore-lock` on :4694. Ports 4321-4323 untouched.
- Headless Chrome for Testing 156.0.8078.80, a temporary profile per series, a fresh context per
  load, 1440 x 900. Three runs per figure: median, range in brackets. Lighthouse 13, desktop and
  mobile, three runs.
- Load (1-minute average from `uptime`): 4.8-8.0 for the before series, 9.7-22.3 for the after
  series; the machine passed load 186 between them.
- Measured in the browser: the portal, `catalogue.html`, the catalog home and five element
  dashboards and stories; Lighthouse on the portal, the catalog home and one dashboard and story.
- The before build for the pixel check is `HEAD` (v0.34.0) without this change, built from the same
  tree, since v0.34.0 landed during the run.

## Before and after

Production, median:

| Page             | LCP ms before | LCP ms after         | KB before | KB after | Images KB   | Requests  |
| ---------------- | ------------- | -------------------- | --------- | -------- | ----------- | --------- |
| Portal `/brand/` | 116 [112-136] | 104 [96-112]         | 2,226     | 259      | 1,995 to 28 | 169 / 155 |
| `catalogue.html` | 120 [116-136] | 96 [92-100]          | 2,226     | 260      | 1,995 to 28 | 170 / 156 |
| Catalog home     | 56            | 60                   | 94        | 94       | 24          | 121       |
| Dashboards (5)   | 36-44         | measured before only | 25        | 25       | 0           | 6-8       |
| Stories (5)      | 28-44         | measured before only | 19        | 19       | 0           | 5-7       |

TTFB 1-4 ms, long tasks 0 ms. The dashboards and stories changed only by two favicon links.

Lighthouse, performance / accessibility / best practices / SEO:

| Page             | Desktop before        | Desktop after          | Mobile before | Mobile after           |
| ---------------- | --------------------- | ---------------------- | ------------- | ---------------------- |
| Portal           | 93 [92-93]/100/100/91 | 98 [97-98]/100/100/100 | 64/100/100/91 | 85 [83-85]/100/100/100 |
| Catalog home     | 100/100/96/91         | 100/100/100/91         | 100/100/96/91 | 100/100/100/91         |
| Dashboard, story | 100/100/96/90         | 100/100/100/90         | 100/100/96/90 | 100/100/100/90         |

Portal CLS 0.139 to 0.005 on desktop, 0.412 to 0.008 on mobile. Mobile LCP 4.59 to 4.36 s.

Starts (after only; neither change touches the dev or build path): dev cold 1,056 [1,031-1,112] ms,
warm 1,042 [957-6,249] ms to the first portal response; the portal then answers in 117 [114-128] ms
per request, since it reads the working tree afresh by design. Build 0.96-1.14 s (Astro's page count
line), 1.35-2.08 s wall clock.

## Fixes

- The merch and device-sticker mockups name their print files in `data-href`; `show()` sets `href`
  when their section opens. An SVG `<image>` loads even inside a hidden section, so 1.9 MB
  (`stickerZ-Z2.svg` 700 KB, the device sticker PNG 697 KB, `stickerZ-Z1.svg` 302 KB and the rest)
  loaded with every visit. The portal test now also resolves every `data-href`.
- The catalogue carries `data-mode="overview"` in its markup. Before, `show()` set it at the end of
  the page, and the quick start appeared above tiles that had already painted (CLS 0.412 on
  Lighthouse mobile).
- The portal's lead is its meta description.
- The catalog pages carry brand's favicons (`catalog/Head.astro`), so no page asks the site root for
  a `favicon.ico` that is not there.

The catalog is not part of the package, so no release follows; no consumer changes.

## Pixel check and device check

- The portal's overview and its eight views (colours, type, tokens, elements, logos, applications,
  press kit, words) at 1440, 1024 and 390: 0 differing pixels, except the press kit view, where
  the downscaled 2,785 px photo differs by up to 12,424 pixels of channel value 5 or less in some
  runs and 0 in others (decoder resampling; a same-server control reads 0).
- The 7 merch products and 3 device figures, element by element, opened from `#applications`:
  products 0 differing pixels. The device figures differ by 1-230 pixels of value 13 or less, and by
  the same amounts between the two before builds (v0.33.1 and v0.34.0, neither with this change).
  Not yet explained; this change is ruled out as the factor.
- The 55 overview tiles element by element and the 220 catalog dashboards and stories at 1440:
  0 differing pixels.
- The portal at 1440, 1024 and 390 is also the device check.

## What stays below 100

- Portal mobile performance 85: LCP 4.36 s. The LCP element is a line of the quick start; its text
  waits for brand's faces on the simulated 4G link, behind 325 KB of HTML that inlines every
  view's markup. Splitting the views into their own pages, or `font-display: swap` on the faces,
  would move it; both change how the portal behaves or paints, so neither went in. Desktop 98 is
  the same LCP.
- Catalog home, dashboards and stories: SEO 90-91, no meta description in scaffolding's catalog
  shell. Brief for scaffolding: emit the catalog's `lead` as the meta description.

## Assumptions

- Loading the mockups when their section opens rather than on every visit is the "lazy" the os item
  asked for; with JavaScript off the mockups stay empty, as the rest of the portal's views need
  JavaScript to open at all.
- The favicon links change the browser tab, not the page; counted as no visible change.
