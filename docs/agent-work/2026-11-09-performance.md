# Performance of the brand catalog

Typing into a list filter of 120 rows now costs 23.5 ms of main-thread time per query, down from
25.9 ms. The filter stopped rewriting the titles of hidden rows and maps its rows in one pass. The
portal, the catalog and a story page load as fast as before: Lighthouse scores them alike before and
after, and the portal holds the 98 of the last report.

## Method

Before is commit `79494a9`, built in a detached worktree. After is the working tree with this run's
fixes. Both builds were served side by side from one Bun server each, and every series alternated
before and after, so each pair shares its load. Load is the 1-minute `loadavg` at the start and the
end of a series, on 16 cores.

## List filter typing

Headless Chrome for Testing at 412 x 823, CPU slowed four times. The page is the long list story
(`catalog/stories/Forms/list-filter/long/`). The script types "context" at 120 ms per key, waits
800 ms, and sums script, layout and style time from `page.metrics()`. Median of seven.

| Build  | Main thread | Runs (ms)                                | Load       |
| ------ | ----------- | ---------------------------------------- | ---------- |
| Before | 25.9 ms     | 23.7, 27.4, 26.5, 25.0, 25.2, 25.9, 26.2 | 13.37-9.73 |
| After  | 23.5 ms     | 24.5, 23.7, 25.1, 23.5, 23.2, 22.9, 21.6 | 13.37-9.73 |

The gain is small against the run spread, but six of seven after runs sit below the before median.

## Lighthouse

Lighthouse 13.6.0 via `bunx`, default mobile preset, performance only, three runs each, median.

| Page                                | Server  | Perf before | Perf after | FCP = LCP before | FCP = LCP after | Load        |
| ----------------------------------- | ------- | ----------- | ---------- | ---------------- | --------------- | ----------- |
| Portal `/brand/`                    | gzip    | 98          | 98         | 1954 ms          | 1954 ms         | 12.21-10.86 |
| Portal `/brand/`                    | no gzip | 58          | 58         | 8101 ms          | 8102 ms         | 5.63-10.46  |
| Catalog `/brand/catalog/`           | gzip    | 100         | 100        | 1201 ms          | 1201 ms         | 8.75-10.53  |
| Catalog `/brand/catalog/`           | no gzip | 93          | 92         | 2550 ms          | 2700 ms         | 10.46-9.29  |
| Story `.../Forms/list-filter/long/` | no gzip | 98          | 98         | 1801 ms          | 1801 ms         | 9.29-13.03  |

TBT is at most 9 ms and CLS 0 on every page.

Uncompressed, the catalog's first paint read 2550 ms in all three before runs and 2550, 2700 and
2700 ms after. The after build's elements stylesheet is 41 bytes larger (130,731 against 130,690),
and Lighthouse's simulated link moves in whole round trips. Served with gzip, both builds read
1201 ms in every run, so the step is that rounding, not a slower page.

The first series served files uncompressed and without cache headers. That put the portal at 58,
far below the last report's 98. A control changing only the server to gzip, as GitHub Pages
serves, brought it back to 98 at 1954 ms. The portal's HTML is 836 KB uncompressed, so on
Lighthouse's slow mobile link the compression decides its first paint. The uncompressed rows
compare before and after fairly but not with the last report.

## Not measured

The `brand-elements` scan now labels only the classes it reports, in one pass, instead of building
a label for every classed element. No consumer's large page was at hand, so this run has no number
for it.

## Next baseline

The next run compares against the "after" columns, served with gzip, on the portal, the catalog
index and the long list story.
