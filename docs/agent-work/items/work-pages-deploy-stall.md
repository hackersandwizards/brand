---
kind: work
status: open
priority: 3
order: 1760
area: software-engineering
owner: Ada
evidence: "Checked 12.11.: 56 Pages runs since 11.11. 06:31 UTC, 55 succeeded on their first attempt, none stalled; run 43095095883 (5f43d78, 11.11. 20:17 UTC) still sits queued with no job. Cause not explained, the size control not run. Internal."
---

# Explain why brand's Pages deploys stall now and then

Brief a brand session to test whether the artifact's size stalls brand's Pages deploys, changing size alone.

Brand's deploys stalled for four hours on the night of 09.11. and twice more on 10.11., each time at the deploy step with the server at syncing_files, while slides and documents deployed in the same hours. Each stall cleared with the next push, so the portal ran one commit behind for a few hours. Not yet explained: brand ships 24 times slides' compressed bytes, 98 MB of them the LFS masters the portal shows and links, but no control has changed the size alone.

Next: a control deploy without the masters (the portal linking them elsewhere), repeated over enough pushes to compare with the 2 stalls in 41 deploys since 10.11. 05:12 UTC. If size is the factor, put the decision on hosting the masters elsewhere to Benedikt: LFS media URLs count against the 10 GiB monthly LFS bandwidth. Record every further stall here: the failed phase, the time, the siblings' runs in the same hour and the [status history](https://www.githubstatus.com/history).
