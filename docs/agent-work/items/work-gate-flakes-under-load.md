---
kind: work
status: open
priority: 3
order: 1790
area: software-engineering
owner: Ada
evidence: "Checked 12.11.: no recurrence recorded since 10.11.; two mitigations landed (hooks take the gate's stretched limit, test/limit.ts; v2.23.0's list-filter tests wait for what they assert), but neither 5 s hook timeout is explained. Internal."
---

# Explain the 5 s timeout of a browser hook in brand's tests

Brief a brand session to reproduce the 5 s hook timeout, then fix its cause or set the time a measurement shows.

Every browser test file launches its browser in a `beforeAll` with bun's default 5 s timeout. Launches measured at about half that under heavy load, so time alone does not yet explain the two timeouts. When a hook or a test runs past its timeout, bun kills every process the file has spawned, the shared browser included (bun 1.4.4, `kill_dangling_processes_on_timeout` in `src/runtime/test_runner/Execution.rs`; "killed 1 dangling process" in five runs of 10.11.). One slow step then shows up as several "Target closed" failures in the tests after it, so read the first failure of a run, never the last.

The browser connection that closed during the fallback-face tests in `test/markers.test.ts` is fixed in 9c38745: bun's `expect(promise).rejects` waits in a nested event loop, and there the DevTools socket broke ("Invalid WebSocket frame: RSV2 and RSV3 must be clear"). Over ws the unchanged file failed in 6 of 8 whole-file runs; with its five `.rejects` replaced, 0 of 4, and three gates and a timing run after the fix passed too. Not yet explained: why the nested wait breaks the frame stream. Eighty `.rejects` rounds over ws in a small test held the connection, and a `-t` subset with `.rejects` in place passed, so the break also needs something the whole file builds up before it. The lint rule in `eslint.config.js` now stops `.rejects` and `.resolves` in tests.
