---
kind: work
status: open
priority: 3
order: 1825
area: engineering
owner: Ada
evidence: "brand-next run 08.11.: a hook in test/header.test.ts timed out at 5 s once, one check:catalog test failed once (not captured). w-brand raise 10.11., load average 14 to 22: the check:catalog failure was list-filter's source test (q=c instead of context), a race in elements/list-filter.ts, fixed in dc93ce6 and its follow-up; the three 'a page drawn in a fallback face' tests in test/markers.test.ts failed with 'Target closed' / 'Connection closed' in one gate and in one whole-file rerun alone, then passed in three describe-only runs, one whole-file run and the next two gates. The header timeout was not seen. brand-next4 run 10.11. 03:17, load average 3.4 to 4.2 a few minutes later, nothing else gating in brand: the same three tests failed with 'Protocol error (Target.createTarget): Target closed' in one gate, the file alone passed 53/53 right after, the next gate passed. brand-pages run 10.11. 05:36 and 05:54 (load average 5.5 to 7.3, other repos gating): the same three tests failed with 'Target closed' in two consecutive gates, the file alone passed 53/53 and `bun run test` passed 355/355 in between, the third gate passed at load 7.8 to 15. brand-next5 run 10.11. 07:15, load average 24 to 28 (several sessions gating): the same three tests failed with 'Protocol error (Target.createTarget): Target closed' in three consecutive gates (07:15, 07:24, 07:36, load 9 to 28) and in `bun run test` alone (07:44, 354 pass, 3 fail, the browser connection gone 2 ms into each); the file alone passed 53/53 at load 7 to 12, and the next gate, started at load 7, passed."
---

# Two brand gate tests fail under load

The list-filter failure is fixed. Still not explained: the header hook timeout and the browser connection closing during `test/markers.test.ts`'s fallback-face tests. Reproduce under the same load (several gates running), capture the browser's exit, and fix the cause or the timeout that the load exceeds.
