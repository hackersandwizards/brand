---
kind: work
status: open
priority: 2
order: 625
area: software-engineering
owner: Ada
evidence: "brand-gate run 10.11., three green gates in a worktree, one at a time: 608.3 s (load average 74 to 94; test 461.6 s, check:catalog 146.0 s), 656.0 s (105 to 110; 481.6 s, 174.2 s), 681.6 s (119 to 61; 499.2 s, 181.9 s). Every other step took under 12 s. bun run test alone with per-file times, load 61 falling to 18: 493.3 s, of which test/markers.test.ts 219.0 s, test/elements.test.ts 168.7 s, test/catalog-scan.test.ts 53.1 s, test/behaviour.test.ts 35.8 s, the other 22 files 17 s together. fix-brand-a run 10.11., scaffolding v5.12.1 with the per-test limit stretched by load and marker workers by load, one gate in a worktree: 600.3 s (load average 13.6 rising to 112.8; test 453.8 s, check:catalog 146.2 s; the catalog build now runs beside the quick checks, 3.6 s)."
---

# brand's gate runs past the 600 s tool-call cap

Split the test step across processes and run the catalog check beside it, once the load allows two browser runs.

The steps are `test` and `check:catalog`.

Both steps, from the setup review of 10.11. (finding E2), put a second browser-heavy process beside the first, so this run left them out at a load average of 20 to 120. What they would gain, estimated by adding the times in `evidence`:

| Change                                                                                                                        | Wall time of the gate                                                                                                 | Owner                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| None                                                                                                                          | `test` + `check:catalog`, 608 to 682 s                                                                                |                                                                           |
| `test` in two processes, `markers` with `behaviour` and the small files (272 s) beside `elements` with `catalog-scan` (222 s) | estimated 272 s + `check:catalog`, 420 to 455 s, if neither half slows the other (sums of one solo run, not measured) | brand's `test` script                                                     |
| `check:catalog` starts once `catalog` (7 to 9 s) has built `dist/`, beside `test`                                             | the longer of `test` and 9 s + `check:catalog`                                                                        | scaffolding: a `check` entry runs only after the whole shared group today |

Each half's time beside the other is not measured. Where the one-minute load average is above the core count, the gate (scaffolding v5.10 and later) runs `test`, `catalog` and the repository's own steps one after another, so two `test` steps gain only while it is not. Once the gate fits under 600 s, drop the background line from `CLAUDE.md`.
