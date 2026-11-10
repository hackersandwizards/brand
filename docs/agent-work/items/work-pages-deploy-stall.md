---
kind: work
status: open
priority: 3
order: 1826
area: engineering
owner: Ada
evidence: 'brand-pages run 10.11.: 8 of 12 brand Pages deploy attempts between 09.11. 23:43 and 10.11. 03:56 UTC (reruns counted) timed out at deploy-pages'' 10 minutes, the server still at syncing_files (42745740563, 42736998716: 19 polls) or, on attempt 3 of 42748997693, at finished_file_sync; a workflow_dispatch of the same SHA 5e9ce2f (42753497461) was cancelled 6 s after creation, the Pages deployment for 5e9ce2f reading status "". Ruled out: overlap (concurrency group pages serialised every deploy job), the scaffolding pin (failures under 2273e73 and 49755c5), artifact size alone (107.9 MB on every run since 09.11. 08:45, deploys of 11 to 48 s all of 09.11.; one failure 09.11. 10:26 during GitHub''s Webhooks and Actions incident), a documented limit (1 GB site, 10-minute deployment). slides (4.5 MB) and documents (3 MB) deployed 11 of 11 in the same window. githubstatus.com lists no Pages incident after 09.11. 18:59. Recovered: 954dec7 (04:23) and f0ca3e9 (05:12) deployed in 11 s and 10 s at 107.97 MB.'
---

# Brand's Pages deploys stalled for four hours

Not yet explained: why brand's deploys alone stalled from 23:43 to 04:05 UTC while slides and
documents deployed. Still open is whether size and the window combine, since brand ships 24 times
slides' compressed bytes, 98 MB of them the LFS masters the portal shows and links. Watch the next
stalls: the failed phase, the time, the siblings' runs in the same hour, and the
[status history](https://www.githubstatus.com/history). If they recur, put the decision on hosting
the masters elsewhere to Benedikt: LFS media URLs count against the 10 GiB monthly LFS bandwidth.
