---
kind: work
status: open
priority: 3
order: 1825
area: engineering
owner: Ada
evidence: "brand-next run 08.11.: a hook in test/header.test.ts timed out at 5 s once; which hook was not recorded. brand-gate run 10.11. 11:50, load average 36: the beforeAll of test/markers.test.ts, which only calls launch(), timed out at 5 s with a logging wrapper (bash and tee) in Chrome's launch path, and bun then killed the browser ('killed 1 dangling process'). Ten plain launch() calls right after took 1.0 to 2.4 s at load 53 to 75. Not yet explained."
---

# A browser hook in brand's tests timed out at 5 s

Reproduce the 5 s timeout of a browser-launching hook, then fix its cause or give it the time a measurement shows.

Every browser test file launches its browser in a `beforeAll` with bun's default 5 s timeout. Launches measured at about half that under heavy load, so time alone does not yet explain the two readings in `evidence`. When a hook or a test runs past its timeout, bun kills every process the file has spawned, the shared browser included (bun 1.4.4, `kill_dangling_processes_on_timeout` in `src/runtime/test_runner/Execution.rs`; "killed 1 dangling process" in five runs of 10.11.). One slow step then shows up as several "Target closed" failures in the tests after it, so read the first failure of a run, never the last.

The browser connection that closed during the fallback-face tests in `test/markers.test.ts` is fixed in 9c38745. bun's `expect(promise).rejects` waits in a nested event loop, and there the DevTools socket broke ("Invalid WebSocket frame: RSV2 and RSV3 must be clear"). The lint rule in `eslint.config.js` now stops `.rejects` and `.resolves` in tests.
