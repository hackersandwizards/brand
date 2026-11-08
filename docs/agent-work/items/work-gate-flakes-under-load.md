---
kind: work
status: open
priority: 3
order: 900
area: engineering
owner: Ada
evidence: "brand-next run 08.11., gate under load: a hook in test/header.test.ts timed out at 5 s once, one check:catalog test failed once (not captured); both passed on rerun, final gate clean (72ec40e)."
---

# Two brand gate tests failed once under load

Not yet explained. Reproduce under the same load (several gates running), capture the failing `check:catalog` test, and fix the cause or the timeout that the load exceeds.
