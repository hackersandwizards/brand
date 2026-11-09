---
kind: work
status: open
priority: 3
order: 1825
area: engineering
owner: Ada
evidence: 'brand-next run 08.11., gate under load: a hook in test/header.test.ts timed out at 5 s once, one check:catalog test failed once (not captured); both passed on rerun, final gate clean (72ec40e). brand-fix6 run 09.11., load 4.2-5.0: test/markers.test.ts "markers measure the same under a policy refusing data: images" failed once in the full gate, two markers at offset 0.09752532995457841 without the policy and 0.09761995420103631 under it; passed 3 of 3 alone.'
---

# Three brand gate tests failed once under load

Not yet explained. Reproduce under the same load (several gates running), capture the failing `check:catalog` test, run the markers test against itself without a policy to see whether two plain measurements differ at the fourth decimal too, and fix the cause or the timeout that the load exceeds.
