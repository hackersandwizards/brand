---
kind: work
status: open
priority: 3
order: 1825
area: engineering
owner: Ada
evidence: "brand-next run 08.11.: a hook in test/header.test.ts timed out at 5 s once; which hook was not recorded. brand-gate run 10.11. 11:50, load average 36: the beforeAll of test/markers.test.ts, which only calls launch(), timed out at 5 s with a logging wrapper (bash and tee) in Chrome's launch path, and bun then killed the browser ('killed 1 dangling process'). Ten plain launch() calls at 12:44 took 1.0 to 2.4 s at load 53 to 75. Not yet explained. fix-brand-a run 10.11.: brand's `test` and `check:catalog` now pass bun the gate's load-stretched per-test limit, which bun applies to hooks too (a 6 s beforeAll passed with --timeout 10000 and timed out without it); one gate at load 13.6 rising to 112.8 passed with no hook timeout."
---

# A browser hook in brand's tests timed out at 5 s

Reproduce the 5 s timeout of a browser-launching hook, then fix its cause or give it the time a measurement shows.

Every browser test file launches its browser in a `beforeAll` with bun's default 5 s timeout. Launches measured at about half that under heavy load, so time alone does not yet explain the two readings in `evidence`. When a hook or a test runs past its timeout, bun kills every process the file has spawned, the shared browser included (bun 1.4.4, `kill_dangling_processes_on_timeout` in `src/runtime/test_runner/Execution.rs`; "killed 1 dangling process" in five runs of 10.11.). One slow step then shows up as several "Target closed" failures in the tests after it, so read the first failure of a run, never the last.

The browser connection that closed during the fallback-face tests in `test/markers.test.ts` is fixed in 9c38745: bun's `expect(promise).rejects` waits in a nested event loop, and there the DevTools socket broke ("Invalid WebSocket frame: RSV2 and RSV3 must be clear"). Over ws the unchanged file failed in 6 of 8 whole-file runs; with its five `.rejects` replaced, 0 of 4, and three gates and a timing run after the fix passed too. Not yet explained: why the nested wait breaks the frame stream. Eighty `.rejects` rounds over ws in a small test held the connection, and a `-t` subset with `.rejects` in place passed, so the break also needs something the whole file builds up before it. The lint rule in `eslint.config.js` now stops `.rejects` and `.resolves` in tests.
