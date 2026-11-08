# Performance of the brand catalog

The portal now loads in 1.8 s on Lighthouse mobile, down from 4.4 s, and scores 98 instead of 74.
Its sample frames held up the first paint. Chrome loads an `srcdoc` iframe at once, even below the
fold or inside a hidden view, so the page fetched all 34 frames and 128 stylesheets before it
painted. Each frame's document is now a file in `catalogue-assets/` behind an `src` iframe, which
`loading="lazy"` defers. The frames render pixel for pixel as before. The catalog and story pages
score 100 on performance. This is the repository's first performance report, so it sets the
baseline.

## Lighthouse

Lighthouse 13.6.0 via `bunx`, headless Chrome, default mobile preset and `--preset=desktop`, three
runs each, median. Served by `astro preview` from the production build on port 4391. Load is the
1-minute `vm.loadavg` before the batch and the highest during it.

| Page                                       | Preset  | Perf | A11y | BP  | SEO | FCP = LCP | TBT | CLS | Load      |
| ------------------------------------------ | ------- | ---- | ---- | --- | --- | --------- | --- | --- | --------- |
| Portal `/brand/`, before                   | mobile  | 74   | 100  | 100 | 100 | 4356 ms   | 0   | 0   | 3.88-5.66 |
| Portal `/brand/`, before                   | desktop | 99   | 100  | 100 | 100 | 764 ms    | 0   | 0   | 3.78-4.35 |
| Portal `/brand/`, after                    | mobile  | 98   | 100  | 100 | 100 | 1802 ms   | 0   | 0   | 3.76-4.43 |
| Portal `/brand/`, after                    | desktop | 100  | 100  | 100 | 100 | 603 ms    | 0   | 0   | 3.52-4.03 |
| Catalog `/brand/catalog/`                  | mobile  | 100  | 100  | 100 | 63  | 1502 ms   | 0   | 0   | 3.39-3.74 |
| Catalog `/brand/catalog/`                  | desktop | 100  | 100  | 100 | 63  | 402 ms    | 0   | 0   | 3.39-4.85 |
| Story `/brand/catalog/stories/.../screen/` | mobile  | 100  | 100  | 100 | 60  | 751 ms    | 0   | 0   | 3.69-3.86 |
| Story `/brand/catalog/stories/.../screen/` | desktop | 100  | 100  | 100 | 60  | 201 ms    | 0   | 0   | 3.81-6.87 |

The story's desktop batch started at a load of 3.81 and rose to 6.87 during the runs. Its scores
sit at 100, so the load did not move them.

### Controls on the portal, before the fix

Each control changed one factor in a copy of the built `index.html`, measured like the rows above.

| Variant                       | Mobile perf | Mobile FCP | Desktop FCP | Load      |
| ----------------------------- | ----------- | ---------- | ----------- | --------- |
| As built                      | 74          | 4356 ms    | 764 ms      | 3.88-5.66 |
| Without the `srcdoc` frames   | 100         | 951 ms     | 256 ms      | 3.46-5.80 |
| Without the six font preloads | 89          | 3004 ms    | 441 ms      | 3.71-6.35 |

A headless Chrome at 412 × 823 then listed every frame after `load`: all 31 `srcdoc` tiles below
the fold had loaded, from 3778 px down, and so had the frames in hidden views. The two `src` frames
had not. After the fix none of the frames below the fold had loaded.

The preloads stay. `catalog/portal.ts` keeps them because without them the swap shifted the page
(CLS 0.15 on desktop). The 1.8 s that remain against the 0.95 s without frames are likely theirs,
but no control after the fix shows it.

### What the catalog and story pages lose

SEO 60 to 63: `is-crawlable`. Scaffolding's catalog shell sets `noindex` on every catalog page
(`catalog/Head.astro`, `catalog/index.ts`) on purpose, so this is no defect. Lighthouse also names
150 ms of render-blocking CSS on mobile, which leaves the score at 100.

## Navigation and interaction

Headless Chrome at 1280 × 900, median of five. A portal view opens on a hash change. The time runs
from setting the hash or the search input to the second animation frame after it, so 33 ms is the
floor at 60 Hz.

| Interaction                                  | Before | After | Load      |
| -------------------------------------------- | ------ | ----- | --------- |
| Portal view switch (each of the eight views) | 32-33  | 33-34 | 4.47-4.59 |
| Portal search, typing "teal"                 | 29     | 29    | 4.47-4.59 |

Page navigations to `load`, after the fix: portal to catalog 101 ms, catalog to story 13 ms, story
to story 16 ms, story to portal 80 ms (load 4.47-4.59).

The repository has no server and so no endpoint.

## Start times

Median of three, wall clock, from the command to the first 200 on the page.

| Command                              | Time    | Load      |
| ------------------------------------ | ------- | --------- |
| `bun --bun astro dev` (catalog/)     | 1214 ms | 3.77      |
| `bun --bun astro preview` (catalog/) | 653 ms  | 4.22-4.42 |
| `bun run build`                      | 1.40 s  | 4.26      |

The dev time includes rendering the portal once, which runs `catalog/portal.ts` in its own
process. A cold build at a load of 10.7 took 2.50 s. Astro 7 starts `dev` and `preview` as a
background process when no terminal is attached and records its PID in
`catalog/.astro/dev.json` and `preview.json`; `astro dev stop` stops it.

## Next baseline

The next run compares against the "after" rows. Its method: the same Lighthouse version and
presets, on the portal, the catalog index and one story page.
