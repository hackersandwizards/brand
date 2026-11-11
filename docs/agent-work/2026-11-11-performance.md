# Performance of the brand catalog

The portal now paints its first content in 1244 ms, where it took 1954 ms before 11.11., and it
scores 100 instead of 98. Its main thread now blocks for about 50 ms, where it blocked for none.
Both changes came with one commit, `e0a1899`, which added the chapters on the wizard, photography,
illustration and motion. The catalog index and the long list story load as before. This run made
no performance fix, so the numbers compare the day's commits with the state before them.

## Method

Before is `8d95bd8`, the commit before 11.11.'s first. After is `bec8b76`, the last commit before
this run. Each was built in its own detached worktree with Git LFS files present. Each build was
served by its own Bun server with gzip, as GitHub Pages serves it. Every series alternated before
and after, so each pair shared its load. Load is the 1-minute `loadavg` before each run, on 16
cores.

Lighthouse 13.6.0 via `bunx`, default mobile preset, performance only, Chrome for Testing 157,
three runs each.

## Lighthouse

| Page                                | Perf before | Perf after | FCP before (ms)  | FCP after (ms)   | TBT before (ms) | TBT after (ms) | Load        |
| ----------------------------------- | ----------- | ---------- | ---------------- | ---------------- | --------------- | -------------- | ----------- |
| Portal `/brand/`                    | 98          | 100        | 1954, 1954, 1954 | 1243, 1244, 1245 | 0, 0, 0         | 48, 51, 65     | 12.68-17.23 |
| Catalog `/brand/catalog/`           | 100         | 100        | 1051, 1051, 1052 | 1051, 1051, 1051 | 15, 18, 23      | 17, 29, 29     | 10.77-19.47 |
| Story `.../Forms/list-filter/long/` | 100         | 100        | 901, 901, 901    | 901, 901, 903    | 0, 0, 0         | 0, 0, 0        | 13.01-17.31 |

LCP equals FCP in every run, and CLS is 0 on every page.

The portal's HTML grew from 875,172 to 895,219 bytes, or from 117,027 to 121,630 gzipped. The
after size is from the `93ade07` build, which renders the portal the same as `bec8b76`.

## Cause

One run per commit, on the portal, over the 58 first-parent commits between the two builds. The
first paint reads 1954 ms or, in single runs, about 1504 ms up to the merge `8056ac7`, and 1244 ms
from there on. The 1504 readings are run spread: the base itself read 1503 in an earlier series.
Of the commits that merge brought in, the control is `e0a1899` against its parent `6eb26c0`, with
nothing else changed:

| Build               | FCP runs (ms) | TBT runs (ms) | Load        |
| ------------------- | ------------- | ------------- | ----------- |
| `6eb26c0`, parent   | 1954, 1508    | 0, 0          | 11.29-22.87 |
| `e0a1899`, chapters | 1244, 1294    | 57, 35        | 13.74-73.76 |

Which part of the new chapters paints earlier and what blocks the main thread is not yet explained.
At 50 ms the blocking stays under Lighthouse's 200 ms mark for a good score.

The scaffolding raise from v5.16.0 to v5.19.1 (`93ade07`) changes neither number. Its parent
`ef464f8` read 1244, 1244 and 1243 ms with 38, 42 and 34 ms blocking, and `93ade07` read 1243,
1243 and 1244 ms with 34, 33 and 46 ms. Load was 10.35-17.44.

## Not measured

List filter typing: 23.5 ms of main-thread time per query on the long list story, the 09.11.
reading. Since then only `23bc12f` touched the list filter, one corner in `list-filter.css`.

## Next baseline

The next run compares against the "after" columns, served with gzip, on the portal, the catalog
index and the long list story, and measures list filter typing against the 23.5 ms above.
